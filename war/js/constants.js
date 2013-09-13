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

 (function(wobs, $, undefined) {

  wobs.constants = {
    barcodes: {
      'Aztec': 'aztec',
      'Code 39': 'code39',
      'Code 128': 'code128',
      'Codabar': 'codabar',
      'Data Matrix': 'datamatrix',
      'EAN 8': 'ean8',
      'EAN 13': 'ean13',
      'ITF 14': 'itf14',
      'PDF 417': 'pdf417',
      'QR Code': 'qrCode',
      'UPC A': 'upcA'
    },
    redemptionChannels: {
      'Both': 'both',
      'Instore': 'instore',
      'Online': 'online',
      'Temporary Price Reduction': 'temporaryPriceReduction'
    },
    objStates: {
      'Active': 'active',
      'Completed': 'completed',
      'Deleted': 'deleted',
      'Expired': 'expired',
      'Inactive': 'inactive'
    },
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    expandedViewName: 'g_expanded',
    renderSpecs: {
      'family': 'templateFamily',
      'view': 'viewName',
      'list': 'g_list',
      'listSuffix': '_list',
      'expanded': 'g_expanded',
      'expandedSuffix': '_expanded'
    },
    kindPrefix: 'walletobjects#',
    offerClassKind: 'walletobjects#offerClass',
    loyaltyClassKind: 'walletobjects#loyaltyClass',
    genericClassKind: 'walletobjects#genericClass',
    objectClass: 'classReference',
    templates: {
      offer: ['1.offer1_expanded'],
      loyalty: ['1.loyaltyCard1_expanded', '1.loyaltyCard2_expanded'],
      generic: [
        '1.generic1_expanded',
        '1.generic2_expanded',
        '1.generic3_expanded'
      ]
    },
    // "normal" means normal inputs within the isotope item and not select menus
    // Each of these fields are tied to DOM elements with the same NAME field
    requiredFields: {
      loyalty: {
        normal: [
          'id',
          'issuerName',
          'programLogo.sourceUri.uri',
          'programName'
        ]
      },
      offer: {
        normal: ['id', 'issuerName', 'provider', 'title'],
        selectMenu: ['redemptionChannel']
      },
      generic: {
        normal: ['id', 'description', 'issuerName', 'title']
      },
      objects: {
        normal: ['id'],
        selectMenu: ['state'],
        other: ['origins'] // not really used, look at updateItem
      },
      messages: ['body']
      // also for classes: renderSpecs, reviewStatus, version- can't change
      // also for objects: classId, version- can't change
    }
  }

}(window.wobs = window.wobs || {}, jQuery));