/*
 * rawdata-navigator - Human-understandable raw data navigator
 *
 * Copyright (c) 2014 FOXEL SA - http://foxel.ch
 * Please read <http://foxel.ch/license> for more information.
 *
 *
 * Author(s):
 *
 *      Alexandre Kraft <a.kraft@foxel.ch>
 *
 *
 * This file is part of the FOXEL project <http://foxel.ch>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Additional Terms:
 *
 *      You are required to preserve legal notices and author attributions in
 *      that material or in the Appropriate Legal Notices displayed by works
 *      containing it.
 *
 *      You are required to attribute the work as explained in the "Usage and
 *      Attribution" section of <http://foxel.ch/license>.
 */

$(document).ready(function() {
    "use strict";

    // timeline
    var timeline = {
        vis: null,
        items: []
    };

    // leaflet
    var leaflet = {
        map: null,
        layers: null,
        zoom: {
            base: 4,
            min: 3,
            max: 25,
            native: 18,
            cluster: 20,
            bounds: 17
        },
        bounds: null,
        overlays: [],
        colors: {
            segments: ['#f00','#0c0','#00f']
        }
    };

    // storage
    var storage = {
        root: '/data',
        mac: null,
        master: {
            timestamp: null,
            path: null,
            segments: null
        },
        segmentation: [],
        json: {
            data: [],
            keys: [],
            remaining: 0
        }
    };

    /**
     * rawdata_navigator_init()
     */
    var rawdata_navigator_init = function() {

        // overlay
        overlay_init();

        // map
        leaflet_init();

        // timeline
        timeline_init();

        // raw data
        rawdata_init();

    };

    /**
     * overlay_init()
     */
    var overlay_init = function() {

        // dom
        overlay_resize();

        // event: window resize
        $(window).on('resize',function() {
            overlay_resize();overlay_resize();
        });

    };

    /**
     * overlay_resize()
     */
    var overlay_resize = function() {

        var w = $(window).width();
        var h = $(window).height();

        $('#overlay').width(w);
        $('#overlay').children().width(w);

        $('#overlay').height(h);
        $('#overlay').children(':not(.content)').height(h);

        $('#overlay > .content').css('top',Math.round(h/2-$('#overlay > .content').outerHeight(true)/2));

    };

    /**
     * overlay_show()
     */
    var overlay_show = function() {
        $('#overlay').css('display','block');
    };

    /**
     * overlay_message()
     */
    var overlay_message = function(msg) {
        $('#overlay .caption').html(msg);
    };

    /**
     * overlay_hide()
     */
    var overlay_hide = function() {
        $('#overlay').css('display','none');
    };

    /**
     * leaflet_init()
     */
    var leaflet_init = function() {

        // dom
        leaflet_resize();

        // tile providers
        var providers = [{
            name:           'OpenStreetMap Mapnik',
            url:            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution:    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }, {
            name:           'OpenStreetMap Black and White',
            url:            'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
            attribution:    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }, {
            name:           'Esri World Imagery',
            url:            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution:    'Tiles &copy; Esri &mdash; ' +
                            'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }];

        // base maps as tile layers
        var base_maps = {};
        $.each(providers, function(index,provider) {
            _.extend(base_maps,_.object([provider.name],[L.tileLayer(provider.url,{
                attribution: provider.attribution,
                minZoom: leaflet.zoom.min,
                maxZoom: leaflet.zoom.max,
                maxNativeZoom: leaflet.zoom.native
            })]));
        });

        // instanciate leaflet
        leaflet.map = L.map('map', {
            keyboard: true,
            scrollWheelZoom: true,
            zoom: leaflet.zoom.base,
            minZoom: leaflet.zoom.min,
            maxZoom: leaflet.zoom.max,
            center: [46.205007,6.145134],
            layers: [_.first(_.values(base_maps))]
        });

        // layers
        leaflet.layers = L.control.layers(base_maps,{});
        leaflet.layers.addTo(leaflet.map);

        // scaling rule
        L.control.scale().addTo(leaflet.map);

        // event: window resize
        $(window).on('resize',function() {
            leaflet_resize();
        });

        // event: leaflet map zoom end
        leaflet.map.on('zoomend',function() {
            console.log('[zoom: '+leaflet.map.getZoom()+']');
        });

        // event: leaflet layer removed
        leaflet.map.on('overlayadd',function(e) {
            leaflet_overlay_add(e.layer);
        });

        // event: leaflet layer removed
        leaflet.map.on('overlayremove',function(e) {
            leaflet_overlay_remove(e.layer);
        });

    };

    /**
     * leaflet_resize()
     */
    var leaflet_resize = function() {
        $('#map').width($(window).width());
        $('#map').height($(window).height()-$('#timeline').outerHeight(true));
    };

    /**
     * leaflet_cluster_icon()
     */
    var leaflet_cluster_icon = function(cluster,color) {

        var count = cluster.getChildCount();

        var css = ' marker-cluster-';
        if (count < 50)
            css += 'small';
        else if (count < 100)
            css += 'medium';
        else
            css += 'large';

        css += ' '+color.replace('#','seg-');

        return new L.divIcon({
            html: '<div><span>'+count+'</span></div>',
            className: 'marker-cluster'+css,
            iconSize: new L.point(40,40)
        });

    };

    /**
     * leaflet_marker_icon()
     */
    var leaflet_marker_icon = function(pose,color) {

        var type = pose.guess ? 'guess' : 'unknown';

        var css = 'marker-pnt '+color.replace('#','seg-')+' type-'+type;

        return new L.divIcon({
            html: '<div><span></span></div>',
            className: css,
            iconSize: new L.point(30,30)
        });

    };

    /**
     * leaflet_overlay_add()
     */
    var leaflet_overlay_add = function(layer) {
        if (_.isUndefined(layer.foxel))
            return;
        if (layer.foxel.type=='trace')
            layer.foxel.displayed = true;
    };

    /**
     * leaflet_overlay_remove()
     */
    var leaflet_overlay_remove = function(layer) {
        if (_.isUndefined(layer.foxel))
            return;
        if (layer.foxel.type=='trace')
            layer.foxel.displayed = false;
    };

    /**
     * leaflet_fitbounds()
     */
    var leaflet_fitbounds = function() {
        if (_.isNull(leaflet.bounds))
            return;
        leaflet.map.fitBounds(leaflet.bounds);
        if (leaflet.map.getZoom() > leaflet.zoom.bounds)
            leaflet.map.setZoom(leaflet.zoom.bounds);
        leaflet.map.panTo(leaflet.bounds.getCenter());
    };

    /**
     * timeline_init()
     */
    var timeline_init = function() {

        // instanciate vis.js
        timeline.vis = new vis.Timeline($('#timeline').get(0),[],{
            height: $('#timeline').outerHeight(true),
            stack: false,
            selectable: true
        });

        // event: vis.js timeline select
        timeline.vis.on('select',function(e) {
            timeline_select(e.items);
        });

    };

    /**
     * timeline_select()
     */
    var timeline_select = function(items) {

        // bounds
        leaflet.bounds = null;

        // remove overlays
        $.each(leaflet.overlays, function(i,layer) {
            if (layer.foxel.type!='trace')
                return;
            layer.foxel.displayed = false;
            leaflet.map.removeLayer(layer);
        });

        // add overlays
        $.each(leaflet.overlays, function(i,layer) {

            if (layer.foxel.type!='trace')
                return;
            if (items.length > 0 && !_.contains(items,layer.foxel.segment)) // limit if needed
                return;

            // display
            layer.foxel.displayed = true;
            leaflet.map.addLayer(layer);

            // extract bounds
            if (_.isNull(leaflet.bounds))
                leaflet.bounds = layer.getBounds();
            else
                leaflet.bounds.extend(layer.getBounds());

        });

        // fit and center map on bounds
        leaflet_fitbounds();

    };

    /**
     * rawdata_init()
     */
    var rawdata_init = function() {

        // storage override
        if (!_.isNull(opts.root))
            storage.root = opts.root;

        // message
        overlay_message('Loading from<br />'+storage.root+'/camera/[mac-address]/raw/segment/...');

        // retrieve auto segments
        $.getJSON('php/autosegments.php?storage='+storage.root,function(data) {

            // master selector
            var select = $('#master select');
            select.append($('<option>'));

            // parse data
            $.each(data, function(mac,masters) {

                // group per mac
                var optgroup = $('<optgroup>',{'label':mac});
                $.each(masters, function(master,segments) {

                    var id = mac+'/'+master;

                    // option
                    optgroup.append($('<option>',{'value':id}).text(master));

                    // keep segments
                    storage.segmentation.push({
                        master: master,
                        segments: segments
                    });

                });
                select.append(optgroup);
            });

            // instanciate select2
            select.select2({
                placeholder: 'Select raw data set...',
                formatResult: function(item) {
                    if (!item.id) return item.text; // optgroup
                    var date = new Date(parseInt(item.text,10)*1000); // milliseconds
                    return item.text+'<div class="master dates"><div>'+date.toUTCString()+'</div><div>'+date+'</div></div>';
                },
                formatSelection: function(item) {
                    var date = new Date(parseInt(item.text,10)*1000); // milliseconds
                    return item.id.replace('/',' :: <strong>')+'</strong>';
                }
            });

            // event: select change
            select.on('change',function() {
                rawdata_selected();
            });

            // display
            overlay_hide();
            $('#master').show();

        }).fail(function() {
            overlay_message('Failed to retrieve initial JSON data');
        });

    };

    /**
     * rawdata_selected()
     */
    var rawdata_selected = function() {

        // keep choice
        var value = $('#master select').val().split('/');
        storage.mac = value[0];
        storage.master.timestamp = value[1];
        storage.master.path = storage.root+'/camera/'+storage.mac+'/raw/segment/'+storage.master.timestamp;

        // message
        overlay_message('Loading from<br />'+storage.master.path+'/...');
        overlay_show();

        // segments of selected master
        storage.master.segments = _.findWhere(storage.segmentation,{master:storage.master.timestamp}).segments;

        // init json
        storage.json.keys = _.keys(storage.master.segments);
        storage.json.remaining = storage.json.keys.length;

        // clear timeline
        timeline.items = [];
        timeline.vis.clear({items:true});

        // clear leaflet
        $.each(leaflet.overlays, function(index,layer) {
            leaflet.map.removeLayer(layer);
            leaflet.layers.removeLayer(layer);
        });
        leaflet.bounds = null;
        leaflet.overlays = [];

        // whole list
        $.each(storage.json.keys, function(sid,key) {

            var filepath = storage.master.path+'/'+key+'/csps/exports/rawdata-navigator.json';

            // retrieve json
            $.getJSON('php/csps-json.php?json='+filepath,function(data) {

                // parse
                segment_parsing(sid,key,data);

            }).fail(function() {
                overlay_message('Failed to retrieve<br />'+filepath);
            });

        });

    };

    /**
     * segment_parsing()
     */
    var segment_parsing = function(sid,segment,data) {

        // message
        overlay_message('Building layers, please wait...');

        // keep object
        _.extend(data,{segment:segment});
        storage.json.data.push(data);

        // specific poses
        var poses = {
            first: _.first(data.pose),
            last: _.last(data.pose)
        };

        // range
        var range = {
            start: parseInt(poses.first.sec,10)*1000+parseInt(poses.first.usc,10)/1000,
            end: parseInt(poses.last.sec,10)*1000+parseInt(poses.last.usc,10)/1000
        };

        // color
        var color = leaflet.colors.segments[sid % leaflet.colors.segments.length];

        // timeline range
        timeline.items.push({id:segment,content:''+segment,start:range.start,end:range.end,className:'timeline'+color.replace('#','-')});

        // gps known, draw on map
        if (data.gps) {

            var trace = [];
            var latlngbuffer = null;

            // segment feature group [trace,cluster]
            var segmentlayer = new L.featureGroup();

            // cluster
            var cluster = new L.MarkerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 35,
                singleMarkerMode: false,
                spiderfyOnMaxZoom: true,
                animateAddingMarkers: false,
                iconCreateFunction: function(cluster) {
                    return leaflet_cluster_icon(cluster,color);
                }
            });

            // parse poses
            $.each(data.pose, function(index,pose) {

                // geo point
                var latlng = L.latLng(pose.lat,pose.lng);

                // trace but avoid still points
                if (!_.isNull(latlngbuffer) && !latlng.equals(latlngbuffer))
                    trace.push(latlng);
                latlngbuffer = latlng;

                // cluster marker
                var clustermarker = new L.marker(latlng,{icon:leaflet_marker_icon(pose,color)})
                    .on('mouseover', function() {
                        console.log('marker '+this); // todo
                });

                // add cluster marker to cluster
                cluster.addLayer(clustermarker);

            });

            // trace polyline
            var polyline = L.polyline(trace, {
                color: color,
                weight: 2,
                smoothFactor: 1,
                opacity: 1
            })
                .bindPopup('Segment '+segment,{
                    closeButton: false
            });

            // add to segmentlayer [trace,cluster]
            segmentlayer.addLayer(polyline);
            segmentlayer.addLayer(cluster);

            // segmentlayer custom properties
            _.extend(segmentlayer, {
                foxel: {
                    type: 'trace',
                    segment: segment,
                    displayed: true
                }
            });

            // keep pointers to layers
            leaflet.overlays.push(segmentlayer);

            // extract bounds
            if (_.isNull(leaflet.bounds))
                leaflet.bounds = polyline.getBounds();
            else
                leaflet.bounds.extend(polyline.getBounds());

            // add to map
            leaflet.map.addLayer(segmentlayer);
            //leaflet.layers.addOverlay(segmentlayer,segment+' ('+data.pose.length+' poses)');

        }

        // mark as done
        storage.json.remaining--;

        // last parsing
        if (storage.json.remaining == 0) {

            // update timeline
            timeline.vis.setItems(timeline.items);
            timeline.vis.fit();

            // fit and center map on bounds
            leaflet_fitbounds();

            // display
            overlay_hide();
            console.log('[done. last segment parsed.]');

        }

    };

    // init
    rawdata_navigator_init();

});
