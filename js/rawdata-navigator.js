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
        control: {
            scale: null,
            layers: null
        },
        zoom: {
            base: 4,
            min: 3,
            max: 25,
            native: 18,
            bounds: 17
        },
        bounds: null,
        info: {
            layer: null,
            current: null
        },
        poses: [],
        videoframes: [],
        overlays: [],
        colors: {
            segments: ['#f00','#0c0','#00f']
        },
        timebased: {
            only: false,
            index: 0,
            shift: {
                lat: -0.005
            }
        },
        tilelayers: {
            grey: [],
            providers: [],
            timebased: null
        },
        bulk: {
            trashed: {
                points: [],
                layer: null
            },
            validated: {
                points: [],
                layer: null
            }
        }
    };

    // video
    var video = {
        ready: false,
        played: false,
        fps: 25,
        time: 0.0,
        player: null,
        segment: null
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

        // info
        info_init();

        // video
        video_init();

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

        $('#overlay').children().css('top',Math.round(h/2-$('#overlay').children().outerHeight(true)/2));

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
        $('#overlay .txt').html(msg);
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

        // tile layers
        var basemaps = leaflet_tilelayers();

        // instanciate leaflet
        leaflet.map = L.map('map', {
            keyboard: true,
            scrollWheelZoom: true,
            zoom: leaflet.zoom.base,
            minZoom: leaflet.zoom.min,
            maxZoom: leaflet.zoom.max,
            center: [46.205007,6.145134],
            layers: [_.first(_.values(basemaps))]
        });

        // layers
        leaflet.control.layers = L.control.layers(basemaps,{});
        leaflet.control.layers.addTo(leaflet.map);

        // scaling rule
        leaflet.control.scale = L.control.scale();
        leaflet.control.scale.addTo(leaflet.map);

        // event: window resize
        $(window).on('resize',function() {
            leaflet_resize();
        });

        /*
        // event: leaflet map zoom end
        leaflet.map.on('zoomend',function() {
            console.log('[zoom: '+leaflet.map.getZoom()+']');
        });
        */

    };

    /**
     * leaflet_resize()
     */
    var leaflet_resize = function() {
        $('#map').width($(window).width());
        $('#map').height($(window).height()-$('#timeline').outerHeight(true));
    };

    /**
     * leaflet_tilelayers()
     */
    var leaflet_tilelayers = function() {

        // tile providers
        var providers = [{
            name:           'OpenStreetMap Mapnik',
            url:            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution:    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>'
        }, {
            name:           'OpenStreetMap Black and White',
            url:            'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
            attribution:    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>'
        }, {
            name:           'Esri World Imagery',
            url:            'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution:    'Tiles &copy; Esri, ' +
                            'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }];

        // base maps
        var basemaps = {};

        // parse providers
        $.each(providers, function(index,provider) {

            // tilelayer
            var tilelayer = _.object([provider.name],[L.tileLayer(provider.url, {
                attribution: provider.attribution+' &nbsp;::&nbsp; Photogrammetric data &copy; <a href="http://foxel.ch/" target="_blank">FOXEL SA</a>',
                minZoom: leaflet.zoom.min,
                maxZoom: leaflet.zoom.max,
                maxNativeZoom: leaflet.zoom.native
            })]);

            // add to basemaps
            _.extend(basemaps,tilelayer);

            // keep pointer to tilelayer
            leaflet.tilelayers.providers.push(tilelayer);

        });

        // grey tilelayer
        var greytile = _.object(['Timebased Mode'],[L.tileLayer('img/tile.png',{})]);

        // keep pointer to tilelayer
        leaflet.tilelayers.grey.push(greytile);

        return basemaps;

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

        var type = pose.status;
        var css = 'marker-pnt '+color.replace('#','seg-')+' type-'+type;

        return new L.divIcon({
            html: '<div><span></span></div>',
            className: css,
            iconSize: new L.point(30,30)
        });

    };

    /**
     * leaflet_fitbounds()
     */
    var leaflet_fitbounds = function() {

        leaflet.bounds = null;

        // extract bounds of displayed segments
        $.each(segments_displayed(), function(index,layer) {
            if (_.isNull(leaflet.bounds))
                leaflet.bounds = layer.getBounds();
            else
                leaflet.bounds.extend(layer.getBounds());
        });

        // nothing displayed, nothing to do
        if (_.isNull(leaflet.bounds))
            return;

        // fit
        leaflet.map.fitBounds(leaflet.bounds);

        // unzoom if too close
        if (leaflet.map.getZoom() > leaflet.zoom.bounds)
            leaflet.map.setZoom(leaflet.zoom.bounds);
        else
            leaflet.map.setZoom(leaflet.map.getZoom()-1); // force redraw on some browsers

        // center map
        leaflet.map.panTo(leaflet.bounds.getCenter());

    };

    /**
     * leaflet_clear()
     */
    var leaflet_clear = function() {

        // trashed poses
        if (!_.isNull(leaflet.bulk.trashed.layer)) {
            leaflet.map.removeLayer(leaflet.bulk.trashed.layer);
            leaflet.control.layers.removeLayer(leaflet.bulk.trashed.layer);
        }

        // validated poses
        if (!_.isNull(leaflet.bulk.validated.layer)) {
            leaflet.map.removeLayer(leaflet.bulk.validated.layer);
            leaflet.control.layers.removeLayer(leaflet.bulk.validated.layer);
        }

        // overlays
        $.each(leaflet.overlays, function(index,layer) {
            leaflet.map.removeLayer(layer);
        });

        // pointers
        leaflet.poses = [];
        leaflet.videoframes = [];
        leaflet.overlays = [];
        leaflet.tilelayers.timebased = null;

        leaflet.bulk.trashed.points = [];
        leaflet.bulk.trashed.layer = null;
        leaflet.bulk.validated.points = [];
        leaflet.bulk.validated.layer = null;

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

        // close pose info
        info_close();

        // remove overlays
        $.each(segments_overlays(), function(i,layer) {
            layer.foxel.displayed = false;
            leaflet.map.removeLayer(layer);
        });

        // no selection, show all
        if (items.length == 0)
            segments_showall();

        // selection (single or multiple) made, show filtered
        else
            segments_showselection(items);

    };

    /**
     * info_init()
     */
    var info_init = function() {

        // event: mouse click (info close)
        $('#info .close a').on('click',function(e) {

            e.preventDefault();
            e.stopPropagation();

            // close pose info
            info_close();

        });

        // event: keyboard click (info close)
        $('#jump').on('keyup',function(e) {

            e.preventDefault();
            if (e.keyCode != 13) // enter
                return;

            // requested
            var req = parseInt($('#jump').val(),10);

            // clear
            $('#jump').val('');

            // invalid
            if (_.isNaN(req))
                return;

            // not in range
            if (req < 1 || req > leaflet.info.current.pose.length)
                return;

            // display
            info_display(leaflet.info.current.pose.segment,req-1);

        });

    };

    /**
     * info_display()
     */
    var info_display = function(segment,index) {

        // retrieve pose info
        var info = leaflet.poses[segment+'_'+index];

        // switch video source
        if (video.segment != segment) {
            video.ready = false;
            video.played = false;
            video.segment = segment;
            if (info.state.preview)
                video.player.src({type:'video/webm',src:storage.master.localhost+'/'+segment+'/preview/'+info.state.debayer+'/segment.webm'});
            else
                video.player.src(null);
        }

        // video frame
        var videoframe = _.indexOf(leaflet.videoframes[segment],parseInt(index,10));

        // video time
        video.time = 0.0;
        if (videoframe > -1)
            video.time = (videoframe/video.fps).toPrecision(6);

        // video set current time
        if (videoframe > -1 && video.ready)
            video.player.currentTime(video.time);

        // marker and map
        info_marker(segment,index);

        return false;

    };
    window.info_display = info_display; // global scope

    /**
     * info_marker()
     */
    var info_marker = function(segment,index) {

        // retrieve pose info
        var info = leaflet.poses[segment+'_'+index];

        // center map
        leaflet.map.panTo(L.latLng(info.geo.lat,info.geo.lng));

        // remove static marker
        if (!_.isNull(leaflet.info.layer))
            leaflet.map.removeLayer(leaflet.info.layer);

        // static marker
        leaflet.info.layer = L.marker(L.latLng(info.geo.lat,info.geo.lng),{icon:L.icon({
            iconUrl: 'img/pose-icon.png',
            iconRetinaUrl: 'img/pose-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 39]
        })});

        // add static marker
        leaflet.info.current = info;
        leaflet.map.addLayer(leaflet.info.layer);

        // show
        $('#info').slideDown('fast',function() {

            var data = '<div class="timestamp">'+info.time.sec+' '+info.time.usc+'</div>';

            // milliseconds
            var ms = new Date(parseInt(info.time.sec,10)*1000);

            // geo
            if (info.state.gps) {
                data += '<div class="section">Geo</div>'
                      + '<table>'
                      + '<tr><td class="attr">Latitude</td><td>'+info.geo.lat+'</td></tr>'
                      + '<tr><td class="attr">Longitude</td><td>'+info.geo.lng+'</td></tr>'
                      + '<tr><td class="attr">Altitude</td><td>'+info.geo.alt+'</td></tr>'
                      + '</table>';
            }

            // status
            data += '<div class="section">Status</div>'
                  + '<table>'
                  + '<tr><td class="attr">GPS</td><td>'+(info.state.guess?'Guessed':'Received')+'</td></tr>'
                  + '<tr><td class="attr">JP4</td><td>'+info.state.jp4+'</td></tr>'
                  + '<tr><td class="attr">Segment</td><td>'+(info.state.splitted?'Splitted':'Not splitted yet')+'</td></tr>'
                  + '</table>';

            // date
            data += '<div class="section">Date</div>'
                  + '<table>'
                  + '<tr><td class="attr">UTC</td><td>'+ms.simple_utc()+'</td></tr>'
                  + '<tr><td class="attr">Local</td><td>'+ms.simple_local()+'</td></tr>'
                  + '</table>';

            // preview
            var src = '';
            if (!info.state.preview || info.state.trashed || info.state.corrupted)
                src = '<img src="img/def.png" alt="" width="640" height="320" />';

            // nav
            var nav = '';
            if (info.pose.index > 0)
                nav += '<a href="#" onclick="return info_display(\''+info.pose.segment+'\',\''+(info.pose.index-1)+'\');"><span class="prev"></span>Prev</a>';
            if (info.pose.pos < info.pose.length)
                nav += '<a href="#" onclick="return info_display(\''+info.pose.segment+'\',\''+(info.pose.index+1)+'\');">Next<span class="next"></span></a>';

            // set content
            $('#info .data').html(data);
            $('#info .preview').html(src);
            $('#info .nav > div').html(nav);
            $('#info .pose').html('Segment '+info.pose.segment+' &nbsp; &nbsp; &nbsp; Pose '+info.pose.pos+' of '+info.pose.length);

        });

    };

    /**
     * info_close()
     */
    var info_close = function() {

        // stop video
        video.player.pause();

        // remove static marker
        if (!_.isNull(leaflet.info.layer))
            leaflet.map.removeLayer(leaflet.info.layer);

        // clear
        leaflet.info.layer = null;
        leaflet.info.current = null;

        // wait some time for the player to stop
        setTimeout(function() {

            // hide
            $('#info').slideUp('fast');

        },250);

    };

    /**
     * video_init()
     */
    var video_init = function() {

        // instanciate video.js
        video.player = videojs('vid', {
            "controls": true,
            "preload": "auto",
            "loop": true,
            "autoplay": false,
            "techOrder": ["html5"],
            "children": {
                "bigPlayButton": false,
                "controlBar": {
                    "currentTimeDisplay": false,
                    "timeDivider": false,
                    "durationDisplay": false,
                    "children": {
                        "volumeControl": false,
                        "muteToggle": false
                    }
                }
            }
        })
            .on('canplay',function() {
                video.ready = true;
                if (!video.played)
                    video.player.currentTime(video.time);
                video.played = true;
        })
            .on('timeupdate',function() {
                var frame = parseInt((video.player.currentTime()*video.fps).toPrecision(6),10);
                var pose = leaflet.videoframes[video.segment][frame];
                info_marker(video.segment,pose);
        })
            .on('play',function() {
                if (leaflet.map.getZoom() > leaflet.zoom.bounds)
                    leaflet.map.setZoom(leaflet.zoom.bounds);
        });

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
                $.each(masters, function(master,obj) {

                    var id = mac+'/'+master;

                    // option
                    optgroup.append($('<option>',{'value':id}).text(JSON.stringify({master:master,name:obj.name})));

                    // keep segments
                    storage.segmentation.push({
                        master: master,
                        segments: obj.segments
                    });

                });
                select.append(optgroup);
            });

            // instanciate select2
            select.select2({
                placeholder: 'Select raw data set...',
                formatResult: function(item) {
                    if (!item.id) return item.text; // optgroup
                    var obj = JSON.parse(item.text);
                    var date = new Date(parseInt(obj.master,10)*1000); // milliseconds
                    var name = !_.isNull(obj.name) ? ' - '+obj.name : '';
                    return obj.master+name+'<div class="master dates">UTC: '+date.simple_utc()+' &nbsp; &nbsp; Local: '+date.simple_local()+'</div></div>';
                },
                formatSelection: function(item) {
                    var obj = JSON.parse(item.text);
                    var date = new Date(parseInt(obj.master,10)*1000); // milliseconds
                    var name = !_.isNull(obj.name) ? ' - '+obj.name : '';
                    return item.id.replace('/',' :: <strong>')+name+'</strong>';
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
            overlay_message('Failed to retrieve initial JSON data<br />Incorrect mount point ?');
        });

    };

    /**
     * rawdata_selected()
     */
    var rawdata_selected = function() {

        // close pose info
        info_close();

        // keep choice
        var value = $('#master select').val().split('/');
        storage.mac = value[0];
        storage.master.timestamp = value[1];
        storage.master.path = storage.root+'/camera/'+storage.mac+'/raw/segment/'+storage.master.timestamp;
        storage.master.localhost = '/data/camera/'+storage.mac+'/raw/segment/'+storage.master.timestamp;

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
        leaflet_clear();

        // whole list
        $.each(storage.json.keys, function(sid,key) {

            var filepath = storage.master.path+'/'+key+'/csps/exports/';

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

        // extreme poses
        var poses = {
            first: _.first(data.pose),
            last: _.last(data.pose)
        };

        // range
        var length = data.pose.length;
        var range = {
            start: parseInt(poses.first.sec,10)*1000+parseInt(poses.first.usc,10)/1000,
            end: parseInt(poses.last.sec,10)*1000+parseInt(poses.last.usc,10)/1000
        };

        // color
        var color = leaflet.colors.segments[sid % leaflet.colors.segments.length];

        // timeline range
        timeline.items.push({
            id: segment,
            content: ''+segment+' ('+length+' poses'+(data.gps?'':', no GPS fix')+')',
            start: range.start,
            end: range.end,
            className: 'timeline'+color.replace('#','-')
        });

        // trace
        var trace = [];

        // segment feature group [trace,cluster]
        var segmentlayer = new L.featureGroup();

        // cluster
        var cluster = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 25,
            singleMarkerMode: false,
            spiderfyOnMaxZoom: true,
            animateAddingMarkers: false,
            iconCreateFunction: function(cluster) {
                return leaflet_cluster_icon(cluster,color);
            }
        });

        // timebased segment
        if (!data.gps)
            leaflet.timebased.index++;

        // shift
        var shift = {
            lat: leaflet.timebased.shift.lat,
            lng: 0,
            buffer: null
        };

        // video frames
        leaflet.videoframes[segment] = [];

        // parse poses
        $.each(data.pose, function(index,pose) {

            // timebased shifting
            if (!data.gps) {

                var displace = 0;
                var usec = parseInt(pose.sec,10)*1000000+parseInt(pose.usc,10);
                if (!_.isNull(shift.buffer))
                    displace = (usec-shift.buffer)/2000000000;
                shift.lng += displace;
                shift.buffer = usec;

                // position
                pose.lat = leaflet.timebased.index * shift.lat;
                pose.lng = shift.lng;

            }

            // geo point
            var latlng = L.latLng(pose.lat,pose.lng);

            // trace
            trace.push(latlng);

            // icon
            var icon = leaflet_marker_icon(pose,color);

            // pose info
            leaflet.poses[segment+'_'+index] = {
                segment: segment,
                time: {
                    sec: pose.sec,
                    usc: String(pose.usc).zeropad(6)
                },
                pose: {
                    segment: segment,
                    index: index,
                    pos: index+1,
                    length: length
                },
                geo: {
                    lat: pose.lat,
                    lng: pose.lng,
                    alt: pose.alt
                },
                state: {
                    gps: data.gps,
                    guess: pose.guess,
                    status: pose.status,
                    jp4: (pose.status=='eof' ? 'Corrupted (EOF)' : pose.status.charAt(0).toUpperCase()+pose.status.slice(1)),
                    splitted: data.split,
                    trashed: (pose.status=='trashed'),
                    corrupted: (pose.status=='eof'),
                    preview: !_.isNull(data.preview),
                    debayer: data.preview
                }
            };

            // video frames
            if (leaflet.poses[segment+'_'+index].state.preview && !leaflet.poses[segment+'_'+index].state.trashed && !leaflet.poses[segment+'_'+index].state.corrupted)
                leaflet.videoframes[segment].push(index);

            // cluster marker
            var clustermarker = new L.marker(latlng,{icon:icon})
                .on('click', function() {
                    info_display(segment,index);
            });

            // add cluster marker to cluster
            cluster.addLayer(clustermarker);

            // add to trashed poses
            if (pose.status=='trashed' || pose.status=='eof') {
                leaflet.bulk.trashed.points.push(L.circle(latlng, 0.55, {
                    color: '#000',
                    opacity: 1,
                    fill: false
                }));
            }

            // add to validated poses
            else if (pose.status=='validated') {
                leaflet.bulk.validated.points.push(L.circle(latlng, 0.55, {
                    color: '#912cee',
                    opacity: 1,
                    fill: false
                }));
            }

        });

        // trace polyline
        var polyline = L.polyline(trace, {
            color: color,
            weight: 2,
            smoothFactor: 1,
            opacity: 1
        })
            .on('click', function() {
                timeline_select([segment]);
                timeline.vis.setSelection(segment);
            }
        );

        // add to segmentlayer [trace,cluster]
        segmentlayer.addLayer(polyline);
        segmentlayer.addLayer(cluster);

        // segmentlayer custom properties
        _.extend(segmentlayer, {
            foxel: {
                type: 'segment',
                segment: segment,
                gps: data.gps,
                displayed: false
            }
        });

        // keep pointers to layers
        leaflet.overlays.push(segmentlayer);

        // mark as done
        storage.json.remaining--;

        // last parsing
        if (storage.json.remaining == 0)
            segments_parsed();

    };

    /**
     * segments_overlays()
     */
    var segments_overlays = function() {
        return _.filter(leaflet.overlays, function(layer) {
            return !_.isUndefined(layer.foxel) && layer.foxel.type=='segment';
        });
    };

    /**
     * segments_timebased()
     */
    var segments_timebased = function(timebased) {
        timebased = _.isUndefined(timebased) ? true : timebased;
        return _.filter(segments_overlays(), function(layer) {
            return timebased ? !layer.foxel.gps : layer.foxel.gps;
        });
    };

    /**
     * segments_displayed()
     */
    var segments_displayed = function(displayed) {
        displayed = _.isUndefined(displayed) ? true : displayed;
        return _.filter(segments_overlays(), function(layer) {
            return displayed ? layer.foxel.displayed : !layer.foxel.displayed;
        });
    };

    /**
     * segments_parsed()
     */
    var segments_parsed = function() {

        // timebased only
        leaflet.timebased.only = segments_timebased().length == segments_overlays().length;

        // update timeline
        timeline.vis.setItems(timeline.items);
        timeline.vis.fit();

        // add segments to map
        segments_showall();

        // add trashed/validated poses to map
        bulk_poses();

        // display
        overlay_hide();
        console.log('[done. last segment parsed]');

    };

    /**
     * segments_showall()
     */
    var segments_showall = function() {

        // add segments to map (timebased only, or every another one otherwise)
        $.each(segments_timebased(leaflet.timebased.only), function(index,layer) {
            layer.foxel.displayed = true;
            leaflet.map.addLayer(layer);
        });

        // tilelayers
        segments_tilelayers();

        // fit and center map on bounds
        leaflet_fitbounds();

    };

    /**
     * segments_showselection()
     */
    var segments_showselection = function(items) {

        var selected = [];
        var count = {
            gps: 0,
            timebased: 0
        };

        // extract segments layers from selection
        $.each(segments_overlays(), function(i,layer) {

            // not in selection
            if (!_.contains(items,layer.foxel.segment))
                return;

            // type
            if (layer.foxel.gps)
                count.gps++;
            else
                count.timebased++;

            // keep
            selected.push(layer);

        });

        // detected mixed (gps and timebased) selection
        var mixed = count.gps > 0 && count.timebased > 0;

        // add filtered segments to map
        $.each(selected, function(index,layer) {

            // mixed case, keep only gps based
            if (mixed && !layer.foxel.gps)
                return;

            // add to map
            layer.foxel.displayed = true;
            leaflet.map.addLayer(layer);

        });

        // tilelayers
        segments_tilelayers();

        // fit and center map on bounds
        leaflet_fitbounds();

    };

    /**
     * segments_tilelayers()
     */
    var segments_tilelayers = function() {

        // state
        var timebased = !_.first(segments_displayed()).foxel.gps;
        if (!_.isNull(leaflet.tilelayers.timebased) && timebased == leaflet.tilelayers.timebased)
            return;

        // new stage
        leaflet.tilelayers.timebased = timebased;

        // layers
        var add = timebased ? leaflet.tilelayers.grey : leaflet.tilelayers.providers;
        var remove = timebased ? leaflet.tilelayers.providers : leaflet.tilelayers.grey;

        // remove
        $.each(remove,function(index,obj) {

            var key = _.first(_.keys(obj));
            var layer = obj[key];

            leaflet.map.removeLayer(layer);
            leaflet.control.layers.removeLayer(layer);

        });

        // add
        $.each(add,function(index,obj) {

            var key = _.first(_.keys(obj));
            var layer = obj[key];

            if (index == 0)
                leaflet.map.addLayer(layer);
            leaflet.control.layers.addBaseLayer(layer,key);

        });

    };

    /**
     * bulk_poses()
     */
    var bulk_poses = function() {

        // trashed
        leaflet.bulk.trashed.layer = L.layerGroup(leaflet.bulk.trashed.points);
        leaflet.control.layers.addOverlay(leaflet.bulk.trashed.layer,'Trashed poses (#'+leaflet.bulk.trashed.points.length+') only (all segments)');

        // validated
        leaflet.bulk.validated.layer = L.layerGroup(leaflet.bulk.validated.points);
        leaflet.control.layers.addOverlay(leaflet.bulk.validated.layer,'Validated poses (#'+leaflet.bulk.validated.points.length+') only (all segments)');

    };

    // extend string prototype
    String.prototype.zeropad = function(length) {
        var string = this;
        while (string.length < length)
            string = '0'+string;
        return string;
    };

    // extend date prototype
    Date.prototype.simple_utc = function() {
        var ms = this;
        return String(ms.getUTCDate()).zeropad(2)+'.'+String((ms.getUTCMonth()+1)).zeropad(2)+'.'+ms.getUTCFullYear()+' '
              +String(ms.getUTCHours()).zeropad(2)+':'+String(ms.getUTCMinutes()).zeropad(2)+':'+String(ms.getUTCSeconds()).zeropad(2);
    };

    // extend date prototype
    Date.prototype.simple_local = function() {
        var ms = this;
        var gmt = ms.getTimezoneOffset()/-60;
        return String(ms.getDate()).zeropad(2)+'.'+String((ms.getMonth()+1)).zeropad(2)+'.'+ms.getFullYear()+' '
              +String(ms.getHours()).zeropad(2)+':'+String(ms.getMinutes()).zeropad(2)+':'+String(ms.getSeconds()).zeropad(2)+' '
              +'GMT '+(gmt>0?'+':'')+gmt;
    };

    // init
    rawdata_navigator_init();

});
