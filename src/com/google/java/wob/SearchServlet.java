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
import com.google.common.base.Strings;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Searches for class or object with specified id.
 */
public class SearchServlet extends HttpServlet {
  private static final Logger log = Logger.getLogger(SearchServlet.class.getName());

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    resp.setContentType("application/json; charset=utf-8");

    String issuerId = req.getParameter("issuerId");
    Walletobjects client = ClientMethods.getClientForId(issuerId);
    if (client == null) {
      log.warning("Unable to get client for issuer id " + issuerId + ".");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    String query = issuerId + "." + req.getParameter("query");
    String kind = req.getParameter("kind");
    if (Strings.isNullOrEmpty(kind)) {
      log.warning("Unable to continue without kind of class or object.");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    // Attempt to find class or object with specified id
    GenericJson result = null;
    JsonArray array = new JsonArray();
    JsonFactory jsonFactory = new GsonFactory();
    JsonParser parser = new JsonParser();
    if (kind.equals("class")) {
      try {
        result = client.offerclass().get(query).execute();
      } catch (GoogleJsonResponseException e) {
      }
      try {
        result = client.loyaltyclass().get(query).execute();
      } catch (GoogleJsonResponseException e) {
      }
      try {
        result = client.genericclass().get(query).execute();
      } catch (GoogleJsonResponseException e) {
      }
    } else if (kind.equals("object")) {
      try {
        result = client.offerobject().get(query).execute();
      } catch (GoogleJsonResponseException e) {
      }
      try {
        result = client.loyaltyobject().get(query).execute();
      } catch (GoogleJsonResponseException e) {
      }
      try {
        result = client.genericobject().get(query).execute();
      } catch (GoogleJsonResponseException e) {
      }
    } else {
      log.warning("Unknown kind " + kind);
      resp.getWriter().write(ClientMethods.createError(null));
    }

    if (result != null) {
      result.setFactory(jsonFactory);
      array.add(parser.parse(result.toString()));
      resp.getWriter().write(array.toString());
    }
  }
}
