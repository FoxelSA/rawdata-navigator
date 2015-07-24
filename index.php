<?php

/**
 * rawdata-navigator - Human-understandable raw data navigator
 *
 * Copyright (c) 2014-2015 FOXEL SA - http://foxel.ch
 * Please read <http://foxel.ch/license> for more information.
 *
 *
 * Author(s):
 *
 *      Alexandre Kraft <a.kraft@foxel.ch>
 *
 * Contributor(s):
 *
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

?><!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>FOXEL | rawdata-navigator</title>
    <link rel="shortcut icon" type="image/x-icon" href="img/favicon.ico" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet/leaflet.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet.markercluster/MarkerCluster.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/leaflet.markercluster/MarkerCluster.Default.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/select2/select2.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/vis.js/vis.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/video.js/video-js.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="js/thirdparty/jquery.mCustomScrollbar/jquery.mCustomScrollbar.min.css" />
    <link rel="stylesheet" type="text/css" media="all" href="css/rawdata-navigator.css" />
    <script type="text/javascript" src="js/thirdparty/jquery-2.1.3.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/underscore.js/underscore-1.7.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/leaflet/leaflet-0.7.3.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/leaflet.markercluster/leaflet.markercluster-e63f39e5fc.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/select2/select2-3.5.2.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/vis.js/vis-3.10.0.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/video.js/video-js-4.12.0.min.js"></script>
    <script type="text/javascript" src="js/thirdparty/jquery.mCustomScrollbar/jquery.mCustomScrollbar-3.0.7.min.js"></script>
    <script type="text/javascript" src="js/rawdata-navigator.js"></script>
    <script type="text/javascript">
        $(document).ready(function() {
            // init
            RawDataNavigator.init({
            <?php if (isset($_GET['mountpoint']) && !empty($_GET['mountpoint'])): ?>
                mountpoint: <?php echo json_encode(rtrim($_GET['mountpoint'],'/')); ?>,
            <?php endif; ?>

            <?php if (isset($_GET['mac']) && !empty($_GET['mac'])): ?>
                mac: <?php echo json_encode(rtrim($_GET['mac'],'/')); ?>,
            <?php endif; ?>

            <?php if (isset($_GET['master']) && !empty($_GET['master'])): ?>
                master: <?php echo json_encode(rtrim($_GET['master'],'/')); ?>,
            <?php endif; ?>

            <?php if (isset($_GET['segment']) && !empty($_GET['segment'])): ?>
                segment: <?php echo json_encode(rtrim($_GET['segment'],'/')); ?>,
            <?php endif; ?>

            <?php if (isset($_GET['pose']) && !empty($_GET['pose'])): ?>
                pose: <?php echo json_encode(rtrim($_GET['pose'],'/')); ?>,
            <?php endif; ?>
            });
        });
    </script>
</head>

<body>

<div id="header">
    <a class="logo" href="http://foxel.ch" target="_blank"><img src="img/foxel.png" width="175" alt="FOXEL" /></a>
    <div class="dataset">Dataset :</div>
    <div id="allocation">
        <select></select>
    </div>
    <a class="permalink" href="#"><span></span></div>
</div>

<div id="map"></div>

<div id="info">
    <div class="close"><span></span></div>
    <div class="video">
        <video id="vid" class="video-js vjs-default-skin" width="498" height="249">
            <p class="vjs-no-js">Please consider using a web browser that supports <a href="http://videojs.com/html5-video-support/" target="_blank">HTML5</a>.</p>
        </video>
    </div>
    <div class="scrollable">
        <div class="head">
            <div class="jump">
                Pose <input id="jump" name="jump" type="text" value="" /> of <span class="poses"></span>
            </div>
            <div class="nav"><div></div></div>
            <div style="clear:both;"></div>
        </div>
        <div class="viewer">
            <div class="preview">
                <img src="img/def.png" alt="" width="498" height="249" />
            </div>
        </div>
        <div class="data">
            <div>
                <div class="block">
                    <div class="section status control closed"><span></span>Run</div>
                    <div class="closeable closed">
                        <table class="section status">
                            <tr><td class="attr">Location</td><td class="location"></td></tr>
                            <tr class="space"><td class="attr">JP4</td><td class="jp4"></td></tr>
                            <tr class="space"><td class="attr">Master</td><td class="master"></td></tr>
                            <tr><td class="attr">Segment</td><td class="segment"></td></tr>
                            <tr class="space"><td class="attr">MAC address</td><td class="camera"></td></tr>
                        </table>
                    </div>
                </div>
                <div class="block">
                    <div class="section date control closed"><span></span>Date</div>
                    <div class="closeable closed">
                        <table class="section date">
                            <tr><td class="attr">Trigger</td><td class="timestamp"></td></tr>
                            <tr class="space"><td class="attr">UTC</td><td class="utc"></td></tr>
                            <tr><td class="attr">Local time</td><td class="gmt"></td></tr>
                        </table>
                    </div>
                </div>
                <div style="clear:both;"></div>
            </div>
            <div>
                <div class="block">
                    <div class="section geo control closed"><span></span>Position</div>
                    <div class="closeable closed">
                        <table class="section geo known">
                            <tr><td class="attr">Latitude</td><td><span class="pre">WGS84</span><span class="lat"></span></td></tr>
                            <tr><td class="attr">Longitude</td><td><span class="pre">WGS84</span><span class="lng"></span></td></tr>
                            <tr class="space"><td class="attr">Altitude</td><td><span class="pre">MSL</span><span class="alt"></span></td></tr>
                            <tr class="space"><td class="attr">Still</td><td class="still"></td></tr>
                            <tr><td class="attr">Robustness</td><td class="robustness"></td></tr>
                        </table>
                        <table class="section geo unknown">
                            <tr><td class="attr">GPS</td><td>No GPS fix</td></tr>
                        </table>
                    </div>
                </div>
                <div class="block">
                    <div class="section orientation control closed"><span></span>Orientation</div>
                    <div class="closeable closed">
                        <table class="section orientation known">
                            <tr><td class="attr">Robustness</td><td class="robustness"></td></tr>
                            <tr class="space"><td class="attr">Rotation 0,0</td><td class="rot00"></td></tr>
                            <tr><td class="attr">Rotation 0,1</td><td class="rot01"></td></tr>
                            <tr><td class="attr">Rotation 0,2</td><td class="rot02"></td></tr>
                            <tr class="space"><td class="attr">Rotation 1,0</td><td class="rot10"></td></tr>
                            <tr><td class="attr">Rotation 1,1</td><td class="rot11"></td></tr>
                            <tr><td class="attr">Rotation 1,2</td><td class="rot12"></td></tr>
                            <tr class="space"><td class="attr">Rotation 2,0</td><td class="rot20"></td></tr>
                            <tr><td class="attr">Rotation 2,1</td><td class="rot21"></td></tr>
                            <tr><td class="attr">Rotation 2,2</td><td class="rot22"></td></tr>
                        </table>
                        <table class="section orientation unknown">
                            <tr><td class="attr">IMU</td><td>No IMU data</td></tr>
                        </table>
                    </div>
                </div>
                <div style="clear:both;"></div>
            </div>
        </div>
        <div id="overview"></div>
    </div>
</div>

<div id="timeline"></div>
<div id="statistics"><div></div></div>

<div id="overlay">
    <div>
        <div class="spin"><span></span></div>
        <div class="txt"></div>
    </div>
</div>

</body>
</html>
