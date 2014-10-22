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


$csps = array();

// storage
if (!isset($_GET['storage']) || empty($_GET['storage']) || !is_dir($_GET['storage']))
    exit();

// scan
$camera_path = $_GET['storage'].'/camera';
$camera_lsdir = scandir($camera_path);

// loop over mac addresses
foreach ($camera_lsdir as $macaddress) {

    $macaddress_path = $camera_path.'/'.$macaddress;
    $rawsegment_path = $macaddress_path.'/raw/segment';
    if (!is_dir($rawsegment_path))
        continue;

    $csps[$macaddress] = array();
    $rawsegment_lsdir = scandir($rawsegment_path,SCANDIR_SORT_DESCENDING);

    // loop over raw segment masters
    foreach ($rawsegment_lsdir as $master) {

        $master_path = $rawsegment_path.'/'.$master;
        if (!is_dir($master_path) || substr($master,0,1)=='.')
            continue;

        $csps[$macaddress][$master] = array();
        $master_lsdir = scandir($master_path);

        // loop over segments
        foreach ($master_lsdir as $segment) {

            $segment_path = $master_path.'/'.$segment;
            if (!file_exists($segment_path.'/csps/exports/rawdata-navigator.json'))
                continue;

            $csps[$macaddress][$master][$segment] = (object)array('name'=>'N/A');

        }

        // clean
        if (empty($csps[$macaddress][$master]))
            unset($csps[$macaddress][$master]);

    }

    // clean
    if (empty($csps[$macaddress]))
        unset($csps[$macaddress]);

}

// output
header('Content-Type: application/json');
echo json_encode($csps);
