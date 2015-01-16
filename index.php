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
    <title>Raw data navigator</title>
    <link rel="stylesheet" type="text/css" media="all" href="font-awesome-4.2.0/css/font-awesome.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet/leaflet.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet.markercluster/MarkerCluster.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet.markercluster/MarkerCluster.Default.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/select2/select2.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/vis.js/vis.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/video.js/video-js.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="css/rawdata-navigator.css" />
    <script type="text/javascript" src="js/thirdparty/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/underscore.js/underscore-1.7.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/leaflet/leaflet-0.7.3.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/leaflet.markercluster/leaflet.markercluster-37cdfca01d.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/select2/select2-3.5.2.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/vis.js/vis-3.7.2.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/video.js/video-js-4.11.1.min.js"></script>
    <script type="text/javascript" src="js/jquery.globalstylesheet.js"></script>
    <script type="text/javascript" src="js/rawdata-navigator.js"></script>
    <script type="text/javascript">
        $(document).ready(function() {
            // init
            RawDataNavigator.init({
            <?php if (isset($_GET['mountpoint']) && !empty($_GET['mountpoint'])): ?>
                mountpoint: <?php echo json_encode(rtrim($_GET['mountpoint'],'/')); ?>,
            <?php endif; ?>
            });
        });
    </script>
</head>

<body>


<div id="map"></div>

<div id="leftpanel">
  <div class="views">
    <a class="button current" id="viewonmap">Voir sur la carte</a>
    <a class="button" id="viewasvignette">Voir vignettes</a>
  </div>
  <div class="close"><a class="fa fa-angle-double-left fa-fw"></a></div>
  <div class="content"></div>
</div>


<!--div id="timeline"></div-->
<div id="statistics"><div></div></div>

<div id="overlay">
    <div>
        <img src="img/ajax-loader.gif" width="24" height="24" alt="" />
        <div class="txt"></div>
    </div>
</div>

<div id="leftbar">
  <nav>
    <a class="fa fa-angle-double-right fa-fw"></a>
    <div class="separator"></div>
    <a class="fa fa-cogs fa-fw"></a>
    <a class="fa fa-download fa-fw"></a>
    <div class="separator"></div>
    <a class="fa fa-list-ul fa-fw"></a>
    <a class="fa fa-gear fa-fw"></a>
    <div class="separator"></div>
    <a class="fa fa-power-off fa-fw"></a>
  </nav>
</div> 

<div id="info_button"><a class="fa fa-fw fa-angle-double-right"></a></div>

<div id="panels" style="visibility: invisible">

<div id="home" class="panel">

  <div id="allocation">
        <select></select>
  </div>

  <!--div id="search">

    <input type="search" name="search">
    <select multiple name="keywords" value="Mots clés">
    </select>
    <button class="button" id="search">SEARCH</button>

  </div-->

</div>

</div>

<div id="panels2" style="visibility: invisible">
<div id="pose_info" class="panel">
    <div class="pose"></div>
    <div class="video">
        <video id="vid" class="video-js vjs-default-skin" width="640" height="320">
            <p class="vjs-no-js">Please consider using a web browser that supports <a href="http://videojs.com/html5-video-support/" target="_blank">HTML5</a>.</p>
        </video>
    </div>
    <div class="preview"></div>
    <span class="jump">
        Jump to: <input id="jump" name="jump" type="text" value="" />
    </span>
    <span class="nav"><div></div></span>
    <div class="data">
      <div class="timestamp"></div>
        <table class="section date">
          <tr>
            <td class="attr">UTC</td><td class="utc"></td>
            <td class="attr">Local time</td><td class="gmt"></td>
          </tr>
        </table>
      <table><tr><td>
        <table class="section geo">
            <tr><td class="attr">Latitude</td><td class="lat"></td></tr>
            <tr><td class="attr">Longitude</td><td class="lng"></td></tr>
            <tr><td class="attr">Altitude</td><td class="lat"></td></tr>
          </table>
        </td><td>
        <table class="section status">
            <tr><td class="attr">GPS</td><td class="gps"></td></tr>
            <tr><td class="attr">JP4</td><td class="jp4"></td></tr>
            <tr><td class="attr">Splitted</td><td class="split"></td></tr>
          </table>
        </td></tr></table>
    </div>
    <div id="map_overview"></div>
</div>

</div>

</body>
</html>
