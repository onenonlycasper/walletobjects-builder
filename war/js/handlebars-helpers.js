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

// Returns the expanded render specs using the renderspecs object
Handlebars.registerHelper('getGexpanded', helpers.getRenderSpecs);

// Used to format date from RFC to MMMM dd yyyy
Handlebars.registerHelper('getFormattedDate', helpers.getFormattedDate);

// Used to determine which checkbox to check (true-yes, false-no)
Handlebars.registerHelper('getYesNo', function(val) {
  if (val) {
    return 'Yes';
  }
  return 'No';
});

// Uses the links module object and links template to create links html
Handlebars.registerHelper('getLinks', function(val, isClass) {
  var linkmodule = '';
  for (var key in val) {
    if (key.indexOf('uri') !== -1) {
      var link = {};
      link['description'] = val[key]['uri']['description'];
      link.uri = val[key]['uri']['uri'];
      link.idx = key.charAt(3); // uri index ie uri0 -> 0
      link.isClass = isClass;
      linkmodule += page.linksTemplate(link);
    }
  }
  return new Handlebars.SafeString(linkmodule);
});

// Makes messages past the 5th invisible
Handlebars.registerHelper('getInv', function(total, index) {
  if (total - index > 5) {
    return 'inv';
  }
});

// Same as Handlebars #each, but backwards, used to put latest messages first
// Lists overflow messages as invisible, unless they are class messages within
// and object (which can't be deleted from the object)
Handlebars.registerHelper('revEach', function(messages, isClass, options) {
  var ret = '';
  var numMessages = 0;
  for (var i = messages.length - 1, j = 0; i >= j; i--) {
    messages[i]['index'] = i.toString();
    messages[i]['total'] = messages.length.toString();
    ret = ret + options.fn(messages[i]);
    delete messages[i]['index'];
    delete messages[i]['total'];
    if (isClass && ++numMessages === 5) {
      return ret;
    }
  }
  return ret;
});

// If version is 0 (new class) then 'View Objects' is not shown
Handlebars.registerHelper('ifnot0', function(context, options) {
  if (context !== '0') {
    return options.fn(context);
  }
});

// Used to determine if value contains the conditional
Handlebars.registerHelper('ifContains', function(value, conditional, options) {
  if (value.indexOf(conditional) !== -1) {
    return options.fn(this);
  }
});

// Get id excluding issuer id in the front
Handlebars.registerHelper('getId', function(id) {
  return id.substring(id.indexOf('.') + 1);
});