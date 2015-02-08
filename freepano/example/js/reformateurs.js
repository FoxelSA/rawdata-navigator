/*
 * freepano - WebGL panorama viewer
 *
 * Copyright (c) 2014 FOXEL SA - http://foxel.ch
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

  var filesToLoad=1;

  function file_onload() {
    --filesToLoad;
    if (!filesToLoad) {
      $(document).trigger('filesloaded');
    }
  }

   
  // load image with alpha channel to use as POI cursor
  window.poicursor_texture=new THREE.ImageUtils.loadTexture(
    '../../img/dav-cursor.png',
    THREE.UVMapping,
    file_onload,
    function onloaderror() {
      $.notify('Cannot load dav-cursor.png !');
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

    camera: {

      zoom: {

        // initial zoom value
        current: 1.0,

        // maximal zoom value
        max: 1.5

      }

    }, // camera

    // panorama.sphere: sphere object defaults
    // normally you dont need to modify this

    sphere: {

      radius: 15,

      widthSegments: 36,

      heightSegments: 18,

      // panorama.sphere.texture: sphere texture options
      // When using 'panorama.list' to configure several panoramas,
      // 'panorama.list.defaults' will extend or override values below

      texture: {

        // tiles directory relative url
        dirName: 'panoramas/result_1403179805_224762-0-25-1/',

        // tile filename prefix
        baseName: 'result_1403179805_224762-0-25-1',

        // full panorama dimension, in tiles
        columns: 16,
        rows: 8

      } // texture

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

      // panorama.poi.defaults: default values for POIs
      defaults: {

          // set to false to disable mouse event handling
          handleMousevents: true,

          color: {
             active: '#0000ff',
             hover: '#ffffff',
             normal: '#000000'
          },

          // event handlers below are already filtered
          // eg: mousein and mouseout are not triggered during panorama rotation
          // if you really need, you can hook to the 'private' methods (eg: _mousein)

          onmousein: function poi_mousein(e) {
            console.log('mousein',this);
          },

          onmouseout: function poi_mouseout(e) {
            console.log('mouseout',this);
          },

          onmouseover: function poi_mouseover(e) {
          },

          onmousedown: function poi_mousedown(e) {
            console.log('mousedown',this);
          },

          onmouseup: function poi_mouseup(e) {
            console.log('mouseup',this);
          },

          onclick: function poi_click(e) {
            console.log('click',this);
          },
      },
    },

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

            '1404374395_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374395_319830-0-25-1/512/3',
            coords: { lat: 46.20001185, lon: 6.1460866 }
            },
            '1404374397_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374397_319830-0-25-1/512/3',
            coords: { lat: 46.20002519, lon: 6.14607673 }
            },
            '1404374399_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374399_319830-0-25-1/512/3',
            coords: { lat: 46.20004401, lon: 6.14606654 }
            },
            '1404374401_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374401_319830-0-25-1/512/3',
            coords: { lat: 46.20005727, lon: 6.14604315 }
            },
            '1404374403_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374403_319830-0-25-1/512/3',
            coords: { lat: 46.20006547, lon: 6.14603292 }
            },
            '1404374405_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374405_319830-0-25-1/512/3',
            coords: { lat: 46.2000734, lon: 6.1460178 }
            },
            '1404374407_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374407_319830-0-25-1/512/3',
            coords: { lat: 46.20008047, lon: 6.1460028 }
            },
            '1404374409_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374409_319830-0-25-1/512/3',
            coords: { lat: 46.20008875, lon: 6.1459878 }
            },
            '1404374411_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374411_319830-0-25-1/512/3',
            coords: { lat: 46.2000984, lon: 6.14597113 }
            },
            '1404374413_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374413_319830-0-25-1/512/3',
            coords: { lat: 46.20010731, lon: 6.14595257 }
            },
            '1404374415_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374415_319830-0-25-1/512/3',
            coords: { lat: 46.20011624, lon: 6.1459329 }
            },
            '1404374417_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374417_319830-0-25-1/512/3',
            coords: { lat: 46.20012517, lon: 6.14591322 }
            },
            '1404374419_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374419_319830-0-25-1/512/3',
            coords: { lat: 46.2001341, lon: 6.14589355 }
            },
            '1404374421_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374421_319830-0-25-1/512/3',
            coords: { lat: 46.20014303, lon: 6.14587387 }
            },
            '1404374423_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374423_319830-0-25-1/512/3',
            coords: { lat: 46.20015195, lon: 6.14585419 }
            },
            '1404374425_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374425_319830-0-25-1/512/3',
            coords: { lat: 46.20016087, lon: 6.14583451 }
            },
            '1404374427_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374427_319830-0-25-1/512/3',
            coords: { lat: 46.20016979, lon: 6.14581483 }
            },
            '1404374429_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374429_319830-0-25-1/512/3',
            coords: { lat: 46.2001787, lon: 6.14579514 }
            },
            '1404374431_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374431_319830-0-25-1/512/3',
            coords: { lat: 46.20018761, lon: 6.14577546 }
            },
            '1404374433_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374433_319830-0-25-1/512/3',
            coords: { lat: 46.20019652, lon: 6.14575577 }
            },
            '1404374435_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374435_319830-0-25-1/512/3',
            coords: { lat: 46.20020543, lon: 6.14573608 }
            },
            '1404374437_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374437_319830-0-25-1/512/3',
            coords: { lat: 46.20021434, lon: 6.1457164 }
            },
            '1404374439_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374439_319830-0-25-1/512/3',
            coords: { lat: 46.20022324, lon: 6.14569671 }
            },
            '1404374441_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374441_319830-0-25-1/512/3',
            coords: { lat: 46.20023214, lon: 6.14567703 }
            },
            '1404374443_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374443_319830-0-25-1/512/3',
            coords: { lat: 46.20024103, lon: 6.14565734 }
            },
            '1404374445_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374445_319830-0-25-1/512/3',
            coords: { lat: 46.20024993, lon: 6.14563766 }
            },
            '1404374447_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374447_319830-0-25-1/512/3',
            coords: { lat: 46.20025882, lon: 6.14561797 }
            },
            '1404374449_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374449_319830-0-25-1/512/3',
            coords: { lat: 46.20026771, lon: 6.14559829 }
            },
            '1404374451_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374451_319830-0-25-1/512/3',
            coords: { lat: 46.20027659, lon: 6.14557861 }
            },
            '1404374453_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374453_319830-0-25-1/512/3',
            coords: { lat: 46.20028547, lon: 6.14555893 }
            },
            '1404374455_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374455_319830-0-25-1/512/3',
            coords: { lat: 46.20029435, lon: 6.14553926 }
            },
            '1404374457_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374457_319830-0-25-1/512/3',
            coords: { lat: 46.20030323, lon: 6.14551958 }
            },
            '1404374459_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374459_319830-0-25-1/512/3',
            coords: { lat: 46.2003121, lon: 6.14549991 }
            },
            '1404374461_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374461_319830-0-25-1/512/3',
            coords: { lat: 46.20032097, lon: 6.14548024 }
            },
            '1404374463_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374463_319830-0-25-1/512/3',
            coords: { lat: 46.20032827, lon: 6.14545731 }
            },
            '1404374465_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374465_319830-0-25-1/512/3',
            coords: { lat: 46.20033758, lon: 6.14544342 }
            },
            '1404374467_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374467_319830-0-25-1/512/3',
            coords: { lat: 46.2003403, lon: 6.1454437 }
            },
            '1404374469_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374469_319830-0-25-1/512/3',
            coords: { lat: 46.20034302, lon: 6.14544399 }
            },
            '1404374471_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374471_319830-0-25-1/512/3',
            coords: { lat: 46.20034573, lon: 6.14544428 }
            },
            '1404374475_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374475_319830-0-25-1/512/3',
            coords: { lat: 46.20035113, lon: 6.14544487 }
            },
            '1404374477_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374477_319830-0-25-1/512/3',
            coords: { lat: 46.20035382, lon: 6.14544518 }
            },
            '1404374479_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374479_319830-0-25-1/512/3',
            coords: { lat: 46.20035651, lon: 6.1454455 }
            },
            '1404374481_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374481_319830-0-25-1/512/3',
            coords: { lat: 46.20035919, lon: 6.14544581 }
            },
            '1404374483_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374483_319830-0-25-1/512/3',
            coords: { lat: 46.20036186, lon: 6.14544614 }
            },
            '1404374485_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374485_319830-0-25-1/512/3',
            coords: { lat: 46.20036453, lon: 6.14544647 }
            },
            '1404374487_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374487_319830-0-25-1/512/3',
            coords: { lat: 46.2003672, lon: 6.14544681 }
            },
            '1404374489_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374489_319830-0-25-1/512/3',
            coords: { lat: 46.20036986, lon: 6.14544715 }
            },
            '1404374491_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374491_319830-0-25-1/512/3',
            coords: { lat: 46.20037253, lon: 6.1454475 }
            },
            '1404374493_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374493_319830-0-25-1/512/3',
            coords: { lat: 46.20037519, lon: 6.14544785 }
            },
            '1404374495_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374495_319830-0-25-1/512/3',
            coords: { lat: 46.20037784, lon: 6.14544821 }
            },
            '1404374497_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374497_319830-0-25-1/512/3',
            coords: { lat: 46.2003805, lon: 6.14544857 }
            },
            '1404374499_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374499_319830-0-25-1/512/3',
            coords: { lat: 46.20038315, lon: 6.14544894 }
            },
            '1404374501_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374501_319830-0-25-1/512/3',
            coords: { lat: 46.20038581, lon: 6.14544932 }
            },
            '1404374503_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374503_319830-0-25-1/512/3',
            coords: { lat: 46.20038847, lon: 6.1454497 }
            },
            '1404374505_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374505_319830-0-25-1/512/3',
            coords: { lat: 46.20039112, lon: 6.14545008 }
            },
            '1404374507_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374507_319830-0-25-1/512/3',
            coords: { lat: 46.20039378, lon: 6.14545047 }
            },
            '1404374509_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374509_319830-0-25-1/512/3',
            coords: { lat: 46.20039644, lon: 6.14545087 }
            },
            '1404374511_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374511_319830-0-25-1/512/3',
            coords: { lat: 46.2003991, lon: 6.14545127 }
            },
            '1404374513_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374513_319830-0-25-1/512/3',
            coords: { lat: 46.20040177, lon: 6.145452 }
            },
            '1404374515_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374515_319830-0-25-1/512/3',
            coords: { lat: 46.20039839, lon: 6.14546506 }
            },
            '1404374517_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374517_319830-0-25-1/512/3',
            coords: { lat: 46.20039339, lon: 6.14547708 }
            },
            '1404374519_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374519_319830-0-25-1/512/3',
            coords: { lat: 46.20038495, lon: 6.14549461 }
            },
            '1404374521_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374521_319830-0-25-1/512/3',
            coords: { lat: 46.20037578, lon: 6.14551228 }
            },
            '1404374523_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374523_319830-0-25-1/512/3',
            coords: { lat: 46.2003666, lon: 6.14552995 }
            },
            '1404374525_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374525_319830-0-25-1/512/3',
            coords: { lat: 46.20035742, lon: 6.14554763 }
            },
            '1404374527_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374527_319830-0-25-1/512/3',
            coords: { lat: 46.20034823, lon: 6.1455653 }
            },
            '1404374529_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374529_319830-0-25-1/512/3',
            coords: { lat: 46.20033904, lon: 6.14558298 }
            },
            '1404374531_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374531_319830-0-25-1/512/3',
            coords: { lat: 46.20032985, lon: 6.14560066 }
            },
            '1404374533_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374533_319830-0-25-1/512/3',
            coords: { lat: 46.20032066, lon: 6.14561833 }
            },
            '1404374535_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374535_319830-0-25-1/512/3',
            coords: { lat: 46.20031146, lon: 6.14563601 }
            },
            '1404374537_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374537_319830-0-25-1/512/3',
            coords: { lat: 46.20030226, lon: 6.14565369 }
            },
            '1404374539_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374539_319830-0-25-1/512/3',
            coords: { lat: 46.20029305, lon: 6.14567137 }
            },
            '1404374541_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374541_319830-0-25-1/512/3',
            coords: { lat: 46.20028385, lon: 6.14568905 }
            },
            '1404374543_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374543_319830-0-25-1/512/3',
            coords: { lat: 46.20027464, lon: 6.14570672 }
            },
            '1404374545_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374545_319830-0-25-1/512/3',
            coords: { lat: 46.20026543, lon: 6.1457244 }
            },
            '1404374547_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374547_319830-0-25-1/512/3',
            coords: { lat: 46.20025621, lon: 6.14574208 }
            },
            '1404374549_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374549_319830-0-25-1/512/3',
            coords: { lat: 46.200247, lon: 6.14575976 }
            },
            '1404374551_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374551_319830-0-25-1/512/3',
            coords: { lat: 46.20023778, lon: 6.14577743 }
            },
            '1404374553_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374553_319830-0-25-1/512/3',
            coords: { lat: 46.20022856, lon: 6.14579511 }
            },
            '1404374555_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374555_319830-0-25-1/512/3',
            coords: { lat: 46.20021933, lon: 6.14581279 }
            },
            '1404374557_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374557_319830-0-25-1/512/3',
            coords: { lat: 46.20021011, lon: 6.14583046 }
            },
            '1404374559_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374559_319830-0-25-1/512/3',
            coords: { lat: 46.20020088, lon: 6.14584814 }
            },
            '1404374561_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374561_319830-0-25-1/512/3',
            coords: { lat: 46.20019165, lon: 6.14586581 }
            },
            '1404374563_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374563_319830-0-25-1/512/3',
            coords: { lat: 46.20018241, lon: 6.14588349 }
            },
            '1404374565_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374565_319830-0-25-1/512/3',
            coords: { lat: 46.20017318, lon: 6.14590116 }
            },
            '1404374567_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374567_319830-0-25-1/512/3',
            coords: { lat: 46.20016394, lon: 6.14591884 }
            },
            '1404374569_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374569_319830-0-25-1/512/3',
            coords: { lat: 46.20015134, lon: 6.14593908 }
            },
            '1404374571_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374571_319830-0-25-1/512/3',
            coords: { lat: 46.20014119, lon: 6.14596048 }
            },
            '1404374573_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374573_319830-0-25-1/512/3',
            coords: { lat: 46.2001316, lon: 6.1459845 }
            },
            '1404374575_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374575_319830-0-25-1/512/3',
            coords: { lat: 46.20011983, lon: 6.14600847 }
            },
            '1404374577_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374577_319830-0-25-1/512/3',
            coords: { lat: 46.20010436, lon: 6.14603339 }
            },
            '1404374579_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374579_319830-0-25-1/512/3',
            coords: { lat: 46.20009125, lon: 6.14605435 }
            },
            '1404374581_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374581_319830-0-25-1/512/3',
            coords: { lat: 46.20008285, lon: 6.14607727 }
            },
            '1404374583_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374583_319830-0-25-1/512/3',
            coords: { lat: 46.20007458, lon: 6.14609882 }
            },
            '1404374585_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374585_319830-0-25-1/512/3',
            coords: { lat: 46.20006327, lon: 6.14612233 }
            },
            '1404374589_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374589_319830-0-25-1/512/3',
            coords: { lat: 46.20004327, lon: 6.146169 }
            },
            '1404374591_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374591_319830-0-25-1/512/3',
            coords: { lat: 46.20002932, lon: 6.14618722 }
            },
            '1404374593_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374593_319830-0-25-1/512/3',
            coords: { lat: 46.20001111, lon: 6.14620771 }
            },
            '1404374595_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374595_319830-0-25-1/512/3',
            coords: { lat: 46.19999111, lon: 6.14623617 }
            },
            '1404374597_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374597_319830-0-25-1/512/3',
            coords: { lat: 46.19997778, lon: 6.14625722 }
            },
            '1404374599_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374599_319830-0-25-1/512/3',
            coords: { lat: 46.19996327, lon: 6.14628103 }
            },
            '1404374601_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374601_319830-0-25-1/512/3',
            coords: { lat: 46.19995386, lon: 6.14630281 }
            },
            '1404374603_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374603_319830-0-25-1/512/3',
            coords: { lat: 46.19994506, lon: 6.14632222 }
            },
            '1404374605_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374605_319830-0-25-1/512/3',
            coords: { lat: 46.19993618, lon: 6.14634055 }
            },
            '1404374607_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374607_319830-0-25-1/512/3',
            coords: { lat: 46.19992784, lon: 6.14636068 }
            },
            '1404374609_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374609_319830-0-25-1/512/3',
            coords: { lat: 46.19991958, lon: 6.14638228 }
            },
            '1404374611_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374611_319830-0-25-1/512/3',
            coords: { lat: 46.19990988, lon: 6.14640389 }
            },
            '1404374613_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374613_319830-0-25-1/512/3',
            coords: { lat: 46.1999045, lon: 6.14642217 }
            },
            '1404374615_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374615_319830-0-25-1/512/3',
            coords: { lat: 46.19990263, lon: 6.14643274 }
            },
            '1404374617_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374617_319830-0-25-1/512/3',
            coords: { lat: 46.19990177, lon: 6.14643963 }
            },
            '1404374619_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374619_319830-0-25-1/512/3',
            coords: { lat: 46.1999009, lon: 6.14644629 }
            },
            '1404374621_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374621_319830-0-25-1/512/3',
            coords: { lat: 46.19990005, lon: 6.14645291 }
            },
            '1404374623_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374623_319830-0-25-1/512/3',
            coords: { lat: 46.19990775, lon: 6.14644443 }
            },
            '1404374625_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374625_319830-0-25-1/512/3',
            coords: { lat: 46.19992941, lon: 6.14644 }
            },
            '1404374627_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374627_319830-0-25-1/512/3',
            coords: { lat: 46.19994173, lon: 6.14643327 }
            },
            '1404374629_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374629_319830-0-25-1/512/3',
            coords: { lat: 46.19995006, lon: 6.14642457 }
            },
            '1404374631_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374631_319830-0-25-1/512/3',
            coords: { lat: 46.19995883, lon: 6.14640994 }
            },
            '1404374633_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374633_319830-0-25-1/512/3',
            coords: { lat: 46.19996721, lon: 6.1463932 }
            },
            '1404374635_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374635_319830-0-25-1/512/3',
            coords: { lat: 46.19997612, lon: 6.14637455 }
            },
            '1404374637_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374637_319830-0-25-1/512/3',
            coords: { lat: 46.19998209, lon: 6.1463561 }
            },
            '1404374639_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374639_319830-0-25-1/512/3',
            coords: { lat: 46.199985, lon: 6.14634136 }
            },
            '1404374641_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374641_319830-0-25-1/512/3',
            coords: { lat: 46.19998371, lon: 6.14633225 }
            },
            '1404374643_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374643_319830-0-25-1/512/3',
            coords: { lat: 46.19998229, lon: 6.14631932 }
            },
            '1404374645_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374645_319830-0-25-1/512/3',
            coords: { lat: 46.19998747, lon: 6.1463055 }
            },
            '1404374647_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374647_319830-0-25-1/512/3',
            coords: { lat: 46.19998994, lon: 6.14629271 }
            },
            '1404374651_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374651_319830-0-25-1/512/3',
            coords: { lat: 46.2000005, lon: 6.14626611 }
            },
            '1404374653_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374653_319830-0-25-1/512/3',
            coords: { lat: 46.2000055, lon: 6.14625161 }
            },
            '1404374655_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374655_319830-0-25-1/512/3',
            coords: { lat: 46.19999994, lon: 6.14624199 }
            },
            '1404374657_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374657_319830-0-25-1/512/3',
            coords: { lat: 46.19998717, lon: 6.14626062 }
            },
            '1404374659_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374659_319830-0-25-1/512/3',
            coords: { lat: 46.19998778, lon: 6.14627167 }
            },
            '1404374661_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374661_319830-0-25-1/512/3',
            coords: { lat: 46.19998623, lon: 6.14627617 }
            },
            '1404374663_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374663_319830-0-25-1/512/3',
            coords: { lat: 46.1999745, lon: 6.1462606 }
            },
            '1404374665_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374665_319830-0-25-1/512/3',
            coords: { lat: 46.19996833, lon: 6.1462445 }
            },
            '1404374667_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374667_319830-0-25-1/512/3',
            coords: { lat: 46.19996617, lon: 6.14623777 }
            },
            '1404374669_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374669_319830-0-25-1/512/3',
            coords: { lat: 46.19996201, lon: 6.14622774 }
            },
            '1404374671_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374671_319830-0-25-1/512/3',
            coords: { lat: 46.19996506, lon: 6.14621599 }
            },
            '1404374673_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374673_319830-0-25-1/512/3',
            coords: { lat: 46.1999734, lon: 6.14619957 }
            },
            '1404374675_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374675_319830-0-25-1/512/3',
            coords: { lat: 46.19997667, lon: 6.14619321 }
            },
            '1404374677_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374677_319830-0-25-1/512/3',
            coords: { lat: 46.19997846, lon: 6.14618661 }
            },
            '1404374679_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374679_319830-0-25-1/512/3',
            coords: { lat: 46.19998406, lon: 6.14617272 }
            },
            '1404374681_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374681_319830-0-25-1/512/3',
            coords: { lat: 46.19998667, lon: 6.1461473 }
            },
            '1404374683_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374683_319830-0-25-1/512/3',
            coords: { lat: 46.19998667, lon: 6.14612236 }
            },
            '1404374685_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374685_319830-0-25-1/512/3',
            coords: { lat: 46.19999012, lon: 6.14610609 }
            },
            '1404374687_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374687_319830-0-25-1/512/3',
            coords: { lat: 46.19999512, lon: 6.14609114 }
            },
            '1404374689_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374689_319830-0-25-1/512/3',
            coords: { lat: 46.1999988, lon: 6.14607614 }
            },
            '1404374691_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374691_319830-0-25-1/512/3',
            coords: { lat: 46.20000213, lon: 6.14606114 }
            },
            '1404374693_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374693_319830-0-25-1/512/3',
            coords: { lat: 46.20000547, lon: 6.14604779 }
            },
            '1404374695_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374695_319830-0-25-1/512/3',
            coords: { lat: 46.20001012, lon: 6.14603446 }
            },
            '1404374697_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374697_319830-0-25-1/512/3',
            coords: { lat: 46.20001512, lon: 6.14601946 }
            },
            '1404374699_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374699_319830-0-25-1/512/3',
            coords: { lat: 46.20001882, lon: 6.14600445 }
            },
            '1404374701_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374701_319830-0-25-1/512/3',
            coords: { lat: 46.20002383, lon: 6.14598944 }
            },
            '1404374703_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374703_319830-0-25-1/512/3',
            coords: { lat: 46.20003012, lon: 6.14597444 }
            },
            '1404374705_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374705_319830-0-25-1/512/3',
            coords: { lat: 46.200037, lon: 6.14595782 }
            },
            '1404374707_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374707_319830-0-25-1/512/3',
            coords: { lat: 46.20004543, lon: 6.14594124 }
            },
            '1404374709_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374709_319830-0-25-1/512/3',
            coords: { lat: 46.20005386, lon: 6.14592466 }
            },
            '1404374711_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374711_319830-0-25-1/512/3',
            coords: { lat: 46.20006229, lon: 6.14590808 }
            },
            '1404374713_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374713_319830-0-25-1/512/3',
            coords: { lat: 46.20007073, lon: 6.1458915 }
            },
            '1404374715_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374715_319830-0-25-1/512/3',
            coords: { lat: 46.20007917, lon: 6.14587492 }
            },
            '1404374717_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374717_319830-0-25-1/512/3',
            coords: { lat: 46.20008761, lon: 6.14585833 }
            },
            '1404374719_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374719_319830-0-25-1/512/3',
            coords: { lat: 46.20009606, lon: 6.14584175 }
            },
            '1404374721_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374721_319830-0-25-1/512/3',
            coords: { lat: 46.20010452, lon: 6.14582517 }
            },
            '1404374723_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374723_319830-0-25-1/512/3',
            coords: { lat: 46.20011298, lon: 6.14580859 }
            },
            '1404374725_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374725_319830-0-25-1/512/3',
            coords: { lat: 46.20012144, lon: 6.14579201 }
            },
            '1404374727_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374727_319830-0-25-1/512/3',
            coords: { lat: 46.20012991, lon: 6.14577543 }
            },
            '1404374729_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374729_319830-0-25-1/512/3',
            coords: { lat: 46.20013838, lon: 6.14575885 }
            },
            '1404374731_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374731_319830-0-25-1/512/3',
            coords: { lat: 46.20014686, lon: 6.14574227 }
            },
            '1404374733_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374733_319830-0-25-1/512/3',
            coords: { lat: 46.20015534, lon: 6.14572569 }
            },
            '1404374735_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374735_319830-0-25-1/512/3',
            coords: { lat: 46.20016382, lon: 6.14570911 }
            },
            '1404374737_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374737_319830-0-25-1/512/3',
            coords: { lat: 46.20017231, lon: 6.14569253 }
            },
            '1404374739_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374739_319830-0-25-1/512/3',
            coords: { lat: 46.2001808, lon: 6.14567595 }
            },
            '1404374741_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374741_319830-0-25-1/512/3',
            coords: { lat: 46.2001893, lon: 6.14565936 }
            },
            '1404374743_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374743_319830-0-25-1/512/3',
            coords: { lat: 46.20019839, lon: 6.14564327 }
            },
            '1404374745_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374745_319830-0-25-1/512/3',
            coords: { lat: 46.20020718, lon: 6.14562616 }
            },
            '1404374747_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374747_319830-0-25-1/512/3',
            coords: { lat: 46.20021673, lon: 6.14560776 }
            },
            '1404374749_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374749_319830-0-25-1/512/3',
            coords: { lat: 46.20022545, lon: 6.14559276 }
            },
            '1404374751_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374751_319830-0-25-1/512/3',
            coords: { lat: 46.2002373, lon: 6.14557443 }
            },
            '1404374753_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374753_319830-0-25-1/512/3',
            coords: { lat: 46.20025006, lon: 6.14555276 }
            },
            '1404374755_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374755_319830-0-25-1/512/3',
            coords: { lat: 46.2002589, lon: 6.14553443 }
            },
            '1404374757_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374757_319830-0-25-1/512/3',
            coords: { lat: 46.20027064, lon: 6.14552154 }
            },
            '1404374759_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374759_319830-0-25-1/512/3',
            coords: { lat: 46.20027541, lon: 6.14551668 }
            },
            '1404374761_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374761_319830-0-25-1/512/3',
            coords: { lat: 46.20027541, lon: 6.14551668 }
            },
            '1404374763_319830': {
            dirName: '/data/footage/demodav/1404381299/pyramid/result_1404374763_319830-0-25-1/512/3',
            coords: { lat: 46.20027541, lon: 6.14551668 }
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

      precision: 'lowp',

      antialias: false,

      alpha: false

    },


/* incompatible with panorama.list below yet
    pyramid: {
      dirName: 'panoramas/result_1403179805_224762-0-25-1/512',
      baseName: 'result_1403179805_224762-0-25-1',
      levels: 4,
      preload: true
      sphere: [
        {
          radius: 1
        },
        {
          radius: 2
        },
        {
          radius: 4
        },
        {
          radius: 8
        },
        {
          radius: 16
        },
      ]
    },
*/

    postProcessing: {
      enabled: false,
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
    case 77:
      var map = panorama.map;
      if(map) {
          map.instance.active = !map.instance.active;
      }
      break;
    }

    if (panorama.postProcessing) panorama.postProcessing.enabled=panorama.postProcessing.edge.pass.enabled||panorama.postProcessing.edge2.pass.enabled;
  });

  function toggleEffect(effect){
    effect.pass.enabled=!effect.pass.enabled;
    panorama.drawScene();
  }

});
