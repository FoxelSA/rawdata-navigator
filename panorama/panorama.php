<?php

$pano = $_GET['pano'];

$panots = '';
if ($pano == 'mur-des-reformateurs')
    $panots = '1404381299';
elseif ($pano == 'place-de-neuve')
    $panots = '1404383663';
elseif ($pano == 'tour-de-boel')
    $panots = '1412953590';
elseif ($pano == 'ssa')
    $panots = '1423492626';
elseif ($pano == 'cathedrale-st-pierre')
    $panots = '1418211239';
elseif ($pano == 'epfl')
    $panots = '1426679568';
elseif ($pano == 'tranchee')
    $panots = '1428107987';

$poi_path=$_GET['mountpoint']."/footage/demodav/".$panots."/poi/";

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
    <script type="text/javascript" src="../lib/freepano/js/thirdparty/multithread.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/notify.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/eventDispatcher.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/progressBar.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/loader.js"></script>
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
<?php if (isset($_GET['action']) && $_GET['action']=='poi_edit') : ?>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pointcloud.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pointcloud.sequence.js"></script>
    <script type="text/javascript" src="../lib/freepano/js/jquery.freepano.pointcloud.sequence.loader.js"></script>
<?php endif; ?>
    <script type="text/javascript" src="js/<?php echo $pano; ?>.js"></script>
    <link rel="stylesheet" type="text/css" media="all" href="../font-awesome-4.3.0/css/font-awesome.css">
    <link rel="stylesheet" type="text/css" media="all" href="../lib/freepano/js/thirdparty/jquery-toastmessage/css/jquery.toastmessage.css" />
    <link rel="stylesheet" type="text/css" media="all" href="../lib/freepano/js/thirdparty/leaflet/leaflet.css" />
    <link rel="stylesheet" type="text/css" media="all" href="../lib/freepano/example/css/main.css" />
    <link rel="stylesheet" type="text/css" media="all" href="css/dav.css" />
</head>

<body>

<div id="pano" class="freepano"></div>

