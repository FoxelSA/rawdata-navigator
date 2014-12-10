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

"use strict";

/**
 * RawDataNavigator class
 * Constructor of RawDataNavigator.
 */
var RawDataNavigator = new function() {

    /**
     * init()
     */
    this.init = function(args) {

        if (!_.isObject(args))
            args = {};

        prototyping.init();
        storage.init(args);

        // dom
        overlay.init();
        map.init();
        timeline.init();
        information.init();

        // allocation
        allocation.init();

    };

    /**
     * info()
     */
    this.info = function(segment,index) {
        information.show(segment,index);
    };

    /**
     * storage object
     */
    var storage = {

        mountpoint: '/data',
        hostpoint: '/data',

        /**
         * storage.init()
         */
        init: function(args) {

            // mount-point
            if (_.has(args,'mountpoint'))
                this.mountpoint = args.mountpoint;

            // host-point
            if (_.has(args,'hostpoint'))
                this.hostpoint = args.hostpoint;

        }

    };

    /**
     * overlay object
     */
    var overlay = {

        _dom: '#overlay',

        /**
         * overlay.init()
         */
        init: function() {
            this.events();
            this.resize();
        },

        /**
         * overlay.events()
         */
        events: function() {
            $(window).on('resize',function() {
                overlay.resize();
            });
        },

        /**
         * overlay.show()
         */
        show: function(msg) {
            $(this._dom).css('display','block');
            $(this._dom+' .txt').html(msg);
        },

        /**
         * overlay.hide()
         */
        hide: function() {
            $(this._dom).css('display','none');
        },

        /**
         * overlay.resize()
         */
        resize: function() {
            $('body').css('overflow','hidden');
            $(this._dom).width($(window).width());
            $(this._dom).children().width($(window).width());
            $(this._dom).height($(window).height());
            $(this._dom).children().css(
                'top',Math.round($(window).height()/2-$(this._dom).children().outerHeight(true)/2));
            $('body').css('overflow','visible');
        }

    };

    /**
     * timeline object
     */
    var timeline = {

        _items: [],
        _component: null,
        _dom: '#timeline',

        /**
         * timeline.init()
         */
        init: function() {

            // vis.js
            this._component = new vis.Timeline($(this._dom).get(0),[],{
                height: $(this._dom).outerHeight(true),
                stack: false,
                selectable: true
            });

            // events
            this.events();

        },

        /**
         * timeline.events()
         */
        events: function() {
            this._component.on('select',function(e) {
                timeline.select(e.items);
            });
        },

        /**
         * timeline.add()
         */
        add: function(segment,info,poses) {
            this._items.push({
                id: segment,
                content: segment+' ('+poses.length+' poses'+(info.gps?'':', no GPS fix')+')',
                start: parseInt(_.first(poses).sec,10)*1000+parseInt(_.first(poses).usc,10)/1000,
                end: parseInt(_.last(poses).sec,10)*1000+parseInt(_.last(poses).usc,10)/1000,
                className: 'timeline'+info.color.replace('#','-')
            });
        },

        /**
         * timeline.update()
         */
        update: function() {
            this._component.setItems(this._items);
            this._component.fit();
        },

        /**
         * timeline.select()
         */
        select: function(items) {

            if (!_.isArray(items))
                items = [items];

            // highlight
            this._component.setSelection(items);

            // information
            information.close();

            // remove overlays
            map.segments.clear();

            // show segments
            _.isEmpty(items) ? map.segments.show() : map.segments.selection(items);

        },

        /**
         * timeline.clear()
         */
        clear: function() {
            this._items = [];
            this._component.clear({items:true});
        }

    };

    /**
     * allocation object
     */
    var allocation = {

        _component: null,
        _dom: '#allocation',
        _tree: [],

        /**
         * allocation.init()
         */
        init: function() {

            // component
            this._component = $(this._dom+' select');

            // size
            this._component.width($(this._dom).width());

            // placeholder
            this._component.append($('<option>'));

            // select2
            this._component.select2({
                placeholder: 'Select a dataset...',
                formatResult: this.formatters.item,
                formatSelection: this.formatters.selection,
                sortResults: this.formatters.sorting
            });

            // events
            this.events();

            // load
            this.json.load();

        },

        /**
         * allocation.events()
         */
        events: function() {
            this._component.on('change',function() {
                allocation.select();
            });
        },

        /**
         * allocation.add()
         */
        add: function(mac,master,obj) {

            // tree mac
            if (!_.isArray(this._tree[mac]))
                this._tree[mac] = [];

            // tree master
            if (!_.isArray(this._tree[mac][master]))
                this._tree[mac][master] = [];

            // tree segments
            this._tree[mac][master] = obj.segments;

            // selector
            this._component.append(
                $('<option>',{'value':mac+'/'+master})
                    .text(JSON.stringify({master:master,mac:mac,name:obj.name})));

        },

        /**
         * allocation.select()
         */
        select: function() {
            this.clear();
            this.set();
            segmentation.json.load();
        },

        /**
         * allocation.set()
         */
        set: function() {
            var val = this._component.val().split('/');
            this.current.mac = val[0];
            this.current.master = val[1];
            this.current.path = storage.mountpoint+'/camera/'+this.current.mac+'/raw/segment/'+this.current.master;
            this.current.host = storage.hostpoint+'/camera/'+this.current.mac+'/raw/segment/'+this.current.master;
        },

        /**
         * allocation.show()
         */
        show: function() {
            $(this._dom).show();
        },

        /**
         * allocation.clear()
         */
        clear: function() {
            information.close();
            timeline.clear();
            map.clear();
            segmentation.clear();
        },

        /**
         * allocation.current{}
         */
        current: {

            mac: null,
            master: null,
            path: null,
            host: null,

            /**
             * allocation.current.segments()
             */
            segments: function() {
                return allocation._tree[this.mac][this.master];
            }

        },

        /**
         * allocation.json{}
         */
        json: {

            /**
             * allocation.json.load()
             */
            load: function() {
                overlay.show('Loading master allocations from<br />'+storage.mountpoint+'/');
                $.getJSON('php/autosegments.php?storage='+storage.mountpoint,allocation.json.success).fail(allocation.json.fail);
            },

            /**
             * allocation.json.success()
             */
            success: function(data) {

                // parse json
                $.each(data, function(mac,masters) {
                    $.each(masters, function(master,obj) {
                        allocation.add(mac,master,obj);
                    });
                });

                // gui
                overlay.hide();
                allocation.show();

            },

            /**
             * allocation.json.fail()
             */
            fail: function() {
                overlay.show('Failed to load master allocations from<br />'+storage.mountpoint+'/');
            }

        },

        /**
         * allocation.formatters{}
         */
        formatters: {

            /**
             * allocation.formatters.item()
             */
            item: function(item) {

                // optgroup
                if (!item.id)
                    return this.formatters.group(item);

                // properties
                var obj = JSON.parse(item.text);
                var date = new Date(parseInt(obj.master,10)*1000); // milliseconds
                var name = !_.isNull(obj.name) ? '<div class="name">'+obj.name+'</div>' : '';

                return '<div class="allocation"><span></span>'+obj.master
                            + '<div class="info">'+name
                            + '<div class="camera">Camera: '+obj.mac+'</div>'
                            + '<div class="date">UTC: '+date.getSimpleUTCDate()
                                + ' &nbsp; Local: '+date.getSimpleLocalDate()+'</div></div></div>';

            },

            /**
             * allocation.formatters.group()
             */
            group: function(item) {
                return item.text;
            },

            /**
             * allocation.formatters.selection()
             */
            selection: function(item) {
                var obj = JSON.parse(item.text);
                var name = !_.isNull(obj.name) ? ' - '+obj.name : '';
                return item.id.replace('/',' :: <strong>')+name+'</strong>';
            },

            /**
             * allocation.formatters.sorting()
             */
            sorting: function(results,container,query) {
                return _.sortBy(results,function(item) {
                    return JSON.parse(item.text).master;
                }).reverse();
            }

        }

    };

    /**
     * segmentation object
     */
    var segmentation = {

        _items: {},
        _colors: ['#f00','#0c0','#00f'],

        /**
         * segmentation.items()
         */
        items: function() {
            return this._items;
        },

        /**
         * segmentation.geolocated()
         */
        geolocated: function() {
            return _.filter(this.items(), function(item) {
                return item.info.gps;
            });
        },

        /**
         * segmentation.linear()
         */
        linear: function() {
            return _.filter(this.items(), function(item) {
                return !item.info.gps;
            });
        },

        /**
         * segmentation.add()
         */
        add: function(segment,obj) {
            _.extend(this._items,_.object([segment],[obj]));
        },

        /**
         * segmentation.item()
         */
        item: function(segment) {
            return this._items[segment];
        },

        /**
         * segmentation.info()
         */
        info: function(segment) {
            return this.item(segment).info;
        },

        /**
         * segmentation.layer()
         */
        layer: function(segment) {
            return this.item(segment).layer;
        },

        /**
         * segmentation.poses()
         */
        poses: function(segment) {
            return this.item(segment).poses;
        },

        /**
         * segmentation.pose()
         */
        pose: function(segment,index) {
            return this.poses(segment)[index];
        },

        /**
         * segmentation.vframes()
         */
        vframes: function(segment) {
            return this.item(segment).vframes;
        },

        /**
         * segmentation.vframe()
         */
        vframe: function(segment,index) {
            return this.vframes(segment)[index];
        },

        /**
         * segmentation.vframeindex()
         */
        vframeindex: function(segment,index) {
            return _.indexOf(this.vframes(segment),parseInt(index,10));
        },

        /**
         * segmentation.clear()
         */
        clear: function() {
            this._items = {};
        },

        /**
         * segmentation.json{}
         */
        json: {

            _remaining: 0,

            /**
             * segmentation.json.load()
             */
            load: function() {
                overlay.show('Loading segments from<br />'+allocation.current.path+'/');
                this._remaining = allocation.current.segments().length;
                $.each(allocation.current.segments(), function(index,segment) {
                    $.getJSON('php/csps-json.php?json='+allocation.current.path+'/'+segment+'/info/rawdata-autoseg/',function(data) {
                        segmentation.json.success(index,segment,data);
                    }).fail(segmentation.json.fail);
                });
            },

            /**
             * segmentation.json.success()
             */
            success: function(index,segment,data) {
                _.extend(data,{segment:segment});
                this.parse(index,segment,data);
            },

            /**
             * segmentation.json.fail()
             */
            fail: function() {
                overlay.show('Failed to load segments from<br />'+allocation.current.path+'/');
            },

            /**
             * segmentation.json.parse()
             */
            parse: function(call,segment,data) {

                var poses = [];
                var vframes = [];

                var info = {
                    gps: data.gps,
                    split: data.split,
                    preview: !_.isNull(data.preview),
                    debayer: data.preview,
                    color: segmentation._colors[call % segmentation._colors.length]
                };

                var track = [];
                var layer = map.helpers.layer(segment);
                var cluster = map.helpers.cluster.group(info);

                // gui
                overlay.show('Building layers, please wait...');

                // poses
                $.each(data.pose, function(index,pose) {

                    // geopoint
                    var latlng = map.helpers.latlng(pose,info,call,index);

                    // add on track
                    track.push(latlng);

                    // add on vframes
                    if (info.preview && pose.status=='validated')
                        vframes.push(index);

                    // add on cluster
                    cluster.addLayer(map.helpers.cluster.marker(segment,pose,latlng,info,index));

                    // add on poses
                    poses[index] = {
                        sec: pose.sec,
                        usc: String(pose.usc).zeropad(6),
                        latlng: latlng,
                        alt: pose.alt,
                        guess: pose.guess,
                        status: pose.status
                    };

                });

                // add on layer
                layer.addLayer(map.helpers.polyline(segment,info,track));
                layer.addLayer(cluster);

                // add on timeline
                timeline.add(segment,info,data.pose);

                // segmentation
                segmentation.add(segment,{info:info,layer:layer,poses:poses,vframes:vframes});
                this._remaining--;

                // last parsing
                if (this._remaining == 0)
                    this.done();

            },

            /**
             * segmentation.json.done()
             */
            done: function() {
                timeline.update();
                map.segments.show();
                overlay.hide();
            }

        }

    };

    /**
     * map object
     */
    var map = {

        _component: null,
        _dom: '#map',

        /**
         * map.init()
         */
        init: function() {

            this.events();
            this.resize();

            // leaflet
            this._component = L.map('map', {
                keyboard: true,
                scrollWheelZoom: true,
                boxZoom: false,
                zoom: this.zoom.default,
                minZoom: this.zoom.min,
                maxZoom: this.zoom.max,
                center: [46.205007,6.145134]
            });

            // scale
            L.control.scale().addTo(this._component);

            // tiles
            this.tiles.init();

        },

        /**
         * map.events()
         */
        events: function() {
            $(window).on('resize',function() {
                map.resize();
            });
        },

        /**
         * map.resize()
         */
        resize: function() {
            $(this._dom).width($(window).width());
            $(this._dom).height($(window).height()-$(timeline._dom).outerHeight(true));
        },

        /**
         * map.clear()
         */
        clear: function() {
            this.segments.clear();
            this.tiles.reset();
        },

        /**
         * map.zoom{}
         */
        zoom: {

            default: 4,
            min: 3,
            max: 25,
            native: 18,
            bounds: 17,

            /**
             * map.zoom.fit()
             */
            fit: function() {

                var bounds = null;
                $.each(map.segments.displayed(), function(index,layer) {
                    _.isNull(bounds) ?
                        bounds = layer.getBounds() : bounds.extend(layer.getBounds());
                });

                // empty
                if (_.isNull(bounds))
                    return;

                // fit
                map._component.fitBounds(bounds);

                // zoom
                this.bounding();

                // center
                map._component.panTo(bounds.getCenter());

            },

            /**
             * map.zoom.bounding()
             */
            bounding: function() {
                var zoom = map._component.getZoom() > this.bounds ?
                    this.bounds : map._component.getZoom();
                map._component.setZoom(zoom);
            }

        },

        /**
         * map.tiles{}
         */
        tiles: {

            _maps: [],
            _static: null,
            _linear: null,

            control: null,

            /**
             * map.tiles.init()
             */
            init: function() {

                this.control = L.control.layers({},{}).addTo(map._component);

                this.maps();
                this.static();

            },

            /**
             * map.tiles.maps()
             */
            maps: function() {

                if (!_.isEmpty(this._maps))
                    return this._maps;

                // sources
                var sources = [{
                    description: 'OpenStreetMap Mapnik',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '
                                    + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>'
                }, {
                    description: 'OpenStreetMap Black and White',
                    url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '
                                    + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>'
                }, {
                    description: 'Esri World Imagery',
                    url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    attribution: 'Tiles &copy; Esri, '
                                    + 'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }];

                // layers
                $.each(sources, function(index,source) {

                    var layer = _.extend(
                        L.tileLayer(source.url, {
                            attribution: source.attribution
                                + ' &nbsp;::&nbsp; Photogrammetric data &copy; <a href="http://foxel.ch/" target="_blank">FOXEL SA</a>',
                            minZoom: map.zoom.min,
                            maxZoom: map.zoom.max,
                            maxNativeZoom: map.zoom.native
                        }),{
                            description:source.description
                        });

                    // reference
                    map.tiles._maps.push(layer);

                    // add to map
                    if (index == 0)
                        map._component.addLayer(layer);

                    // add to layer control
                    map.tiles.control.addBaseLayer(layer,source.description);

                });

            },

            /**
             * map.tiles.static()
             */
            static: function() {

                if (!_.isNull(this._static))
                    return this._static;

                this._static = _.extend(
                    L.tileLayer('img/tile.png', {
                        attribution: 'Photogrammetric data &copy; <a href="http://foxel.ch/" target="_blank">FOXEL SA</a>',
                        minZoom: map.zoom.min,
                        maxZoom: map.zoom.max
                    }),{
                        description:'Timebased Mode'
                    });

            },

            /**
             * map.tiles.update()
             */
            update: function() {

                var item = _.first(map.segments.displayed());
                var info = segmentation.info(item.segment);

                if (!_.isNull(this._linear) && !info.gps == this._linear)
                    return;
                this._linear = !info.gps;

                // current tiles
                $.each((!info.gps ? this.maps() : [this.static()]),function(index,layer) {
                    map._component.removeLayer(layer);
                    map.tiles.control.removeLayer(layer);
                });

                // updated tiles
                $.each((!info.gps ? [this.static()] : this.maps()),function(index,layer) {
                    if (index == 0)
                        map._component.addLayer(layer);
                    map.tiles.control.addBaseLayer(layer,layer.description);
                });

            },

            /**
             * map.tiles.reset()
             */
            reset: function() {
                this._linear = null;
            }

        },

        /**
         * map.segments{}
         */
        segments: {

            /**
             * map.segments.layers()
             */
            layers: function() {
                var layers = [];
                $.each(segmentation.items(), function(index,item) {
                    layers.push(item.layer);
                });
                return layers;
            },

            /**
             * map.segments.displayed()
             */
            displayed: function() {
                return _.filter(this.layers(), function(layer) {
                    return layer.displayed;
                });
            },

            /**
             * map.segments.show()
             */
            show: function() {

                var segments = _.isEmpty(segmentation.geolocated()) ?
                    segmentation.linear() : segmentation.geolocated();

                // add to map
                $.each(segments, function(index,segment) {
                    segment.layer.displayed = true;
                    map._component.addLayer(segment.layer);
                });

                // map
                map.tiles.update();
                map.zoom.fit();

            },

            /**
             * map.segments.selection()
             */
            selection: function(items) {

                var geolocated = 0;
                var linear = 0;
                var selected = [];

                // filter
                $.each(segmentation.items(), function(index,segment) {
                    if (!_.contains(items,index))
                        return;
                    segment.info.gps ? geolocated++ : linear++; // detect mixed geolocated+linear selection
                    selected.push(segment);
                });

                // add to map
                $.each(selected, function(index,segment) {
                    if (geolocated > 0 && linear > 0 && !segment.info.gps) // mixed then filter on geolocated
                        return;
                    segment.layer.displayed = true;
                    map._component.addLayer(segment.layer);
                });

                // map
                map.tiles.update();
                map.zoom.fit();

            },

            /**
             * map.segments.clear()
             */
            clear: function() {
                $.each(this.layers(), function(index,layer) {
                    layer.displayed = false;
                    map._component.removeLayer(layer);
                });
            }

        },

        /**
         * map.helpers{}
         */
        helpers: {

            /**
             * map.helpers.layer()
             */
            layer: function(segment) {
                return _.extend(new L.featureGroup(), {
                    segment: segment,
                    displayed: false
                });
            },

            /**
             * map.helpers.latlng()
             */
            latlng: function(pose,info,vshift,hshift) {
                if (!info.gps) {
                    pose.lat = vshift * -0.005;
                    pose.lng = hshift * 0.00005;
                }
                return L.latLng(pose.lat,pose.lng);
            },

            /**
             * map.helpers.polyline()
             */
            polyline: function(segment,info,track) {
                return L.polyline(track, {
                    color: info.color,
                    weight: 3,
                    smoothFactor: 1,
                    opacity: 1
                }).on('click', function() {
                    timeline.select(segment);
                });
            },

            /**
             * map.cluster{}
             */
            cluster: {

                /**
                 * map.helpers.cluster.group()
                 */
                group: function(info) {
                    return new L.MarkerClusterGroup({
                        showCoverageOnHover: false,
                        maxClusterRadius: 25,
                        singleMarkerMode: false,
                        spiderfyOnMaxZoom: true,
                        animateAddingMarkers: false,
                        iconCreateFunction: function(cluster) {
                            var c = cluster.getChildCount();
                            return L.divIcon({
                                html: '<div><span>'+c+'</span></div>',
                                className: 'marker-cluster marker-cluster-'
                                    + (c < 50 ? 'small' : '')+(c >= 50 && c < 100 ? 'medium' : '')+(c >= 100 ? 'large' : '')
                                    + ' '+info.color.replace('#','seg-'),
                                iconSize: L.point(40,40)
                            });
                        }
                    });
                },

                /**
                 * map.helpers.cluster.marker()
                 */
                marker: function(segment,pose,latlng,info,index) {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            html: '<div><span></span></div>',
                            className: 'marker-pnt '+info.color.replace('#','seg-')+' type-'+pose.status,
                            iconSize: L.point(30,30)
                        })
                    }).on('click', function() {
                        information.show(segment,index);
                    });
                }

            }

        }

    };

    /**
     * information object
     */
    var information = {

        _component: null,
        _dom: '#info',

        _segment: null,
        _index: null,
        _layer: null,

        /**
         * information.init()
         */
        init: function() {
            this._component = $(this._dom+' .data');
            this.events();
            this.video.init();
        },

        /**
         * information.events()
         */
        events: function() {

            // close
            $(this._dom+' .close a').on('click',function(e) {
                e.preventDefault();
                e.stopPropagation();
                information.close();
            });

            // jump
            $('#jump').on('keyup',function(e) {

                e.preventDefault();
                if (e.keyCode != 13) // enter
                    return;

                // value
                var req = parseInt($('#jump').val(),10);
                $('#jump').val('');

                // invalid
                if (_.isNaN(req))
                    return;
                // not in range
                if (req < 1 || req > segmentation.poses(information._segment).length)
                    return;

                // display
                information.show(information._segment,req-1);

            });

        },

        /**
         * information.show()
         */
        show: function(segment,index) {

            var info = segmentation.info(segment);
            var pose = segmentation.pose(segment,index);
            var videoframe = segmentation.vframeindex(segment,index);

            // change source
            if (this.video._segment != segment && videoframe > -1) {
                this.video.clear();
                this.video._segment = segment;
                if (info.preview)
                    this.video._player.src({type:'video/webm',src:allocation.current.host+'/'+segment+'/preview/'+info.debayer+'/segment.webm'});
            }

            // timing
            this.video._timing = 0.0;
            if (videoframe > -1)
                this.video._timing = (videoframe/this.video._fps).toPrecision(6);

            // go to timing
            if (videoframe > -1 && this.video._ready)
                this.video._player.currentTime(this.video._timing);

            // details
            this.details(segment,index);

        },

        /**
         * information.details()
         */
        details: function(segment,index) {

            index = parseInt(index,10);
            var info = segmentation.info(segment);
            var pose = segmentation.pose(segment,index);
            var poses = segmentation.poses(segment);

            // center map
            map._component.panTo(pose.latlng);

            // clear marker
            if (!_.isNull(this._layer))
                map._component.removeLayer(this._layer);

            // static marker
            this._layer = L.marker(pose.latlng,{icon:L.icon({
                iconUrl: 'img/pose-icon.png',
                iconRetinaUrl: 'img/pose-icon-2x.png',
                iconSize: [25, 41],
                iconAnchor: [12, 39]
            })});

            // add static marker
            this._segment = segment;
            this._index = index;
            map._component.addLayer(this._layer);

            // show
            $(this._dom).slideDown('fast',function() {

                // timestamp
                information._component.find('.timestamp').html(pose.sec+'.'+pose.usc);

                // geo
                if (info.gps) {
                    information._component.find('.section.geo').css('display','block');
                    information._component.find('.lat').html(pose.latlng.lat);
                    information._component.find('.lng').html(pose.latlng.lng);
                    information._component.find('.alt').html(pose.alt);
                } else {
                    information._component.find('.section.geo').css('display','none');
                    information._component.find('.lat').html('');
                    information._component.find('.lng').html('');
                    information._component.find('.alt').html('');
                }

                // status
                information._component.find('.gps').html(info.gps?(pose.guess?'Guessed':'Valid'):'No GPS fix');
                information._component.find('.jp4').html(pose.status.charAt(0).toUpperCase()+pose.status.slice(1));
                information._component.find('.split').html(info.split?'Yes':'No');

                // date
                var date = new Date(parseInt(pose.sec,10)*1000);
                information._component.find('.utc').html(date.getSimpleUTCDate());
                information._component.find('.gmt').html(date.getSimpleLocalDate());

                // html
                $(information._dom+' .preview').html(
                    (!info.preview || pose.status!='validated') ? '<img src="img/def.png" alt="" width="640" height="320" />' : ''
                );
                $(information._dom+' .nav > div').html(
                    ((index > 0) ? '<a href="#" onclick="RawDataNavigator.info(\''+segment+'\',\''+(index-1)+'\');return false;"><span class="prev"></span>Prev</a>' : '')
                    + ((index+1 < poses.length) ? '<a href="#" onclick="RawDataNavigator.info(\''+segment+'\',\''+(index+1)+'\');return false;">Next<span class="next"></span></a>' : '')
                );
                $(information._dom+' .pose').html(
                    'Segment '+segment+' &nbsp; &nbsp; &nbsp; '
                    + 'Pose '+(index+1)+' of '+poses.length
                );

            });

        },

        /**
         * information.close()
         */
        close: function() {

            this.video.clear();
            this.clear();

            // wait for the player to stop
            setTimeout(function() {
                $(information._dom).slideUp('fast');
            },250);

        },

        /**
         * information.clear()
         */
        clear: function() {
            if (!_.isNull(this._layer))
                map._component.removeLayer(this._layer);
            this._layer = null;
            this._segment = null;
            this._index = null;
        },

        /**
         * information.video{}
         */
        video: {

            _component: null,
            _dom: '#video',
            _player: null,

            _ready: false,
            _changed: true,
            _fps: 25,
            _timing: 0.0,
            _segment: null,

            /**
             * information.video.init()
             */
            init: function() {

                // vis.js
                this._player = videojs('vid', {
                    controls: true,
                    preload: 'auto',
                    loop: true,
                    autoplay: false,
                    techOrder: ['html5'],
                    children: {
                        bigPlayButton: false,
                        controlBar: {
                            currentTimeDisplay: false,
                            timeDivider: false,
                            durationDisplay: false,
                            children: {
                                volumeControl: false,
                                muteToggle: false
                            }
                        }
                    }
                });

                // events
                this.events();

            },

            /**
             * information.video.events()
             */
            events: function() {

                this._player.on('canplay',function() {
                    information.video._ready = true;
                    if (information.video._changed)
                        information.video._player.currentTime(information.video._timing);
                    information.video._changed = false;
                });

                this._player.on('timeupdate',function() {
                    var frame = parseInt((information.video._player.currentTime()*information.video._fps).toPrecision(6),10);
                    information.details(information.video._segment,segmentation.vframe(information.video._segment,frame));
                });

                this._player.on('play',function() {
                    map.zoom.bounding();
                });

            },

            /**
             * information.video.clear()
             */
            clear: function() {

                this._ready = false;
                this._changed = true;
                this._timing = 0.0;

                this._player.pause();
                this._player.src(null);
            }

        }

    };

    /**
     * prototyping object
     */
    var prototyping = {

        /**
         * prototyping.init()
         */
        init: function() {
            this.string();
            this.date();
        },

        /**
         * prototyping.string()
         */
        string: function() {
            String.prototype.zeropad = function(length) {
                var string = this;
                while (string.length < length)
                    string = '0'+string;
                return string;
            };
        },

        /**
         * prototyping.date()
         */
        date: function() {

            Date.prototype.getSimpleUTCDate = function() {
                var ms = this;
                if (_.isNaN(ms.getUTCDate()))
                    return 'Invalid date';
                return String(ms.getUTCDate()).zeropad(2)+'.'+String((ms.getUTCMonth()+1)).zeropad(2)+'.'+ms.getUTCFullYear()+' '
                      +String(ms.getUTCHours()).zeropad(2)+':'+String(ms.getUTCMinutes()).zeropad(2)+':'+String(ms.getUTCSeconds()).zeropad(2);
            };

            Date.prototype.getSimpleLocalDate = function() {
                var ms = this;
                if (_.isNaN(ms.getDate()))
                    return 'Invalid date';
                var gmt = ms.getTimezoneOffset()/-60;
                return String(ms.getDate()).zeropad(2)+'.'+String((ms.getMonth()+1)).zeropad(2)+'.'+ms.getFullYear()+' '
                      +String(ms.getHours()).zeropad(2)+':'+String(ms.getMinutes()).zeropad(2)+':'+String(ms.getSeconds()).zeropad(2)+' '
                      +'GMT '+(gmt>0?'+':'')+gmt;
            };

        }

    };

};
