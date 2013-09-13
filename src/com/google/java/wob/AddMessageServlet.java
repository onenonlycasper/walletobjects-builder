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
import com.google.api.client.util.DateTime;
import com.google.api.services.walletobjects.Walletobjects;
import com.google.api.services.walletobjects.model.GenericClassAddMessageRequest;
import com.google.api.services.walletobjects.model.GenericObjectAddMessageRequest;
import com.google.api.services.walletobjects.model.Image;
import com.google.api.services.walletobjects.model.LoyaltyClassAddMessageRequest;
import com.google.api.services.walletobjects.model.LoyaltyObjectAddMessageRequest;
import com.google.api.services.walletobjects.model.TimeInterval;
import com.google.api.services.walletobjects.model.Uri;
import com.google.api.services.walletobjects.model.WalletObjectMessage;
import com.google.common.base.Strings;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Generates an add message request for specified id and with message parameters from request.
 */
public class AddMessageServlet extends HttpServlet {
  private static final Logger log = Logger.getLogger(AddMessageServlet.class.getName());

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    resp.setContentType("application/json; charset=utf-8");

    JsonFactory jsonFactory = new GsonFactory();

    Walletobjects client = ClientMethods.getClientForId(req.getParameter("issuerId"));
    if (client == null) {
      log.warning("Unable to get client for issuer id " + req.getParameter("issuerId"));
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    String id = req.getParameter("id");
    String kind = req.getParameter("kind");
    if (Strings.isNullOrEmpty(id) || Strings.isNullOrEmpty(kind)) {
      log.warning("Unable to add message without id and kind.");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    String body = req.getParameter("body");
    if (Strings.isNullOrEmpty(body)) {
      log.warning("Unable to add message without a body.");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    String header = req.getParameter("header");
    String actionUriString = req.getParameter("actionUri");
    String actionUriDescription = req.getParameter("actionUriDescription");
    String imageUriString = req.getParameter("imageUri");
    String imageUriDescription = req.getParameter("imageUriDescription");
    String displayIntervalStart = req.getParameter("displayIntervalStart");
    String displayIntervalEnd = req.getParameter("displayIntervalEnd");

    WalletObjectMessage message = new WalletObjectMessage();
    message.setHeader(header);
    message.setBody(body);

    // Action uri
    if (!Strings.isNullOrEmpty(actionUriString)) {
      Uri actionUri = new Uri().setUri(actionUriString);
      if (!Strings.isNullOrEmpty(actionUriDescription)) {
        actionUri.setDescription(actionUriDescription);
      }
      message.setActionUri(actionUri);
    }

    // Message image
    if (!Strings.isNullOrEmpty(imageUriString)) {
      Uri imageUri = new Uri().setUri(imageUriString);
      if (!Strings.isNullOrEmpty(imageUriDescription)) {
        imageUri.setDescription(actionUriDescription);
      }
      message.setImage(new Image().setSourceUri(imageUri));
    }

    // Display interval
    if (!Strings.isNullOrEmpty(displayIntervalStart)
        && !Strings.isNullOrEmpty(displayIntervalEnd)) {
      TimeInterval interval = new TimeInterval();
      com.google.api.services.walletobjects.model.DateTime start =
          new com.google.api.services.walletobjects.model.DateTime();
      start.setDate(new DateTime(displayIntervalStart));

      com.google.api.services.walletobjects.model.DateTime end =
          new com.google.api.services.walletobjects.model.DateTime();
      end.setDate(new DateTime(displayIntervalEnd));

      interval.setStart(start);
      interval.setEnd(end);

      message.setDisplayInterval(interval);
    }

    // Create and execute add message request
    GenericJson updated = null;
    try {
      if (kind.contains("loyaltyClass")) {
        LoyaltyClassAddMessageRequest content = new LoyaltyClassAddMessageRequest();
        content.setMessage(message);
        client.loyaltyclass().addmessage(id, content).execute();
        updated = client.loyaltyclass().get(id).execute();

      } else if (kind.contains("genericClass")) {
        GenericClassAddMessageRequest content = new GenericClassAddMessageRequest();
        content.setMessage(message);
        client.genericclass().addmessage(id, content).execute();
        updated = client.genericclass().get(id).execute();

      } else if (kind.contains("loyaltyObject")) {
        LoyaltyObjectAddMessageRequest content = new LoyaltyObjectAddMessageRequest();
        content.setMessage(message);
        client.loyaltyobject().addmessage(id, content).execute();
        updated = client.loyaltyobject().get(id).execute();

      } else if (kind.contains("genericObject")) {
        GenericObjectAddMessageRequest content = new GenericObjectAddMessageRequest();
        content.setMessage(message);
        client.genericobject().addmessage(id, content).execute();
        updated = client.genericobject().get(id).execute();

      } else {
        log.warning("Unable to add message with invalid kind " + kind + ".");
        resp.getWriter().write(ClientMethods.createError(null));
        return;
      }
    } catch (GoogleJsonResponseException e) {
      log.warning("Add message request failed: " + e.getMessage());
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    if (Strings.isNullOrEmpty(updated.toString())) {
      log.warning("Unable to verify update due to unknown error");
      resp.getWriter().write(ClientMethods.createError("Unable to verify save, please refresh."));
      return;
    }

    resp.getWriter().write(updated.toString());
  }
}
