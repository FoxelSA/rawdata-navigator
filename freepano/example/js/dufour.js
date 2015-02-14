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

  var filesToLoad=2;

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

  // load image with alpha channel to use as POI
  window.poi_texture=new THREE.ImageUtils.loadTexture(
    '../../img/dav-cursor-blank.png',
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
        max: 10

      }

    }, // camera
/*
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
              poi.title=text2canvas(poi.metadata.name);
              console.log(poi.title);
              var map=new THREE.Texture(poi.title);
              map.needsUpdate=true;
              var mesh=new THREE.Mesh(
                new THREE.PlaneBufferGeometry(poi.title.width/150,poi.title.height/150,100),
                new THREE.MeshBasicMaterial({
                 map: map,
                 transparent: true,
                 depthWrite: false,
                 depthTest: false,
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

            '1404376712_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376712_514657-0-25-1/512/3',
            coords: { lat: 46.20141833, lon: 6.14364355 }
            },
            '1404376713_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376713_514657-0-25-1/512/3',
            coords: { lat: 46.20142011, lon: 6.1436353 }
            },
            '1404376714_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376714_514657-0-25-1/512/3',
            coords: { lat: 46.20141691, lon: 6.14362076 }
            },
            '1404376715_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376715_514657-0-25-1/512/3',
            coords: { lat: 46.20141033, lon: 6.14359765 }
            },
            '1404376716_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376716_514657-0-25-1/512/3',
            coords: { lat: 46.20139876, lon: 6.14357104 }
            },
            '1404376717_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376717_514657-0-25-1/512/3',
            coords: { lat: 46.20138561, lon: 6.14354149 }
            },
            '1404376718_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376718_514657-0-25-1/512/3',
            coords: { lat: 46.20137071, lon: 6.1435032 }
            },
            '1404376719_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376719_514657-0-25-1/512/3',
            coords: { lat: 46.20135232, lon: 6.14346331 }
            },
            '1404376720_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376720_514657-0-25-1/512/3',
            coords: { lat: 46.2013372, lon: 6.14341522 }
            },
            '1404376721_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376721_514657-0-25-1/512/3',
            coords: { lat: 46.20133175, lon: 6.14336256 }
            },
            '1404376722_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376722_514657-0-25-1/512/3',
            coords: { lat: 46.20132365, lon: 6.14331 }
            },
            '1404376723_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376723_514657-0-25-1/512/3',
            coords: { lat: 46.2013154, lon: 6.14326786 }
            },
            '1404376724_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376724_514657-0-25-1/512/3',
            coords: { lat: 46.2013054, lon: 6.14323611 }
            },
            '1404376725_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376725_514657-0-25-1/512/3',
            coords: { lat: 46.20129531, lon: 6.14320757 }
            },
            '1404376726_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376726_514657-0-25-1/512/3',
            coords: { lat: 46.20128699, lon: 6.14318262 }
            },
            '1404376727_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376727_514657-0-25-1/512/3',
            coords: { lat: 46.20128021, lon: 6.1431576 }
            },
            '1404376728_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376728_514657-0-25-1/512/3',
            coords: { lat: 46.20127355, lon: 6.14313262 }
            },
            '1404376729_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376729_514657-0-25-1/512/3',
            coords: { lat: 46.20126698, lon: 6.14310772 }
            },
            '1404376730_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376730_514657-0-25-1/512/3',
            coords: { lat: 46.20125864, lon: 6.14307624 }
            },
            '1404376731_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376731_514657-0-25-1/512/3',
            coords: { lat: 46.20124871, lon: 6.14304277 }
            },
            '1404376732_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376732_514657-0-25-1/512/3',
            coords: { lat: 46.20123221, lon: 6.14301257 }
            },
            '1404376733_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376733_514657-0-25-1/512/3',
            coords: { lat: 46.20122039, lon: 6.14298903 }
            },
            '1404376734_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376734_514657-0-25-1/512/3',
            coords: { lat: 46.20120132, lon: 6.1429704 }
            },
            '1404376735_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376735_514657-0-25-1/512/3',
            coords: { lat: 46.20116787, lon: 6.14295863 }
            },
            '1404376736_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376736_514657-0-25-1/512/3',
            coords: { lat: 46.20113598, lon: 6.14296149 }
            },
            '1404376737_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376737_514657-0-25-1/512/3',
            coords: { lat: 46.2011013, lon: 6.14297268 }
            },
            '1404376738_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376738_514657-0-25-1/512/3',
            coords: { lat: 46.20107072, lon: 6.14299299 }
            },
            '1404376739_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376739_514657-0-25-1/512/3',
            coords: { lat: 46.20104408, lon: 6.14301149 }
            },
            '1404376740_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376740_514657-0-25-1/512/3',
            coords: { lat: 46.2010175, lon: 6.14302986 }
            },
            '1404376741_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376741_514657-0-25-1/512/3',
            coords: { lat: 46.20099108, lon: 6.14304815 }
            },
            '1404376742_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376742_514657-0-25-1/512/3',
            coords: { lat: 46.20096491, lon: 6.14306641 }
            },
            '1404376743_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376743_514657-0-25-1/512/3',
            coords: { lat: 46.20094187, lon: 6.14308452 }
            },
            '1404376744_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376744_514657-0-25-1/512/3',
            coords: { lat: 46.20093533, lon: 6.14309313 }
            },
            '1404376745_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376745_514657-0-25-1/512/3',
            coords: { lat: 46.20093164, lon: 6.143098 }
            },
            '1404376746_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376746_514657-0-25-1/512/3',
            coords: { lat: 46.20092857, lon: 6.1431031 }
            },
            '1404376747_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376747_514657-0-25-1/512/3',
            coords: { lat: 46.20092524, lon: 6.14310812 }
            },
            '1404376748_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376748_514657-0-25-1/512/3',
            coords: { lat: 46.20092035, lon: 6.14311468 }
            },
            '1404376749_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376749_514657-0-25-1/512/3',
            coords: { lat: 46.20091354, lon: 6.14312939 }
            },
            '1404376750_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376750_514657-0-25-1/512/3',
            coords: { lat: 46.20090858, lon: 6.1431446 }
            },
            '1404376751_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376751_514657-0-25-1/512/3',
            coords: { lat: 46.20090498, lon: 6.14315626 }
            },
            '1404376752_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376752_514657-0-25-1/512/3',
            coords: { lat: 46.20090344, lon: 6.14316468 }
            },
            '1404376753_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376753_514657-0-25-1/512/3',
            coords: { lat: 46.20090011, lon: 6.14317299 }
            },
            '1404376754_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376754_514657-0-25-1/512/3',
            coords: { lat: 46.20089693, lon: 6.14317966 }
            },
            '1404376755_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376755_514657-0-25-1/512/3',
            coords: { lat: 46.20089527, lon: 6.14318473 }
            },
            '1404376756_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376756_514657-0-25-1/512/3',
            coords: { lat: 46.20089347, lon: 6.14317723 }
            },
            '1404376757_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376757_514657-0-25-1/512/3',
            coords: { lat: 46.20089164, lon: 6.14317341 }
            },
            '1404376758_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376758_514657-0-25-1/512/3',
            coords: { lat: 46.20089197, lon: 6.14316806 }
            },
            '1404376759_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376759_514657-0-25-1/512/3',
            coords: { lat: 46.20089167, lon: 6.14316976 }
            },
            '1404376761_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376761_514657-0-25-1/512/3',
            coords: { lat: 46.20089807, lon: 6.14318466 }
            },
            '1404376762_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376762_514657-0-25-1/512/3',
            coords: { lat: 46.20089989, lon: 6.143193 }
            },
            '1404376763_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376763_514657-0-25-1/512/3',
            coords: { lat: 46.20090309, lon: 6.14319978 }
            },
            '1404376764_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376764_514657-0-25-1/512/3',
            coords: { lat: 46.20090333, lon: 6.14320465 }
            },
            '1404376765_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376765_514657-0-25-1/512/3',
            coords: { lat: 46.20090503, lon: 6.14321446 }
            },
            '1404376766_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376766_514657-0-25-1/512/3',
            coords: { lat: 46.20090643, lon: 6.14322312 }
            },
            '1404376767_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376767_514657-0-25-1/512/3',
            coords: { lat: 46.20090498, lon: 6.14322502 }
            },
            '1404376768_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376768_514657-0-25-1/512/3',
            coords: { lat: 46.20089867, lon: 6.1432281 }
            },
            '1404376769_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376769_514657-0-25-1/512/3',
            coords: { lat: 46.20089344, lon: 6.14322833 }
            },
            '1404376770_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376770_514657-0-25-1/512/3',
            coords: { lat: 46.20089167, lon: 6.14322975 }
            },
            '1404376771_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376771_514657-0-25-1/512/3',
            coords: { lat: 46.20088998, lon: 6.1432299 }
            },
            '1404376772_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376772_514657-0-25-1/512/3',
            coords: { lat: 46.20089, lon: 6.14323156 }
            },
            '1404376773_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376773_514657-0-25-1/512/3',
            coords: { lat: 46.20088833, lon: 6.14323323 }
            },
            '1404376774_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376774_514657-0-25-1/512/3',
            coords: { lat: 46.2008869, lon: 6.14323643 }
            },
            '1404376775_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376775_514657-0-25-1/512/3',
            coords: { lat: 46.20088667, lon: 6.14323836 }
            },
            '1404376776_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376776_514657-0-25-1/512/3',
            coords: { lat: 46.200885, lon: 6.14323989 }
            },
            '1404376777_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376777_514657-0-25-1/512/3',
            coords: { lat: 46.200885, lon: 6.14324156 }
            },
            '1404376778_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376778_514657-0-25-1/512/3',
            coords: { lat: 46.2008851, lon: 6.14324333 }
            },
            '1404376779_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376779_514657-0-25-1/512/3',
            coords: { lat: 46.20088333, lon: 6.143245 }
            },
            '1404376780_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376780_514657-0-25-1/512/3',
            coords: { lat: 46.20088333, lon: 6.14324669 }
            },
            '1404376781_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376781_514657-0-25-1/512/3',
            coords: { lat: 46.20088333, lon: 6.14324656 }
            },
            '1404376782_514657': {
            dirName: '/data/footage/demodav/1404383663/pyramid/result_1404376782_514657-0-25-1/512/3',
            coords: { lat: 46.20088164, lon: 6.14324822 }
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

window.text2canvas=function text2canvas(text,options) {
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
   

