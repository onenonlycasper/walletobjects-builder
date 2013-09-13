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

import com.google.api.client.json.GenericJson;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.walletobjects.Walletobjects;
import com.google.java.wob.utils.*;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStoreException;
import java.util.logging.Logger;

/**
 * Contains methods to obtain a Walletobjects client for an issuer id as well as
 * generating credentials.
 */
public class ClientMethods {
  private static final Logger log = Logger.getLogger(ClientMethods.class.getName());

  public static Walletobjects getClientForId(String issuerId) {

    WobUtils utils = null;
    Walletobjects client = null;
    try {
      utils = new WobUtils(createCredentials(issuerId));
      client = utils.getClient();
    } catch (FileNotFoundException e) {
      log.warning(e.getMessage());
    } catch (KeyStoreException e) {
      log.warning(e.getMessage());
    } catch (IOException e) {
      log.warning(e.getMessage());
    } catch (GeneralSecurityException e) {
      log.warning(e.getMessage());
    }

    try {
      client.offerclass().list(Long.decode(issuerId)).execute();
    } catch(NullPointerException e) {
      log.warning(e.getMessage());
      client = null;
    } catch (IOException e) {
      log.warning(e.getMessage());
      client = null;
    } catch (NumberFormatException e) {
      log.warning(e.getMessage());
      client = null;
    }

    return client;
  }

  public static WobCredentials createCredentials(String issuerId) {
    return new WobCredentials(
        System.getProperty("SERVICE_ACCOUNT_ID"), System.getProperty("PRIVATE_KEY"),
        System.getProperty("APPLICATION_NAME"), issuerId);
  }

  // Creates a generic json object with one key, error, to alert the client-side user
  public static String createError(String text) {
    if (text == null) {
      text = "An error occurred, please try again.";
    }
    JsonFactory jsonFactory = new GsonFactory();
    GenericJson error = new GenericJson();
    error.put("error", text);
    error.setFactory(jsonFactory);
    return error.toString();
  }
}
