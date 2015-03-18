
## Changelog


### 1.3.3 (March 18, 2015)

- `ADDED` Pose unknown flag in case the associated MOV has not been splitted.


### 1.3.2 (March 6, 2015)

- `ADDED` Poses can be filtered by their status.
- `FIXED` Right-clicking on the timeline was breaking the widget.


### 1.3.1 (March 6, 2015)

- `ADDED` Pose missing flag in case there is not associated image or MOV file to it.


### 1.3.0 (February 19, 2015)

- `FIXED` Overview map size is invalidated following the API.
- `FIXED` Information panel is on the left of the screen, scrollable.
- `FIXED` Timeline uses a dark theme to focus user on the map.
- `FIXED` Allocation selector goes on the top of the screen to avoid map interference.
- `FIXED` Loader image as font and CSS3 animation.
- `ADDED` JSON additional information is reflected on the information panel.
- `ADDED` Mapbox Bright and Labelled Satellite tiles are available.
- `UPDATED` JSON discovery is updated according to the new raw data structure.
- `UPDATED` Third party libraries are updated to their latest versions.


### 1.2.0 (December 17, 2014)

- `FIXED` Remove the _data_ symbolic link dependency as video streaming is allowed now.
- `ADDED` Information panel now shows a secondary global map of the segment track.
- `FIXED` Playing the segment video doesn't unzoom and move the primary map anymore.
- `FIXED` Timeline is now locked to dates from the first to the last segment.
- `ADDED` Timeline blocks now shows additional information in a tooltip.
- `ADDED` Opened segment information panel is now reflected in the timeline.
- `ADDED` Right-clicking a segment in timeline now open its information panel.
- `FIXED` Disabled OSM Black&White tiles as the server has gone away.


### 1.1.0 (December 10, 2014)

- `FIXED` Improved performance and lower memory consumption (code refactoring).
- `FIXED` Reset the video player to avoid user confusion if the network is a bit laggy.
- `FIXED` Overlay resizing sometimes had strange behaviour.
- `ADDED` Allow to specify a specific _hostpoint_ (see documentation).
- `UPDATED` Third party libraries are updated to their latest versions.


### 1.0.0 (November 6, 2014)

- Initial release
