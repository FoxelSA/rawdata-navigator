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
/*
            '1428108507_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108507_468867-0-25-1/512/3',
            coords: { lat: 46.20139493772975, lon: 6.164358373876521 }
            },
            */
            '1428108507_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108507_968867-0-25-1/512/3',
            coords: { lat: 46.201399126125, lon: 6.1643542072083335 }
            },
            '1428108508_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108508_468867-0-25-1/512/3',
            coords: { lat: 46.20140493792597, lon: 6.1643516854292075 }
            },
            '1428108508_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108508_968867-0-25-1/512/3',
            coords: { lat: 46.201409126250006, lon: 6.164347540416667 }
            },
            '1428108509_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108509_468867-0-25-1/512/3',
            coords: { lat: 46.201413273855835, lon: 6.164343373626619 }
            },
            '1428108509_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108509_968867-0-25-1/512/3',
            coords: { lat: 46.20141902747654, lon: 6.16434088367437 }
            },
            '1428108510_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108510_468867-0-25-1/512/3',
            coords: { lat: 46.20142494116472, lon: 6.16433835485107 }
            },
            '1428108510_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108510_968867-0-25-1/512/3',
            coords: { lat: 46.20143157629626, lon: 6.164337550195405 }
            },
            '1428108511_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108511_468867-0-25-1/512/3',
            coords: { lat: 46.20143827183524, lon: 6.164336685741473 }
            },
            '1428108511_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108511_968867-0-25-1/512/3',
            coords: { lat: 46.201444235537416, lon: 6.164334216706041 }
            },
            '1428108512_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108512_468867-0-25-1/512/3',
            coords: { lat: 46.201448293406735, lon: 6.164331707060069 }
            },
            '1428108512_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108512_968867-0-25-1/512/3',
            coords: { lat: 46.2014542356484, lon: 6.164327539924999 }
            },
            '1428108513_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108513_468867-0-25-1/512/3',
            coords: { lat: 46.201458274558206, lon: 6.164323354177861 }
            },
            '1428108513_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108513_968867-0-25-1/512/3',
            coords: { lat: 46.20146402789407, lon: 6.164321656737293 }
            },
            '1428108514_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108514_468867-0-25-1/512/3',
            coords: { lat: 46.20146996077631, lon: 6.164319999538767 }
            },
            '1428108514_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108514_968867-0-25-1/512/3',
            coords: { lat: 46.20147668628128, lon: 6.164319901018716 }
            },
            '1428108515_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108515_468867-0-25-1/512/3',
            coords: { lat: 46.20148325375513, lon: 6.164321667125033 }
            },
            '1428108515_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108515_968867-0-25-1/512/3',
            coords: { lat: 46.20148991101603, lon: 6.164323442198921 }
            },
            '1428108516_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108516_468867-0-25-1/512/3',
            coords: { lat: 46.201496587324684, lon: 6.164324978900245 }
            },
            '1428108517_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108517_968867-0-25-1/512/3',
            coords: { lat: 46.2015116067726, lon: 6.164321684956243 }
            },
            '1428108517_468867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108517_468867-0-25-1/512/3',
            coords: { lat: 46.20151835373115, lon: 6.164318323526046 }
            },
            '1428108516_968867': {
            dirName: '/data/footage/demodav/1428107987/pyramid/result_1428108516_968867-0-25-1/512/3',
            coords: { lat: 46.20150413706332, lon: 6.1643233234950054 }
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

    showMouseInfo: false,

    pointCloud: {

      allInOne: true,
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
          depthWrite: false
      }), // pointCloud.defaults.dotMaterial

      enableParticleEvents: false,

      showParticleCursor: false

    },

    snapshot: {
      active: true
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
      case 13: // enter
        if (panorama.ias) {
          // save snapshot
          panorama.snapshot.toggleEdit({
            save: true,
            keepThumb: true
          });
          break;
        }
        // continue

      case 27: // escape
        if (panorama.ias) {
          // cancel snapshot
          panorama.snapshot.toggleEdit({
            keepThumb:false
          });
        } else if ($(panorama.gallery.overlay).is(':visible')) {
            // hide gallery
            panorama.gallery.hide();
        }   
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
