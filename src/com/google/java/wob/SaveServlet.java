/*
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package com.google.java.wob;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.json.GenericJson;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.walletobjects.Walletobjects;
import com.google.api.services.walletobjects.model.GenericClass;
import com.google.api.services.walletobjects.model.GenericObject;
import com.google.api.services.walletobjects.model.LoyaltyClass;
import com.google.api.services.walletobjects.model.LoyaltyObject;
import com.google.api.services.walletobjects.model.OfferClass;
import com.google.api.services.walletobjects.model.OfferObject;
import com.google.common.base.Strings;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Updates a wallet class or object using new JSON.
 */
public class SaveServlet extends HttpServlet {
  private static final Logger log = Logger.getLogger(SaveServlet.class.getName());

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    resp.setContentType("application/json; charset=utf-8");

    Walletobjects client = ClientMethods.getClientForId(req.getParameter("issuerId"));
    if (client == null) {
      log.warning("Unable to get client for issuer id " + req.getParameter("issuerId"));
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    String kind = req.getParameter("kind");
    String json = req.getParameter("json");
    if (Strings.isNullOrEmpty(kind) || Strings.isNullOrEmpty(json)) {
      log.warning("Unable to update or insert without both kind and json.");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    // Insert if the version was 0, update otherwise
    GenericJson updated = null;
    JsonFactory jsonFactory = new GsonFactory();
    try {
      if (kind.contains("offerClass")) {
        OfferClass offerClass = jsonFactory.fromString(json, OfferClass.class);
        offerClass.setVersion(offerClass.getVersion() + 1);
        if (offerClass.getVersion() == 1) {
          client.offerclass().insert(offerClass).execute();
          log.info("Offer class was inserted");
        } else {
          client.offerclass().update(offerClass.getId(), offerClass).execute();
          log.info("Offer class was updated");
        }
        updated = client.offerclass().get(offerClass.getId()).execute();

      } else if (kind.contains("loyaltyClass")) {
        LoyaltyClass loyaltyClass = jsonFactory.fromString(json, LoyaltyClass.class);
        loyaltyClass.setVersion(loyaltyClass.getVersion() + 1);
        if (loyaltyClass.getVersion() == 1) {
          client.loyaltyclass().insert(loyaltyClass).execute();
          log.info("Loyalty class was inserted.");
        } else {
          client.loyaltyclass().update(loyaltyClass.getId(), loyaltyClass).execute();
          log.info("Loyalty class was updated.");
        }
        updated = client.loyaltyclass().get(loyaltyClass.getId()).execute();

      } else if (kind.contains("genericClass")) {
        GenericClass genericClass = jsonFactory.fromString(json, GenericClass.class);
        genericClass.setVersion(genericClass.getVersion() + 1);
        if (genericClass.getVersion() == 1) {
          client.genericclass().insert(genericClass).execute();
          log.info("Generic class was inserted.");
        } else {
          client.genericclass().update(genericClass.getId(), genericClass).execute();
          log.info("Generic class was updated.");
        }
        updated = client.genericclass().get(genericClass.getId()).execute();

      } else if (kind.contains("offerObject")) {
        OfferObject offerObject = jsonFactory.fromString(json, OfferObject.class);
        offerObject.setVersion(offerObject.getVersion() + 1);
        client.offerobject().update(offerObject.getId(), offerObject).execute();
        updated = client.offerobject().get(offerObject.getId()).execute();
        log.info("Offer object was patched.");

      } else if (kind.contains("loyaltyObject")) {
        LoyaltyObject loyaltyObject = jsonFactory.fromString(json, LoyaltyObject.class);
        loyaltyObject.setVersion(loyaltyObject.getVersion() + 1);
        client.loyaltyobject().update(loyaltyObject.getId(), loyaltyObject).execute();
        updated = client.loyaltyobject().get(loyaltyObject.getId()).execute();
        log.info("Loyalty object was patched.");

      } else if (kind.contains("genericObject")) {
        GenericObject genericObject = jsonFactory.fromString(json, GenericObject.class);
        genericObject.setVersion(genericObject.getVersion() + 1);
        client.genericobject().update(genericObject.getId(), genericObject).execute();
        updated = client.genericobject().get(genericObject.getId()).execute();
        log.info("Generic object was patched.");

      } else {
        log.warning("Unable to update or insert with invalid kind " + kind + ".");
        resp.getWriter().write(ClientMethods.createError(null));
        return;
      }
    } catch (GoogleJsonResponseException e) {
      log.warning("Insert or update failed: " + e.getMessage());
      resp.getWriter()
          .write(ClientMethods.createError("Something went wrong, please refresh and try again"));
      return;
    } catch (IllegalArgumentException e) {
      log.warning("Invalid json: " + e.getMessage());
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    if (Strings.isNullOrEmpty(updated.toString())) {
      log.warning("Unable to verify update due to unknown error");
      resp.getWriter().write(ClientMethods.createError("Unable to verify save, please refresh."));
      return;
    }

    // Return the JSON of the updated object
    resp.getWriter().write(updated.toString());
  }
}
