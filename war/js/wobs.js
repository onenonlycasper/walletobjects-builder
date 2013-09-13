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
 * Uses history state to start loading all templates,
 * page.getAllTemplates decides whether or not to load classes or objects
 * with the history state.
 */
window.onpopstate = function(event) {
  if (event.state !== null) {
    page.getAllTemplates(event.state);
  }
  $('#noClasses').hide();
  $('#noObjects').hide();
};

/**
 * Because Firefox does not fire onpopstate on first page load,
 * we must designate the above function to run when there is a history state
 * and this function to run on first page load (no history state).
 */
window.onload = function() {
  page.getAllTemplates(null);
};

$(document).ready(function() {
  // Something required by the barcode library
  symdesc.pop();

  ui.updateMainSpinner();
  ui.showSpinner();

  // Fix titlebar on small windows
  ui.updateTitleBar();
  $(window).resize(ui.updateTitleBar);

  // Set up isotope
  $('#content').isotope({
    masonry: {
      columnWidth: 400
    }
  });

  // Bind button clicks
  $('#createObject').bind('click', function(e) {
    if (!ui.loading) {
      page.addObject(e);
    }
  });
  $('#createClass').bind('click', function(e) {
    if (!ui.loading) {
      page.addClass(e);
    }
  });
  $('#viewMyPlaces').bind('click', maps.updateMapBounds);
  $('#saveLocations').bind('click', server.saveLocations);
  $('#getJWT').bind('click', ui.jwtOverlay);
  $('#viewClasses, #loadClasses').bind('click', server.loadClasses);
  $('#postMessage').bind('click', server.postMessage);
  $('#genJwt').bind('click', server.getJwt);
  $('#searchbutton').bind('click', server.search);
  $('#origins').keydown(function(e) {
    if (e.keyCode === 13) {
      server.getJwt();
    }
  });
  $('#search').keydown(function(e) {
    if (e.keyCode === 13) {
      server.search($(e.target).val());
    }
  });
  $('#issuerId').keydown(function(e) {
    if (e.keyCode === 13) {
      server.loadClasses(e);
    }
  });

  // Overlays
  $('#changeId').overlay({
    mask: 'gray',
    onBeforeLoad: function() {
      $('#issuerIdDiv').addClass('isOverlay');
      $('#issuerIdDiv .close').show();
      $('#issuerIdDiv h1').show();
      $('#noId').hide();
      $('#issuerId').val(server.issuerId);
    },
    onClose: function() {
      $('#issuerIdDiv').removeClass();
      // Fix css change from overlay
      $('#issuerIdDiv').css('position', 'inherit');
      $('#issuerIdDiv h1').hide();
      $('#noId').show();
      // If load classes was not clicked issuer id reverts to previous value
      $('#issuerId').val(server.issuerId);
    }
  });

  $('#jwt').overlay({
    mask: 'gray',
    onClose: function() {
      $('#objectId').val('');
      $('#jwtText').hide();
      $('#walletButton').remove();
    }
  });

  $('#locations').overlay({
    mask: 'gray',
    // To enable removing items from places list without closing the overlay
    closeOnClick: false,
    onLoad: function() {
      $('#exposeMask').unbind('click').bind('click', function() {
        $('#locations').data('overlay').close();
      });
      // Only works when overlay is loaded
      maps.updateMapBounds();
    },
    onClose: function() {
      // If coming from new object locations
      $('#saveLocations').unbind('click').bind('click', server.saveLocations);
    }
  });

  $('#addMessage').overlay({
    mask: 'gray'
  });
  ui.updateDatePicker($('#addMessage'));

  $('#issuerId').val(server.issuerId);

  // Set up infinite scroll to retrieve moar JSON! (Use isotope append instead?)
  /*
   * $('#content').infinitescroll({ navSelector: 'a#next:last', nextSelector:
   * 'a#next:last', itemSelector: '#content div', dataType: 'json',
   * appendCallback: false, // USE FOR PREPENDING }, createItems);
   */
});