<div id="colorpicker">
  <ul>
    <li><a title="#ffffff" rel="ffffff" style="background: #ffffff; colour: 000000;">#ffffff</a></li>
    <li><a title="#ffccc9" rel="ffccc9" style="background: #ffccc9; colour: 000000;">#ffccc9</a></li>
    <li><a title="#ffce93" rel="ffce93" style="background: #ffce93; colour: 000000;">#ffce93</a></li>
    <li><a title="#fffc9e" rel="fffc9e" style="background: #fffc9e; colour: 000000;">#fffc9e</a></li>
    <li><a title="#ffffc7" rel="ffffc7" style="background: #ffffc7; colour: 000000;">#ffffc7</a></li>
    <li><a title="#9aff99" rel="9aff99" style="background: #9aff99; colour: 000000;">#9aff99</a></li>
    <li><a title="#96fffb" rel="96fffb" style="background: #96fffb; colour: 000000;">#96fffb</a></li>
    <li><a title="#cdffff" rel="cdffff" style="background: #cdffff; colour: 000000;">#cdffff</a></li>
    <li><a title="#cbcefb" rel="cbcefb" style="background: #cbcefb; colour: 000000;">#cbcefb</a></li>
    <li><a title="#cfcfcf" rel="cfcfcf" style="background: #cfcfcf; colour: 000000;">#cfcfcf</a></li>
    <li><a title="#fd6864" rel="fd6864" style="background: #fd6864; colour: 000000;">#fd6864</a></li>
    <li><a title="#fe996b" rel="fe996b" style="background: #fe996b; colour: 000000;">#fe996b</a></li>
    <li><a title="#fffe65" rel="fffe65" style="background: #fffe65; colour: 000000;">#fffe65</a></li>
    <li><a title="#fcff2f" rel="fcff2f" style="background: #fcff2f; colour: 000000;">#fcff2f</a></li>
    <li><a title="#67fd9a" rel="67fd9a" style="background: #67fd9a; colour: 000000;">#67fd9a</a></li>
    <li><a title="#38fff8" rel="38fff8" style="background: #38fff8; colour: 000000;">#38fff8</a></li>
    <li><a title="#68fdff" rel="68fdff" style="background: #68fdff; colour: 000000;">#68fdff</a></li>
    <li><a title="#9698ed" rel="9698ed" style="background: #9698ed; colour: 000000;">#9698ed</a></li>
    <li><a title="#c0c0c0" rel="c0c0c0" style="background: #c0c0c0; colour: 000000;">#c0c0c0</a></li>
    <li><a title="#fe0000" rel="fe0000" style="background: #fe0000; colour: 000000;">#fe0000</a></li>
    <li><a title="#f8a102" rel="f8a102" style="background: #f8a102; colour: 000000;">#f8a102</a></li>
    <li><a title="#ffcc67" rel="ffcc67" style="background: #ffcc67; colour: 000000;">#ffcc67</a></li>
    <li><a title="#f8ff00" rel="f8ff00" style="background: #f8ff00; colour: 000000;">#f8ff00</a></li>
    <li><a title="#34ff34" rel="34ff34" style="background: #34ff34; colour: 000000;">#34ff34</a></li>
    <li><a title="#68cbd0" rel="68cbd0" style="background: #68cbd0; colour: 000000;">#68cbd0</a></li>
    <li><a title="#34cdf9" rel="34cdf9" style="background: #34cdf9; colour: 000000;">#34cdf9</a></li>
    <li><a title="#6665cd" rel="6665cd" style="background: #6665cd; colour: 000000;">#6665cd</a></li>
    <li><a title="#9b9b9b" rel="9b9b9b" style="background: #9b9b9b; colour: 000000;">#9b9b9b</a></li>
    <li><a title="#cb0000" rel="cb0000" style="background: #cb0000; colour: 000000;">#cb0000</a></li>
    <li><a title="#f56b00" rel="f56b00" style="background: #f56b00; colour: 000000;">#f56b00</a></li>
    <li><a title="#ffcb2f" rel="ffcb2f" style="background: #ffcb2f; colour: 000000;">#ffcb2f</a></li>
    <li><a title="#ffc702" rel="ffc702" style="background: #ffc702; colour: 000000;">#ffc702</a></li>
    <li><a title="#32cb00" rel="32cb00" style="background: #32cb00; colour: 000000;">#32cb00</a></li>
    <li><a title="#00d2cb" rel="00d2cb" style="background: #00d2cb; colour: 000000;">#00d2cb</a></li>
    <li><a title="#3166ff" rel="3166ff" style="background: #3166ff; colour: 000000;">#3166ff</a></li>
    <li><a title="#6434fc" rel="6434fc" style="background: #6434fc; colour: 000000;">#6434fc</a></li>
    <li><a title="#656565" rel="656565" style="background: #656565; colour: 000000;">#656565</a></li>
    <li><a title="#9a0000" rel="9a0000" style="background: #9a0000; colour: 000000;">#9a0000</a></li>
    <li><a title="#ce6301" rel="ce6301" style="background: #ce6301; colour: 000000;">#ce6301</a></li>
    <li><a title="#cd9934" rel="cd9934" style="background: #cd9934; colour: 000000;">#cd9934</a></li>
    <li><a title="#999903" rel="999903" style="background: #999903; colour: 000000;">#999903</a></li>
    <li><a title="#009901" rel="009901" style="background: #009901; colour: 000000;">#009901</a></li>
    <li><a title="#329a9d" rel="329a9d" style="background: #329a9d; colour: 000000;">#329a9d</a></li>
    <li><a title="#3531ff" rel="3531ff" style="background: #3531ff; colour: 000000;">#3531ff</a></li>
    <li><a title="#6200c9" rel="6200c9" style="background: #6200c9; colour: 000000;">#6200c9</a></li>
    <li><a title="#343434" rel="343434" style="background: #343434; colour: 000000;">#343434</a></li>
    <li><a title="#680100" rel="680100" style="background: #680100; colour: 000000;">#680100</a></li>
    <li><a title="#963400" rel="963400" style="background: #963400; colour: 000000;">#963400</a></li>
    <li><a title="#986536" rel="986536" style="background: #986536; colour: 000000;">#986536</a></li>
    <li><a title="#646809" rel="646809" style="background: #646809; colour: 000000;">#646809</a></li>
    <li><a title="#036400" rel="036400" style="background: #036400; colour: 000000;">#036400</a></li>
    <li><a title="#34696d" rel="34696d" style="background: #34696d; colour: 000000;">#34696d</a></li>
    <li><a title="#00009b" rel="00009b" style="background: #00009b; colour: 000000;">#00009b</a></li>
    <li><a title="#303498" rel="303498" style="background: #303498; colour: 000000;">#303498</a></li>
    <li><a title="#000000" rel="000000" style="background: #000000; colour: ffffff;">#000000</a></li>
    <li><a title="#330001" rel="330001" style="background: #330001; colour: 000000;">#330001</a></li>
    <li><a title="#643403" rel="643403" style="background: #643403; colour: 000000;">#643403</a></li>
    <li><a title="#663234" rel="663234" style="background: #663234; colour: 000000;">#663234</a></li>
    <li><a title="#343300" rel="343300" style="background: #343300; colour: 000000;">#343300</a></li>
    <li><a title="#013300" rel="013300" style="background: #013300; colour: 000000;">#013300</a></li>
    <li><a title="#003532" rel="003532" style="background: #003532; colour: 000000;">#003532</a></li>
    <li><a title="#010066" rel="010066" style="background: #010066; colour: 000000;">#010066</a></li>
    <li><a title="#340096" rel="340096" style="background: #340096; colour: 000000;">#340096</a></li>
  </ul>
</div>

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
