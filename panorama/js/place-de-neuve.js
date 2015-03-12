/*
 * freepano - WebGL panorama viewer
 *
 * Copyright (c) 2014-2015 FOXEL SA - http://foxel.ch
 * Please read <http://foxel.ch/license> for more information.
 *
 *
 * Author(s):
 *
 *      Luc Deschenaux <l.deschenaux@foxel.ch>
 *
 *
 * Contributor(s):
 *
 *      Alexandre Kraft <a.kraft@foxel.ch>
 *      Kevin Velickovic <k.velickovic@foxel.ch>
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

$(document).ready(function(){

  var filesToLoad=2;

  function file_onload() {
    --filesToLoad;
    if (!filesToLoad) {
      $(document).trigger('filesloaded');
    }
  }

  // load image with alpha channel to use as POI cursor
  window.poicursor_texture=new THREE.ImageUtils.loadTexture(
    '/dav/img/dav-cursor.png',
    THREE.UVMapping,
    file_onload,
    function onloaderror() {
      $.notify('Cannot load dav-cursor.png !');
    }
  );

  // load image with alpha channel to use as POI
  window.poi_texture=new THREE.ImageUtils.loadTexture(
    '/dav/img/dav-cursor-blank.png',
    THREE.UVMapping,
    file_onload,
    function onloaderror() {
      $.notify('Cannot load dav-cursor-blank.png !');
    }
  );

}); // ready

$(document).on('filesloaded', function(){

  $('#pano').panorama({
      defaults: {
        poi: {
          overlay: true
        }
      },

/*
 * Properties and methods defined here will extend or override properties
 * and methods of the panorama object instance before the init() method is run
 *
 * When using panorama.list below to define several panoramas,
 * properties and methods defined there will extend or override properties
 * and methods of the panorama object instance.
 *
 */

    // panorama.fov: camera field of view

    fov: {

      // initial field of view
      start: 120,

      // minimal field of view
      min: 1,

      // maximal field of view
      // fov > 120 results in non-rectilinear projection
      max: 120

    }, // fov

    // panorama.rotation: initial panorama sphere rotation

    rotation: {

      // vertical axis rotation
      heading: -90,

      // horizontal axis rotation
      // adjust in the viewer using <shift>-mousewheel
      tilt: 0,

      // depth axis rotation
      // adjust in the viewer using <alt>-mousewheel
      roll: 0,

      // rotation step for tilt and roll adjustment
      step: 0.1

    }, // rotation

/*
    // panorama.limits: limits

    limits: {

      // panorama vertical rotation limits
      lat: {
        min: -85,
        max: 85
      }

    }

*/
/*
    // panorama.camera: main camera options

*/
    camera: {

      zoom: {

        // initial zoom value
        current: 1.0,

        // maximal zoom value
        max: 15

      }

    }, // camera

    // panorama.sphere: sphere object defaults
    // normally you dont need to modify this

    sphere: {
      dynamicTileLoading: false
//      dynamicTileDisposal: false
    }, // sphere

