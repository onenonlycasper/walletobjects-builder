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
 * Contains methods for updating various UI elements
 */
(function(ui, $, undefined) {
  ui.loading = false;
  /**
   * Updates UI elements such as click functions on new items, as well as cursor
   * changes and link hovers.
   */
  ui.update = function($isotopeItem, item) {
    updateDelLink($isotopeItem);
    updateAddLink($isotopeItem);
    updateDelMsg($isotopeItem);
    updateAddMsg($isotopeItem);
    updateLinkHover($isotopeItem);
    ui.updateMenuButton($isotopeItem, item);
    ui.updateSpinner($isotopeItem);

    // Update class only ui elements or object only ui elements
    if (item.classId == undefined) {
      ui.updateToggleUsers($isotopeItem, item);
      if (item.kind.indexOf('offer') !== -1) {
        ui.updateSelectMenu($isotopeItem, item, 'redemptionChannel',
          wobs.constants.redemptionChannels);
      }
    } else {
      ui.updateSelectMenu($isotopeItem, item, 'state',
        wobs.constants.objStates);
      if (item.kind.indexOf('offer') !== -1) {
        ui.updateDatePicker($isotopeItem);
      }
      // Show barcode on certain render specs
      var specs = helpers.getRenderSpecs(page.theClass.renderSpecs);
      if (specs === wobs.constants.templates.offer[0] ||
        specs === wobs.constants.templates.loyalty[0] ||
        specs === wobs.constants.templates.generic[0]) {
        ui.updateSelectMenu($isotopeItem, item, 'barcode.type',
          wobs.constants.barcodes);
        // Render barcode only on renderspecs number 1
        if (item.barcode != undefined) {
          ui.renderBarcode($isotopeItem, item.barcode);
        }
      }
    }

    // Bind other click functions
    $isotopeItem.find('.jwtOverlay').bind('click', jwtOverlay);
    $isotopeItem.find('.save').bind('click', server.save);

    // Wait for images to be loaded before relayout on isotope to prevent
    // cutting off the container
    imagesLoaded($isotopeItem, function() {
      $('#content').isotope('reLayout');
    });
    $('#content').isotope('reLayout');
    ui.hideSpinner();
  };

  // Determines title bar style based on browser width
  ui.updateTitleBar = function() {
    var title = $('#title');
    var tabs = $('#tabs');
    var search = $('.search');
    title.removeClass();
    tabs.removeClass();
    if ($(window).width() < 1300) {
      title.addClass('title1');
      tabs.addClass('title1');
    } else {
      title.addClass('title2');
    }
    if ($(window).width() < 640) {
      search.css('width', '300');
    } else {
      search.css('width', '600');
    }
  };

  // Shows spinner on page if item is specified (for saving)
  ui.showSpinner = function($isotopeItem) {
    ui.loading = true;
    if ($isotopeItem != undefined) {
      $isotopeItem.find('div.spinner').fadeIn('fast');
    } else {
      $('div#spinner').fadeIn('fast');
    }
  };

  ui.hideSpinner = function() {
    ui.loading = false;
    $('div#spinner').fadeOut('fast');
    $('div.spinner').fadeOut('fast');
    $('#content').isotope('reLayout');
  };

  // Determine which tabs are shown based on if classes or objects loaded
  ui.setUpTabs = function(isClass) {
    if (isClass) {
      $('#createClass, #changeId').css('display', 'inline-block');
      $('#viewClasses, #createObject').css('display', 'none');
    } else {
      $('#createClass, #changeId').css('display', 'none');
      $('#viewClasses, #createObject').css('display', 'inline-block');
    }
  };

  ui.updateMapOverlay = function(idx) {
    // Updates map overlay for whichever item was clicked
    if (page.itemList[idx].locations == undefined) {
      page.itemList[idx].locations = [];
    }
    if (page.itemList[idx].version === '0') {
      if (page.theClass != undefined) {
        // Cannot 'save' a newly created object, must get jwt
        $('#saveLocations').unbind('click').bind('click', function() {
          alert('Please use get JWT instead.');
        });
      }
      $('#locationsHeader').html('Locations for new item');
    } else {
      $('#locationsHeader').html('Locations for ' +
        page.itemList[idx].id.substr(page.itemList[idx].id.indexOf('.') + 1));
    }
    if (!maps.updateMap(page.itemList[idx].locations)) {
      ui.updateSpinner($('#locations'));
    }
  }


  function updateDelMsg($isotopeItem) {
    // Click function for deleting messages
    $isotopeItem.find('.delMessage').unbind('click')
      .bind('click', function(elem) {
        var $message = $(elem.target).parents('li');
        var numMessages = $message.siblings('li').not('.ignore').length + 1;
        var classMessages = $message.siblings('li.ignore').length > 0;

        var id = $(elem.target).parents('.item').attr('id');
        var num = $(elem.target).attr('name');
        var item = page.itemList[id];
        // Delete message number "num" from item
        if (item.messages != undefined && item.messages[num] != undefined) {
          item.messages.splice(num, 1);
        }
        // Shift message indexes & input names down
        if (numMessages > 1) {
          for (var i = parseInt(num, 10); i < numMessages; i++) {
            $message.parents('.messages').find('[name^="messages.' + i + '"]')
              .each(function(idx, input) {
                $(input).attr('name', $(input).attr('name').replace(i, i - 1));
              });
            var button = $message.parents('.messages')
              .find('[name="' + i + '"]');
            $(button).attr('name', $(button).attr('name').replace(i, i - 1));
          }
        }
        // Show older messages if they exist
        if ($message.siblings('li:visible').length < 5) {
          $message.nextAll('li:hidden:first').show();
        }

        // Display no messages span or just remove message
        if (numMessages === 1) {
          if (!classMessages) {
            $message.parent().html('<span class="holder">No messages to display.<br />Click the plus button to add more.<h6></h6></span>');
          } else {
            $message.remove();
          }
          delete item.messages;
        } else {
          $message.remove();
        }

        $('#content').isotope('reLayout');
      });
  }

  function updateDelLink($isotopeItem) {
    // Click function for deleting links
    $isotopeItem.find('.delLink').unbind('click').bind('click', function(elem) {
      var id = $(elem.target).parents('.item').attr('id');

      function deleteLinksModule() {
        if (helpers.isValidPath('issuerData.g_expanded.linksModule', page.itemList[id])) {
          delete page.itemList[id].issuerData.g_expanded.linksModule;
        }
      }
      // Get current links module
      var linksModule;
      if (helpers.isValidPath('issuerData.g_expanded.linksModule', page.itemList[id])) {
        linksModule = page.itemList[id].issuerData.g_expanded.linksModule;
      } else {
        linksModule = undefined;
      }
      var $link = $(elem.target).parents('.uri');
      // Holder is used in genericLinks.html to find the correct place
      // for a new link since genericLinks only have issuer data links
      var numLinks = $link.siblings('.links').not('holder').length - 1;
      if (numLinks === 0) {
        $(elem.target).parents('.linksDiv').append('<span class="center holder">No links to display. <br /> Click the plus button to add more.<h6></h6></span>');
        deleteLinksModule();
      }

      // If no more object links, but still class links
      var numObjLinks = $link.siblings('.links').not('holder').not('.ignore').length - 1;
      // For loyalty, homepage uri will be included in numLinks
      if ((numLinks === 1 &&
          page.itemList[id].kind === wobs.constants.loyaltyClassKind) ||
        (page.theClass != undefined && numObjLinks === 0)) {
        deleteLinksModule();
      }

      // Delete link from item
      if (linksModule != undefined) {
        delete linksModule['uri' + $link.attr('name')];
      }
      // Shift links below up by one
      var nextLinks = $link.nextAll('.uri');
      nextLinks.each(function(idx, mLink) {
        var inputs = $(mLink).find('input');
        var curIdx = $(mLink).attr('name');
        var newIdx = (parseInt(curIdx, 10) - 1).toString();
        $(mLink).attr('name', newIdx);
        inputs.each(function(idx, i) {
          i.name = i.name.replace(curIdx, newIdx);
        });
        if (linksModule != undefined &&
          helpers.isValidPath('uri' + curIdx, linksModule)) {
          linksModule['uri' + newIdx] = linksModule['uri' + curIdx];
          delete linksModule['uri' + curIdx];
        }
      });

      // Remove h6 divider then link itself
      $link.next().remove();
      $link.remove();
      $('#content').isotope('reLayout');
    });
  }

  function updateAddMsg($isotopeItem) {
    // Click function for adding messages
    $isotopeItem.find('.addMessage').bind('click', function() {
      var $messages = $(this).siblings('.messages');
      var numMessages = $messages.children('li').not('.ignore').length;
      var classMessages = $messages.children('li.ignore').length > 0;
      if (numMessages === 0) {
        // Instantiate message list if it doesn't exist
        var id = $(this).parents('.item').attr('id');
        page.itemList[id].messages = [];
        if (!classMessages) {
          $(this).siblings('.messages').html('');
        }
      }
      // Add message html
      $messages.prepend('<li><div class="right"><img src="/stylesheets/image/Blank.png" /><button type="button" class="delMessage editonly change" name="0" title="Delete Message"></button></div><div class="left"><input class="editable h3 change" placeholder="Header" name="messages.0.header"><textarea class="editable body change" name="messages.0.body" placeholder="Type body..."></textarea></div><div class="clear"></div><div class="imgUri editonly"><label>Action Uri:</label><input class="editable change" name="messages.0.actionUri.uri" placeholder="Action URI" /><label>Image Source Uri:</label><input class="editable src change" name="messages.0.image.sourceUri.uri" placeholder="http://www.example.com/example.jpg" /></div></li>');
      // Replace 0s with correct message number
      $messages.find('.change').each(function(index, elem) {
        $(elem).attr('name', $(elem).attr('name')
          .replace('0', numMessages.toString()));
        $(elem).removeClass('change');
      });
      // Hide last visible message if there are now more than 5 messages
      if ($messages.children('li:visible').length > 5) {
        $messages.children('li:visible:last').hide();
      }
      updateDelMsg($isotopeItem);
      // Show editonly attributes of new message
      $isotopeItem.find('.editonly').show();
      $('#content').isotope('reLayout');
    });
  }

  function updateAddLink($isotopeItem) {
    // Click function for adding links
    $isotopeItem.find('.addLink').bind('click', function(event) {
      // Where to place the link
      var linksHeader = $(this).siblings('.links:last');
      var numIssuerLinks = $(this).siblings('.links').not('.ignore').length;
      var link = {
        'idx': numIssuerLinks
      };
      // Remove no links to display span if shown
      $(this).siblings('span').remove();
      // Add link to links module & update
      $(linksHeader).after(page.linksTemplate(link));

      updateDelLink($isotopeItem);
      updateLinkHover($isotopeItem);

      // Show delete link button
      $isotopeItem.find('.editonly').show();
      $('#content').isotope('reLayout');
    });
  }

  function updateLinkHover($isotopeItem) {
    // Binds mouseover for links to show uri
    $isotopeItem.find('.uri').bind('mouseenter', function() {
      $(this).children('.hUri').toggle(true);
      $('#content').isotope('reLayout');
    });
    $isotopeItem.find('.uri').bind('mouseleave', function() {
      if (!$(this).children('.hUri').children('input').is(':focus')) {
        $(this).children('.hUri').toggle(false);
        $('#content').isotope('reLayout');
      }
    });
    $isotopeItem.find('.uri').children('.hUri').children('input').blur(
      function() {
        $(this).parents('.hUri').toggle(false);
        $('#content').isotope('reLayout');
      });
    $isotopeItem.find('.uri').children('input').bind('focus', function() {
      $(this).siblings('.hUri').toggle(true);
      $('#content').isotope('reLayout');
    });
  }

  function jwtOverlay(event) {
    // Loads the overlay that appears when clicking "Get JWT" on an object.
    var idx = $(event.target).parents('.footer').siblings('.item').attr('id');
    $('#jwt .divId').val(idx);
    $('#jwtText').hide();
    $('#jwt').data('overlay').load();
  }

}(window.ui = window.ui || {}, jQuery));