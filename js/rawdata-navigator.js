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
 * Contributor(s):
 *
 *      Luc Deschenaux <l.deschenaux@foxel.ch>
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

L.Map.prototype.panToOffset = function (latlng, offset, options) {
    return this.panTo(latlng,options);
}

L.Map.prototype.panToOffset = function (latlng, offset, options) {
    var x = this.latLngToContainerPoint(latlng).x - (offset?offset[0]:0);
    var y = this.latLngToContainerPoint(latlng).y - (offset?offset[1]:0);
    var point = this.containerPointToLatLng([x, y])
    return this.setView(point, this._zoom, { pan: options })
}

/**
 * DAV class
 * Constructor of DAV.
 */
var DAV = new function() {

    /**
     * [public] DAV.init()
     */
    this.init = function(args) {

        var dav=this;

        if (!_.isObject(args))
            args = {};

        prototyping.init();
        storage.init(args);

        // dom
        overlay.init();
        map.init();
        leftbar.init();

        // init panels
        $.each(window._panels,function(){
          this.init();
        });

        // setup resize event handlers
        $(window).on('resize.dav',function(e){
          // resize panels
          $.each(window._panels,function(){
            var panel=this;
            panel[e.type](e);
          });
        });

        // setup infopanel viewer buttons
        $('.panel').on('click.viewer_button','.viewers a', function(e){
            var panel=window._panels[e.target.id.substr(2)];
            if (!$('iframe',panel._dom).attr('src').length) {
                $('iframe',panel._dom).attr('src',panel.url);
            }
            panel.toggle();
        });

        // setup panel close button handler
        $('.panel').on('click.panel_close','.close a',function(e){
          var id=$(e.target).closest('.panel').attr('id');
          var panel=window._panels[id];
          if (panel.content && panel.content.closebutton_click) {
            if (panel.content.closebutton_click(e)===false) {
              return false;
            }
          }
          if (panel.closebutton_click) {
            if (panel.closebutton_click(e)===false) {
              return false;
            }
          }
          panel.hide();
        });

        // update map._offset on panel visibility events
        map.panelState={};
        $(leftpanel._dom+', '+infopanel._dom).on('visible hidden',function(e) {
          map.panelState[e.target.id]=e.type;
          var offset_h=0;
          $.each(map.panelState,function(id,visibility){
            if (visibility=="visible") {
              offset_h=Math.max($('#'+id).outerWidth(true)/2,offset_h);
            }
          });
          if (offset_h>0) offset_h=leftpanel._width/2;
          if (offset_h!=map._offset[0]) {
            map._offset=[offset_h,0];
          }
          // scroll map if marker is displayed
          if (information.overview._marker) {
            map._component.panToOffset(information.overview._marker.getLatLng(),map._offset);
          }
        });

        home.init();
        leftpanel.setContent(home);
        timeline.init();
        information.init();

        // allocation
        allocation.init();

    };

    var home = this.home = {

        _dom: '#home',

        _dom2: '#vignettes',

        init: function home_init(){

          var home=this;
          $('.views .button',leftpanel._dom).on('click',function(e){

            if ($(e.target).hasClass('current')) {
              return;
            }

            switch(e.target.id) {
            case 'viewasvignette': leftpanel.expand(); break;
            case 'viewonmap': leftpanel.shrink(); break;
            }

            $('.views .button',leftpanel._dom).toggleClass('current');

          });

        }
    };


    /**
     * [public] info()
     */
    this.info = function(segment,index) {
        information.show(segment,index);
    };

    /**
     * storage object
     */
    var storage = this.storage = {

        mountpoint: '/data',

        /**
         * storage.init()
         */
        init: function(args) {
            if (_.has(args,'mountpoint'))
                this.mountpoint = args.mountpoint;
        }

    };

    /**
     * overlay object
     */
    var overlay = this.overlay = {

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
    var timeline = this.timeline = {

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
            this.resize();

        },

        /**
         * timeline.events()
         */
        events: function() {
            var timeline=this;
            timeline._component.on('select',function(e) {
                timeline.select(e.items);
            });
            $(timeline._dom).on('resize.timeline',timeline.resize);
        },

        /**
         * timeline.resize()
         */
        resize: function timeline_resize(e){
          var timeline=this;
          $(timeline._dom).width($(window).width-$(leftbar._dom).outerWidth(true));
        },

        /**
         * timeline.add()
         */
        add: function(segment,info,poses,validated,trashed,corrupted) {
            this._items.push({
                id: segment,
                content: '<div id="timeline_'+segment+'"></div><strong>'+segment+'</strong>',
                start: parseInt(_.first(poses).sec,10)*1000+parseInt(_.first(poses).usc,10)/1000,
                end: parseInt(_.last(poses).sec,10)*1000+parseInt(_.last(poses).usc,10)/1000,
                className: 'timeline'+info.color.replace('#','-'),
                segmentation: {
                    length: poses.length,
                    validated: validated,
                    trashed: trashed,
                    corrupted: corrupted,
                    gps: info.gps,
                    split: info.split,
                    preview: info.preview,
                    debayer: info.debayer
                }
            });
        },

        /**
         * timeline.update()
         */
        update: function() {

            if (!this._component)
                return;

            // date range
            var min = _.min(this._items,function(item) {
                    return item.start;
                });
            var max = _.max(this._items,function(item) {
                    return item.end;
                });
            var ts = (max.end-min.start)/100;

            // range locking
            this._component.setOptions({
                min: min.start-ts,
                max: max.end+ts
            });

            // update the timeline
            this._component.setItems(this._items);
            this._component.fit();

            // events hack
            $.each(this._items,function(index,item) {

                // mouse enter
                timeline.box(item.id).on('mouseenter',function(e) {
                    $('#statistics div').html(item.segmentation.length+' poses'
                        + ' ['+item.segmentation.validated+' valid, '+item.segmentation.trashed+' trashed, '+item.segmentation.corrupted+' corrupted]'
                        + ' <span>GPS :&nbsp; '+(item.segmentation.gps?'Yes':'No')+'</span>'
                        + ' <span>Splitted :&nbsp; '+(item.segmentation.split?'Yes':'No')+'</span>'
                        + ' <span>Preview :&nbsp; '+(item.segmentation.preview?'Yes ('+item.segmentation.debayer+')':'No')+'</span>');
                    $('#statistics').stop(true,false).slideDown(100);
                });

                // mouse leave
                timeline.box(item.id).on('mouseleave',function(e) {
                    $('#statistics').stop(true,false).slideUp(100);
                });

                // right-click
                timeline.box(item.id).bind('contextmenu',function(e) {

                    e.preventDefault();
                    e.stopPropagation();

                    // select
                    timeline.rightclick(item.id);

                });
            });

        },

        /**
         * timeline.box()
         */
        box: function(segment) {
            return $('#timeline_'+segment).parent().parent();
        },

        /**
         * timeline.boxes()
         */
        boxes: function() {
            return $(this._dom+' .item.range');
        },

        /**
         * timeline.active()
         */
        active: function(segment) {
            timeline.boxes().removeClass('information');
            if (!_.isNull(segment))
                timeline.box(segment).addClass('information');
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
         * timeline.rightclick()
         */
        rightclick: function(segment) {

            // remove overlays
            map.segments.clear();

            // show segment
            map.segments.selection([segment]);

            // show information on videoframe
            var vframe = segmentation.vframe(segment,0);
            information.show(segment,_.isUndefined(vframe)?0:vframe);

        },

        /**
         * timeline.clear()
         */
        clear: function() {
            this._items = [];
            if (this._component)
                this._component.clear({items:true});
        }

    };

    /**
     * allocation object
     */
    var allocation = this.allocation = {

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
    var segmentation = this.segmentation = {

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
                vignettes.clear();
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

                var validated = 0;
                var trashed = 0;
                var corrupted = 0;

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

                    // type
                    if (pose.status=='trashed')
                        trashed++;
                    else if (pose.status=='corrupted')
                        corrupted++;
                    else
                        validated++;

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

                    if (pose.status=="validated") {
                        // add to vignettes
                        vignettes.add({
                            segment: segment,
                            segment_info: info,
                            pose_index: index,
                            pose: poses[index]
                        });
                    }
                });

                // add on layer
                layer.addLayer(map.helpers.polyline(segment,info,track));
                layer.addLayer(cluster);

                // add on timeline
                timeline.add(segment,info,data.pose,validated,trashed,corrupted);

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
     * leftbar object
     */
    var leftbar = this.leftbar = {

      _dom: "#leftbar",

      init: function leftbar_init(){
        this.events();
      },

      events: function leftbar_events() {
        $('a, img',leftbar._dom).on('click.leftbar',leftbar.click);

        $(window).on('resize.leftbar',leftbar.resize);

        $(document).on('fullscreenchange.leftbar',function(){
          $('.fullscreen',leftbar._dom).toggleClass('fa-expand fa-compress');
        });

        $(leftpanel._dom).on('hidden visible',function(e){
          return;
          /*
          if (e.type=="hidden") {
            $('a#panel_main')
            .addClass('fa-angle-double-right')
            .removeClass('fa-angle-double-left');
          } else {
            $('a#panel_main')
            .addClass('fa-angle-double-left')
            .removeClass('fa-angle-double-right');
          }
          */
        });
      },

      resize: function leftbar_resize(e) {
        $(leftbar._dom).height($(window).height());
      },

      click: function leftbar_click(e){

        switch(e.target.id) {

        case 'a_digitizingpanel':
          if (!$('iframe',digitizingpanel._dom).attr('src').length) {
            $('iframe',digitizingpanel._dom).attr('src',digitizingpanel.url);
          }
          break;

        case 'leftbar_fullscreen':
          $(document).toggleFullScreen();
          break;

        }

        if ($(e.target).hasClass('panel_button')) {
          window._panels[$(e.target).attr('id').substr(2)].toggle();
        }

      },

    }; // leftbar

    function Panel(options) {
      if (!(this instanceof Panel)) {
        return new Panel(options);
      }
      $.extend(true,this,options);
      this.register();
    }

    $.extend(Panel.prototype,{

      _dom: "#leftpanel",
      _pool: "#panels",
      _width: 512,
      _background_rgb: "0,0,0",
      _background_alpha: 0.8,

      visible: false,

      _base_zIndex: 100,

    init: function panel_init() {
        var panel=this;

        // set hover title for leftbar icon
        $('#a_'+panel._dom.substr(1)).attr('title',panel._title);

        if (panel._expand) {
          panel.expand();
        }

        if (panel.visible) {
          panel.show();
        }

    }, // panel_init

    register: function panel_register() {

        // first panel instantiated ?
        if (!window._panels) {
          // create panel list
          window._panels={};
        }

        // register panel
        window._panels[this._dom.substr(1)]=this;

    }, // panel register

    resize: function panel_resize(e){

      var panel=this;

      $(panel._dom).height($(window).height()-$(timeline._dom).outerHeight(true));

      if (panel.expanded){
        panel.expand();
      }
      if (panel.visible){
        panel.show('resize');
      }
    }, // panel_resize

    isprimary: function panel_isprimary() {
      return $(this._dom).hasClass('primary');
    }, // panel_isprimary

    toggle: function panel_toggle(){

      var panel=this;

      // panel is visible
      if (panel.visible) {

        // bring to front if not toplevel and is secondary
        if (!panel.isprimary() && !panel.istoplevel()) {
          panel.setTitle();
          panel._level=panel.gettoplevel()+1;
          $(panel._dom).css({
              transition: 'none',
              opacity: 0.0,
              zIndex: panel._base_zIndex+panel._level
          });
          setTimeout(function(){
          $(panel._dom).css({
              transition: '',
              opacity: 1.0
          });
          },100);
          return;
        }

        // if we clicked on the dav button
        if ($(panel._dom).hasClass('primary')) {

          // in that case close all open secondary panels
          var closedOne=false;
          var topp=toppanel();
          $.each(window._panels,function(){
            if (this.visible && $(this._dom).hasClass('secondary')) {
              this.hide((topp && topp._level>this._level));
              closedOne=true;
            }
          });

          // dont hide primary panel in case we just closed some secondary one(s)
          if (closedOne) {
            return;
          }

          // close information panel first
          panel.closebutton_click();
          return
          
        }

        // hide the requested panel
        panel.hide();


      } else { 
        
        // close secondary panels if the primary one is requested
        if ($(panel._dom).hasClass('primary')) {

          // close all open secondary panels
          var closedOne=false;
          var topp=toppanel();
          $.each(window._panels,function(){
            if (this.visible && $(this._dom).hasClass('secondary')) {
              this.hide((topp && topp._level>this._level));
              closedOne=true;
            }
          });

          // show also information if any vignette is selected
          if (information.visible && $('.current',vignettes._dom).length) {
            setTimeout(function(){
              infopanel.show();
            },1000);
          }
        }

        // show panel
        panel.show();

      }
    }, // panel_toggle

    updateTitle: function panel_updateTitle() {

        var panel=this;
        var toplevel=0;
        var panels={};

        $.each(window._panels,function(){
          if (this.visible && this!=panel) {
            panels[this._level]=this;
            toplevel=Math.max(this._level,toplevel); 
          }
        });

        if (panels[toplevel]) {
          panels[toplevel].setTitle();
        }

    }, // panel_gettoplevel

    gettoplevel: function panel_gettoplevel() {

        var panel=this;
        var toplevel=0;

        $.each(window._panels,function(){
          if (this.visible && this!=panel) {
            toplevel=Math.max(this._level,toplevel); 
          }
        });

        return toplevel;

    }, // panel_gettoplevel

    bringtotop: function panel_bringtotop() {

        var panel=this;

        panel._level=panel.gettoplevel()+1;
        $(panel._dom).css('zIndex',panel._base_zIndex+panel._level);

    }, // panel_bringtotop

    istoplevel: function panel_istoplevel() {
        return this._level>this.gettoplevel();
    }, // panel_istoplevel

    hide: function panel_hide(now){
      var panel=this;

      if (now) {
        $(panel._dom).css('transition','none');
      }

      $(panel._dom).css({
        left: -panel._currentWidth,
        'background-color': 'rbga('+panel._background_rgb+','+panel._background_alpha/2+')'
      });

      if (now) {
        $(panel._dom).css({
            transition: '',
            display: 'none'
        });
      }

      panel.visible=false;
      panel._level=0;

      panel.updateTitle();

      $(panel._dom).trigger('hidden');

    }, // panel_hide

    show: function panel_show(resize){

      var panel=this;

      if (resize){
        $(panel._dom).css('transition','none');
      } else {
        if (!panel.isprimary()) {
          // update zindex
          panel.bringtotop();
        }
        panel.setTitle();
      }

      $(panel._dom).css({
        visibility: 'visible',
        display: 'block',
        left: $(leftbar._dom).outerWidth(true),
        'background-color': 'rgba('+panel._background_rgb+','+panel._background_alpha+')'
      });

      panel._currentWidth=$(panel._dom).width();

      if (resize){
        $(panel._dom).css('transition','');
      } else {
        panel.visible=true;
        $(panel._dom).trigger('visible');
      }

    }, // panel_show

    setTitle: function panel_setTitle() {
      var panel=this;
      if (panel._title) {
        $('.paneltitle').css({
            transition: 'none',
            opacity: 0
        });
        $('.paneltitle div').text(panel._title);
        setTimeout(function(){
          $('.paneltitle').css({
              transition: '',
              'opacity': 1.0
          });
        },500);
      } else {
        $('.paneltitle').css('opacity',0);
      }
    }, // panel_setTitle

    setContent: function panel_setContent(content){
      var panel=this;

      if (panel.content==content){
        return;
      }

      // hide previous content
      if (panel.content && panel.content._dom) {
        $(panel._pool).append($(panel.content._dom));
      }

      // set new content
      $('.content',panel._dom)
      .empty()
      .append($(content._dom).css('visibility','visible'));

      panel.content=content;
      content.parent=panel;

      // trigger ready event for content._dom
      $(content._dom).trigger('ready');

    }, // panel_setContent

    setContent2: function panel_setContent2(content){
      var panel=this;

      if (panel.content2==content){
        return;
      }

      // hide previous content
      if (panel.content2 && panel.content2._dom) {
        $(panel._pool).append($(panel.content2._dom));
      }

      if (!content) {
        return;
      }

      // set new content
      $('.content2',panel._dom)
      .empty()
      .append($(content._dom).css('visibility','visible'));

      panel.content2=content;
      content.parent=panel;

      // trigger ready event for content._dom
      $(content._dom).trigger('ready');

    }, // panel_setContent2

    // expand panel to full screen width
    expand: function panel_expand() {
      var panel=this;
      panel._currentWidth=$(window).width()-$(leftbar._dom).outerWidth(true);
      if (!panel.visible) {
        $(panel._dom).css('left',-panel._currentWidth);
      }
      $(panel._dom).css('width',panel._currentWidth);

      try {
        $('.content2',panel._dom).css('width',panel._currentWidth-$('.content2',panel._dom).offset().left);
      } catch(e) {}

      panel.expanded=true;
      setTimeout(function(){
        $(panel._dom).trigger('expand');
      },1000);
    },

    // shrink panel from full screen to normal width
    shrink: function panel_shrink() {
      var panel=this;
      panel._currentWidth=panel._width;
      $(panel._dom).css('width',panel._currentWidth);
      panel.expanded=false;
      setTimeout(function(){
        $(panel._dom).trigger('shrink');
      },1000);
    }

  }); // extend panel prototype


  /**
   * leftpanels
   */
  var leftpanel = this.leftpanel = new Panel({
      _level: 1,
      _dom: "#leftpanel",
      _pool: "#panels",
      _backround_alpha: 0.8,
      closebutton_click: function leftpanel_closebutton_click(e){
          var panel=this;
          if (information.visible) {
            information.close();
            setTimeout(function(){
             panel.hide();
            },1000);
            return false;
          } else {
            panel.hide();
          }
      },

  });

  var infopanel = this.infopanel = new Panel({
      _level: 2,
      _dom: "#infopanel",
      _pool: "#panels2",
      _background_alpha: 1.0
  });

  var digitizingpanel = this.digitizingpanel = new Panel({
      _title: "Digitizing",
      _expand: true,
      _dom: "#digitizingpanel",
      _background_alpha: 1.0,
      url: 'http://project-osrm.org/osrm-frontend-v2/'
  });

  var processingpanel = this.processingpanel = new Panel({
      _title: "Processing",
      _expand: true,
      _dom: "#processingpanel",
      _background_alpha: 1.0
  });

  var taxonomypanel = this.taxonomypanel = new Panel({
      _title: "Taxonomy",
      _expand: true,
      _dom: "#taxonomypanel",
      _background_alpha: 1.0
  });

  var configurationpanel = this.configurationpanel = new Panel({
      _title: "Configuration",
      _expand: true,
      _dom: "#configurationpanel",
      _background_alpha: 1.0,
  });

  var pointcloudpanel = this.pointcloudpanel = new Panel({
      _expand: true,
      _dom: "#pointcloudpanel",
      _background_alpha: 1.0,
      url: document.location.origin+'/potree'
  });

  var freepanel = this.freepanel = new Panel({
      _expand: true,
      _dom: "#freepanel",
      _background_alpha: 1.0,
      url: document.location.origin+'/freepano'
  });

  /**
   * map object
   */
  var map = this.map = {

      _offset: [0,0],
      _component: null,
      _dom: '#map',

      /**
       * map.init()
       */
      init: function map_init() {

          this.events();
          this.resize();

          // leaflet
          this._component = L.map(this._dom.substring(1), {
              keyboard: true,
              scrollWheelZoom: true,
              boxZoom: false,
              zoomControl: false,
              scaleControl: false,
              layersControl: false,
              zoom: this.zoom.default,
              minZoom: this.zoom.min,
              maxZoom: this.zoom.max,
              center: [46.205007,6.145134]
          });

          this._component.fitBounds = function (bounds, options) {
              options = options || {};
              bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

              var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
                  paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

                  zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR)),
                  paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

                  swPoint = this.project(bounds.getSouthWest(), zoom),
                  nePoint = this.project(bounds.getNorthEast(), zoom),
                  center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

              this._zoom = options && options.maxZoom ? Math.min(options.maxZoom, zoom) : zoom;

              return this.panToOffset(center, DAV.map._offset, options);
          }
/*
          this._component.getCenter = function () { // (Boolean) -> LatLng                                                                                                                                                                
              this._checkIfLoaded();
              if (this._initialCenter && !this._moved()) {
                  return this._initialCenter;
              }
              return this.layerPointToLatLng(this._getCenterLayerPoint());
          }

          this._component._getCenterLayerPoint = function (vanilla) {
              var point = this.containerPointToLayerPoint(this.getSize()._divideBy(2));
              if (map._offset) {
                  point.x+=map._offset[0];
                  point.y+=map._offset[1];
              }
              return point;
          }

          // offset of the specified place to the current center in pixels
          this._component._getCenterOffset = function (latlng) {
              return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
          }
*/
/*
          this._component.setZoomAround = function (latlng, zoom, options) {
              var scale = this.getZoomScale(zoom);
              var viewHalf = this.getSize().divideBy(2);
              if (map._offset) {
                  viewHalf.x-=map._offset[0];
                  viewHalf.y-=map._offset[1];
              }
              
              var containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng);
              var centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale);
              var newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
              return this.setView(newCenter, zoom, {zoom: options});
          };
*/

          // scale
          L.control.scale({position: 'bottomleft'}).addTo(this._component);

          // zoom
          L.control.zoom({position: 'topright'}).addTo(this._component);

          // tiles
          this.tiles.init();

      }, // map_init

      /**
       * map.events()
       */
      events: function map_events() {
          $(window).on('resize.map',function() {
              map.resize();
          });
      }, // map_events

      /**
       * map.resize()
       */
      resize: function map_resize() {
        $(this._dom).width($(window).width()-$(leftbar._dom).outerWidth(true)); //-(parseInt($(information._dom).css('left'))>0?$(information._dom).outerWidth(true):0));
        $(this._dom).height($(window).height()-$(timeline._dom).outerHeight(true));

        // invalidate map size so that the center coords for panTo are updated
        if (this._component) {
          this._component.invalidateSize();
        }

      }, // map_resize

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
              map._component.panToOffset(bounds.getCenter(),map._offset);

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

              this.control = L.control.layers({},{},{position: 'bottomright'}).addTo(map._component);

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
              },
              /*
              {
                  description: 'OpenStreetMap Black and White',
                  url: 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
                  attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '
                                  + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC BY-SA</a>'
              },
              */
              {
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
              return _.extend(L.featureGroup(), {
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
                      information.click=true;
                      information.show(segment,index);
                      information.click=false;
                  });
              }

          }

      }

  };

  /**
   * information object
   */
  var information = this.information = {
      _width: 512,
      _currentWidth: 512,
      _buttonid: '#info_button',
      _component: null,
      _dom: '#pose_info',

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
          this.overview.init();
      },

      /**
       * closebutton_click
       */
      closebutton_click: function information_closebutton_click(e){
          information.close();
          information.visible=false;
          return false;
      },

      /**
       * information.events()
       */
      events: function information_events() {

          var information=this;

          $(this._buttonid).on('click',function(e){
             information.showPanel();
          });

          $(infopanel._dom).on('click.preview','.preview img',function(e){
            console.log('click');
            if (infopanel.expanded){
              information.video._player.pause();
              infopanel.shrink();
              return;
            } else {
              infopanel.expand();
            }

            information.video.resize();
            infopanel.setContent2(information.video);

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
        show: function information_show(segment,index) {

            var info = segmentation.info(segment);
            var pose = segmentation.pose(segment,index);
            var videoframe = segmentation.vframeindex(segment,index);

            vignettes.select(segment,index);

            // change source
            if (this._segment != segment && videoframe > -1) {
                this.video.clear();
                if (info.preview)
                    this.video._player.src({type:'video/webm',src:'php/segment-video.php?src='+allocation.current.path+'/'+segment+'/preview/'+info.debayer+'/segment'});
            }

            // change track
            if (this._segment != segment)
                this.overview.track(segment);

            // timeline
            timeline.active(segment);

            // store
            this._segment = segment;
            this._index = index;

            // timing
            this.video._timing = 0.0;
            if (videoframe > -1)
                this.video._timing = (videoframe/this.video._fps).toPrecision(6);

            // go to timing
            if (videoframe > -1 && this.video._ready)
                this.video._player.currentTime(this.video._timing);

            // details
            this.details(segment,index);

            this.showPanel();

        }, // information_show

        showPanel: function information_showPanel() {

            // hide info_button
            $(this._buttonid).hide();

            // set panel content
            infopanel.setContent(this);

            // show primary panel first, if not already visible
            if (!leftpanel.visible) {
              leftpanel.show();
              $(infopanel._dom).css('top',$('.views').outerHeight(true)+$('.views').position().top+10);
              infopanel.show();
              information.visible=true;
              return;
            }

            // show panel
            $(infopanel._dom).css('top',$('.views').outerHeight(true)+$('.views').position().top+10);
            infopanel.show();
            information.visible=true;

        }, // information_showPanel

        /**
         * information.details()
         */
        details: function(segment,index) {

            index = parseInt(index,10);
            var info = segmentation.info(segment);
            var pose = segmentation.pose(segment,index);
            var poses = segmentation.poses(segment);

            // static marker
            if (_.isNull(this._layer)) {

                this._layer = L.marker(pose.latlng,{icon:L.icon({
                    iconUrl: 'img/pose-icon.png',
                    iconRetinaUrl: 'img/pose-icon-2x.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 39]
                })});

                // add static marker on map
                map._component.addLayer(this._layer);

            }

            // place static marker
            this._layer.setLatLng(pose.latlng);

            // track marker
            information.overview.marker(segment,pose);

            // show preview
            var framepreview=(!info.preview || pose.status!='validated')?'img/nopreview.png':document.location.origin+allocation.current.path+'/'+segment+'/preview/'+info.debayer+'/0/'+pose.sec+'_'+pose.usc+'.jpeg';
            $('div.preview img').attr('src',framepreview);

            // show
            $(this._dom).show(0,function() {

                // fix overview
                information.overview._component.invalidateSize();

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
                $(information._dom+' .nav > div').html(
                    ((index > 0) ? '<a href="#" onclick="DAV.info(\''+segment+'\',\''+(index-1)+'\');return false;"><span class="prev"></span>Prev</a>' : '')
                    + ((index+1 < poses.length) ? '<a href="#" onclick="DAV.info(\''+segment+'\',\''+(index+1)+'\');return false;">Next<span class="next"></span></a>' : '')
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
            if (!information.visible) return;

            this.video.clear();
//            this.clear();
            timeline.active(null);

            setTimeout(function() {

              infopanel.hide();
              /*
              setTimeout(function(){
                $('#info_button').fadeIn();
              },1000);
              */

            },250);
            return false;
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
            _dom: '#video_player',
            _player: null,

            _ready: false,
            _changed: true,
            _fps: 25,
            _timing: 0.0,

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

                if (false) this._player.on('timeupdate',function() {
                    var frame = parseInt((information.video._player.currentTime()*information.video._fps).toPrecision(6),10);
                    information.details(information._segment,segmentation.vframe(information._segment,frame));
                });

                this._player.on('pause',function(){
                    if (information.panTimeout) {
                      clearTimeout(information.panTimeout);
                      information.panTimeout=null;
                    }
                    map._component.panToOffset(information.overview._marker.getLatLng(),map._offset);
                });

                $(window).on('resize.video',function(){
                  if (!DAV.information.video._player.isFullscreen()) 
                    DAV.information.video.resize();
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
            },

            resize: function information_video_resize() {
                var width=$('.content2',infopanel._dom).width();
                var height=$('.content2',infopanel._dom).height()-$('.content2',infopanel._dom).offset().top;

                if (height<width/2) {
                  width=(height-=20)*2;
                } else {
                  height=(width-=20)/2;
                }

                $(information.video._dom).width(width).height(height);
                $('.video',information.video._dom).width(width).height(height);
                information.video._player.width(width).height(height);
            }

        }, // information_video

        /**
         * information.overview{}
         */
        overview: {

            _component: null,
            _dom: '#map_overview',

            _track: null,
            _marker: null,

            /**
             * information.overview.init()
             */
            init: function() {

                // leaflet
                this._component = L.map(this._dom.substring(1), {
                    keyboard: false,
                    dragging: false,
                    touchZoom: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    zoomControl: false,
                    attributionControl:false,
                    zoom: map.zoom.default,
                    minZoom: map.zoom.min,
                    maxZoom: map.zoom.max,
                    center: [46.205007,6.145134]
                });

                // scale
                L.control.scale().addTo(this._component);

                // tiles
                var tiles = _.first(map.tiles.maps());

                // add tiles on map
                this._component.addLayer(
                    L.tileLayer(tiles._url, {
                        minZoom: tiles.options.minZoom,
                        maxZoom: tiles.options.maxZoom,
                        maxNativeZoom: tiles.options.maxNativeZoom
                    }));

            },

            /**
             * information.overview.track()
             */
            track: function(segment) {

                var info = segmentation.info(segment);
                var poses = segmentation.poses(segment);

                // hide map
                $(this._dom).css('visibility','hidden');

                // clear track
                if (!_.isNull(this._track))
                    this._component.removeLayer(this._track);

                // linear
                if (!info.gps)
                    return;

                // add on track
                var track = [];
                $.each(poses,function(index,pose) {
                    track.push(pose.latlng);
                });

                // add on map
                this._track = map.helpers.polyline(segment,info,track);
                this._component.addLayer(this._track);

                // bounds
                var bounds = this._track.getBounds();

                // show map
                $(information.overview._dom).css('visibility','visible');

                // wait a bit (leaflet take some time to be ready)
                setTimeout(function () {

                    // fit
                    information.overview._component.fitBounds(bounds);

                    // center
                    information.overview._component.panTo(bounds.getCenter());

                },500);

            },

            /**
             * information.overview.marker()
             */
            marker: function(segment,pose) {

                // track marker
                if (_.isNull(this._marker)) {

                    this._marker = L.marker(pose.latlng,{icon:L.icon({
                        iconUrl: 'img/pose-icon.png',
                        iconRetinaUrl: 'img/pose-icon-2x.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 39]
                    })});

                    // add track marker on map
                    this._component.addLayer(this._marker);

                }

                // place track marker
                this._marker.setLatLng(pose.latlng);
                if (information.click && information.visible==true){
                  information.panTimeout=null;
                } else {
                  information._layer.setLatLng(pose.latlng);
                  if (!information.panTimeout) {
                    information.panTimeout=setTimeout(function(){
                      map._component.panToOffset(pose.latlng,map._offset,{
                          duration: 0.05,
                          easeLinearity: 1.0,
                          noMoveStart: true
                      });
                      information.panTimeout=null;
                    },250);
                  }
                }

            }

        }

    };

    /**
     * prototyping object
     */
    var prototyping = this.prototyping = {

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

    }; // prototyping

    function Vignettes(options) {
      $.extend(true,this,options);
      this.init();
    }

    $.extend(true,Vignettes.prototype,{

        _dom: '#vignettes',

        _initialvalues: {
          list: [],
          first: -1,
          last: -1,
          _overflow: false,
          height: 0
        },

        init: function vignettes_init(){
          var vignettes=this;
          vignettes.clear();
          $(document).on('click',vignettes._dom+' .wrap',function(e){
            vignettes.click(e)
          });
          $(window).on('resize',function(e){
            vignettes.update(e);
          });
          $(document).on('expand',leftpanel._dom,function(e){
            vignettes.update(e);
          });

        }, // vignettes_init

        clear: function vignettes_clear(){
          var vignettes=this;
          $(vignettes._dom).empty();
          $.extend(vignettes, vignettes._initialvalues);
          $(vignettes._dom).off('scroll').on('scroll',function(e){
            vignettes.onscroll(e);
          });
        }, // vignettes_clear

        add: function vignettes_add(vignette){
          var vignettes=this;
          vignettes.list.push(vignette);
          if (vignettes._overflow) {
            return;
          }
          vignettes.show(vignettes.list.length-1);
        }, // vignettes_add

        show: function vignettes_show(index){
          if (!leftpanel.expanded) return;
          var vignettes=this;
          var vignette=vignettes.list[index];
          var date=new Date(vignette.pose.sec*1000);
          var html='<div class="wrap">';
          html+='<div class="timestamp">'+date.getSimpleUTCDate();
          html+='<a class="button fa fa-gear fa-fw"></a></div>';
          html+='<img class="thumb" alt="n/a" onerror="nopreview(this);" src="'+document.location.origin+allocation.current.path+'/'+vignette.segment+'/preview/'+vignette.segment_info.debayer+'/0/'+vignette.pose.sec+'_'+vignette.pose.usc+'.jpeg"></img>';
          html+='<div class="info">';
          html+='<div class="what">Poses (RAW DATA)</div>';
          html+='<div class="footer">INFORMATIONS</div>';
//          html+=vignette.info;
          html+='</div>';
          html+='</div>';
          var div;
          $(vignettes._dom).append(div=$('div:first',html).parent().data('index',index));
          if (vignettes.first<0) {
            vignettes.first=index;
            vignettes.height=div.outerHeight(true);
          }
          vignettes.last=index;
          if (!vignettes._overflow && vignettes.overflow()){
            vignettes._overflow=true;
            vignettes.remove_overflow=true;
            vignettes.update();
            vignettes.remove_overflow=false;
          }
        }, // vignettes_show

        onscroll: function vignettes_onscroll(e) {
          var vignettes=this;
          var container=$(vignettes._dom);
          if (container.innerHeight() + container.scrollTop() >= container.prop('scrollHeight')) {
            vignettes.addRow();
          }
        },

        click: function vignettes_click(e) {
          var index=$(e.target).closest('.wrap').data('index');
          var info=vignettes.list[index];
          information.click=true;
          information.show(info.segment,info.pose_index);
          information.click=false;
        }, // vignettes_click

        select: function vignettes_select(segment,pose_index){
          var vignettes=this;
          $('.current',vignettes._dom).removeClass('current');
          $('.wrap',vignettes._dom).each(function(){
            var index=$(this).data('index');
            var info=vignettes.list[index];
            if (info.pose_index==pose_index && info.segment==segment) {
              $(this).addClass('current');
            }
          });
        },

        // check for container overflow;
        overflow: function vignettes_overflow() {
          var vignettes=this;
          var container=$(vignettes._dom);
          return (container.prop('scrollHeight') > (container.height() + vignettes.height));
        }, // vignettes_overflow

        resize: function vignettes_resize(e) {
          var vignettes=this;
          var container=$(vignettes._dom);

          container.height(container.parent().height()-container.offset().top*2);
          container.width($(window).width()-container.offset().left+16);

        }, // vignettes_resize

        update: function vignettes_update(e) {

          if (!leftpanel.expanded) return;

          var vignettes=this;

          vignettes.resize();
          var container=$(vignettes._dom);

          var limit=container.height()+vignettes.height;

          // compute line length
          // and remove items overflowing (if remove_overflow is true)
          vignettes._overflow=false;
          vignettes._itemsperline=0;
          var firstop;
          $('.wrap',container).each(function(_index,div){
            div=$(div);
            if (vignettes._overflow){
              div.remove();
            } else {
              var top=div.offset().top;
              if (top>limit) {
                vignettes._overflow=true;
                if (!vignettes.remove_overflow) {
                  return false;
                }
                div.remove();
                var index=div.data('index');
                if (vignettes.last>=index) {
                  vignettes.last=index-1;
                  if (vignettes.first==index) {
                    vignettes.first=-1;
                    vignettes.last=-1;
                    $(container).empty();
                    return false;
                  }
                }
              } else {
                if (!firstop || top==firstop) {
                   ++vignettes._itemsperline;
                   firstop=top;
                 }
              }
            }
          });

          if (vignettes._overflow) return;

          // else fill empty space
          for (var i=vignettes.last+1; i<vignettes.list.length; ++i) {
            vignettes.show(i);
            if (vignettes._overflow) {
              return;
            }
          }

        }, // vignettes_update

        addRow: function vignettes_addRow() {
          var vignettes=this;
          var container=$(vignettes._dom);
          var sol=vignettes.last+1;
          var eol=vignettes.last+vignettes._itemsperline;
          if (sol>=vignettes.list.length) {
            return;
          }
          for (var i=sol; i<vignettes.list.length && i<=eol; ++i) {
            vignettes.show(i);
          }
        } // vignettes_addRow


    });  // Vignettes

    var vignettes = this.vignettes = new Vignettes();
    

}; // DAV


window.nopreview = function nopreview(img) {
  img.onerror=null;
  console.log('nopreview',img.src);
  img.src='img/nopreview.png';
};

window.toppanel = function toppanel(){
  var toplevel=0;
  var panel;
  $.each(window._panels,function(){
    if (this.visible && this._level>toplevel){
      toplevel=this._level;
      panel=this;
    }
  });
  return panel;
}

/*
window.getpanelstate = function getpanelstate() {
  var panel_state=[];
  $.each(window._panels,function(){
    var panel=this;
    if (panel.visible){
      panel_state.push([panel,panel._level]);
    }
  });
  return panel_state;
}
*/