/*
   // panorama.sound: sounds bound to panorama
   // When using 'panorama.list' below to configure several panoramas,
   // 'panorama.list.images[image].sound' properties and methods will
   // extend or modify values below

    sound: {

      // defaults for sounds defined in 'panorama.sound.list' below,
      // where more sound options are described

      defaults: {

        // sound type (only Howler is supported)
        type: 'howler',

        // event handlers
        onloaderror: function sound_onloaderror(sound_event) {
           console.log('sound_onloaderror: ',this,sound_event);
        },
        onload: null,
        onpause: null,
        onplay: null,
        onend: null

      },

      list: {

        // sound ID
        ambient1: {

          // Howler options
          src: ["ambient1.mp3"],
          autoplay: true,
          loop: true

        },

        ambient2: {
          src: ["welcome.mp3"]
          autoplay: true,
          loop: false
        }
      }

    },

    // panorama.poi: points of interest
    // When using panorama.list to define several panoramas,
    // poi options below are extended or overrided with the ones
    // from panorama.list.images[id].poi
*/
    poi: {

      // use a secondary scene for rendering widgets (eg when using filters)
      overlay: true,

//      camera: {
//        instance: new THREE.OrthographicCamera(-10,10,10,-10,0.1,15.1),
//      },

      // panorama.poi.defaults: default values for POI_list
      defaults: {

        // panorama.poi.defaults.poi: default values for POIs
        poi: {
          // set to false to disable mouse event handling
          handleMousevents: true,

          color: {
             active: '#bbbbbb',
             hover: '#dddddd',
             normal: '#ffffff',
             selected: '#ecb100'
          },

          radius: 14,

          initialScale: 0.3,

          object3D: function DAV_poi_object3D(){
              var poi=this;
              var object3D=new THREE.Object3D();

              // poi icon
              object3D.add(poi.icon());

              // poi title
              poi.title=poi.text2canvas(poi.metadata.name);
              console.log(poi.title);
              var map=new THREE.Texture(poi.title);
              map.needsUpdate=true;
              var mesh=new THREE.Mesh(
                new THREE.PlaneBufferGeometry(poi.title.width/150,poi.title.height/150,100),
                new THREE.MeshBasicMaterial({
                 map: map,
                 transparent: true,
                 depthWrite: true,
                 depthTest: true,
                 opacity: 0.8
                })
              );
              mesh.position.y=0.5;
              object3D.add(mesh);

              // poi line
              var geometry=new THREE.Geometry();
              geometry.vertices.push(
                new THREE.Vector3(0,0,-1),
                new THREE.Vector3(0,0.2,-1),
                new THREE.Vector3(0,0.52-poi.title.height/300,-1)
              );
              var line=new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial()
              );
              object3D.add(line);
              object3D.scale.x=object3D.scale.y=object3D.scale.z=poi.initialScale;

              return object3D;
          },

          icon: function DAV_poi_icon() {
            return new THREE.Mesh(
              new THREE.PlaneBufferGeometry(Math.PI/36,Math.PI/36,1,1),
              new THREE.MeshBasicMaterial({
                map: poi_texture,
                transparent: true,
                depthWrite: false,
                depthTest: false,
                opacity: 0.5
              })
            );
          }
        }, // defaults.poi

          // event handlers below are already filtered
          // eg: mousein and mouseout are not triggered during panorama rotation
          // if you really need, you can hook to the 'private' methods (eg: _mousein)

      }, // defaults

    }, // poi

      /*

      // panorama.poi.list
      list: {

        // POI identifier
        unicorn: {

          // to define the POI geometry you can either specify 'object'
          // as THREE.Object3D (default object is null)
          object: null,

          // ... or 'mesh' as THREE.mesh, (default mesh is a circle)
          mesh: new THREE.Mesh(new THREE.PlaneGeometry(Math.PI/18,Math.PI/18,1,1), new THREE.MeshBasicMaterial({
            map: unicorn_texture,
            transparent: true,
          })),

          // for POI defined as a texture with alpha layer like this one
          // setting 'handleTransparency' to true will disable mouse events
          // occuring over fully transparent pixels
          handleTransparency: true,

          // POI coordinates
          coords: {
            lon: -70,
            lat: 0
          }

        }, // unicorn

        // POI identifier
        circle: {

            // POI coords
            coords: {
              lon: -90,
              lat: 0
            },

            // poi.list.sound:
            // sounds bound to a poi
            sound: {

              // for defaults, see comments for panorama.sounds above
              defaults: {
              },

              // poi.list.sound.list
              list: {

                beep: {

                  // sound type specific options (see Howler.js 2.0 documentation)
                  src: ["sound/argo.mp3"],
                  autoplay: true,
                  loop: true,
                  fadeOut: 2000,

                  // If you specify optional WebAudio sound cone parameters,
                  // the sound is always oriented in the direction opposite
                  // to the camera, and the volume fall to coneOuterGain
                  // outside the cone outer angle.
                  coneInnerAngle: 30,
                  coneOuterAngle: 90,
                  coneOuterGain: 0,

                  // when specifying sound cone parameters above, set rolloffFactor
                  // to 0 will disable gain change relative to z position.
                  rolloffFactor: 0

                },
                plop: {
                  src: ["plop.mp3"]
                }
              }
            }
        } // circle
      } // poi.list
    }, // poi

    // work in progress
    hud: {
      list: {
        testarro: {
          color: {
            active: '#0000ff',
            normal: '#ffffff',
            hover: '#000000'
          },
          coords: {
            lon: 0,
            lat: 0
          }
        }
      }
    },

*/
    // when using jquery.freepano.list.js,
    // you can set the preferences for several images below
    // instead of sphere.texture above

    list: {

        // default options for elements of the 'images' object below
        // (will be merged with the sphere.texture properties above)

        defaults: {

          // tiles directory name
          //dirName: 'panoramas/result_1403179805_224762-0-25-1',
          dirName: '',

          // tile filename prefix
          prefix: 'result_',

          // tile filename suffix
          suffix: '-0-25-1',

          // full panorama dimension, in tiles
          columns: 16,
          rows: 8

        },

        // initial image
        // default is the first element of 'images' below
        //initialImage: '1403179809_224762',
        initialImage: window.initialImage,

        // panorama list
        images: {

          // the panorama instance will be extended
          // 1. with the list.defaults above
          // 2. with the object below

'1404376712_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376712_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376712_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376712_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376713_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376713_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376713_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376713_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376714_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376714_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376714_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376714_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376715_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376715_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376715_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376715_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376716_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376716_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376716_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376716_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376717_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376717_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376717_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376717_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376718_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376718_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376718_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376718_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376719_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376719_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376719_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376719_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376720_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376720_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376720_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376720_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376721_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376721_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376721_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376721_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376722_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376722_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376722_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376722_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376723_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376723_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376723_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376723_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376724_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376724_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376724_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376724_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376725_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376725_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376725_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376725_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376726_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376726_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376726_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376726_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376727_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376727_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376727_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376727_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376728_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376728_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376728_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376728_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376729_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376729_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376729_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376729_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376730_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376730_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376730_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376730_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376731_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376731_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376731_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376731_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376732_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376732_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376732_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376732_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376733_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376733_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376733_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376733_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376734_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376734_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299712 }
},
'1404376734_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376734_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376735_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376735_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376735_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376735_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376736_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376736_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376736_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376736_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299689 }
},
'1404376737_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376737_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376737_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376737_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376738_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376738_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376738_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376738_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376739_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376739_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376739_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376739_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376740_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376740_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376740_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376740_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376741_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376741_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376741_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376741_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376742_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376742_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376742_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376742_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376743_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376743_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376743_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376743_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299667 }
},
'1404376744_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376744_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299846 }
},
'1404376744_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376744_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376745_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376745_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376745_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376745_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376746_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376746_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376746_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376746_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376747_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376747_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376747_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376747_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376748_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376748_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376748_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376748_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376749_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376749_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376749_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376749_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376750_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376750_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376750_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376750_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376751_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376751_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376751_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376751_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376752_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376752_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376752_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376752_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376753_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376753_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376753_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376753_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376754_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376754_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376754_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376754_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376755_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376755_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376755_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376755_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376756_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376756_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14300012 }
},
'1404376756_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376756_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376757_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376757_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376757_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376757_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376758_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376758_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376758_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376758_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376759_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376759_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376759_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376759_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376760_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376760_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376760_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376760_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376761_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376761_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376761_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376761_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376762_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376762_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376762_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376762_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376763_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376763_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376763_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376763_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376764_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376764_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376764_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376764_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376765_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376765_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376765_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376765_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376766_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376766_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376766_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376766_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.143 }
},
'1404376767_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376767_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14300006 }
},
'1404376767_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376767_514657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299831 }
},
'1404376768_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376768_014657-0-25-1/512/3',
coords: { lat: 46.20108, lon: 6.14299833 }
},
'1404376768_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376768_514657-0-25-1/512/3',
coords: { lat: 46.2010801, lon: 6.14299833 }
},
'1404376769_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376769_014657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.14299833 }
},
'1404376769_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376769_514657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.14299833 }
},
'1404376770_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376770_014657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.14299828 }
},
'1404376770_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376770_514657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.14300002 }
},
'1404376771_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376771_014657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376771_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376771_514657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376772_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376772_014657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376772_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376772_514657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376773_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376773_014657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376773_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376773_514657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376774_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376774_014657-0-25-1/512/3',
coords: { lat: 46.20107833, lon: 6.143 }
},
'1404376774_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376774_514657-0-25-1/512/3',
coords: { lat: 46.2010769, lon: 6.143 }
},
'1404376775_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376775_014657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376775_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376775_514657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376776_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376776_014657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376776_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376776_514657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376777_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376777_014657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376777_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376777_514657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376778_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376778_014657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.143 }
},
'1404376778_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376778_514657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.14300143 }
},
'1404376779_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376779_014657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.14300167 }
},
'1404376779_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376779_514657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.14300167 }
},
'1404376780_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376780_014657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.14300345 }
},
'1404376780_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376780_514657-0-25-1/512/3',
coords: { lat: 46.20107667, lon: 6.14300333 }
},
'1404376781_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376781_014657-0-25-1/512/3',
coords: { lat: 46.20107672, lon: 6.14300699 }
},
'1404376781_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376781_514657-0-25-1/512/3',
coords: { lat: 46.20107635, lon: 6.14302001 }
},
'1404376782_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376782_014657-0-25-1/512/3',
coords: { lat: 46.201077, lon: 6.14302592 }
},
'1404376782_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376782_514657-0-25-1/512/3',
coords: { lat: 46.20108127, lon: 6.14303409 }
},
'1404376783_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376783_014657-0-25-1/512/3',
coords: { lat: 46.20108365, lon: 6.14304457 }
},
'1404376783_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376783_514657-0-25-1/512/3',
coords: { lat: 46.20108784, lon: 6.1430556 }
},
'1404376784_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376784_014657-0-25-1/512/3',
coords: { lat: 46.20109308, lon: 6.14306736 }
},
'1404376784_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376784_514657-0-25-1/512/3',
coords: { lat: 46.20109155, lon: 6.14309263 }
},
'1404376785_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376785_014657-0-25-1/512/3',
coords: { lat: 46.20109508, lon: 6.14312186 }
},
'1404376785_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376785_514657-0-25-1/512/3',
coords: { lat: 46.20109659, lon: 6.14315675 }
},
'1404376786_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376786_014657-0-25-1/512/3',
coords: { lat: 46.20110186, lon: 6.14318862 }
},
'1404376786_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376786_514657-0-25-1/512/3',
coords: { lat: 46.20110463, lon: 6.14322074 }
},
'1404376787_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376787_014657-0-25-1/512/3',
coords: { lat: 46.20111015, lon: 6.14325171 }
},
'1404376787_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376787_514657-0-25-1/512/3',
coords: { lat: 46.20111455, lon: 6.14327912 }
},
'1404376788_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376788_014657-0-25-1/512/3',
coords: { lat: 46.2011208, lon: 6.14330447 }
},
'1404376788_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376788_514657-0-25-1/512/3',
coords: { lat: 46.20112936, lon: 6.14332498 }
},
'1404376789_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376789_014657-0-25-1/512/3',
coords: { lat: 46.20113592, lon: 6.14334768 }
},
'1404376789_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376789_514657-0-25-1/512/3',
coords: { lat: 46.20114288, lon: 6.14337094 }
},
'1404376790_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376790_014657-0-25-1/512/3',
coords: { lat: 46.20115087, lon: 6.14339704 }
},
'1404376790_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376790_514657-0-25-1/512/3',
coords: { lat: 46.20116097, lon: 6.14341777 }
},
'1404376791_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376791_014657-0-25-1/512/3',
coords: { lat: 46.20116926, lon: 6.14344066 }
},
'1404376791_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376791_514657-0-25-1/512/3',
coords: { lat: 46.20117759, lon: 6.14346009 }
},
'1404376792_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376792_014657-0-25-1/512/3',
coords: { lat: 46.20118413, lon: 6.14348242 }
},
'1404376792_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376792_514657-0-25-1/512/3',
coords: { lat: 46.20119259, lon: 6.14350176 }
},
'1404376793_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376793_014657-0-25-1/512/3',
coords: { lat: 46.20120092, lon: 6.1435223 }
},
'1404376793_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376793_514657-0-25-1/512/3',
coords: { lat: 46.20120914, lon: 6.14354187 }
},
'1404376794_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376794_014657-0-25-1/512/3',
coords: { lat: 46.20121926, lon: 6.14355817 }
},
'1404376794_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376794_514657-0-25-1/512/3',
coords: { lat: 46.2012276, lon: 6.14357057 }
},
'1404376795_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376795_014657-0-25-1/512/3',
coords: { lat: 46.20123632, lon: 6.14358132 }
},
'1404376795_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376795_514657-0-25-1/512/3',
coords: { lat: 46.20124592, lon: 6.14359092 }
},
'1404376796_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376796_014657-0-25-1/512/3',
coords: { lat: 46.20125387, lon: 6.14359887 }
},
'1404376796_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376796_514657-0-25-1/512/3',
coords: { lat: 46.20126105, lon: 6.14360455 }
},
'1404376797_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376797_014657-0-25-1/512/3',
coords: { lat: 46.20126721, lon: 6.14361042 }
},
'1404376797_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376797_514657-0-25-1/512/3',
coords: { lat: 46.20127288, lon: 6.14361621 }
},
'1404376798_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376798_014657-0-25-1/512/3',
coords: { lat: 46.20127918, lon: 6.14362208 }
},
'1404376798_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376798_514657-0-25-1/512/3',
coords: { lat: 46.201286, lon: 6.14362788 }
},
'1404376799_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376799_014657-0-25-1/512/3',
coords: { lat: 46.20129264, lon: 6.14363592 }
},
'1404376799_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376799_514657-0-25-1/512/3',
coords: { lat: 46.20129935, lon: 6.14364289 }
},
'1404376800_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376800_014657-0-25-1/512/3',
coords: { lat: 46.20130554, lon: 6.14365093 }
},
'1404376800_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376800_514657-0-25-1/512/3',
coords: { lat: 46.2013127, lon: 6.14365925 }
},
'1404376801_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376801_014657-0-25-1/512/3',
coords: { lat: 46.2013193, lon: 6.14366759 }
},
'1404376801_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376801_514657-0-25-1/512/3',
coords: { lat: 46.20132589, lon: 6.14367592 }
},
'1404376802_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376802_014657-0-25-1/512/3',
coords: { lat: 46.20133425, lon: 6.14368603 }
},
'1404376802_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376802_514657-0-25-1/512/3',
coords: { lat: 46.20134244, lon: 6.14369422 }
},
'1404376803_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376803_014657-0-25-1/512/3',
coords: { lat: 46.20135252, lon: 6.14370257 }
},
'1404376803_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376803_514657-0-25-1/512/3',
coords: { lat: 46.20136265, lon: 6.14371095 }
},
'1404376804_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376804_014657-0-25-1/512/3',
coords: { lat: 46.20137095, lon: 6.14371928 }
},
'1404376804_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376804_514657-0-25-1/512/3',
coords: { lat: 46.20137929, lon: 6.14372762 }
},
'1404376805_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376805_014657-0-25-1/512/3',
coords: { lat: 46.20138584, lon: 6.14373601 }
},
'1404376805_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376805_514657-0-25-1/512/3',
coords: { lat: 46.20139431, lon: 6.14374272 }
},
'1404376806_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376806_014657-0-25-1/512/3',
coords: { lat: 46.20140263, lon: 6.1437471 }
},
'1404376806_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376806_514657-0-25-1/512/3',
coords: { lat: 46.20141095, lon: 6.14375301 }
},
'1404376807_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376807_014657-0-25-1/512/3',
coords: { lat: 46.20141929, lon: 6.1437554 }
},
'1404376807_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376807_514657-0-25-1/512/3',
coords: { lat: 46.20142902, lon: 6.14375806 }
},
'1404376808_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376808_014657-0-25-1/512/3',
coords: { lat: 46.20143767, lon: 6.14376012 }
},
'1404376808_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376808_514657-0-25-1/512/3',
coords: { lat: 46.20144425, lon: 6.14376011 }
},
'1404376809_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376809_014657-0-25-1/512/3',
coords: { lat: 46.20145262, lon: 6.14375798 }
},
'1404376809_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376809_514657-0-25-1/512/3',
coords: { lat: 46.20146108, lon: 6.14375368 }
},
'1404376810_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376810_014657-0-25-1/512/3',
coords: { lat: 46.20146762, lon: 6.14374778 }
},
'1404376810_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376810_514657-0-25-1/512/3',
coords: { lat: 46.2014759, lon: 6.14374213 }
},
'1404376811_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376811_014657-0-25-1/512/3',
coords: { lat: 46.20148387, lon: 6.14373413 }
},
'1404376811_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376811_514657-0-25-1/512/3',
coords: { lat: 46.20149097, lon: 6.14372411 }
},
'1404376812_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376812_014657-0-25-1/512/3',
coords: { lat: 46.20149889, lon: 6.14371146 }
},
'1404376812_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376812_514657-0-25-1/512/3',
coords: { lat: 46.20150608, lon: 6.1436977 }
},
'1404376813_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376813_014657-0-25-1/512/3',
coords: { lat: 46.20151228, lon: 6.14368562 }
},
'1404376813_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376813_514657-0-25-1/512/3',
coords: { lat: 46.20151643, lon: 6.14367426 }
},
'1404376814_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376814_014657-0-25-1/512/3',
coords: { lat: 46.20151882, lon: 6.14366528 }
},
'1404376814_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376814_514657-0-25-1/512/3',
coords: { lat: 46.20152299, lon: 6.14365569 }
},
'1404376815_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376815_014657-0-25-1/512/3',
coords: { lat: 46.20152541, lon: 6.14364737 }
},
'1404376815_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376815_514657-0-25-1/512/3',
coords: { lat: 46.20152805, lon: 6.14363917 }
},
'1404376816_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376816_014657-0-25-1/512/3',
coords: { lat: 46.20152833, lon: 6.1436287 }
},
'1404376816_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376816_514657-0-25-1/512/3',
coords: { lat: 46.20152833, lon: 6.14361744 }
},
'1404376817_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376817_014657-0-25-1/512/3',
coords: { lat: 46.20152792, lon: 6.14360562 }
},
'1404376817_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376817_514657-0-25-1/512/3',
coords: { lat: 46.20152537, lon: 6.14359437 }
},
'1404376818_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376818_014657-0-25-1/512/3',
coords: { lat: 46.20152297, lon: 6.14358014 }
},
'1404376818_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376818_514657-0-25-1/512/3',
coords: { lat: 46.20152008, lon: 6.14356617 }
},
'1404376819_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376819_014657-0-25-1/512/3',
coords: { lat: 46.20151544, lon: 6.14355192 }
},
'1404376819_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376819_514657-0-25-1/512/3',
coords: { lat: 46.20150293, lon: 6.14353823 }
},
'1404376820_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376820_014657-0-25-1/512/3',
coords: { lat: 46.2014919, lon: 6.14351762 }
},
'1404376820_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376820_514657-0-25-1/512/3',
coords: { lat: 46.20147803, lon: 6.14349692 }
},
'1404376821_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376821_014657-0-25-1/512/3',
coords: { lat: 46.20146342, lon: 6.14347258 }
},
'1404376821_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376821_514657-0-25-1/512/3',
coords: { lat: 46.2014527, lon: 6.14345027 }
},
'1404376822_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376822_014657-0-25-1/512/3',
coords: { lat: 46.20144407, lon: 6.14342444 }
},
'1404376822_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376822_514657-0-25-1/512/3',
coords: { lat: 46.2014371, lon: 6.14340669 }
},
'1404376823_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376823_014657-0-25-1/512/3',
coords: { lat: 46.20142905, lon: 6.14338761 }
},
'1404376823_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376823_514657-0-25-1/512/3',
coords: { lat: 46.20142073, lon: 6.14336543 }
},
'1404376824_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376824_014657-0-25-1/512/3',
coords: { lat: 46.20141283, lon: 6.14334252 }
},
'1404376824_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376824_514657-0-25-1/512/3',
coords: { lat: 46.20140252, lon: 6.14331848 }
},
'1404376825_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376825_014657-0-25-1/512/3',
coords: { lat: 46.20139403, lon: 6.14329749 }
},
'1404376825_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376825_514657-0-25-1/512/3',
coords: { lat: 46.20138395, lon: 6.14327491 }
},
'1404376826_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376826_014657-0-25-1/512/3',
coords: { lat: 46.20137558, lon: 6.14325186 }
},
'1404376826_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376826_514657-0-25-1/512/3',
coords: { lat: 46.201369, lon: 6.1432285 }
},
'1404376827_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376827_014657-0-25-1/512/3',
coords: { lat: 46.20136064, lon: 6.14320744 }
},
'1404376827_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376827_514657-0-25-1/512/3',
coords: { lat: 46.20135374, lon: 6.14318654 }
},
'1404376828_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376828_014657-0-25-1/512/3',
coords: { lat: 46.20134566, lon: 6.14316928 }
},
'1404376828_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376828_514657-0-25-1/512/3',
coords: { lat: 46.20133723, lon: 6.14314845 }
},
'1404376829_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376829_014657-0-25-1/512/3',
coords: { lat: 46.2013311, lon: 6.1431254 }
},
'1404376829_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376829_514657-0-25-1/512/3',
coords: { lat: 46.20132388, lon: 6.14310188 }
},
'1404376830_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376830_014657-0-25-1/512/3',
coords: { lat: 46.20131776, lon: 6.14307901 }
},
'1404376830_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376830_514657-0-25-1/512/3',
coords: { lat: 46.20131207, lon: 6.14305688 }
},
'1404376831_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376831_014657-0-25-1/512/3',
coords: { lat: 46.20130398, lon: 6.14303579 }
},
'1404376831_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376831_514657-0-25-1/512/3',
coords: { lat: 46.20129707, lon: 6.14301493 }
},
'1404376832_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376832_014657-0-25-1/512/3',
coords: { lat: 46.20128903, lon: 6.14299411 }
},
'1404376832_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376832_514657-0-25-1/512/3',
coords: { lat: 46.20127907, lon: 6.14297472 }
},
'1404376833_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376833_014657-0-25-1/512/3',
coords: { lat: 46.20126861, lon: 6.14295626 }
},
'1404376833_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376833_514657-0-25-1/512/3',
coords: { lat: 46.20125611, lon: 6.14294267 }
},
'1404376834_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376834_014657-0-25-1/512/3',
coords: { lat: 46.20124144, lon: 6.14293054 }
},
'1404376834_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376834_514657-0-25-1/512/3',
coords: { lat: 46.20122458, lon: 6.14292383 }
},
'1404376835_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376835_014657-0-25-1/512/3',
coords: { lat: 46.20120618, lon: 6.14291302 }
},
'1404376835_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376835_514657-0-25-1/512/3',
coords: { lat: 46.20118789, lon: 6.14291021 }
},
'1404376836_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376836_014657-0-25-1/512/3',
coords: { lat: 46.2011694, lon: 6.14291179 }
},
'1404376836_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376836_514657-0-25-1/512/3',
coords: { lat: 46.20115327, lon: 6.142913 }
},
'1404376837_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376837_014657-0-25-1/512/3',
coords: { lat: 46.20113504, lon: 6.14291321 }
},
'1404376837_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376837_514657-0-25-1/512/3',
coords: { lat: 46.2011195, lon: 6.14291333 }
},
'1404376838_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376838_014657-0-25-1/512/3',
coords: { lat: 46.20110503, lon: 6.14291507 }
},
'1404376838_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376838_514657-0-25-1/512/3',
coords: { lat: 46.20109136, lon: 6.14291797 }
},
'1404376839_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376839_014657-0-25-1/512/3',
coords: { lat: 46.20107644, lon: 6.14292244 }
},
'1404376839_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376839_514657-0-25-1/512/3',
coords: { lat: 46.20106116, lon: 6.14293264 }
},
'1404376840_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376840_014657-0-25-1/512/3',
coords: { lat: 46.20104427, lon: 6.1429428 }
},
'1404376840_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376840_514657-0-25-1/512/3',
coords: { lat: 46.20102786, lon: 6.14294934 }
},
'1404376841_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376841_014657-0-25-1/512/3',
coords: { lat: 46.20101336, lon: 6.14295985 }
},
'1404376841_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376841_514657-0-25-1/512/3',
coords: { lat: 46.2009998, lon: 6.14297236 }
},
'1404376842_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376842_014657-0-25-1/512/3',
coords: { lat: 46.20098412, lon: 6.14298174 }
},
'1404376842_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376842_514657-0-25-1/512/3',
coords: { lat: 46.20096122, lon: 6.14299582 }
},
'1404376843_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376843_014657-0-25-1/512/3',
coords: { lat: 46.20094557, lon: 6.14300392 }
},
'1404376843_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376843_514657-0-25-1/512/3',
coords: { lat: 46.20092491, lon: 6.14301155 }
},
'1404376844_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376844_014657-0-25-1/512/3',
coords: { lat: 46.20091355, lon: 6.14302236 }
},
'1404376844_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376844_514657-0-25-1/512/3',
coords: { lat: 46.20090259, lon: 6.14303064 }
},
'1404376845_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376845_014657-0-25-1/512/3',
coords: { lat: 46.200894, lon: 6.1430436 }
},
'1404376845_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376845_514657-0-25-1/512/3',
coords: { lat: 46.20088565, lon: 6.14305878 }
},
'1404376846_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376846_014657-0-25-1/512/3',
coords: { lat: 46.20087944, lon: 6.14307202 }
},
'1404376846_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376846_514657-0-25-1/512/3',
coords: { lat: 46.20087976, lon: 6.1430827 }
},
'1404376847_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376847_014657-0-25-1/512/3',
coords: { lat: 46.20088123, lon: 6.14309232 }
},
'1404376847_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376847_514657-0-25-1/512/3',
coords: { lat: 46.20088603, lon: 6.14310228 }
},
'1404376848_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376848_014657-0-25-1/512/3',
coords: { lat: 46.20089218, lon: 6.14312052 }
},
'1404376848_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376848_514657-0-25-1/512/3',
coords: { lat: 46.20089482, lon: 6.14313696 }
},
'1404376849_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376849_014657-0-25-1/512/3',
coords: { lat: 46.20090449, lon: 6.14315714 }
},
'1404376849_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376849_514657-0-25-1/512/3',
coords: { lat: 46.2009127, lon: 6.14317797 }
},
'1404376850_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376850_014657-0-25-1/512/3',
coords: { lat: 46.20092103, lon: 6.14320482 }
},
'1404376850_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376850_514657-0-25-1/512/3',
coords: { lat: 46.20092783, lon: 6.14322798 }
},
'1404376851_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376851_014657-0-25-1/512/3',
coords: { lat: 46.20093584, lon: 6.14325506 }
},
'1404376851_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376851_514657-0-25-1/512/3',
coords: { lat: 46.20094731, lon: 6.14328738 }
},
'1404376852_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376852_014657-0-25-1/512/3',
coords: { lat: 46.20095986, lon: 6.14331462 }
},
'1404376852_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376852_514657-0-25-1/512/3',
coords: { lat: 46.20096932, lon: 6.14333822 }
},
'1404376853_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376853_014657-0-25-1/512/3',
coords: { lat: 46.200978, lon: 6.14336144 }
},
'1404376853_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376853_514657-0-25-1/512/3',
coords: { lat: 46.20099056, lon: 6.14339279 }
},
'1404376854_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376854_014657-0-25-1/512/3',
coords: { lat: 46.20100268, lon: 6.14341199 }
},
'1404376854_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376854_514657-0-25-1/512/3',
coords: { lat: 46.20101264, lon: 6.14342995 }
},
'1404376855_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376855_014657-0-25-1/512/3',
coords: { lat: 46.2010209, lon: 6.14344868 }
},
'1404376855_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376855_514657-0-25-1/512/3',
coords: { lat: 46.20103237, lon: 6.14346662 }
},
'1404376856_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376856_014657-0-25-1/512/3',
coords: { lat: 46.20104269, lon: 6.14348351 }
},
'1404376856_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376856_514657-0-25-1/512/3',
coords: { lat: 46.20105252, lon: 6.1435019 }
},
'1404376857_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376857_014657-0-25-1/512/3',
coords: { lat: 46.20106473, lon: 6.14351853 }
},
'1404376857_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376857_514657-0-25-1/512/3',
coords: { lat: 46.20107724, lon: 6.1435352 }
},
'1404376858_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376858_014657-0-25-1/512/3',
coords: { lat: 46.20108969, lon: 6.14355226 }
},
'1404376858_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376858_514657-0-25-1/512/3',
coords: { lat: 46.20110393, lon: 6.1435702 }
},
'1404376859_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376859_014657-0-25-1/512/3',
coords: { lat: 46.20111639, lon: 6.14358859 }
},
'1404376859_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376859_514657-0-25-1/512/3',
coords: { lat: 46.20112886, lon: 6.14360684 }
},
'1404376860_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376860_014657-0-25-1/512/3',
coords: { lat: 46.20114314, lon: 6.14362343 }
},
'1404376860_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376860_514657-0-25-1/512/3',
coords: { lat: 46.20115552, lon: 6.14364184 }
},
'1404376861_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376861_014657-0-25-1/512/3',
coords: { lat: 46.2011684, lon: 6.1436581 }
},
'1404376861_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376861_514657-0-25-1/512/3',
coords: { lat: 46.20118207, lon: 6.14367211 }
},
'1404376862_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376862_014657-0-25-1/512/3',
coords: { lat: 46.20119672, lon: 6.14368672 }
},
'1404376862_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376862_514657-0-25-1/512/3',
coords: { lat: 46.20121174, lon: 6.14370186 }
},
'1404376863_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376863_014657-0-25-1/512/3',
coords: { lat: 46.20122673, lon: 6.14371295 }
},
'1404376863_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376863_514657-0-25-1/512/3',
coords: { lat: 46.20124059, lon: 6.14372401 }
},
'1404376864_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376864_014657-0-25-1/512/3',
coords: { lat: 46.2012527, lon: 6.14373083 }
},
'1404376864_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376864_514657-0-25-1/512/3',
coords: { lat: 46.20126277, lon: 6.14373941 }
},
'1404376865_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376865_014657-0-25-1/512/3',
coords: { lat: 46.20126894, lon: 6.14374377 }
},
'1404376865_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376865_514657-0-25-1/512/3',
coords: { lat: 46.20127299, lon: 6.14374969 }
},
'1404376866_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376866_014657-0-25-1/512/3',
coords: { lat: 46.20127721, lon: 6.14375199 }
},
'1404376866_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376866_514657-0-25-1/512/3',
coords: { lat: 46.20127974, lon: 6.14375813 }
},
'1404376867_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376867_014657-0-25-1/512/3',
coords: { lat: 46.20128179, lon: 6.1437587 }
},
'1404376867_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376867_514657-0-25-1/512/3',
coords: { lat: 46.20128307, lon: 6.1437631 }
},
'1404376868_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376868_014657-0-25-1/512/3',
coords: { lat: 46.20128507, lon: 6.14376107 }
},
'1404376868_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376868_514657-0-25-1/512/3',
coords: { lat: 46.20128809, lon: 6.1437617 }
},
'1404376869_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376869_014657-0-25-1/512/3',
coords: { lat: 46.20129222, lon: 6.14376208 }
},
'1404376869_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376869_514657-0-25-1/512/3',
coords: { lat: 46.20129929, lon: 6.143766 }
},
'1404376870_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376870_014657-0-25-1/512/3',
coords: { lat: 46.20130942, lon: 6.14377089 }
},
'1404376870_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376870_514657-0-25-1/512/3',
coords: { lat: 46.20131767, lon: 6.14377765 }
},
'1404376871_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376871_014657-0-25-1/512/3',
coords: { lat: 46.20132389, lon: 6.14378557 }
},
'1404376871_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376871_514657-0-25-1/512/3',
coords: { lat: 46.20132762, lon: 6.14379267 }
},
'1404376872_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376872_014657-0-25-1/512/3',
coords: { lat: 46.20133557, lon: 6.143801 }
},
'1404376872_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376872_514657-0-25-1/512/3',
coords: { lat: 46.20134265, lon: 6.14380932 }
},
'1404376873_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376873_014657-0-25-1/512/3',
coords: { lat: 46.20135274, lon: 6.14381545 }
},
'1404376873_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376873_514657-0-25-1/512/3',
coords: { lat: 46.20136406, lon: 6.14381994 }
},
'1404376874_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376874_014657-0-25-1/512/3',
coords: { lat: 46.20137654, lon: 6.14382122 }
},
'1404376874_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376874_514657-0-25-1/512/3',
coords: { lat: 46.20138898, lon: 6.14382011 }
},
'1404376875_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376875_014657-0-25-1/512/3',
coords: { lat: 46.20140148, lon: 6.14381444 }
},
'1404376875_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376875_514657-0-25-1/512/3',
coords: { lat: 46.20141127, lon: 6.14380478 }
},
'1404376876_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376876_014657-0-25-1/512/3',
coords: { lat: 46.20141674, lon: 6.14378839 }
},
'1404376876_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376876_514657-0-25-1/512/3',
coords: { lat: 46.20141693, lon: 6.14377451 }
},
'1404376877_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376877_014657-0-25-1/512/3',
coords: { lat: 46.20141706, lon: 6.1437578 }
},
'1404376877_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376877_514657-0-25-1/512/3',
coords: { lat: 46.20142135, lon: 6.14374115 }
},
'1404376878_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376878_014657-0-25-1/512/3',
coords: { lat: 46.20142558, lon: 6.14372591 }
},
'1404376878_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376878_514657-0-25-1/512/3',
coords: { lat: 46.20142667, lon: 6.14370464 }
},
'1404376879_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376879_014657-0-25-1/512/3',
coords: { lat: 46.20142712, lon: 6.14368671 }
},
'1404376879_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376879_514657-0-25-1/512/3',
coords: { lat: 46.20142977, lon: 6.14366983 }
},
'1404376880_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376880_014657-0-25-1/512/3',
coords: { lat: 46.20143, lon: 6.14365294 }
},
'1404376880_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376880_514657-0-25-1/512/3',
coords: { lat: 46.20142869, lon: 6.14363763 }
},
'1404376881_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376881_014657-0-25-1/512/3',
coords: { lat: 46.20142634, lon: 6.14362468 }
},
'1404376881_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376881_514657-0-25-1/512/3',
coords: { lat: 46.20142042, lon: 6.14361281 }
},
'1404376882_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376882_014657-0-25-1/512/3',
coords: { lat: 46.20141407, lon: 6.14359682 }
},
'1404376882_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376882_514657-0-25-1/512/3',
coords: { lat: 46.20140724, lon: 6.14357831 }
},
'1404376883_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376883_014657-0-25-1/512/3',
coords: { lat: 46.2014011, lon: 6.14355925 }
},
'1404376883_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376883_514657-0-25-1/512/3',
coords: { lat: 46.20139544, lon: 6.14354003 }
},
'1404376884_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376884_014657-0-25-1/512/3',
coords: { lat: 46.20138916, lon: 6.14352594 }
},
'1404376884_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376884_514657-0-25-1/512/3',
coords: { lat: 46.20137916, lon: 6.14352222 }
},
'1404376885_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376885_014657-0-25-1/512/3',
coords: { lat: 46.2013705, lon: 6.14351165 }
},
'1404376885_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376885_514657-0-25-1/512/3',
coords: { lat: 46.20136252, lon: 6.14349451 }
},
'1404376886_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376886_014657-0-25-1/512/3',
coords: { lat: 46.20135569, lon: 6.14347812 }
},
'1404376886_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376886_514657-0-25-1/512/3',
coords: { lat: 46.20134867, lon: 6.14346315 }
},
'1404376887_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376887_014657-0-25-1/512/3',
coords: { lat: 46.20134448, lon: 6.14344613 }
},
'1404376887_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376887_514657-0-25-1/512/3',
coords: { lat: 46.20134204, lon: 6.14342197 }
},
'1404376888_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376888_014657-0-25-1/512/3',
coords: { lat: 46.20133611, lon: 6.14340047 }
},
'1404376888_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376888_514657-0-25-1/512/3',
coords: { lat: 46.20133042, lon: 6.14337846 }
},
'1404376889_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376889_014657-0-25-1/512/3',
coords: { lat: 46.20132408, lon: 6.14335543 }
},
'1404376889_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376889_514657-0-25-1/512/3',
coords: { lat: 46.20131726, lon: 6.14333205 }
},
'1404376890_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376890_014657-0-25-1/512/3',
coords: { lat: 46.2013111, lon: 6.14330879 }
},
'1404376890_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376890_514657-0-25-1/512/3',
coords: { lat: 46.2013053, lon: 6.14328501 }
},
'1404376891_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376891_014657-0-25-1/512/3',
coords: { lat: 46.20129892, lon: 6.14326205 }
},
'1404376891_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376891_514657-0-25-1/512/3',
coords: { lat: 46.20129376, lon: 6.14323835 }
},
'1404376892_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376892_014657-0-25-1/512/3',
coords: { lat: 46.20128737, lon: 6.14321358 }
},
'1404376892_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376892_514657-0-25-1/512/3',
coords: { lat: 46.20128065, lon: 6.14318854 }
},
'1404376893_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376893_014657-0-25-1/512/3',
coords: { lat: 46.20127403, lon: 6.14316355 }
},
'1404376893_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376893_514657-0-25-1/512/3',
coords: { lat: 46.20126723, lon: 6.14313858 }
},
'1404376894_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376894_014657-0-25-1/512/3',
coords: { lat: 46.20126108, lon: 6.14311402 }
},
'1404376894_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376894_514657-0-25-1/512/3',
coords: { lat: 46.20125539, lon: 6.14309164 }
},
'1404376895_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376895_014657-0-25-1/512/3',
coords: { lat: 46.20124723, lon: 6.1430686 }
},
'1404376895_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376895_514657-0-25-1/512/3',
coords: { lat: 46.20124065, lon: 6.14304655 }
},
'1404376896_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376896_014657-0-25-1/512/3',
coords: { lat: 46.20123228, lon: 6.14302611 }
},
'1404376896_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376896_514657-0-25-1/512/3',
coords: { lat: 46.2012226, lon: 6.14300955 }
},
'1404376897_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376897_014657-0-25-1/512/3',
coords: { lat: 46.20121141, lon: 6.1429937 }
},
'1404376897_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376897_514657-0-25-1/512/3',
coords: { lat: 46.20119604, lon: 6.14298705 }
},
'1404376898_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376898_014657-0-25-1/512/3',
coords: { lat: 46.20118519, lon: 6.1429816 }
},
'1404376898_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376898_514657-0-25-1/512/3',
coords: { lat: 46.20116785, lon: 6.14297988 }
},
'1404376899_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376899_014657-0-25-1/512/3',
coords: { lat: 46.20115124, lon: 6.14298212 }
},
'1404376899_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376899_514657-0-25-1/512/3',
coords: { lat: 46.20113606, lon: 6.14298323 }
},
'1404376900_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376900_014657-0-25-1/512/3',
coords: { lat: 46.20112182, lon: 6.14298712 }
},
'1404376900_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376900_514657-0-25-1/512/3',
coords: { lat: 46.20110932, lon: 6.14299445 }
},
'1404376901_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376901_014657-0-25-1/512/3',
coords: { lat: 46.20109546, lon: 6.14300052 }
},
'1404376901_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376901_514657-0-25-1/512/3',
coords: { lat: 46.20108429, lon: 6.14300786 }
},
'1404376902_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376902_014657-0-25-1/512/3',
coords: { lat: 46.20107179, lon: 6.14301814 }
},
'1404376902_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376902_514657-0-25-1/512/3',
coords: { lat: 46.20105939, lon: 6.14302902 }
},
'1404376903_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376903_014657-0-25-1/512/3',
coords: { lat: 46.20104514, lon: 6.1430394 }
},
'1404376903_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376903_514657-0-25-1/512/3',
coords: { lat: 46.2010327, lon: 6.14304606 }
},
'1404376904_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376904_014657-0-25-1/512/3',
coords: { lat: 46.20102019, lon: 6.14305049 }
},
'1404376904_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376904_514657-0-25-1/512/3',
coords: { lat: 46.20100765, lon: 6.14305315 }
},
'1404376905_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376905_014657-0-25-1/512/3',
coords: { lat: 46.20099474, lon: 6.14305924 }
},
'1404376905_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376905_514657-0-25-1/512/3',
coords: { lat: 46.20097778, lon: 6.14306618 }
},
'1404376906_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376906_014657-0-25-1/512/3',
coords: { lat: 46.20096329, lon: 6.14307658 }
},
'1404376906_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376906_514657-0-25-1/512/3',
coords: { lat: 46.20094949, lon: 6.14308446 }
},
'1404376907_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376907_014657-0-25-1/512/3',
coords: { lat: 46.20093678, lon: 6.1430888 }
},
'1404376907_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376907_514657-0-25-1/512/3',
coords: { lat: 46.20092421, lon: 6.14309601 }
},
'1404376908_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376908_014657-0-25-1/512/3',
coords: { lat: 46.20091391, lon: 6.14310386 }
},
'1404376908_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376908_514657-0-25-1/512/3',
coords: { lat: 46.20090394, lon: 6.14311129 }
},
'1404376909_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376909_014657-0-25-1/512/3',
coords: { lat: 46.20089564, lon: 6.14311936 }
},
'1404376909_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376909_514657-0-25-1/512/3',
coords: { lat: 46.20088863, lon: 6.14312616 }
},
'1404376910_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376910_014657-0-25-1/512/3',
coords: { lat: 46.20088667, lon: 6.14313593 }
},
'1404376910_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376910_514657-0-25-1/512/3',
coords: { lat: 46.20088667, lon: 6.14314778 }
},
'1404376911_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376911_014657-0-25-1/512/3',
coords: { lat: 46.20088846, lon: 6.14315647 }
},
'1404376911_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376911_514657-0-25-1/512/3',
coords: { lat: 46.20088988, lon: 6.14317343 }
},
'1404376912_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376912_014657-0-25-1/512/3',
coords: { lat: 46.20089053, lon: 6.14318883 }
},
'1404376912_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376912_514657-0-25-1/512/3',
coords: { lat: 46.20089468, lon: 6.14320381 }
},
'1404376913_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376913_014657-0-25-1/512/3',
coords: { lat: 46.20089873, lon: 6.1432187 }
},
'1404376913_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376913_514657-0-25-1/512/3',
coords: { lat: 46.20090627, lon: 6.14323519 }
},
'1404376914_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376914_014657-0-25-1/512/3',
coords: { lat: 46.20091258, lon: 6.14325405 }
},
'1404376914_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376914_514657-0-25-1/512/3',
coords: { lat: 46.20091929, lon: 6.14326915 }
},
'1404376915_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376915_014657-0-25-1/512/3',
coords: { lat: 46.20092939, lon: 6.14328535 }
},
'1404376915_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376915_514657-0-25-1/512/3',
coords: { lat: 46.20093934, lon: 6.14330027 }
},
'1404376916_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376916_014657-0-25-1/512/3',
coords: { lat: 46.20094944, lon: 6.14331654 }
},
'1404376916_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376916_514657-0-25-1/512/3',
coords: { lat: 46.20095916, lon: 6.14333196 }
},
'1404376917_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376917_014657-0-25-1/512/3',
coords: { lat: 46.20096777, lon: 6.14334862 }
},
'1404376917_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376917_514657-0-25-1/512/3',
coords: { lat: 46.20097607, lon: 6.14336794 }
},
'1404376918_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376918_014657-0-25-1/512/3',
coords: { lat: 46.20098264, lon: 6.14338945 }
},
'1404376918_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376918_514657-0-25-1/512/3',
coords: { lat: 46.20099098, lon: 6.14341332 }
},
'1404376919_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376919_014657-0-25-1/512/3',
coords: { lat: 46.2010001, lon: 6.14343191 }
},
'1404376919_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376919_514657-0-25-1/512/3',
coords: { lat: 46.20101406, lon: 6.14345029 }
},
'1404376920_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376920_014657-0-25-1/512/3',
coords: { lat: 46.20102437, lon: 6.14346698 }
},
'1404376920_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376920_514657-0-25-1/512/3',
coords: { lat: 46.20103422, lon: 6.14348179 }
},
'1404376921_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376921_014657-0-25-1/512/3',
coords: { lat: 46.20104466, lon: 6.14350068 }
},
'1404376921_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376921_514657-0-25-1/512/3',
coords: { lat: 46.20105741, lon: 6.14351723 }
},
'1404376922_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376922_014657-0-25-1/512/3',
coords: { lat: 46.20106772, lon: 6.14353142 }
},
'1404376922_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376922_514657-0-25-1/512/3',
coords: { lat: 46.20107755, lon: 6.14354575 }
},
'1404376923_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376923_014657-0-25-1/512/3',
coords: { lat: 46.20108799, lon: 6.14355644 }
},
'1404376923_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376923_514657-0-25-1/512/3',
coords: { lat: 46.20110059, lon: 6.14356892 }
},
'1404376924_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376924_014657-0-25-1/512/3',
coords: { lat: 46.20111448, lon: 6.14357965 }
},
'1404376924_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376924_514657-0-25-1/512/3',
coords: { lat: 46.20112575, lon: 6.14359231 }
},
'1404376925_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376925_014657-0-25-1/512/3',
coords: { lat: 46.20113605, lon: 6.1436026 }
},
'1404376925_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376925_514657-0-25-1/512/3',
coords: { lat: 46.2011459, lon: 6.14361268 }
},
'1404376926_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376926_014657-0-25-1/512/3',
coords: { lat: 46.20115777, lon: 6.14362141 }
},
'1404376926_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376926_514657-0-25-1/512/3',
coords: { lat: 46.20116739, lon: 6.14363099 }
},
'1404376927_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376927_014657-0-25-1/512/3',
coords: { lat: 46.20117593, lon: 6.14363932 }
},
'1404376927_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376927_514657-0-25-1/512/3',
coords: { lat: 46.20118601, lon: 6.14364765 }
},
'1404376928_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376928_014657-0-25-1/512/3',
coords: { lat: 46.20119253, lon: 6.14365604 }
},
'1404376928_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376928_514657-0-25-1/512/3',
coords: { lat: 46.2012011, lon: 6.14366273 }
},
'1404376929_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376929_014657-0-25-1/512/3',
coords: { lat: 46.2012077, lon: 6.14366716 }
},
'1404376929_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376929_514657-0-25-1/512/3',
coords: { lat: 46.20121297, lon: 6.14367281 }
},
'1404376930_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376930_014657-0-25-1/512/3',
coords: { lat: 46.20121888, lon: 6.14367548 }
},
'1404376930_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376930_514657-0-25-1/512/3',
coords: { lat: 46.20122609, lon: 6.14367966 }
},
'1404376931_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376931_014657-0-25-1/512/3',
coords: { lat: 46.20123087, lon: 6.14368421 }
},
'1404376931_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376931_514657-0-25-1/512/3',
coords: { lat: 46.20123793, lon: 6.14369126 }
},
'1404376932_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376932_014657-0-25-1/512/3',
coords: { lat: 46.20124602, lon: 6.1436993 }
},
'1404376932_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376932_514657-0-25-1/512/3',
coords: { lat: 46.20125304, lon: 6.14370948 }
},
'1404376933_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376933_014657-0-25-1/512/3',
coords: { lat: 46.20125718, lon: 6.14371351 }
},
'1404376933_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376933_514657-0-25-1/512/3',
coords: { lat: 46.20126134, lon: 6.14371154 }
},
'1404376934_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376934_014657-0-25-1/512/3',
coords: { lat: 46.20126551, lon: 6.14371551 }
},
'1404376934_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376934_514657-0-25-1/512/3',
coords: { lat: 46.20126825, lon: 6.14371968 }
},
'1404376935_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376935_014657-0-25-1/512/3',
coords: { lat: 46.20127174, lon: 6.1437239 }
},
'1404376935_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376935_514657-0-25-1/512/3',
coords: { lat: 46.20127467, lon: 6.14372772 }
},
'1404376936_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376936_014657-0-25-1/512/3',
coords: { lat: 46.20127884, lon: 6.14373212 }
},
'1404376936_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376936_514657-0-25-1/512/3',
coords: { lat: 46.20128433, lon: 6.14373935 }
},
'1404376937_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376937_014657-0-25-1/512/3',
coords: { lat: 46.20129051, lon: 6.14374725 }
},
'1404376937_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376937_514657-0-25-1/512/3',
coords: { lat: 46.20129458, lon: 6.14375294 }
},
'1404376938_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376938_014657-0-25-1/512/3',
coords: { lat: 46.20129867, lon: 6.14376277 }
},
'1404376938_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376938_514657-0-25-1/512/3',
coords: { lat: 46.20130613, lon: 6.14377139 }
},
'1404376939_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376939_014657-0-25-1/512/3',
coords: { lat: 46.20131225, lon: 6.14377512 }
},
'1404376939_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376939_514657-0-25-1/512/3',
coords: { lat: 46.20131946, lon: 6.14377632 }
},
'1404376940_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376940_014657-0-25-1/512/3',
coords: { lat: 46.20132424, lon: 6.14377649 }
},
'1404376940_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376940_514657-0-25-1/512/3',
coords: { lat: 46.20133118, lon: 6.1437797 }
},
'1404376941_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376941_014657-0-25-1/512/3',
coords: { lat: 46.20134145, lon: 6.14378391 }
},
'1404376941_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376941_514657-0-25-1/512/3',
coords: { lat: 46.20135414, lon: 6.14378642 }
},
'1404376942_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376942_014657-0-25-1/512/3',
coords: { lat: 46.20136448, lon: 6.14379019 }
},
'1404376942_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376942_514657-0-25-1/512/3',
coords: { lat: 46.20137411, lon: 6.14379169 }
},
'1404376943_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376943_014657-0-25-1/512/3',
coords: { lat: 46.20138265, lon: 6.14378954 }
},
'1404376943_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376943_514657-0-25-1/512/3',
coords: { lat: 46.20139276, lon: 6.14378216 }
},
'1404376944_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376944_014657-0-25-1/512/3',
coords: { lat: 46.20140106, lon: 6.14377561 }
},
'1404376944_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376944_514657-0-25-1/512/3',
coords: { lat: 46.20140793, lon: 6.14376721 }
},
'1404376945_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376945_014657-0-25-1/512/3',
coords: { lat: 46.20141563, lon: 6.14376064 }
},
'1404376945_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376945_514657-0-25-1/512/3',
coords: { lat: 46.20142121, lon: 6.14375241 }
},
'1404376946_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376946_014657-0-25-1/512/3',
coords: { lat: 46.2014239, lon: 6.14373828 }
},
'1404376946_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376946_514657-0-25-1/512/3',
coords: { lat: 46.201425, lon: 6.14372774 }
},
'1404376947_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376947_014657-0-25-1/512/3',
coords: { lat: 46.201425, lon: 6.14371166 }
},
'1404376947_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376947_514657-0-25-1/512/3',
coords: { lat: 46.20142358, lon: 6.14369943 }
},
'1404376948_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376948_014657-0-25-1/512/3',
coords: { lat: 46.20142333, lon: 6.14368508 }
},
'1404376948_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376948_514657-0-25-1/512/3',
coords: { lat: 46.20142323, lon: 6.14367549 }
},
'1404376949_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376949_014657-0-25-1/512/3',
coords: { lat: 46.20142506, lon: 6.14367113 }
},
'1404376949_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376949_514657-0-25-1/512/3',
coords: { lat: 46.20142341, lon: 6.14366696 }
},
'1404376950_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376950_014657-0-25-1/512/3',
coords: { lat: 46.20142167, lon: 6.14366453 }
},
'1404376950_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376950_514657-0-25-1/512/3',
coords: { lat: 46.20142167, lon: 6.14366323 }
},
'1404376951_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376951_014657-0-25-1/512/3',
coords: { lat: 46.20142167, lon: 6.14366673 }
},
'1404376951_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376951_514657-0-25-1/512/3',
coords: { lat: 46.20142167, lon: 6.14366825 }
},
'1404376952_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376952_014657-0-25-1/512/3',
coords: { lat: 46.20141988, lon: 6.14367358 }
},
'1404376952_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376952_514657-0-25-1/512/3',
coords: { lat: 46.20142145, lon: 6.14367343 }
},
'1404376953_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376953_014657-0-25-1/512/3',
coords: { lat: 46.20141988, lon: 6.14367172 }
},
'1404376953_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376953_514657-0-25-1/512/3',
coords: { lat: 46.20142, lon: 6.14366998 }
},
'1404376954_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376954_014657-0-25-1/512/3',
coords: { lat: 46.20142, lon: 6.14366821 }
},
'1404376954_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376954_514657-0-25-1/512/3',
coords: { lat: 46.20141856, lon: 6.14366689 }
},
'1404376955_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376955_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.1436662 }
},
'1404376955_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376955_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.143665 }
},
'1404376956_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376956_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14366321 }
},
'1404376956_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376956_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14366344 }
},
'1404376957_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376957_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14366167 }
},
'1404376957_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376957_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14366022 }
},
'1404376958_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376958_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14365953 }
},
'1404376958_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376958_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14365844 }
},
'1404376959_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376959_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14365621 }
},
'1404376959_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376959_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14365357 }
},
'1404376960_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376960_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.1436516 }
},
'1404376960_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376960_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14365008 }
},
'1404376961_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376961_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.1436466 }
},
'1404376961_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376961_514657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14364355 }
},
'1404376962_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376962_014657-0-25-1/512/3',
coords: { lat: 46.20141877, lon: 6.14364121 }
},
'1404376962_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376962_514657-0-25-1/512/3',
coords: { lat: 46.20142011, lon: 6.1436353 }
},
'1404376963_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376963_014657-0-25-1/512/3',
coords: { lat: 46.20141833, lon: 6.14362899 }
},
'1404376963_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376963_514657-0-25-1/512/3',
coords: { lat: 46.20141691, lon: 6.14362076 }
},
'1404376964_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376964_014657-0-25-1/512/3',
coords: { lat: 46.20141449, lon: 6.14361027 }
},
'1404376964_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376964_514657-0-25-1/512/3',
coords: { lat: 46.20141033, lon: 6.14359765 }
},
'1404376965_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376965_014657-0-25-1/512/3',
coords: { lat: 46.20140443, lon: 6.14358473 }
},
'1404376965_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376965_514657-0-25-1/512/3',
coords: { lat: 46.20139876, lon: 6.14357104 }
},
'1404376966_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376966_014657-0-25-1/512/3',
coords: { lat: 46.20139106, lon: 6.14355817 }
},
'1404376966_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376966_514657-0-25-1/512/3',
coords: { lat: 46.20138561, lon: 6.14354149 }
},
'1404376967_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376967_014657-0-25-1/512/3',
coords: { lat: 46.20137903, lon: 6.14352086 }
},
'1404376967_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376967_514657-0-25-1/512/3',
coords: { lat: 46.20137071, lon: 6.1435032 }
},
'1404376968_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376968_014657-0-25-1/512/3',
coords: { lat: 46.20136195, lon: 6.14348436 }
},
'1404376968_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376968_514657-0-25-1/512/3',
coords: { lat: 46.20135232, lon: 6.14346331 }
},
'1404376969_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376969_014657-0-25-1/512/3',
coords: { lat: 46.20134442, lon: 6.14344078 }
},
'1404376969_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376969_514657-0-25-1/512/3',
coords: { lat: 46.2013372, lon: 6.14341522 }
},
'1404376970_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376970_014657-0-25-1/512/3',
coords: { lat: 46.20133326, lon: 6.14338985 }
},
'1404376970_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376970_514657-0-25-1/512/3',
coords: { lat: 46.20133175, lon: 6.14336256 }
},
'1404376971_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376971_014657-0-25-1/512/3',
coords: { lat: 46.20132784, lon: 6.1433337 }
},
'1404376971_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376971_514657-0-25-1/512/3',
coords: { lat: 46.20132365, lon: 6.14331 }
},
'1404376972_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376972_014657-0-25-1/512/3',
coords: { lat: 46.20131948, lon: 6.1432874 }
},
'1404376972_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376972_514657-0-25-1/512/3',
coords: { lat: 46.2013154, lon: 6.14326786 }
},
'1404376973_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376973_014657-0-25-1/512/3',
coords: { lat: 46.20130947, lon: 6.14325168 }
},
'1404376973_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376973_514657-0-25-1/512/3',
coords: { lat: 46.2013054, lon: 6.14323611 }
},
'1404376974_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376974_014657-0-25-1/512/3',
coords: { lat: 46.20129947, lon: 6.14322168 }
},
'1404376974_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376974_514657-0-25-1/512/3',
coords: { lat: 46.20129531, lon: 6.14320757 }
},
'1404376975_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376975_014657-0-25-1/512/3',
coords: { lat: 46.20129115, lon: 6.1431951 }
},
'1404376975_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376975_514657-0-25-1/512/3',
coords: { lat: 46.20128699, lon: 6.14318262 }
},
'1404376976_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376976_014657-0-25-1/512/3',
coords: { lat: 46.20128461, lon: 6.14317012 }
},
'1404376976_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376976_514657-0-25-1/512/3',
coords: { lat: 46.20128021, lon: 6.1431576 }
},
'1404376977_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376977_014657-0-25-1/512/3',
coords: { lat: 46.20127781, lon: 6.14314377 }
},
'1404376977_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376977_514657-0-25-1/512/3',
coords: { lat: 46.20127355, lon: 6.14313262 }
},
'1404376978_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376978_014657-0-25-1/512/3',
coords: { lat: 46.20127115, lon: 6.14312012 }
},
'1404376978_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376978_514657-0-25-1/512/3',
coords: { lat: 46.20126698, lon: 6.14310772 }
},
'1404376979_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376979_014657-0-25-1/512/3',
coords: { lat: 46.20126282, lon: 6.14309305 }
},
'1404376979_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376979_514657-0-25-1/512/3',
coords: { lat: 46.20125864, lon: 6.14307624 }
},
'1404376980_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376980_014657-0-25-1/512/3',
coords: { lat: 46.20125453, lon: 6.14305956 }
},
'1404376980_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376980_514657-0-25-1/512/3',
coords: { lat: 46.20124871, lon: 6.14304277 }
},
'1404376981_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376981_014657-0-25-1/512/3',
coords: { lat: 46.20123876, lon: 6.14302788 }
},
'1404376981_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376981_514657-0-25-1/512/3',
coords: { lat: 46.20123221, lon: 6.14301257 }
},
'1404376982_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376982_014657-0-25-1/512/3',
coords: { lat: 46.20122608, lon: 6.14300009 }
},
'1404376982_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376982_514657-0-25-1/512/3',
coords: { lat: 46.20122039, lon: 6.14298903 }
},
'1404376983_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376983_014657-0-25-1/512/3',
coords: { lat: 46.20121229, lon: 6.14297717 }
},
'1404376983_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376983_514657-0-25-1/512/3',
coords: { lat: 46.20120132, lon: 6.1429704 }
},
'1404376984_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376984_014657-0-25-1/512/3',
coords: { lat: 46.20118459, lon: 6.14296403 }
},
'1404376984_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376984_514657-0-25-1/512/3',
coords: { lat: 46.20116787, lon: 6.14295863 }
},
'1404376985_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376985_014657-0-25-1/512/3',
coords: { lat: 46.2011512, lon: 6.14295523 }
},
'1404376985_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376985_514657-0-25-1/512/3',
coords: { lat: 46.20113598, lon: 6.14296149 }
},
'1404376986_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376986_014657-0-25-1/512/3',
coords: { lat: 46.20111777, lon: 6.14296559 }
},
'1404376986_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376986_514657-0-25-1/512/3',
coords: { lat: 46.2011013, lon: 6.14297268 }
},
'1404376987_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376987_014657-0-25-1/512/3',
coords: { lat: 46.20108507, lon: 6.14298275 }
},
'1404376987_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376987_514657-0-25-1/512/3',
coords: { lat: 46.20107072, lon: 6.14299299 }
},
'1404376988_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376988_014657-0-25-1/512/3',
coords: { lat: 46.2010574, lon: 6.14300226 }
},
'1404376988_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376988_514657-0-25-1/512/3',
coords: { lat: 46.20104408, lon: 6.14301149 }
},
'1404376989_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376989_014657-0-25-1/512/3',
coords: { lat: 46.20103078, lon: 6.14302068 }
},
'1404376989_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376989_514657-0-25-1/512/3',
coords: { lat: 46.2010175, lon: 6.14302986 }
},
'1404376990_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376990_014657-0-25-1/512/3',
coords: { lat: 46.20100426, lon: 6.14303901 }
},
'1404376990_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376990_514657-0-25-1/512/3',
coords: { lat: 46.20099108, lon: 6.14304815 }
},
'1404376991_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376991_014657-0-25-1/512/3',
coords: { lat: 46.20097795, lon: 6.14305728 }
},
'1404376991_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376991_514657-0-25-1/512/3',
coords: { lat: 46.20096491, lon: 6.14306641 }
},
'1404376992_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376992_014657-0-25-1/512/3',
coords: { lat: 46.20095196, lon: 6.14307554 }
},
'1404376992_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376992_514657-0-25-1/512/3',
coords: { lat: 46.20094187, lon: 6.14308452 }
},
'1404376993_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376993_014657-0-25-1/512/3',
coords: { lat: 46.20093774, lon: 6.14308887 }
},
'1404376993_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376993_514657-0-25-1/512/3',
coords: { lat: 46.20093533, lon: 6.14309313 }
},
'1404376994_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376994_014657-0-25-1/512/3',
coords: { lat: 46.20093339, lon: 6.14309558 }
},
'1404376994_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376994_514657-0-25-1/512/3',
coords: { lat: 46.20093164, lon: 6.143098 }
},
'1404376995_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376995_014657-0-25-1/512/3',
coords: { lat: 46.20092988, lon: 6.14310046 }
},
'1404376995_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376995_514657-0-25-1/512/3',
coords: { lat: 46.20092857, lon: 6.1431031 }
},
'1404376996_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376996_014657-0-25-1/512/3',
coords: { lat: 46.20092788, lon: 6.14310507 }
},
'1404376996_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376996_514657-0-25-1/512/3',
coords: { lat: 46.20092524, lon: 6.14310812 }
},
'1404376997_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376997_014657-0-25-1/512/3',
coords: { lat: 46.20092276, lon: 6.14311051 }
},
'1404376997_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376997_514657-0-25-1/512/3',
coords: { lat: 46.20092035, lon: 6.14311468 }
},
'1404376998_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376998_014657-0-25-1/512/3',
coords: { lat: 46.20091794, lon: 6.14312103 }
},
'1404376998_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376998_514657-0-25-1/512/3',
coords: { lat: 46.20091354, lon: 6.14312939 }
},
'1404376999_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376999_014657-0-25-1/512/3',
coords: { lat: 46.20091109, lon: 6.14313771 }
},
'1404376999_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376999_514657-0-25-1/512/3',
coords: { lat: 46.20090858, lon: 6.1431446 }
},
'1404377000_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377000_014657-0-25-1/512/3',
coords: { lat: 46.2009066, lon: 6.14315096 }
},
'1404377000_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377000_514657-0-25-1/512/3',
coords: { lat: 46.20090498, lon: 6.14315626 }
},
'1404377001_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377001_014657-0-25-1/512/3',
coords: { lat: 46.20090321, lon: 6.14316173 }
},
'1404377001_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377001_514657-0-25-1/512/3',
coords: { lat: 46.20090344, lon: 6.14316468 }
},
'1404377002_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377002_014657-0-25-1/512/3',
coords: { lat: 46.20090123, lon: 6.14316884 }
},
'1404377002_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377002_514657-0-25-1/512/3',
coords: { lat: 46.20090011, lon: 6.14317299 }
},
'1404377003_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377003_014657-0-25-1/512/3',
coords: { lat: 46.20089833, lon: 6.14317674 }
},
'1404377003_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377003_514657-0-25-1/512/3',
coords: { lat: 46.20089693, lon: 6.14317966 }
},
'1404377004_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377004_014657-0-25-1/512/3',
coords: { lat: 46.20089667, lon: 6.14318209 }
},
'1404377004_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377004_514657-0-25-1/512/3',
coords: { lat: 46.20089527, lon: 6.14318473 }
},
'1404377005_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377005_014657-0-25-1/512/3',
coords: { lat: 46.200895, lon: 6.14318421 }
},
'1404377005_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377005_514657-0-25-1/512/3',
coords: { lat: 46.20089347, lon: 6.14317723 }
},
'1404377006_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377006_014657-0-25-1/512/3',
coords: { lat: 46.20089326, lon: 6.14317505 }
},
'1404377006_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377006_514657-0-25-1/512/3',
coords: { lat: 46.20089164, lon: 6.14317341 }
},
'1404377007_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377007_014657-0-25-1/512/3',
coords: { lat: 46.20089026, lon: 6.14316901 }
},
'1404377007_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377007_514657-0-25-1/512/3',
coords: { lat: 46.20089197, lon: 6.14316806 }
},
'1404377008_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377008_014657-0-25-1/512/3',
coords: { lat: 46.20089167, lon: 6.14316833 }
},
'1404377008_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377008_514657-0-25-1/512/3',
coords: { lat: 46.20089167, lon: 6.14316976 }
},
'1404377009_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377009_014657-0-25-1/512/3',
coords: { lat: 46.20089167, lon: 6.14317173 }
},
'1404377009_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377009_514657-0-25-1/512/3',
coords: { lat: 46.20089309, lon: 6.1431761 }
},
'1404377010_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377010_014657-0-25-1/512/3',
coords: { lat: 46.20089556, lon: 6.14318051 }
},
'1404377010_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377010_514657-0-25-1/512/3',
coords: { lat: 46.20089807, lon: 6.14318466 }
},
'1404377011_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377011_014657-0-25-1/512/3',
coords: { lat: 46.20089876, lon: 6.14318883 }
},
'1404377011_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377011_514657-0-25-1/512/3',
coords: { lat: 46.20089989, lon: 6.143193 }
},
'1404377012_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377012_014657-0-25-1/512/3',
coords: { lat: 46.20090167, lon: 6.14319538 }
},
'1404377012_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377012_514657-0-25-1/512/3',
coords: { lat: 46.20090309, lon: 6.14319978 }
},
'1404377013_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377013_014657-0-25-1/512/3',
coords: { lat: 46.20090333, lon: 6.14320223 }
},
'1404377013_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377013_514657-0-25-1/512/3',
coords: { lat: 46.20090333, lon: 6.14320465 }
},
'1404377014_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377014_014657-0-25-1/512/3',
coords: { lat: 46.20090328, lon: 6.143207 }
},
'1404377014_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377014_514657-0-25-1/512/3',
coords: { lat: 46.20090503, lon: 6.14321446 }
},
'1404377015_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377015_014657-0-25-1/512/3',
coords: { lat: 46.200905, lon: 6.14322019 }
},
'1404377015_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377015_514657-0-25-1/512/3',
coords: { lat: 46.20090643, lon: 6.14322312 }
},
'1404377016_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377016_014657-0-25-1/512/3',
coords: { lat: 46.20090672, lon: 6.14322328 }
},
'1404377016_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377016_514657-0-25-1/512/3',
coords: { lat: 46.20090498, lon: 6.14322502 }
},
'1404377017_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377017_014657-0-25-1/512/3',
coords: { lat: 46.20090282, lon: 6.14322629 }
},
'1404377017_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377017_514657-0-25-1/512/3',
coords: { lat: 46.20089867, lon: 6.1432281 }
},
'1404377018_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377018_014657-0-25-1/512/3',
coords: { lat: 46.20089446, lon: 6.14322696 }
},
'1404377018_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377018_514657-0-25-1/512/3',
coords: { lat: 46.20089344, lon: 6.14322833 }
},
'1404377019_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377019_014657-0-25-1/512/3',
coords: { lat: 46.20089167, lon: 6.14322833 }
},
'1404377019_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377019_514657-0-25-1/512/3',
coords: { lat: 46.20089167, lon: 6.14322975 }
},
'1404377020_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377020_014657-0-25-1/512/3',
coords: { lat: 46.20089172, lon: 6.14323 }
},
'1404377020_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377020_514657-0-25-1/512/3',
coords: { lat: 46.20088998, lon: 6.1432299 }
},
'1404377021_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377021_014657-0-25-1/512/3',
coords: { lat: 46.20089, lon: 6.14323167 }
},
'1404377021_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377021_514657-0-25-1/512/3',
coords: { lat: 46.20089, lon: 6.14323156 }
},
'1404377022_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377022_014657-0-25-1/512/3',
coords: { lat: 46.20088821, lon: 6.14323333 }
},
'1404377022_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377022_514657-0-25-1/512/3',
coords: { lat: 46.20088833, lon: 6.14323323 }
},
'1404377023_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377023_014657-0-25-1/512/3',
coords: { lat: 46.20088833, lon: 6.143235 }
},
'1404377023_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377023_514657-0-25-1/512/3',
coords: { lat: 46.2008869, lon: 6.14323643 }
},
'1404377024_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377024_014657-0-25-1/512/3',
coords: { lat: 46.20088667, lon: 6.14323661 }
},
'1404377024_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377024_514657-0-25-1/512/3',
coords: { lat: 46.20088667, lon: 6.14323836 }
},
'1404377025_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377025_014657-0-25-1/512/3',
coords: { lat: 46.20088622, lon: 6.14323878 }
},
'1404377025_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377025_514657-0-25-1/512/3',
coords: { lat: 46.200885, lon: 6.14323989 }
},
'1404377026_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377026_014657-0-25-1/512/3',
coords: { lat: 46.200885, lon: 6.14324167 }
},
'1404377026_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377026_514657-0-25-1/512/3',
coords: { lat: 46.200885, lon: 6.14324156 }
},
'1404377027_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377027_014657-0-25-1/512/3',
coords: { lat: 46.200885, lon: 6.14324333 }
},
'1404377027_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377027_514657-0-25-1/512/3',
coords: { lat: 46.2008851, lon: 6.14324333 }
},
'1404377028_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377028_014657-0-25-1/512/3',
coords: { lat: 46.20088333, lon: 6.14324512 }
},
'1404377028_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377028_514657-0-25-1/512/3',
coords: { lat: 46.20088333, lon: 6.143245 }
},
'1404377029_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377029_014657-0-25-1/512/3',
coords: { lat: 46.20088333, lon: 6.14324495 }
},
'1404377029_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377029_514657-0-25-1/512/3',
coords: { lat: 46.20088333, lon: 6.14324669 }
},
'1404377030_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377030_014657-0-25-1/512/3',
coords: { lat: 46.20088333, lon: 6.14324667 }
},
'1404377030_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377030_514657-0-25-1/512/3',
coords: { lat: 46.20088333, lon: 6.14324656 }
},
'1404377031_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377031_014657-0-25-1/512/3',
coords: { lat: 46.20088339, lon: 6.14324833 }
},
'1404377031_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377031_514657-0-25-1/512/3',
coords: { lat: 46.20088164, lon: 6.14324822 }
},
'1404377032_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377032_014657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325 }
},
'1404377032_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377032_514657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325 }
},
'1404377033_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377033_014657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325179 }
},
'1404377033_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377033_514657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325167 }
},
'1404377034_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377034_014657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325346 }
},
'1404377034_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377034_514657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325323 }
},
'1404377035_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377035_014657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.143255 }
},
'1404377035_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377035_514657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325642 }
},
'1404377036_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377036_014657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325711 }
},
'1404377036_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377036_514657-0-25-1/512/3',
coords: { lat: 46.20088167, lon: 6.14325823 }
},
'1404377037_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377037_014657-0-25-1/512/3',
coords: { lat: 46.20088428, lon: 6.14326479 }
},
'1404377037_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377037_514657-0-25-1/512/3',
coords: { lat: 46.20089119, lon: 6.14327586 }
},
'1404377038_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377038_014657-0-25-1/512/3',
coords: { lat: 46.2008934, lon: 6.14328311 }
},
'1404377038_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377038_514657-0-25-1/512/3',
coords: { lat: 46.20089623, lon: 6.1432954 }
},
'1404377039_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377039_014657-0-25-1/512/3',
coords: { lat: 46.20090212, lon: 6.1433104 }
},
'1404377039_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377039_514657-0-25-1/512/3',
coords: { lat: 46.20090803, lon: 6.14332543 }
},
'1404377040_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377040_014657-0-25-1/512/3',
coords: { lat: 46.20091353, lon: 6.14333822 }
},
'1404377040_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377040_514657-0-25-1/512/3',
coords: { lat: 46.20091632, lon: 6.14334764 }
},
'1404377041_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377041_014657-0-25-1/512/3',
coords: { lat: 46.20091833, lon: 6.14335556 }
},
'1404377041_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377041_514657-0-25-1/512/3',
coords: { lat: 46.20091973, lon: 6.14335995 }
},
'1404377042_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377042_014657-0-25-1/512/3',
coords: { lat: 46.20092041, lon: 6.14336341 }
},
'1404377042_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377042_514657-0-25-1/512/3',
coords: { lat: 46.20092156, lon: 6.14336642 }
},
'1404377043_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377043_014657-0-25-1/512/3',
coords: { lat: 46.20092369, lon: 6.14336886 }
},
'1404377043_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377043_514657-0-25-1/512/3',
coords: { lat: 46.20092659, lon: 6.14337126 }
},
'1404377044_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377044_014657-0-25-1/512/3',
coords: { lat: 46.20093047, lon: 6.14337755 }
},
'1404377044_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377044_514657-0-25-1/512/3',
coords: { lat: 46.20093454, lon: 6.14339022 }
},
'1404377045_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377045_014657-0-25-1/512/3',
coords: { lat: 46.20094253, lon: 6.14340692 }
},
'1404377045_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377045_514657-0-25-1/512/3',
coords: { lat: 46.20095424, lon: 6.14342498 }
},
'1404377046_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377046_014657-0-25-1/512/3',
coords: { lat: 46.20096642, lon: 6.14344364 }
},
'1404377046_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377046_514657-0-25-1/512/3',
coords: { lat: 46.20097886, lon: 6.14346174 }
},
'1404377047_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377047_014657-0-25-1/512/3',
coords: { lat: 46.20099138, lon: 6.14348055 }
},
'1404377047_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377047_514657-0-25-1/512/3',
coords: { lat: 46.20100392, lon: 6.14349844 }
},
'1404377048_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377048_014657-0-25-1/512/3',
coords: { lat: 46.20101637, lon: 6.1435169 }
},
'1404377048_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377048_514657-0-25-1/512/3',
coords: { lat: 46.20103064, lon: 6.14353359 }
},
'1404377049_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377049_014657-0-25-1/512/3',
coords: { lat: 46.20104269, lon: 6.14354983 }
},
'1404377049_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377049_514657-0-25-1/512/3',
coords: { lat: 46.2010525, lon: 6.14356527 }
},
'1404377050_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377050_014657-0-25-1/512/3',
coords: { lat: 46.20106294, lon: 6.14357801 }
},
'1404377050_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377050_514657-0-25-1/512/3',
coords: { lat: 46.20107564, lon: 6.14359363 }
},
'1404377051_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377051_014657-0-25-1/512/3',
coords: { lat: 46.20108639, lon: 6.14360997 }
},
'1404377051_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377051_514657-0-25-1/512/3',
coords: { lat: 46.20109724, lon: 6.1436179 }
},
'1404377052_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377052_014657-0-25-1/512/3',
coords: { lat: 46.20110978, lon: 6.14362418 }
},
'1404377052_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377052_514657-0-25-1/512/3',
coords: { lat: 46.20112241, lon: 6.14363524 }
},
'1404377053_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377053_014657-0-25-1/512/3',
coords: { lat: 46.20113098, lon: 6.14365201 }
},
'1404377053_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377053_514657-0-25-1/512/3',
coords: { lat: 46.20114072, lon: 6.14366553 }
},
'1404377054_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377054_014657-0-25-1/512/3',
coords: { lat: 46.20115368, lon: 6.14368238 }
},
'1404377054_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377054_514657-0-25-1/512/3',
coords: { lat: 46.20116601, lon: 6.14370029 }
},
'1404377055_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377055_014657-0-25-1/512/3',
coords: { lat: 46.2011761, lon: 6.14371485 }
},
'1404377055_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377055_514657-0-25-1/512/3',
coords: { lat: 46.20118572, lon: 6.14372431 }
},
'1404377056_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377056_014657-0-25-1/512/3',
coords: { lat: 46.20119426, lon: 6.14373091 }
},
'1404377056_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377056_514657-0-25-1/512/3',
coords: { lat: 46.20120434, lon: 6.14373773 }
},
'1404377057_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377057_014657-0-25-1/512/3',
coords: { lat: 46.20121266, lon: 6.14374216 }
},
'1404377057_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377057_514657-0-25-1/512/3',
coords: { lat: 46.20122101, lon: 6.14374776 }
},
'1404377058_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377058_014657-0-25-1/512/3',
coords: { lat: 46.20122934, lon: 6.14375261 }
},
'1404377058_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377058_514657-0-25-1/512/3',
coords: { lat: 46.20123777, lon: 6.1437593 }
},
'1404377059_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377059_014657-0-25-1/512/3',
coords: { lat: 46.20124433, lon: 6.14376766 }
},
'1404377059_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377059_514657-0-25-1/512/3',
coords: { lat: 46.20125268, lon: 6.14377459 }
},
'1404377060_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377060_014657-0-25-1/512/3',
coords: { lat: 46.20126101, lon: 6.14378045 }
},
'1404377060_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377060_514657-0-25-1/512/3',
coords: { lat: 46.20126924, lon: 6.14378626 }
},
'1404377061_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377061_014657-0-25-1/512/3',
coords: { lat: 46.20127972, lon: 6.14379434 }
},
'1404377061_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377061_514657-0-25-1/512/3',
coords: { lat: 46.20129233, lon: 6.14380266 }
},
'1404377062_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377062_014657-0-25-1/512/3',
coords: { lat: 46.20130489, lon: 6.14380656 }
},
'1404377062_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377062_514657-0-25-1/512/3',
coords: { lat: 46.20131577, lon: 6.14381279 }
},
'1404377063_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377063_014657-0-25-1/512/3',
coords: { lat: 46.20132652, lon: 6.14381896 }
},
'1404377063_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377063_514657-0-25-1/512/3',
coords: { lat: 46.20133902, lon: 6.14382311 }
},
'1404377064_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377064_014657-0-25-1/512/3',
coords: { lat: 46.20135109, lon: 6.14382255 }
},
'1404377064_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377064_514657-0-25-1/512/3',
coords: { lat: 46.20136097, lon: 6.14381672 }
},
'1404377065_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377065_014657-0-25-1/512/3',
coords: { lat: 46.20137104, lon: 6.14381281 }
},
'1404377065_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377065_514657-0-25-1/512/3',
coords: { lat: 46.20137926, lon: 6.14380722 }
},
'1404377066_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377066_014657-0-25-1/512/3',
coords: { lat: 46.20138931, lon: 6.14380069 }
},
'1404377066_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377066_514657-0-25-1/512/3',
coords: { lat: 46.20139927, lon: 6.14379073 }
},
'1404377067_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377067_014657-0-25-1/512/3',
coords: { lat: 46.20141113, lon: 6.14377675 }
},
'1404377067_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377067_514657-0-25-1/512/3',
coords: { lat: 46.20142074, lon: 6.14376014 }
},
'1404377068_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377068_014657-0-25-1/512/3',
coords: { lat: 46.20142934, lon: 6.14373709 }
},
'1404377068_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377068_514657-0-25-1/512/3',
coords: { lat: 46.20143772, lon: 6.14371329 }
},
'1404377069_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377069_014657-0-25-1/512/3',
coords: { lat: 46.20144386, lon: 6.1436885 }
},
'1404377069_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377069_514657-0-25-1/512/3',
coords: { lat: 46.20144813, lon: 6.14366202 }
},
'1404377070_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377070_014657-0-25-1/512/3',
coords: { lat: 46.20145018, lon: 6.14363455 }
},
'1404377070_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377070_514657-0-25-1/512/3',
coords: { lat: 46.20144831, lon: 6.14360714 }
},
'1404377071_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377071_014657-0-25-1/512/3',
coords: { lat: 46.20144614, lon: 6.14357798 }
},
'1404377071_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377071_514657-0-25-1/512/3',
coords: { lat: 46.20144341, lon: 6.14354889 }
},
'1404377072_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377072_014657-0-25-1/512/3',
coords: { lat: 46.20143949, lon: 6.14351983 }
},
'1404377072_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377072_514657-0-25-1/512/3',
coords: { lat: 46.20143675, lon: 6.1434878 }
},
'1404377073_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377073_514657-0-25-1/512/3',
coords: { lat: 46.20142869, lon: 6.14341655 }
},
'1404377074_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377074_014657-0-25-1/512/3',
coords: { lat: 46.20142232, lon: 6.143379 }
},
'1404377074_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377074_514657-0-25-1/512/3',
coords: { lat: 46.2014157, lon: 6.14333994 }
},
'1404377075_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377075_014657-0-25-1/512/3',
coords: { lat: 46.20140554, lon: 6.14330043 }
},
'1404377075_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377075_514657-0-25-1/512/3',
coords: { lat: 46.20139742, lon: 6.14325993 }
},
'1404377076_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377076_014657-0-25-1/512/3',
coords: { lat: 46.20138687, lon: 6.14321866 }
},
'1404377076_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377076_514657-0-25-1/512/3',
coords: { lat: 46.20137585, lon: 6.14317808 }
},
'1404377077_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377077_014657-0-25-1/512/3',
coords: { lat: 46.20136509, lon: 6.14313641 }
},
'1404377077_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377077_514657-0-25-1/512/3',
coords: { lat: 46.20135259, lon: 6.14309613 }
},
'1404377078_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377078_014657-0-25-1/512/3',
coords: { lat: 46.20134011, lon: 6.14305734 }
},
'1404377078_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377078_514657-0-25-1/512/3',
coords: { lat: 46.20132772, lon: 6.14301952 }
},
'1404377079_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377079_014657-0-25-1/512/3',
coords: { lat: 46.20131346, lon: 6.14298248 }
},
'1404377079_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377079_514657-0-25-1/512/3',
coords: { lat: 46.20130097, lon: 6.14294615 }
},
'1404377080_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377080_014657-0-25-1/512/3',
coords: { lat: 46.20128847, lon: 6.14291079 }
},
'1404377080_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377080_514657-0-25-1/512/3',
coords: { lat: 46.20127595, lon: 6.14287763 }
},
'1404377081_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377081_014657-0-25-1/512/3',
coords: { lat: 46.20126524, lon: 6.14284253 }
},
'1404377081_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377081_514657-0-25-1/512/3',
coords: { lat: 46.20125251, lon: 6.14280919 }
},
'1404377082_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377082_014657-0-25-1/512/3',
coords: { lat: 46.20124351, lon: 6.1427758 }
},
'1404377082_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377082_514657-0-25-1/512/3',
coords: { lat: 46.20123539, lon: 6.14274411 }
},
'1404377083_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377083_014657-0-25-1/512/3',
coords: { lat: 46.20122949, lon: 6.14271301 }
},
'1404377083_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377083_514657-0-25-1/512/3',
coords: { lat: 46.20122619, lon: 6.14268128 }
},
'1404377084_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377084_014657-0-25-1/512/3',
coords: { lat: 46.20122522, lon: 6.14264895 }
},
'1404377084_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377084_514657-0-25-1/512/3',
coords: { lat: 46.20122633, lon: 6.14261718 }
},
'1404377085_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377085_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377085_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377085_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377086_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377086_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377086_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377086_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377087_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377087_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377087_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377087_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377088_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377088_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377088_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377088_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377089_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377089_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377089_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377089_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377090_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377090_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377090_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377090_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377091_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377091_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377091_514657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377091_514657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
},
'1404377092_014657': {
dirName: '/data/footage/demodav/1404383663/pyramid/result_1404377092_014657-0-25-1/512/3',
coords: { lat: 46.20122913, lon: 6.14258585 }
}

        }
    },

    controls: {
        touch: {
            move: {
                active: true
            },
            zoom: {
                active: true
            }
        },
        keyboard: {
            move: {
                active: true
            },
            zoom: {
                active: true
            }
        },
        devicemotion: {
            move: {
                active: false
            }
        }
    },

    map: {
        active: false
    },

    // THREE.js renderer options

    renderer: {

      precision: 'highp',

      antialias: true,

      alpha: true,

      logarithmicDepthBuffer: true

    },

    pointCloud: {
      active: true,

      showDebugInfo: true,

      cursorMap: {
        normal: THREE.ImageUtils.loadTexture('img/dot_hover_normal.png'),
        recording: THREE.ImageUtils.loadTexture('img/dot_hover_recording.png')
      },

      // point cloud dot material
      dotMaterial: new THREE.PointCloudMaterial({
          map: THREE.ImageUtils.loadTexture('img/dot.png'),
          size: 0.15,
          color: 'yellow',
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.8,
          alphaTest: 0.1,
          depthTest: false,
          depthWrite: false,
          visible: false
      }), // pointCloud.defaults.dotMaterial

      enableParticleEvents: false,

      showParticleCursor: false

    },

    postProcessing: {
      enabled: false,

      green: {
        shader: THREE.GreenShader,
        enabled: false,
        uniforms: {}
      },

      edge: {
        shader: THREE.EdgeShader,
        enabled: false,
        uniforms: {
          aspect: function(panorama) {
            this.value.x=$(panorama.container).width();
            this.value.y=$(panorama.container).height();
          }
        }
      },

      edge2: {
        shader: THREE.EdgeShader2,
        enabled: false,
        uniforms: {
          aspect: function(panorama) {
            this.value.x=$(panorama.container).width();
            this.value.y=$(panorama.container).height();
          }
        }
      }
    }

  }); // panorama


  var panorama=$('#pano').data('pano');

  $(document).on('keydown',function(e){
    switch(e.keyCode) {
    case 32:
      console.log('lon ['+panorama.lon+'] lat ['+panorama.lat+'] tilt ['+panorama.rotation.tilt+'] roll ['+panorama.rotation.roll+']');
      break;
    case 49:
      toggleEffect(panorama.postProcessing.edge);
      break;
    case 50:
      toggleEffect(panorama.postProcessing.edge2);
      break;
    case 51:
      toggleEffect(panorama.postProcessing.green);
      break;
    case 77:
      var map = panorama.map;
      if(map) {
          map.instance.active = !map.instance.active;
      }
      break;
    }

    if (panorama.postProcessing) panorama.postProcessing.enabled=panorama.postProcessing.edge.pass.enabled||panorama.postProcessing.edge2.pass.enabled||panorama.postProcessing.green.pass.enabled;
  });

  function toggleEffect(effect){
    effect.pass.enabled=!effect.pass.enabled;
    panorama.drawScene();
  }

});

