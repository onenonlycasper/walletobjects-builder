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
import com.google.api.services.walletobjects.model.GenericClassListResponse;
import com.google.api.services.walletobjects.model.LoyaltyClassListResponse;
import com.google.api.services.walletobjects.model.OfferClassListResponse;
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
 * Uses the client's issuer id in order to retrieve their wallet classes.
 */
public class ClassListServlet extends HttpServlet {
  private static final Logger log = Logger.getLogger(ClassListServlet.class.getName());

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    resp.setContentType("application/json; charset=utf-8");

    // Get issuer ID from client
    String issuerId = req.getParameter("issuerId");
    if (Strings.isNullOrEmpty(issuerId)) {
      log.warning("No issuer id");
      return;
    }

    Long id;
    try {
      id = Long.valueOf(issuerId);
    } catch (NumberFormatException e) {
      log.warning("Unable to parse issuer ID: " + e.getMessage());
      return;
    }

    Walletobjects client = ClientMethods.getClientForId(issuerId);
    if (client == null) {
      log.warning("Unable to get client for issuer id " + issuerId + ".");
      return;
    }

    // Add all classes to class list
    OfferClassListResponse offerClassList;
    LoyaltyClassListResponse loyaltyClassList;
    GenericClassListResponse genericClassList;
    try {
      offerClassList = client.offerclass().list(id).execute();
      loyaltyClassList = client.loyaltyclass().list(id).execute();
      genericClassList = client.genericclass().list(id).execute();
    } catch (GoogleJsonResponseException e) {
      log.warning("Class list failed " + e.getMessage());
      resp.getWriter()
          .write(ClientMethods.createError("Something went wrong, please refresh and try again"));
      return;
    }

    List<GenericJson> classList = new ArrayList<GenericJson>();
    if (offerClassList.getResources() != null) {
      classList.addAll(offerClassList.getResources());
    }
    if (loyaltyClassList.getResources() != null) {
      classList.addAll(loyaltyClassList.getResources());
    }
    if (genericClassList.getResources() != null) {
      classList.addAll(genericClassList.getResources());
    }

    // Write the class' JSON as a list for client side
    // gson.toJson cannot be used due to differences in how the JSON is created
    JsonFactory jsonFactory = new GsonFactory();
    JsonArray array = new JsonArray();
    JsonParser parser = new JsonParser();
    for (int i = 0; i < classList.size(); i++) {
      GenericJson theClass = classList.get(i);
      theClass.setFactory(jsonFactory);
      array.add(parser.parse(theClass.toString()));
    }
    resp.getWriter().write(array.toString());
  }
}
