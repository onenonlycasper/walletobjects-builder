/*
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Contains methods for interacting with the locations map overlay
 */
(function(maps, $, undefined) {
  var map, placesList = [];
  maps.markerList = [];

  // Creates the map if not created already and 
  // then updates map with new location list
  maps.updateMap = function(locations) {
    var created = false;
    if (map == undefined) {
      createMap(locations);
      created = true;
    }
    // Delete all markers and recreate with new location list
    for (var i = 0; i < maps.markerList.length; i++) {
      maps.markerList[i].setMap(null);
    }
    createMarkers(locations);
    return !created;
  }

  // Uses markers in marker list to reset markers and set map bounds
  maps.updateMapBounds = function() {
    clearPlacesList();
    $('#locationList').html('');
    if (maps.markerList.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < maps.markerList.length; i++) {
        maps.markerList[i].setMap(map);
        bounds.extend(maps.markerList[i].position);
        // Decide text for places list div overlay
        var text = maps.markerList[i].getTitle();
        $('#locationList').append('<div><li title="View Location">' + text +
          '</li><img src="/stylesheets/image/delete.png" class="delLocation" title="Delete Location" /></div>');
        updateDeletePlaces();
      }
      map.fitBounds(bounds);
      map.panBy(230 / 2, 0);
      map.setZoom(map.getZoom() - 1);
    }
  };

  function createMap(locations) {
    map = new google.maps.Map($('#map-canvas')[0], {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      center: new google.maps.LatLng(37.7833, -122.4167),
      zoom: 10
    });
    var searchBox = new google.maps.places.SearchBox($('#placesSearch')[0]);

    // Place searching
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      clearPlacesList();

      function approxEqual(a, b) {
        // 0.0000001 is approximately 1.112 cm
        return Math.abs(a - b) <= 0.0000001;
      }

      var bounds = new google.maps.LatLngBounds();
      for (var i = 0, place; place = places[i]; i++) {
        // Prevent another search from showing a duplicate marker
        var duplicate = maps.markerList.filter(function(m) {
          return approxEqual(m.getPosition().lat(),
            place.geometry.location.lat()) &&
            approxEqual(m.getPosition().lng(), place.geometry.location.lng());
        }).length > 0;
        if (!duplicate) {
          var image = {
            url: '../stylesheets/image/unadded_marker.png',
            size: new google.maps.Size(26, 44),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(13, 44)
          };

          var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location
          });

          // Clicking a place adds it to marker list and visible places list
          // if it hasn't been added already
          google.maps.event.addListener(marker, 'click', function(event) {
            $('#locationList').append('<div><li title="View Location">' +
              this.getTitle() +
              '</li><img src="/stylesheets/image/delete.png" class="delLocation" title="Delete Location" /></div>');
            updateDeletePlaces();
            maps.markerList.push(new google.maps.Marker({
              title: this.getTitle(),
              position: this.getPosition(),
              map: map
            }));
            this.setMap(null);
          });

          placesList.push(marker);
          bounds.extend(place.geometry.location);
        }
      }
      map.fitBounds(bounds);
    });

    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    });
  }

  function createMarkers(locations) {
    // Creates markers for each location and adds them to marker list,
    maps.markerList = [];
    if (locations != undefined) {
      for (var i = 0; i < locations.length; i++) {
        var lat = locations[i].latitude;
        var lng = locations[i].longitude;
        maps.markerList.push(new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: map,
          title: lat + ', ' + lng
        }));
      }
    }
  }

  function updateDeletePlaces() {
    // Click function for deleting deletes marker on the map,
    // the list item which was clicked, and the marker in marker list
    $('#locationList div:last').hover(function() {
      // Mouseenter
      $(this).find('img').show();
    }, function() {
      // Mouseleave
      $(this).find('img').hide();
    });
    // Clicking trash can
    $('#locationList div:last img').bind('click', function(e) {
      var idx = $('#locationList div').index($(this).parent());
      maps.markerList[idx].setMap(null);
      maps.markerList.splice(idx, 1);
      $(this).parent().remove();
    });
    // Clicking on a place centers the map on that place
    $('#locationList li:last').bind('click', function(e) {
      if (!$(this).siblings('img').is(':hover')) {
        var idx = $('#locationList li').index(e.target);
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(maps.markerList[idx].position);
        map.fitBounds(bounds);
        map.panBy(230 / 2, 0);
        map.setZoom(map.getZoom() - 1);
      }
    });
  }

  function clearPlacesList() {
    // Resets places list when searching for places
    for (var i = 0; i < placesList.length; i++) {
      placesList[i].setMap(null);
    }
    placesList = [];
  }

}(window.maps = window.maps || {}, jQuery));
