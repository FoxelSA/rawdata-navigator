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

            '1416400954_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400954_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400955_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400955_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400955_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400955_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400956_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400956_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400956_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400956_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400957_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400957_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400957_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400957_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400958_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400958_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400958_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400958_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400959_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400959_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400959_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400959_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400960_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400960_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400960_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400960_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400961_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400961_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400961_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400961_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400962_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400962_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400962_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400962_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400963_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400963_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400963_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400963_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400964_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400964_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400964_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400964_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400965_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400965_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400965_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400965_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400966_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400966_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400966_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400966_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400967_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400967_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400967_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400967_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400968_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400968_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400968_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400968_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400969_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400969_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400969_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400969_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400970_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400970_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400970_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400970_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400971_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400971_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400971_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400971_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400972_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400972_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400972_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400972_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400973_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400973_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400973_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400973_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400974_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400974_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400974_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400974_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400975_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400975_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400975_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400975_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400976_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400976_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400976_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400976_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400977_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400977_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400977_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400977_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400978_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400978_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400978_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400978_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400979_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400979_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400979_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400979_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400980_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400980_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400980_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400980_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400981_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400981_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400981_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400981_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400982_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400982_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400982_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400982_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400983_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400983_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400983_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400983_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400984_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400984_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400984_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400984_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400985_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400985_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400985_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400985_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400986_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400986_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400986_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400986_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400987_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400987_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400987_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400987_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400988_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400988_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400988_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400988_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400989_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400989_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400989_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400989_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400990_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400990_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400990_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400990_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400991_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400991_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400991_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400991_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400992_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400992_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400992_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400992_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400993_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400993_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400993_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400993_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400994_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400994_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400994_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400994_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400995_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400995_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400995_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400995_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400996_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400996_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400996_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400996_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400997_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400997_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400997_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400997_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400998_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400998_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400998_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400998_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400999_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400999_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416400999_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416400999_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401000_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401000_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401000_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401000_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401001_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401001_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401001_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401001_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401002_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401002_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401002_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401002_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401003_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401003_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401003_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401003_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401004_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401004_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401004_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401004_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401005_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401005_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401005_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401005_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401006_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401006_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401006_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401006_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401007_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401007_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401007_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401007_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401008_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401008_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401008_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401008_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401009_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401009_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401009_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401009_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401010_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401010_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401010_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401010_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401011_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401011_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401011_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401011_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401012_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401012_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401012_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401012_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401013_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401013_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401013_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401013_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401014_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401014_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401014_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401014_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401015_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401015_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401015_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401015_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401016_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401016_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401016_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401016_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401017_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401017_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401017_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401017_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401018_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401018_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401018_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401018_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401019_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401019_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401019_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401019_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401020_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401020_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401020_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401020_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401021_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401021_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401021_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401021_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401022_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401022_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401022_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401022_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401023_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401023_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401023_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401023_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401024_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401024_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401024_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401024_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401025_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401025_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401025_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401025_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401026_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401026_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401026_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401026_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401027_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401027_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401027_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401027_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401028_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401028_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401028_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401028_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401029_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401029_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401029_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401029_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401030_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401030_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401030_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401030_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401031_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401031_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401031_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401031_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401032_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401032_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401032_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401032_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401033_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401033_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401033_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401033_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401034_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401034_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401034_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401034_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401035_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401035_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401035_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401035_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401036_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401036_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401036_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401036_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401037_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401037_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401037_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401037_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401038_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401038_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401038_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401038_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401039_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401039_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401039_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401039_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401040_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401040_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401040_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401040_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401041_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401041_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401041_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401041_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401042_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401042_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401042_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401042_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401043_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401043_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401043_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401043_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401044_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401044_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401044_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401044_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401045_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401045_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401045_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401045_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401046_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401046_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401046_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401046_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401047_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401047_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401047_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401047_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401048_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401048_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401048_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401048_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401049_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401049_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401049_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401049_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401050_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401050_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401050_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401050_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401051_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401051_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401051_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401051_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401052_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401052_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401052_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401052_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401053_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401053_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401053_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401053_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401054_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401054_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401054_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401054_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401055_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401055_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401055_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401055_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401056_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401056_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401056_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401056_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401057_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401057_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401057_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401057_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401058_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401058_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401058_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401058_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401059_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401059_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401059_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401059_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401060_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401060_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401060_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401060_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401061_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401061_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401061_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401061_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401062_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401062_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401062_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401062_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401063_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401063_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401063_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401063_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401064_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401064_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401064_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401064_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401065_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401065_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401065_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401065_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401066_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401066_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401066_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401066_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401067_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401067_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401067_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401067_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401068_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401068_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401068_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401068_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401069_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401069_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401069_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401069_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401070_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401070_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401070_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401070_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401071_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401071_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401071_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401071_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401072_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401072_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401072_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401072_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401073_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401073_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401073_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401073_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401074_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401074_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401074_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401074_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401075_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401075_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401075_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401075_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401076_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401076_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401076_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401076_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401077_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401077_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401077_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401077_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401078_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401078_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401078_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401078_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401079_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401079_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401079_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401079_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401080_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401080_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401080_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401080_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401081_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401081_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401081_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401081_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401082_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401082_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401082_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401082_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401083_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401083_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401083_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401083_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401084_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401084_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401084_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401084_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401085_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401085_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401085_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401085_951107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401086_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401086_451107-0-25-1/512/3',
            coords: { lat: 46.20278429, lon: 6.14466569 }
            },
            '1416401086_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401086_951107-0-25-1/512/3',
            coords: { lat: 46.20278042, lon: 6.14465968 }
            },
            '1416401087_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401087_451107-0-25-1/512/3',
            coords: { lat: 46.20277445, lon: 6.14465306 }
            },
            '1416401087_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401087_951107-0-25-1/512/3',
            coords: { lat: 46.20276834, lon: 6.14465438 }
            },
            '1416401088_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401088_451107-0-25-1/512/3',
            coords: { lat: 46.20276098, lon: 6.14465507 }
            },
            '1416401088_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401088_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401089_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401089_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401089_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401089_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401090_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401090_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401090_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401090_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401091_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401091_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401091_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401091_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401092_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401092_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401092_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401092_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401093_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401093_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401093_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401093_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401094_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401094_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401094_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401094_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401095_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401095_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401095_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401095_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401096_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401096_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401096_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401096_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401097_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401097_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401097_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401097_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401098_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401098_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401098_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401098_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401099_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401099_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401099_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401099_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401100_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401100_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401100_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401100_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401101_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401101_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401101_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401101_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401102_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401102_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401102_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401102_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401103_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401103_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401103_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401103_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401104_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401104_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401104_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401104_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401105_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401105_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401105_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401105_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401106_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401106_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401106_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401106_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401107_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401107_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401107_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401107_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401108_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401108_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401108_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401108_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401109_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401109_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401109_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401109_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401110_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401110_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401110_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401110_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401111_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401111_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401111_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401111_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401112_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401112_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401112_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401112_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401113_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401113_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401113_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401113_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401114_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401114_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401114_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401114_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401115_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401115_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401115_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401115_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401116_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401116_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401116_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401116_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401117_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401117_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401117_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401117_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401118_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401118_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401118_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401118_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401119_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401119_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401119_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401119_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401120_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401120_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401120_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401120_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401121_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401121_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401121_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401121_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401122_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401122_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401122_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401122_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401123_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401123_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401123_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401123_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401124_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401124_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401124_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401124_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401125_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401125_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401125_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401125_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401126_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401126_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401126_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401126_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401127_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401127_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401127_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401127_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401128_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401128_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401128_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401128_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401129_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401129_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401129_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401129_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401130_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401130_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401130_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401130_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401131_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401131_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401131_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401131_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401132_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401132_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401132_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401132_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401133_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401133_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401133_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401133_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401134_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401134_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401134_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401134_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401135_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401135_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401135_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401135_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401136_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401136_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401136_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401136_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401137_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401137_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401137_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401137_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401138_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401138_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401138_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401138_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401139_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401139_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401139_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401139_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401140_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401140_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401140_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401140_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401141_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401141_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401141_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401141_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401142_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401142_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401142_951107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401142_951107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
            },
            '1416401143_451107': {
            dirName: '/data/footage/demodav/1416400954/pyramid/result_1416401143_451107-0-25-1/512/3',
            coords: { lat: 46.20275373, lon: 6.144658 }
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
    //      map: THREE.ImageUtils.loadTexture('img/dot.png'),
    //      size: 0.15,
          size: 1,
          color: 'yellow',
          sizeAttenuation: false,
  //        transparent: true,
  //        opacity: 0.3,
  //        alphaTest: 0.1,
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
