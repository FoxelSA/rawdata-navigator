<?php

/**
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

 ?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=1920, user-scalable=no">
    <title>DAV</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
    <link rel="stylesheet" type="text/css" media="all" href="font-awesome-4.3.0/css/font-awesome.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet/leaflet.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet.markercluster/MarkerCluster.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet.markercluster/MarkerCluster.Default.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/select2/select2.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/vis.js/vis.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/video.js/video-js.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css" />
    <link rel="stylesheet" type="text/css" media="all" href="css/rawdata-navigator.css" />
    <script type="text/javascript" src="js/thirdparty/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/jquery.fullscreen-min.js"></script>
    <script type="text/javascript" src="js/thirdparty/jquery.cookie-1.4.1.js"></script>
    <script type="text/javascript" src="js/thirdparty/underscore.js/underscore-1.7.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/leaflet/leaflet-0.7.3.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/leaflet.markercluster/leaflet.markercluster-37cdfca01d.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/select2/select2-3.5.2.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/vis.js/vis-3.7.2.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/video.js/video-js-4.11.1.min.js"></script>
    <script type="text/javascript" src="js/rawdata-navigator.js"></script>
    <script type="text/javascript">
      function isMobile() {
          try{ document.createEvent("TouchEvent"); return true; }
            catch(e){ return false; }
      }
      $(document).ready(function() {
            DAV.init({
            <?php if (isset($_GET['mountpoint']) && !empty($_GET['mountpoint'])): ?>
                mountpoint: <?php echo json_encode(rtrim($_GET['mountpoint'],'/')); ?>,
            <?php endif; ?>
            });
        });
    </script>
</head>

<body>

<div id="map"></div>

<div id="leftpanel" class="panel primary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content"></div>
  <div class="content2">
    <div id="vignettes"></div>
  </div>
</div>

<div id="infopanel" class="panel">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content"></div>
  <div class="content2">
  </div>
</div>

<div id="digitizingpanel" class="panel secondary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content">
    <iframe src="<?php if (true) { echo 'http://project-osrm.org/osrm-frontend-v2/'; } ?>" frameborder="no" scrolling="no" seamless="seamless"></iframe>
  </div>
</div>

<div id="processingpanel" class="panel secondary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content"></div>
</div>

<div id="taxonomypanel" class="panel secondary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content">
  </div>
</div>

<div id="configurationpanel" class="panel secondary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content">
  </div>
</div>

<div id="pointcloudpanel" class="panel secondary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content">
    <iframe src="<?php if (false) { echo '/potree'; } ?>" frameborder="no" scrolling="no" seamless="seamless"></iframe>
  </div>
</div>

<div id="freepanel" class="panel secondary">
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content">
    <iframe src="<?php if (false) { echo '/freepano'; } ?>" frameborder="no" scrolling="no" seamless="seamless"></iframe>
  </div>
</div>

<div class="paneltitle"><div></div></div>

<div id="timeline"></div>
<div id="statistics"><div></div></div>

<div id="overlay">
    <div>
        <img src="img/ajax-loader.gif" width="24" height="24" alt="" />
        <div class="txt"></div>
    </div>
</div>

<div id="leftbar">
  <nav>
    <a id="a_leftpanel" class="button panel_button davicon"></a>
    <a id="viewasvignette" class="button views fa fa-th fa-fw" title="Vignettes"></a>

    <a id="a_digitizingpanel" class="button panel_button fa fa-download fa-fw"></a>
    <a id="a_processingpanel" class="button panel_button fa fa-cubes fa-fw"></a>

    <a id="a_taxonomypanel" class="button panel_button spacer fa fa-server fa-fw"></a>
    <a id="a_configurationpanel" class="button panel_button fa fa-gear fa-fw"></a>
    <!--
    <div class="separator"></div>
    <a id="logout" class="button fa fa-power-off fa-fw"></a>
    -->
    <div id="leftbar_footer">
      <a id="leftbar_timeline" class="button timeline fa fa-clock-o fa-fw"></a>
      <a id="leftbar_fullscreen" class="button fullscreen fa fa-expand fa-fw"></a>
    </div>
  </nav>
</div>

<div id="info_button"><a class="fa fa-fw fa-angle-double-right"></a></div>

<!-- panels -->
<div id="panels" style="visibility: invisible">

<!-- home -->
<div id="home" class="panel_content">
  <div id="allocation">
        <h2>Recherche de données</h2>
        <select multiple="multiple"></select>
        <h3>Recherche rapide</h3>
        <a href="#" class="quick" onclick="DAV.allocation.quicksearch('both');return false;">Projet SITG</a>
        <a href="#" class="quick" onclick="DAV.allocation.quicksearch('reformateurs');return false;">Mur des Réformateurs</a>
  </div>

  <!--div id="search">

    <input type="search" name="search">
    <button class="button" id="search">SEARCH</button>

    </div-->

</div>
<!-- home -->

</div>
<!-- panels -->


<!-- panels2 -->
<div id="panels2" style="visibility: invisible">

<!-- pose_info -->
<div id="pose_info" class="panel_content">
    <div class="pose"></div>
    <!--
    <div class="viewers">
      <a class="button" id="a_freepanel">Panorama</a>
      <a class="button" id="a_pointcloudpanel">Point Cloud</a>
   </div>
   -->
   <div id="usages" class="data">
       <div class="usage posepreview">
            <div class="title">Preview</div>
            <div class="nocloseable">
                <div class="preview"><img onerror="nopreview(this);"></img></div>
                <div class="actions">
                    <div class="action"><a href="" class="download_tiles">Download RAW tiles...</a></div>
                </div>
            </div>
        </div>
        <div class="usage posemap">
            <div class="title">Overview</div>
            <div class="nocloseable">
                <div id="map_overview"></div>
            </div>
        </div>
        <div class="usage poseinformation">
            <div class="title pointer">Information</div>
            <div class="closeable">
                <div class="section" style="margin-top:15px;">Date</div>
                <table class="section date">
                  <tr><td class="attr">UTC</td><td class="utc"></td></tr>
                  <tr><td class="attr">Local time</td><td class="gmt"></td></tr>
                </table>
                <div class="section">Géoposition</div>
                <table class="section geo">
                  <tr><td class="attr">Latitude</td><td class="lat"></td></tr>
                  <tr><td class="attr">Longitude</td><td class="lng"></td></tr>
                  <tr><td class="attr">Altitude</td><td class="lat"></td></tr>
                  <tr><td class="attr">GPS</td><td class="gps"></td></tr>
                </table>
                <div class="section">Acquisition</div>
                <table class="section digitizing">
                  <tr><td class="attr">Run</td><td class="run"></td></tr>
                  <tr><td class="attr">Segment</td><td class="segment"></td></tr>
                  <tr><td class="attr">Trigger</td><td class="sec"></td></tr>
                  <tr><td class="attr">μSec</td><td class="usc"></td></tr>
                  <tr><td class="attr">Pose</td><td class="item"></td></tr>
                </table>
            </div>
        </div>
        <div class="usage posepanorama">
            <div class="title pointer">Panorama</div>
            <div class="closeable">
              <div><a class="view_panorama" onclick="DAV.viewFreepano(this);return false;"><img width="430" /></a></div>
                <div class="actions">
                    <div class="action"><a href="" class="download_panorama">Download EQR image...</a></div>
                </div>
            </div>
        </div>
        <div class="usage posepointcloud">
            <div class="title pointer">Point Cloud</div>
            <div class="closeable">
              <div><a class="view_pointcloud" onclick="DAV.viewPotree(this);return false;"><img width="430" /></a></div>
                <div class="actions">
                    <div class="action"><a href="" class="download_pointcloud">Download PLY pointcloud...</a></div>
                </div>
            </div>
        </div>
    </div>
  </div>
  <!-- pose_info -->

<!-- video_player -->
  <div id="video_player" class="panel_content">
    <div class="video">
      <video id="vid" class="video-js vjs-default-skin">
          <p class="vjs-no-js">Please consider using a web browser that supports <a href="http://videojs.com/html5-video-support/" target="_blank">HTML5</a>.</p>
      </video>
   </div>
    <div class="jump">
      <span>Frame:</span>
      <input id="pose" name="pose" type="number" min="0" />
      <a class="button" id="select">Select</a>
      <span class="nav">
        <a id="prev" class="button"><span class="fa fa-angle-double-left fa-fw"></span>Prev</a>
        <a id="next" class="button">Next<span class="fa fa-angle-double-right fa-fw"></span></a>
      </span>
    </div>
 </div>
<!-- video_player -->

</div>
<!-- panels2 -->

</body>
</html>
