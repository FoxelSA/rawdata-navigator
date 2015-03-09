<?php

$pano = $_GET['pano'];

$poi_path="/data/footage/demodav/".$pano."/poi/";

if (isset($_POST['cmd'])) {

  switch($_POST['cmd']) {

  // save poi list
  case 'poi_save':

    // output file name
    $outfile=$poi_path.$_GET['initial'].".json";

    // write json to file
    $ret=file_put_contents($outfile,$_POST['json']);

    // set return status
    header('Content-Type: application/json');
    echo '{"status": '.($ret===FALSE?'"error"':'"ok"').'}';

    exit(0);

  // save particle sequences
  case 'seq_save':

    // output file name
    $outfile=$poi_path.$_GET['initial']."_seq.json";

    // write json to file
    $ret=file_put_contents($outfile,$_POST['json']);

    // set return status
    header('Content-Type: application/json');
    echo '{"status": '.($ret===FALSE?'"error"':'"ok"').'}';

    exit(0);
  }

  // unknown command
  exit(1);
}

// timestamp and action specified ?
if (isset($_GET['initial']) && isset($_GET['action'])) {

  switch($_GET['action']) {

  /* POI list requested */
  case "poi_list":

    $json=$poi_path.$_GET['initial'].".json";

    if (isset($_GET['download'])) {
      header('Content-Type: application/octet-stream');
      header("Content-Transfer-Encoding: Binary");
      header("Content-disposition: attachment; filename=\"" . basename($json) . "\"");
    } else {
      header('Content-Type: application/json');
    }

    if (isset($json) && file_exists($json)) {
      print(file_get_contents($json));
    } else {
      echo '{}';
    }
    exit(0);

  /* point lists requested */
  case "seq_list":

    $json=$poi_path.$_GET['initial']."_seq.json";

    if (isset($_GET['download'])) {
      header('Content-Type: application/octet-stream');
      header("Content-Transfer-Encoding: Binary");
      header("Content-disposition: attachment; filename=\"" . basename($json) . "\"");
    } else {
      header('Content-Type: application/json');
    }

    if (isset($json) && file_exists($json)) {
      print(file_get_contents($json));
    } else {
      echo '{}';
    }
    exit(0);


  }
}
?><!DOCTYPE html>
<html lang="en">
<!--

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

-->
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <title>Freepano Example - https://github.com/FoxelSA/freepano</title>
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,minimum-scale=1,maximum-scale=1,user-scalable=0">
    <script type="text/javascript">
            var poi_path='<?php print($poi_path); ?>';
        <?php if (isset($_GET['initial'])): ?>
            var initialImage = '<?php print ($_GET['initial']); ?>';
        <?php endif; ?>
    </script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/jquery-2.1.3.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/jquery.easing-1.3.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/jquery.mousewheel-3.1.12.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/jquery-toastmessage/jquery.toastmessage.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/jquery.browser-0.0.6.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/hammer.js/hammer-2.0.4.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/watch-1.3.0.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/leaflet/leaflet-0.7.3.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/three-r70.min.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/postprocessing/EffectComposer.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/postprocessing/RenderPass.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/postprocessing/MaskPass.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/postprocessing/ShaderPass.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/shaders/CopyShader.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/shaders/GreenShader.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/shaders/EdgeShader.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/three.js/shaders/EdgeShader2.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/howler.js/howler.core.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/howler.js/howler.effects.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/notify.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/eventDispatcher.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.widget.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.poi.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.poi.thumbnails.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.poi.loader.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.arrow.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.sound.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.list.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.controls.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pyramid.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.map.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pointcloud.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pointcloud.sequence.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pointcloud.sequence.loader.js"></script>
    <script type="text/javascript" src="js/<?php echo $pano; ?>.js"></script>
    <link rel="stylesheet" type="text/css" media="all" href="../lib/freepano/js/thirdparty/jquery-toastmessage/css/jquery.toastmessage.css" />
    <link rel="stylesheet" type="text/css" media="all" href="../lib/freepano/js/thirdparty/leaflet/leaflet.css" />
    <link rel="stylesheet" type="text/css" media="all" href="../lib/freepano/example/css/main.css" />
</head>

<body>

<div id="pano" class="freepano"></div>

<!--footer>
    <div class="shade"></div>
    <div class="main">
        <div class="caption">
            <div>Projet SITG</div>
            <div>Mur des Réformateurs</div>
        </div>
        <div class="logo">
            <a href="http://foxel.ch/" target="_blank"><img src="img/foxel.png" alt="FOXEL" width="71" height="18" /></a>
        </div>
    </div>
</footer-->

</body>
</html>
