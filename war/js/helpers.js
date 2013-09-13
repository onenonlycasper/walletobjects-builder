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
 * Contains helper methods used by ui, page, and server.
 */
(function(helpers, $, undefined) {

  /**
   * @return { string } The g_expanded render specs string.
   */
  helpers.getRenderSpecs = function(renderSpecs) {
    for (var i = 0; i < renderSpecs.length; i++) {
      if (renderSpecs[i].viewName === wobs.constants.expandedViewName) {
        return renderSpecs[i].templateFamily;
      }
    }
    return 'No render specs.';
  };

  /**
   * Determine if the path exists in the item to prevent undefined errors.
   *
   * @param { string } path The path to take, ex: my.custom.path
   * @param { object } item The item in which to try this path - item.my.etc
   * @return { boolean } Whether or not the entire path exists
   */
  helpers.isValidPath = function(path, item) {
    var index = path.split('.');
    var valid = true;
    if (item == undefined) {
      return false;
    }
    $.each(index, function(k, v) {
      if (item[v] == undefined) {
        valid = false;
        return false;
      }
      if (k === index.length - 1) {
        return false;
      } else {
        item = item[v]; // Traverse down further
      }
    });
    return valid;
  };

  /**
   * Merges wallet object into wallet class recursively.
   *
   * @param { object } fullClass The wallet class the object belongs to.
   * @param { object } object The wallet object that extends upon its class.
   * @return { object } The extended object (wallet object onto wallet class).
   */
  helpers.getExtended = function(fullClass, object) {
    // Prevent overwriting original class on jQuery extend
    var extended = {};
    $.extend(true, extended, fullClass);

    // Save class messages/links and object messages/links seperately
    var classMsgs, objMsgs;
    var classLinks, objLinks;
    if (extended.messages != undefined) {
      classMsgs = JSON.parse(JSON.stringify(extended.messages));
      objMsgs = object.messages;
    }
    if (helpers.isValidPath('issuerData.g_expanded.linksModule', extended)) {
      classLinks = JSON.parse(JSON.stringify(extended.issuerData.g_expanded.linksModule));
      if (helpers.isValidPath('issuerData.g_expanded.linksModule', object)) {
        objLinks = object.issuerData.g_expanded.linksModule;
      }
    }
    $.extend(true, extended, object);
    // Re-assign messages & links (both class and obj ones are wanted)
    if (classMsgs != undefined) {
      extended.classMessages = classMsgs;
      extended.messages = objMsgs;
    }
    if (classLinks != undefined) {
      extended.classLinks = classLinks;
      extended.issuerData.g_expanded.linksModule = objLinks;
    }
    return extended;
  };

  /**
   * Traverse down a path in order to change the item.
   *
   * @param { input } elem The input that specifies where and what to change.
   *  its name contains the path and its value the new value.
   * @param { object } item The item we are changing.
   * @param { integer } stop When to stop the traversal, 0 for default changes,
   *  and a higher number if we are deleting a URI because simply deleting
   *  the URI object's uri string is not allowed.
   */
  helpers.traverse = function(elem, item, stop) {
    var path = elem.name.split('.');
    var done = false;
    $.each(path, function(k, v) {
      if (done)
        return;
      if (item[v] == undefined) {
        item[v] = {}; // Create the index
      }
      /** 
       * Off by one so that stop signifies how many levels above
       * the field you are editing you need to stop at
       * E.g. this.is.a.path, stop = 2 signifies to edit "is" and not "path"
       */
      if (k === path.length - 1 - stop) {
        if (elem.value === '') {
          delete item[v];
        } else {
          item[v] = elem.value;
        }
        done = true;
      } else {
        item = item[v]; // Traverse down further
      }
    });
  };

  helpers.getFormattedDate = function(validTimeInterval) {
    var date = new Date(validTimeInterval);
    var month = wobs.constants.months[date.getMonth()];
    var day = date.getDate().toString();
    if (day.length === 1) {
      day = '0' + day;
    }
    var year = date.getFullYear().toString();
    return month + ' ' + day + ' ' + year;
  };

  // Returns query parameter from url bar
  helpers.getQueryParam = function(name) {
    return decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
        .exec(location.search) || [, ''])[1]
      .replace(/\+/g, '%20')) || null;
  };

}(window.helpers = window.helpers || {}, jQuery));