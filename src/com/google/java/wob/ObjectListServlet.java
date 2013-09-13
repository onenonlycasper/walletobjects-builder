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
import com.google.api.services.walletobjects.model.GenericObjectListResponse;
import com.google.api.services.walletobjects.model.LoyaltyObjectListResponse;
import com.google.api.services.walletobjects.model.OfferObjectListResponse;
import com.google.common.base.Strings;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Uses a wallet class id in order to retrieve objects of that class.
 */
public class ObjectListServlet extends HttpServlet {
  private static final Logger log = Logger.getLogger(ObjectListServlet.class.getName());

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    resp.setContentType("application/json; charset=utf-8");

    // Add all objects of kind "kind" and with class id "id"
    String kind = req.getParameter("kind");
    String id = req.getParameter("id");
    if (Strings.isNullOrEmpty(kind) || Strings.isNullOrEmpty(id)) {
      log.warning("Unable to retrieve objects without both kind and id");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    String issuerId;
    try {
      issuerId = id.substring(0, id.indexOf("."));
    } catch (StringIndexOutOfBoundsException e) {
      log.warning("Invalid issuer id");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    Walletobjects client = ClientMethods.getClientForId(issuerId);
    if (client == null) {
      log.warning("Unable to get client for issuer id " + issuerId + ".");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    List<GenericJson> objList = new ArrayList<GenericJson>();
    GenericJson theClass = null;
    try {
      if (kind.contains("offer")) {
        // Attempt to list objects
        OfferObjectListResponse offerList = client.offerobject().list(id).execute();
        // If no objects exist, retrieve the class
        if (offerList.getResources() != null) {
          objList.addAll(offerList.getResources());
        } else {
          theClass = client.offerclass().get(id).execute();
        }
      } else if (kind.contains("loyalty")) {
        // Attempt to list objects
        LoyaltyObjectListResponse loyaltyList = client.loyaltyobject().list(id).execute();
        // If no objects exist, retrieve the class
        if (loyaltyList.getResources() != null) {
          objList.addAll(loyaltyList.getResources());
        } else {
          theClass = client.loyaltyclass().get(id).execute();
        }
      } else if (kind.contains("generic")) {
        // Attempt to list objects
        GenericObjectListResponse genericList = client.genericobject().list(id).execute();
        // If no objects exist, retrieve the class
        if (genericList.getResources() != null) {
          objList.addAll(genericList.getResources());
        } else {
          theClass = client.genericclass().get(id).execute();
        }
      } else {
        log.warning("Unable to retrieve objects with invalid kind " + kind + ".");
        resp.getWriter().write(ClientMethods.createError(null));
        return;
      }
    } catch (GoogleJsonResponseException e) {
      log.warning("Object list failed: " + e.getMessage());
      resp.getWriter()
          .write(ClientMethods.createError("Something went wrong, please refresh and try again"));
      return;
    }

    JsonFactory jsonFactory = new GsonFactory();
    if (objList.size() > 0) {
      // Write the object's JSON as a list for client side
      // gson.toJson cannot be used due to differences in how the JSON is created
      JsonArray array = new JsonArray();
      JsonParser parser = new JsonParser();
      for (int i = 0; i < objList.size(); i++) {
        GenericJson theObj = objList.get(i);
        theObj.setFactory(jsonFactory);
        array.add(parser.parse(theObj.toString()));
      }
      resp.getWriter().write(array.toString());
    } else {
      // Write the class if there are no objects present so that the user
      // may still create an object and have a class to build on top of
      theClass.setFactory(jsonFactory);
      resp.getWriter().write(theClass.toString());
    }
  }
}
