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

// path
$camera_path = $_GET['storage'].'/camera';
if (!is_dir($camera_path))
    exit();

// scan
$camera_lsdir = scandir($camera_path);

// loop over mac addresses
foreach ($camera_lsdir as $macaddress) {

    $macaddress_path = $camera_path.'/'.$macaddress;
    $rawmaster_path = $macaddress_path.'/raw/sync';
    $rawsegment_path = $macaddress_path.'/raw/segment';
    if (!is_dir($rawsegment_path))
        continue;

    $csps[$macaddress] = array();
    $rawsegment_lsdir = scandir($rawsegment_path,SCANDIR_SORT_DESCENDING);

    // loop over raw segment masters
    foreach ($rawsegment_lsdir as $master) {

        $master_path = $rawsegment_path.'/'.$master;
        $sync_path = $rawmaster_path.'/'.$master;
        if (!is_dir($master_path) || substr($master,0,1)=='.')
            continue;

        $csps[$macaddress][$master] = (object)array('name'=>NULL,'segments'=>array());
        $master_lsdir = scandir($master_path);

        // loop over segments
        foreach ($master_lsdir as $segment) {

            $segment_path = $master_path.'/'.$segment;

            if ((int)$segment != 1404381299 && (int)$segment != 1404383663 && (int)$segment != 1423492626)
                continue;

            // not processed
            if (!file_exists($segment_path.'/info/rawdata-autoseg/segment.json'))
                continue;

            // description exists
            if (file_exists($sync_path.'/info/description.info'))
                $csps[$macaddress][$master]->name = file_get_contents($sync_path.'/info/description.info');

            $csps[$macaddress][$master]->segments[] = $segment;

        }

        // clean
        if (empty($csps[$macaddress][$master]->segments))
            unset($csps[$macaddress][$master]);

    }

    // clean
    if (empty($csps[$macaddress]))
        unset($csps[$macaddress]);

}

// output
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');
echo json_encode($csps);
