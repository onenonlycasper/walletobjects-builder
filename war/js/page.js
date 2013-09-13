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
 * Contains methods for interacting with isotope elements.
 * Also contains methods to retrieve and use handlebar templates.
 */
(function(page, $, undefined) {
  var offerTemplate, loyaltyTemplate, loyalty2Template;
  var genericTemplate, generic2Template, generic3Template;
  page.itemList = [];
  // Used when viewing objects
  page.theClass;

  page.edit = function(index) {
    var id = '#item' + index;
    var readonly = !$(id + ' input, ' + id + ' textarea').attr('readonly');
    $(id + ' input:not(.noedit), ' + id + ' textarea')
      .attr('readonly', readonly);
    $(id + ' *.editonly').toggle();
    $(id + ' *.templateonly').toggle();
    $('#content').isotope('reLayout');
  };

  // Add empty class template for user to save
  page.addClass = function() {
    $('#noClasses').hide();

    var $newItem = $($('#addClass').html());

    var id = parseInt($('#content').children(':first')
      .children('.item').attr('id'), 10) + 1;
    if (isNaN(id)) {
      id = 0;
    }
    // Set correct ids to refer to page's item list
    $newItem.attr('id', 'item' + id);
    $newItem.children('.item').attr('id', id);

    $('#content').prepend($newItem)
      .isotope('reloadItems').isotope({
        sortBy: 'original-order'
      });

    ui.updateTemplateSelectMenus(id);

    // Load correct template HTML based on kind and render specs, then edit
    $newItem.find('.loadTemplate').bind('click', function(event) {
      var itemDiv = $(event.target).parents('.footer').siblings('.item');
      var key = $(itemDiv).attr('id');
      var specs = $(itemDiv).find('.template').val();
      var kind = $(itemDiv).find('.kind').val();

      var item = {};
      item.renderSpecs = [{}, {}];
      item.renderSpecs[0][wobs.constants.renderSpecs.family] =
        specs.concat(wobs.constants.renderSpecs.listSuffix);
      item.renderSpecs[0][wobs.constants.renderSpecs.view] = wobs.constants
        .renderSpecs.list;
      item.renderSpecs[1][wobs.constants.renderSpecs.family] =
        specs.concat(wobs.constants.renderSpecs.expandedSuffix);
      item.renderSpecs[1][wobs.constants.renderSpecs.view] = wobs.constants
        .renderSpecs.expanded;

      item.kind = wobs.constants.kindPrefix + kind + 'Class';
      item.version = '0';
      item.divId = key;

      $(event.target).parents('.isotope-item').html(page.getInnerHtml(item));
      page.itemList.push(item);

      $('#item' + key).find('input, textarea').attr('readonly', true);
      page.edit(key);
      ui.update($('#item' + key), page.itemList[key]);
    });
  };

  page.addObject = function() {
    // Add new isotope object that jwt may be generated for
    $('#noObjects').hide();
    page.theClass.needsjwt = true;
    page.theClass.issuerId = server.issuerId;
    var newObject = {
      classId: page.theClass.id,
      id: null,
      kind: page.theClass.kind.replace('Class', 'Object'),
      version: '0',
      divId: page.itemList.length
    };
    page.itemList.push(newObject);
    insertIsotopeItem(helpers.getExtended(page.theClass, newObject),
      page.itemList.length - 1 !== 0);
    page.edit(page.itemList.length - 1);
  };

  /**
   * Uses retrieved JSON to create an isotope item for each class.
   *
   * @param { array } json An array of JSON data.
   */
  page.createClasses = function(json) {
    $('#issuerIdDiv').hide();
    $('#tabs').css('visibility', 'visible');
    $('#ensure').hide();

    $.each(json, function(idx, val) {
      page.itemList.unshift(val);
      var key = json.length - 1 - idx;
      val.divId = key;
      insertIsotopeItem(val, false);
    });

    if (page.itemList.length === 0) {
      $('#noClasses').show();
    } else {
      $('#noClasses').hide();
    }
    ui.hideSpinner();
  };

  /**
   * Uses retrieved JSON to create an isotope item for each object.
   *
   * @param { array | object } json An array of JSON data if objects exist,
   *  or a single JSON object which represents the wallet class if no objects
   *  exist so that JWT may still be generated without a blank template.
   */
  page.createObjects = function(json) {
    // Add newly retrieved JSON items to our isotope container (list)
    if ($.isArray(json)) {
      page.theClass = json[0][wobs.constants.objectClass];
      $.each(json, function(idx, obj) {
        page.itemList.unshift(obj);
        var key = json.length - 1 - idx;
        obj.divId = key;
        insertIsotopeItem(helpers
          .getExtended(obj[wobs.constants.objectClass], obj), false);
      });
    } else {
      page.theClass = json;
    }

    // If no objects were retrieved set the class so we can create objects
    if (page.itemList.length === 0) {
      $('#noObjects').show();
    }
    ui.hideSpinner();
  };

  // Returns HTML for inside of an isotope item (template + footer)
  page.getInnerHtml = function(item) {
    if (item.messages != undefined) {
      // Sort messages closest expiration date then by insertion time
      var noInterval = item.messages.filter(function(message) {
        return message.displayInterval == undefined;
      });
      var interval = item.messages.filter(function(message) {
        return message.displayInterval != undefined;
      }).sort(function(a, b) {
        var datea = new Date(a.displayInterval.end.date);
        var dateb = new Date(b.displayInterval.end.date);
        return datea.getTime() < dateb.getTime();
      });
      noInterval.push.apply(noInterval, interval);
      item.messages = noInterval;
    }
    var divString = '<div class="item" id ="' + item.divId + '">';
    divString += getTemplateHtml(item);
    return divString;
  };

  /**
   * Acquires all external handlebars templates and registers partials.
   *
   * @param { JSON object } state The previous state such as class or objects,
   *  used to determine whether or not to load wallet classes or objects.
   */
  page.getAllTemplates = function(state) {
    function loadTemplate(name) {
      return $.get('templates/partials/' + name + '.html', function(data) {
        Handlebars.registerPartial(name, data);
      });
    }

    // Load in all templates
    $.when($.get('templates/offer1_expanded.html', function(data) {
        offerTemplate = Handlebars.compile(data);
      }), $.get('templates/loyaltyCard1_expanded.html', function(data) {
        loyaltyTemplate = Handlebars.compile(data);
      }), $.get('templates/loyaltyCard2_expanded.html', function(data) {
        loyalty2Template = Handlebars.compile(data);
      }), $.get('templates/generic1_expanded.html', function(data) {
        genericTemplate = Handlebars.compile(data);
      }), $.get('templates/generic2_expanded.html', function(data) {
        generic2Template = Handlebars.compile(data);
      }), $.get('templates/generic3_expanded.html', function(data) {
        generic3Template = Handlebars.compile(data);
      }), $.get('templates/issuerDataLinksModule.html',
        function(data) {
          page.linksTemplate = Handlebars.compile(data);
        }),
      // Load in all partial templates
      loadTemplate('barcode'),
      loadTemplate('loyaltyLinks'),
      loadTemplate('genericLinks'),
      loadTemplate('footer'),
      loadTemplate('homepage'),
      loadTemplate('messages'),
      loadTemplate('issuerDataTextModule'),
      loadTemplate('issuerDataInfoModule2x2'),
      loadTemplate('issuerDataImageModule'),
      loadTemplate('loyaltyHeader'),
      loadTemplate('loyaltyAccountLabels'),
      loadTemplate('issuerDataInfoModule2x4'),
      loadTemplate('issuerDataTitleModule'))
      .done(function() {
        // Determine whether to load wallet objects or classes
        if (state === null) {
          var kind = helpers.getQueryParam('kind');
          var id = helpers.getQueryParam('id');
          if (kind === null || id === null) {
            server.loadClasses();
          } else {
            server.loadObjects(false, kind, id);
          }
        } else if (state.from === 'class') {
          server.loadClasses();
        } else {
          server.loadObjects(false, state.kind, state.id);
        }
      });
  };

  function insertIsotopeItem(item, prepend) {
    // Insert template based on item to isotope
    var $newItem = $('<div id="item' + item.divId + '"">' +
      page.getInnerHtml(item) + '</div>');
    $newItem.find('input, textarea').attr('readonly', true);
    ui.update($newItem, item);

    if (prepend) {
      $('#content').prepend($newItem)
        .isotope('reloadItems').isotope({
          sortBy: 'original-order'
        });
    } else {
      $('#content').isotope('insert', $newItem);
    }
  }

  /**
   * Fills out an HTML template with item values.
   *
   * @param { JSON object } val The item whose values will be used to populate
   *  the template corresponding to the item's render specs.
   * @return { string } The filled out HTML.
   */

  function getTemplateHtml(val) {
    var renderSpecs = helpers.getRenderSpecs(val.renderSpecs);
    if (renderSpecs === wobs.constants.templates.offer[0]) {
      return offerTemplate(val);
    } else if (renderSpecs === wobs.constants.templates.loyalty[0]) {
      return loyaltyTemplate(val);
    } else if (renderSpecs === wobs.constants.templates.loyalty[1]) {
      return loyalty2Template(val);
    } else if (renderSpecs === wobs.constants.templates.generic[0]) {
      return genericTemplate(val);
    } else if (renderSpecs === wobs.constants.templates.generic[1]) {
      return generic2Template(val);
    } else if (renderSpecs === wobs.constants.templates.generic[2]) {
      return generic3Template(val);
    } else {
      return '';
    }
  };
}(window.page = window.page || {}, jQuery));