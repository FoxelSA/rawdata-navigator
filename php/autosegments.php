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
$rawdata_path = $_GET['storage'].'/rawdata';
if (!is_dir($rawdata_path))
    exit();

// scan
$rawdata_lsdir = scandir($rawdata_path);

// loop over mac addresses
foreach ($rawdata_lsdir as $macaddress) {

    $macaddress_path = $rawdata_path.'/'.$macaddress;
    $rawmaster_path = $macaddress_path.'/master';
    if (!is_dir($rawmaster_path))
        continue;

    $csps[$macaddress] = array();
    $rawmaster_lsdir = scandir($rawmaster_path,1);

    // loop over raw segment masters
    foreach ($rawmaster_lsdir as $master) {

        $master_path = $rawmaster_path.'/'.$master;
        $rawsegment_path = $master_path.'/segment';

        if (!is_dir($master_path) || !is_dir($rawsegment_path) || substr($master,0,1)=='.')
            continue;

        $csps[$macaddress][$master] = (object)array('name'=>NULL,'segments'=>array());
        $rawsegment_lsdir = scandir($rawsegment_path);

        // loop over segments
        foreach ($rawsegment_lsdir as $segment) {

            if (substr($segment,0,1)=='.')
                continue;

            // not processed
            if (!file_exists($rawsegment_path.'/'.$segment.'/info/segment.json'))
                continue;

            // description exists
            if (file_exists($master_path.'/info/description.info'))
                $csps[$macaddress][$master]->name = file_get_contents($master_path.'/info/description.info');

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
