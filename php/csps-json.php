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

if (!isset($_GET['json']) || empty($_GET['json']) || !file_exists($_GET['json'].'/segment.json'))
    exit();

$json = explode('/',$_GET['json']);
$len = count($json);

// output
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// back to old format
if ((int)($json[$len-4]) == 1423492626 || (int)($json[$len-4]) == 1412953590) {

    $data = json_decode(file_get_contents($_GET['json'].'/segment.json'));

    $data->gps = true;

    $keep = array();

    foreach ($data->pose as $pose) {
        unset($pose->orientation);
        if (!is_null($pose->position)) {
            $pose->alt = $pose->position[0];
            $pose->lng = $pose->position[1];
            $pose->lat = $pose->position[2];
        } else {
            $pose->alt = 0.0;
            $pose->lng = 0.0;
            $pose->lat = 0.0;
        }
        $pose->usc = $pose->usec;
        unset($pose->usec);
        $pose->status = $pose->raw;
        if ($pose->status == 'valid')
            $pose->status = 'validated';
        elseif ($pose->status == 'trash')
            $pose->status = 'trashed';
        elseif ($pose->status == 'corrupt')
            $pose->status = 'corrupted';
        unset($pose->raw);
        $pose->folder = '0';
        $pose->guess = false;
        unset($pose->still);

        if (!is_null($pose->position)) {
            $keep[] = $pose;
        }
        unset($pose->position);

    }

    $data->pose = $keep;

    echo json_encode($data);

// normal output
} else {
    echo file_get_contents($_GET['json'].'/segment.json');
}
