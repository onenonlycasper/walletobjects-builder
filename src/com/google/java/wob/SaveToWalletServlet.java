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

import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.walletobjects.model.GenericObject;
import com.google.api.services.walletobjects.model.LoyaltyObject;
import com.google.api.services.walletobjects.model.OfferObject;
import com.google.common.base.Strings;
import com.google.java.wob.utils.WobPayload;
import com.google.java.wob.utils.WobUtils;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStoreException;
import java.security.SignatureException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Generates JWT for the posted JSON wallet object.
 */
public class SaveToWalletServlet extends HttpServlet {
  private static final Logger log = Logger.getLogger(SaveToWalletServlet.class.getName());
  private static final String s1 = "<script src=\"https://apis.google.com/js/plusone.js\" ";
  private static final String s2 = "type=\"text/javascript\"></script><g:savetowallet jwt=\"";
  private static final String s3 = "\" onsuccess=\"successHandler\" onfailure=\"";
  private static final String s4 =
      "failureHandler\" size=\"small\" theme=\"gray\" ></g:savetowallet>";

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

    WobUtils util;
    try {
      util = new WobUtils(ClientMethods.createCredentials(req.getParameter("issuerId")));
    } catch (KeyStoreException e) {
      log.warning(e.getMessage());
      return;
    } catch (GeneralSecurityException e) {
      log.warning(e.getMessage());
      return;
    }

    String json = req.getParameter("json");
    String kind = req.getParameter("kind");
    String sOrigins = req.getParameter("origins");
    if (Strings.isNullOrEmpty(kind) || Strings.isNullOrEmpty(json)
        || Strings.isNullOrEmpty(sOrigins)) {
      log.warning("Unable to generate JWT without kind, json and origins.");
      resp.getWriter().write(ClientMethods.createError(null));
      return;
    }

    List<String> origins = Arrays.asList(sOrigins.replaceAll("\\s+", "").split(","));
    WobPayload payload = new WobPayload();
    String jwtWithOrigins = null;
    String jwtWithUrl = null;

    if (kind.contains("offer")) {
      OfferObject offerObject = new GsonFactory().fromString(json, OfferObject.class);
      offerObject.setVersion(1L);
      payload.addObject(offerObject);
    } else if (kind.contains("loyalty")) {
      LoyaltyObject loyaltyObject = new GsonFactory().fromString(json, LoyaltyObject.class);
      loyaltyObject.setVersion(1L);
      payload.addObject(loyaltyObject);
    } else if (kind.contains("generic")) {
      GenericObject genericObject = new GsonFactory().fromString(json, GenericObject.class);
      genericObject.setVersion(1L);
      payload.addObject(genericObject);
    } else {
      log.warning("Unable to generate JWT with invalid kind " + kind + ".");
      resp.getWriter().write(ClientMethods.createError(null));
    }

    try {
      jwtWithOrigins = util.generateSaveJwt(payload, origins);
      String url = req.getRequestURL().toString();
      // get user's url and ignore jwt at end
      url = url.substring(0, url.length() - 3);
      jwtWithUrl = util.generateSaveJwt(payload, Arrays.asList(url));
    } catch (SignatureException e) {
      log.warning("Unable to generate JWT: " + e.getMessage());
    }

    if (Strings.isNullOrEmpty(jwtWithOrigins)) {
      resp.getWriter().write("JWT generation failed.");
    } else {
      // user specified origins
      StringBuilder withOrigins = new StringBuilder();
      withOrigins.append(s1).append(s2).append(jwtWithOrigins).append(s3).append(s4);
      // users url
      StringBuilder withUrl = new StringBuilder();
      withUrl.append(s1).append(s2).append(jwtWithUrl).append(s3).append(s4);

      List<String> array = new ArrayList<String>();
      array.add(withOrigins.toString());
      array.add(withUrl.toString());

      resp.getWriter().write(array.toString());
    }
  }
}
