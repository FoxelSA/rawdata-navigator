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

// Location cache file array
$location_cache = array();

// Load location cache file if present
if ( file_exists( "../cache/locations.json" ) )
{
    // Load location cache file
    $location_cache = json_decode(
        file_get_contents( "../cache/locations.json" ),
        true
    );
}

// Get GPS position from segment.json if available
function get_first_gps( $segment_json_path )
{
    // Get JSON contents
    $segment_json_data = file_get_contents( $segment_json_path );

    // Decode JSON contents
    $segment_json = json_decode( $segment_json_data , true );

    // Check for gps flag presence
    if( $segment_json[ "gps" ] )
    {
        // Iterate over poses
        foreach ($segment_json[ "pose" ] as $key => $value) {

            // Check if position is not null
            if( $value[ 'position' ] != null )
            {
                // Return coordinates of position
                return [ $value[ 'position' ][ 2 ], $value[ 'position' ][ 1 ] ];
            }
        }
    } else {

        // Return null (No GPS in segment)
        return NULL;
    }
}

// Function go get city, road, town names form GPS coordinates
function get_location_info( $position )
{
    // Query OSM for infomations
    $location_query_json = json_decode(
        file_get_contents( "http://nominatim.openstreetmap.org/reverse?format=json&zoom=16&accept-language=en&lat=" . $position[ 0 ] . "&lon=" . $position[ 1 ] . "&addressdetails=1" ),
        true
    );

    // Road and country name container
    $road = NULL;
    $city = NULL;
    $country = $location_query_json[ 'address' ][ 'country' ];

    // Check if city name has been found
    if( ! array_key_exists( 'city', $location_query_json[ 'address' ] ) )
    {
        // Check if town name has been found
        if( ! array_key_exists( 'town', $location_query_json[ 'address' ] ) )
        {
            // Use village as city name name
            $city = $location_query_json[ 'address' ][ 'village' ];

        } else {

            // Use town as city name name
            $city = $location_query_json[ 'address' ][ 'town' ];
        }

    } else {

        // Get city name
        $city = $location_query_json[ 'address' ][ 'city' ];

    }

    // Check if road name has been found
    if( ! array_key_exists( 'road', $location_query_json[ 'address' ] ) )
    {

        // Check if suburb name has been found
        if( ! array_key_exists( 'suburb', $location_query_json[ 'address' ] ) )
        {
            // Use pedestrian as road name
            $road = $location_query_json[ 'address' ][ 'pedestrian' ];
        } else {

            // Use subrun as road name
            $road = $location_query_json[ 'address' ][ 'suburb' ];
        }

    } else {

        // Get road name
        $road = $location_query_json[ 'address' ][ 'road' ];
    }

    // Check if results are valid and return it
    if( $country && $road )
        return $road . ", " . $city . ", " . $country;
}

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

        $csps[$macaddress][$master] = (object)array('location'=>NULL, 'segments'=>array());

        $rawsegment_lsdir = scandir($rawsegment_path);

        // loop over segments
        foreach ($rawsegment_lsdir as $segment) {

            if (substr($segment,0,1)=='.')
                continue;

            $segment_json = $rawsegment_path.'/'.$segment.'/info/segment.json';

            // not processed
            if (!file_exists($segment_json))
                continue;

            // Segment entry container
            $segment_entry = (object)array(
                'id' => $segment,
                'location' => (object)array(
                    'pos' => NULL,
                    'address' => NULL
                )
            );

            // Check if location of segment is cached
            if ( array_key_exists( $macaddress, $location_cache )
                && array_key_exists( $master, $location_cache[ $macaddress ] )
                && array_key_exists( $segment, $location_cache[ $macaddress ][ $master ] ) )
            {

                // Extract location data from cache
                $current_root    = $location_cache[ $macaddress ][ $master ][ $segment ];
                $current_pos     = $location_cache[ $macaddress ][ $master ][ $segment ][ 'pos' ];
                $current_address = $location_cache[ $macaddress ][ $master ][ $segment ][ 'address' ];

                // Check if location is valid
                if( $current_pos != NULL
                    && $current_address != NULL )
                {
                    // Assign location to segment
                    $segment_entry->location = $current_root;
                }

            } else {

                // Extract position from segment.json
                $position = get_first_gps( $segment_json );

                // Check if segment have GPS
                if ($position)
                {
                    // Assign GPS position
                    $segment_entry->location->pos     = $position;

                    // Resolve address of position
                    $segment_entry->location->address = ucfirst( get_location_info( $position ) );

                    // Cache location
                    $location_cache[ $macaddress ][ $master ][ $segment ] = $segment_entry->location;

                } else {

                    // Flag location as processed but null
                    $location_cache[ $macaddress ][ $master ][ $segment ] = null;

                }

            }

            // Append segment entry to results
            $csps[$macaddress][$master]->segments[] = $segment_entry;

        }

        // clean
        if (empty($csps[$macaddress][$master]->segments))
            unset($csps[$macaddress][$master]);

    }

    // clean
    if (empty($csps[$macaddress]))
        unset($csps[$macaddress]);

}

// Save locations cache file
file_put_contents( "../cache/locations.json",
    json_encode( $location_cache )
);

// clean
if (empty($location_cache))
    unset($location_cache);

// output
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');
echo json_encode($csps);