POI.prototype.text2canvas=function poi_text2canvas(text,options) {
  if (!options) options={};
  var canvas=document.createElement('canvas');
  var ctx=canvas.getContext('2d');
  ctx.font=options.font||"Bold 48px helvetica";
  ctx.fillStyle=options.fillStyle||"rgba(0,0,0,1)";
  ctx.strokeStyle=options.strokeStyle||"rgba(255,255,255,1)";
  ctx.align='left';
  ctx.textBaseline='middle';
  var size=ctx.measureText(text);
  console.log(text);
  canvas.width=size.width+16+48;
  canvas.height=64;
  ctx=canvas.getContext('2d');
  ctx.rect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#ffffff";
  ctx.strokeStyle="#000000";
  ctx.fill();
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.rect(2,2,canvas.width-2,canvas.height-2);
  ctx.lineWidth=1;
  ctx.strokeStyle="#ffffff";
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.font=options.font||"Bold 48px helvetica";
  ctx.fillStyle=options.fillStyle||"rgba(0,0,0,1)";
  ctx.strokeStyle=options.strokeStyle||"rgba(255,255,255,1)";
  ctx.align='left';
  ctx.textBaseline='middle';
  ctx.fillText(text,16,canvas.height/2,(canvas.width-80));
  ctx.strokeText(text,16,canvas.height/2,(canvas.width-80));
  ctx.beginPath();
  ctx.rect(canvas.width-48,0,canvas.width,canvas.height);
  ctx.fill();
  return canvas;
}

window.next_power_of_two=function next_power_of_2(x) {
   x = x - 1;
   x = x | (x >> 1);
   x = x | (x >> 2);
   x = x | (x >> 4);
   x = x | (x >> 8);
   return x + 1;
}
