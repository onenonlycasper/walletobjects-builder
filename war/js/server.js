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
 * Contains methods for interacting with the server to retrieve
 * wallet classes, objects, jwt, as well as saving wallet classes/objects.
 */
(function(server, $, undefined) {
  // This regex retrieves the value of issuerId from cookies
  server.issuerId = document.cookie
    .replace(/(?:(?:^|.*;\s*)issuerId\s*\=\s*([^;]*).*$)|^.*$/, '$1');
  server.kind = 'class';

  /**
   * Loads objects from the server belonging to a wallet class.
   *
   * @param { event } event Whether or not user clicked view objects,
   *    decides whether or not to use inputs or params
   * @param { string } kind The kind of wallet objects being loaded (offers..)
   * @param { string } id The id of the wallet class the objects belong to.
   */
  server.loadObjects = function(event, kind, id) {
    ui.showSpinner();
    $('#search').attr('placeholder', 'Search objects...');
    $('#search').val('');
    server.kind = 'object';

    if (event) {
      /**
       * Push a history state that signifies which class' objects
       * we are viewing so that after a refresh or page nav back the
       * correct objects will be loaded. The url bar will display
       * the class id and the kind of the objects shown. Also,
       * push a history state from class if there is not one already.
       * This is to fix too many from class states in history.
       */
      if (history.state === null) {
        history.pushState({
          from: 'class'
        }, null, '/');
        server.kind = 'class';
      }
      history.pushState({
        'from': 'object',
        'kind': kind.substring(kind.indexOf('#') + 1),
        'id': id,
        'issuerId': server.issuerId
      }, null, '?id=' + id + '&kind=' + kind.substring(kind.indexOf('#') + 1));
    }

    // Remove current items and reload wallet object items
    server.issuerId = id.substring(0, id.indexOf('.'));
    page.itemList = [];
    $('#content').isotope('remove', $('#content').data('isotope').$allAtoms,
      function() {
        // # seems to make things complicated
        $.getJSON('/objlist?id=' + id + '&kind=' +
          kind.substring(kind.indexOf('#') + 1),
          function(data) {
            ui.setUpTabs(false);
            if (data.error != undefined) {
              // Alert user an error occurred
              alert(data.error);
              ui.hideSpinner();
              return;
            }
            page.createObjects(data);
          });
      });
  };

  /**
   * Loads all classes from the server belonging to the specified issuer id.
   *
   * @param { event } event Whether or not user clicked view/load classes,
   */
  server.loadClasses = function(event) {
    ui.showSpinner();
    $('#noObjects').hide();
    $('#search').attr('placeholder', 'Search classes...');
    $('#search').val('');
    server.kind = 'class';

    if (event != undefined && (event.target.id === 'loadClasses' ||
      event.target.id === 'issuerId')) {
      // User clicked load classes --> issuer id has been changed
      $('#changeId').overlay().close();
      server.issuerId = $('#issuerId').val();
      document.cookie = 'issuerId=' + server.issuerId;
    } else if (event != undefined) {
      // User clicked view classes (from viewing objects)
      /** 
       * Push history state of class so that on refresh
       * or page nav back classes are loaded, happens on view classes only
       * to prevent too many states, another from class state is pushed
       * in load objects.
       */
      page.theClass = undefined;
      history.pushState({
        from: 'class'
      }, null, '/');
      $('#origins').val('');
    }

    // Only load classes if issuer id is defined
    var callback;
    if (server.issuerId != undefined && server.issuerId !== '') {
      callback = function() {
        // Load and create classes
        $.getJSON('/classlist?issuerId=' + server.issuerId, function(data) {
          ui.setUpTabs(true);
          if (data === null) {
            // Null data means we could not retrieve a client
            $('#ensure').show();
            $('#issuerIdDiv').show();
            $('#issuerIdDiv .close').hide();
            $('#tabs').css('visibility', 'hidden');
            ui.hideSpinner();
            return;
          } else if (data.error != undefined) {
            // Alert user that an error occurred
            alert(data.error);
            ui.hideSpinner();
            return;
          }
          page.createClasses(data);
        });
      }
    } else {
      callback = function() {
        // Prompt for issuer ID
        $('#issuerIdDiv').show();
        $('#tabs').css('visibility', 'hidden');
        $('#issuerIdDiv .close').hide();
        ui.hideSpinner();
      }
    }
    // Remove current items and reload wallet class items
    page.itemList = [];
    $('#content').isotope('remove', $('#content').data('isotope')
      .$allAtoms, callback);
  };

  // Creates a patch request if saving locations on existing class
  server.saveLocations = function(event) {
    ui.showSpinner($('#locations'));
    var idx = $('#locations .divId').val();
    // Replace all locations with locations from maps.markerList
    page.itemList[idx].locations = [];
    for (var i = 0; i < maps.markerList.length; i++) {
      page.itemList[idx].locations.push({
        latitude: maps.markerList[i].position.lat(),
        longitude: maps.markerList[i].position.lng()
      });
    }
    // Cannot patch a class that does not exist
    if (page.itemList[idx].version === '0') {
      server.save(false, idx);
    } else {
      // Create a patch item for the patch request
      var patchItem = {};
      patchItem.locations = page.itemList[idx].locations;
      patchItem.reviewStatus = 'underReview';
      patchItem.id = page.itemList[idx].id;
      patchItem.version = page.itemList[idx].version;
      $.post('/patch', {
        'json': JSON.stringify(patchItem),
        'kind': page.itemList[idx].kind,
        'issuerId': server.issuerId
      }, function(newJson) {
        if (newJson.error != undefined) {
          // Alert user that an error occurred
          alert(newJson.error);
          return;
        }
        // Update item and map
        page.itemList[idx] = newJson;
        maps.updateMap(page.itemList[idx].locations);
        reloadItem(newJson, idx, page.itemList[idx].kind);
        ui.hideSpinner();
      });
    }
  }

  // Updates object on the server
  server.save = function(event, divId) {
    var item, locations, $isotopeItem;
    if (event !== false) {
      $isotopeItem = $(event.target).parents('.isotope-item');
      ui.showSpinner($isotopeItem);
      divId = parseInt($isotopeItem.find('.item').attr('id'));
      item = page.itemList[divId];
    } else {
      // Saving for locations only when version is 0
      item = page.itemList[divId];
      $isotopeItem = $('#item' + divId);
      ui.showSpinner($('#locations'));
      locations = true;
    }

    if (!updateItem($isotopeItem, item)) {
      // Update failed, don't post to server
      ui.hideSpinner();
      return;
    }

    // Prevent not being able to edit item due to auto-approval
    item.reviewStatus = 'underReview';
    delete item.divId;
    var kind = $isotopeItem.find('.kind').val();

    // Save the object by posting information to server
    $.post('/save', {
      'json': JSON.stringify(item),
      'kind': kind,
      'issuerId': server.issuerId
    }, function(newJson) {
      if (newJson.error != undefined) {
        // Alert user that an error occurred
        alert(newJson.error);
        ui.hideSpinner();
        return;
      }
      reloadItem(newJson, divId, kind);
      // Only if an item was just created with locations
      if (locations) {
        maps.updateMap(page.itemList[divId].locations);
      }
    });
  };

  // Uses values from add message overlay to post a message to the server
  server.postMessage = function() {
    var required = wobs.constants.requiredFields.messages;
    var missing = [];

    function getMsgValue(name) {
      return $('#addMessage [name="' + name + '"]').val();
    }

    for (var i = 0; i < required.length; i++) {
      if (getMsgValue(required[i]) === '') {
        missing.push(required[i]);
      }
    }
    if (missing.length > 0) {
      alert('Missing ' + missing.join(', ') + '.');
      ui.hideSpinner();
      return;
    }

    var idx = $('#addMessage .divId').val();
    $('#addMessage').data('overlay').close();
    ui.showSpinner($('#item' + idx));

    $.post('/addmessage', {
      'id': page.itemList[idx].id,
      'issuerId': server.issuerId,
      'kind': page.itemList[idx].kind,
      'header': getMsgValue('header'),
      'body': getMsgValue('body'),
      'displayIntervalStart': RFC3339(
        getMsgValue('displayInterval.start.date')),
      'displayIntervalEnd': RFC3339(
        getMsgValue('displayInterval.end.date')),
      'actionUri': getMsgValue('actionUri.uri'),
      'actionUriDescription': getMsgValue('actionUri.description'),
      'imageUri': getMsgValue('image.sourceUri.uri'),
      'imageUriDescription': getMsgValue('image.sourceUri.description')
    }, function(newJson) {
      if (newJson.error != undefined) {
        // Alert user that an error occurred
        alert(newJson.error);
        ui.hideSpinner();
        return;
      }
      reloadItem(newJson, idx, page.itemList[idx].kind);
      $('#addMessage :input').val('');
    });
  };

  // Uses class or object id to query server for specific item
  server.search = function() {
    ui.showSpinner();
    var query = $('#search').val();

    if (query === '') {
      // Blank query will basically reload the page items
      if (server.kind === 'class') {
        server.loadClasses();
      } else {
        var kind = helpers.getQueryParam('kind');
        var id = helpers.getQueryParam('id');
        server.loadObjects(false, kind, id);
      }
    } else {
      // Otherwise query is sent to the server
      $.getJSON('/search?issuerId=' + server.issuerId +
        '&query=' + query + '&kind=' + server.kind,
        function(newJsonArray) {
          // newJson is defined if server could find the query
          if (newJsonArray != undefined && newJsonArray !== '') {
            var callback;
            page.itemList = [];
            // Determine whether to create classes or objects based on kind
            if (server.kind === 'class') {
              callback = function() {
                page.createClasses(newJsonArray);
              }
            } else {
              callback = function() {
                page.createObjects(newJsonArray);
              }
            }
            // Remove all items and replace with query results
            $('#content').isotope('remove', $('#content').data('isotope')
              .$allAtoms, callback);
          } else {
            // Don't remove any items if no results were found
            ui.hideSpinner();
            alert('Could not find class or object with id ' + query);
          }
        });
    }
  };

  // JWT for object that was created using "Create an Object" (page.addObject)
  server.getJwt = function() {
    var id = $('#jwt .divId').val();
    var $isotopeItem = $('div#item' + id);

    // Update failed
    if (!updateItem($isotopeItem, page.itemList[id])) {
      return;
    }

    // Send object to server to get jwt
    delete page.itemList[id].divId;
    $.post('/jwt', {
      'json': JSON.stringify(page.itemList[id]),
      'origins': $('#origins').val(),
      'issuerId': server.issuerId,
      'kind': page.itemList[id].kind
    }, function(jwtArray) {
      var array = jwtArray.slice(1, -1).split(',');
      // Display jwt to user, first jwt is from origins, second is from url
      $('#jwtText').val(array[0]);
      $('#jwtText').show();
      // Show a wallet button with origins the current url
      $('#walletButton').remove();
      $('#jwtText').after('<span id="walletButton">' + array[1] + '</span>');
    });
  };

  function reloadItem(newJson, divId, kind) {
    // Reload item with updated values from server
    newJson.divId = divId;
    page.itemList[divId] = newJson;
    var $isotopeItem = $('#item' + divId);
    if (kind.indexOf('Class') !== -1) {
      $isotopeItem.html(page.getInnerHtml(newJson));
    } else {
      // Extend object on top of class before displaying
      var extended = helpers
        .getExtended(newJson[wobs.constants.objectClass], newJson);
      $isotopeItem.html(page.getInnerHtml(extended));
      // Update barcode if needed
      if (helpers.getRenderSpecs(extended.renderSpecs).indexOf('1') !== -1 &&
        extended.barcode !== undefined) {
        ui.renderBarcode(extended.barcode.type, extended.barcode.value,
          extended.id);
      }
    }
    // Save ends the editing session of the item
    $isotopeItem.find('input, textarea').attr('readonly', true);
    // Update ui elements in saved item
    ui.update($isotopeItem, newJson);
  }

  /**
   * Uses form inputs to update the specified item.
   *
   * @param { div } element The isotope item element in which save was clicked.
   * @param { object } item The specific item we are updating.
   * @return { boolean } Whether or not the item could be successfully updated.
   */

  function updateItem($isotopeItem, item) {
    var nobarcode = false;
    var missing = [];
    var required = [];
    // Catch invalid inputs that are not standard inputs in the item
    // Like kennedy select menus fields that are set on change by
    // an event listener
    if (item.classId != undefined) {
      required = wobs.constants.requiredFields.objects.selectMenu;
    } else if (item.kind === wobs.constants.offerClassKind) {
      required = wobs.constants.requiredFields.offer.selectMenu;
    }
    for (var i = 0; i < required.length; i++) {
      if (item[required[i]] == undefined) {
        missing.push(required[i]);
      }
    }
    // Origins input in JWT overlay
    if (item.version === '0' && $('#origins').val() === '' &&
      item.classId != undefined) {
      missing.push('origins');
    }
    $isotopeItem.find(':input, .input').each(function(idx, elem) {
      if (elem.name == undefined) {
        // Handle updating Kennedy radio button
        if ($(elem).attr('name') === 'allowMultipleUsersPerObject') {
          item.allowMultipleUsersPerObject = $(elem)
            .find('.jfk-slideToggle-checked').length > 0;
        }
        return;
      }
      // Ignore buttons, elements without names, 
      // and barcode if there was no barcode value
      if (elem.nodeName === 'BUTTON' || elem.name === '' ||
        (nobarcode && elem.name.indexOf('barcode') !== -1)) {
        return;
      } else if (elem.value === '') {
        // Catch normal invalid inputs
        if (item.kind === wobs.constants.loyaltyClassKind) {
          required = wobs.constants.requiredFields.loyalty.normal;
        } else if (item.kind === wobs.constants.offerClassKind) {
          required = wobs.constants.requiredFields.offer.normal;
        } else if (item.kind === wobs.constants.genericClassKind) {
          required = wobs.constants.requiredFields.generic.normal;
        } else {
          required = wobs.constants.requiredFields.objects.normal;
        }
        for (var i = 0; i < required.length; i++) {
          if (elem.name === required[i]) {
            missing.push(elem.name);
          }
        }
      }
      if (elem.name === 'validTimeInterval.end.date') {
        // Create valid date in item
        var timestamp = Date.parse(elem.value);
        if (!isNaN(timestamp)) {
          item.validTimeInterval = {};
          item.validTimeInterval.end = {};
          item.validTimeInterval.end.date = RFC3339(timestamp);
        } else if (elem.value === '') {
          delete item.validTimeInterval;
        }
      } else if (elem.name === 'barcode.value' && elem.value === '') {
        // Barcodes are required to have a value, if not the barcode is deleted
        delete item.barcode;
        nobarcode = true;
      } else if (elem.name.indexOf('uri') !== -1 &&
        elem.defaultValue !== elem.value) {
        if (elem.value === '') {
          if (elem.name.indexOf('sourceUri') !== -1) {
            // Element is an image, delete whole image, not just sourceuri value
            var stop;
            if (elem.name.indexOf('imageModule') !== -1) {
              stop = 4;
            } else if (elem.name.indexOf('titleModule') !== -1) {
              stop = 3;
            } else {
              stop = 2;
            }
            helpers.traverse(elem, item, stop);
          } else if (elem.name.indexOf('linksModule') !== -1) {
            // Delete entire uri object "uriX.uri.uri"
            helpers.traverse(elem, item, 2);
          } else {
            // Delete uri object, ex: homepageUri (not just its uri)
            helpers.traverse(elem, item, 1);
          }
        } else {
          // Just change the uri
          helpers.traverse(elem, item, 0);
        }
      } else if (elem.defaultValue !== elem.value) {
        // Change item at index (input name)
        helpers.traverse(elem, item, 0);
      }
    });
    // Check required message fields
    if (item.messages != undefined) {
      required = wobs.constants.requiredFields.messages;
      for (var r = 0; r < required.length; r++) {
        for (var m = 0; m < item.messages.length; m++) {
          if (!helpers.isValidPath(required[r], item.messages[m]) ||
            item.messages[m][required[r]] === '') {
            missing.push('message ' + required[r]);
          }
        }
      }
    }
    // Update fails and user notified if anything required is missing
    if (missing.length > 0) {
      alert('Missing ' + missing.join(', ') + '.');
      return false;
    }
    if (item.id.indexOf(server.issuerId) === -1) {
      // No issuer id means a class or object was just created
      // and the issuer id must be prepended
      item.id = server.issuerId + '.' + item.id;
    }
    return true;
  }

  function RFC3339(d) {
    // Correctly formatted date for time interval
    d = new Date(d);
    if (isNaN(d)) {
      return '';
    }

    function addZero(v) {
      return v < 10 ? '0' + v : v;
    }
    var year = d.getUTCFullYear();
    var month = addZero(d.getUTCMonth() + 1);
    var date = addZero(d.getUTCDate());
    var hours = addZero(d.getUTCHours());
    var minutes = addZero(d.getUTCMinutes());
    var seconds = addZero(d.getUTCSeconds());
    return year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':' +
      seconds + 'Z';
  }
}(window.server = window.server || {}, jQuery));