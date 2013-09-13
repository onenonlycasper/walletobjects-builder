package com.google.java.wob.utils;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.security.KeyStoreException;
import java.security.SignatureException;
import java.security.interfaces.RSAPrivateKey;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.logging.Logger;

import net.oauth.jsontoken.JsonToken;
import net.oauth.jsontoken.crypto.RsaSHA256Signer;

import org.joda.time.Instant;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.GenericJson;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.Base64;
import com.google.api.client.util.SecurityUtils;
import com.google.api.services.walletobjects.Walletobjects;
import com.google.api.services.walletobjects.model.DateTime;
import com.google.common.io.ByteStreams;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.java.wob.ClientMethods;
import com.google.java.wob.SaveToWalletServlet;
import com.google.java.wob.webservice.WebserviceResponse;

/**
 * This class contains some utility functions to create clients for API access
 * and generate JWTs for Save To Wallet and the Webservice API.
 *
 * @author pying
 *
 */
public class WobUtils {
  private final String SAVE_TO_WALLET = "savetowallet";
  private final String LOYALTY_WEB = "loyaltywebservice";
  private final String WOB_PROD =
      "https://www.googleapis.com/auth/wallet_object.issuer";
  private final String GOOGLE = "google";

  private final String serviceAccountId;
  private final String rsaKeyPath;
  private final String applicationName;
  private final String issuerId;
  private GoogleCredential credential = null;

  private HttpTransport httpTransport;
  private JsonFactory jsonFactory;

  RsaSHA256Signer signer = null;
  Gson gson = new Gson();

  private RSAPrivateKey rsaKey;

  /**
   *
   * @param credentials
   * @throws FileNotFoundException
   * @throws IOException
   * @throws KeyStoreException
   * @throws GeneralSecurityException
   */
  public WobUtils(WobCredentials credentials) throws FileNotFoundException,
      IOException, KeyStoreException, GeneralSecurityException {
    serviceAccountId = credentials.getServiceAccountId();
    rsaKeyPath = credentials.getServiceAccountPrivateKey();
    applicationName = credentials.getApplicationName();
    issuerId = credentials.getIssuerId();
    httpTransport = new NetHttpTransport();
    jsonFactory = new GsonFactory();
    File file = new File(rsaKeyPath);
    byte[] bytes = ByteStreams.toByteArray(new FileInputStream(file));
    InputStream keyStream = new ByteArrayInputStream(bytes);
    rsaKey = (RSAPrivateKey) SecurityUtils
        .loadPrivateKeyFromKeyStore(SecurityUtils.getPkcs12KeyStore(),
            keyStream, "notasecret", "privatekey", "notasecret");
    signer = new RsaSHA256Signer(serviceAccountId, null, rsaKey);
  }

  /**
   * Creates a Walletobjects client with sandbox and production scopes
   *
   * @return Walletobjects client
   * @throws GeneralSecurityException
   * @throws IOException
   */
  public Walletobjects getClient() throws GeneralSecurityException,
      IOException {
    credential = getCredential();

    return new Walletobjects.Builder(httpTransport, jsonFactory, credential)
        .setApplicationName(applicationName).build();
  }

  /**
   * Helper function to generate the Google Credential
   *
   * @return
   * @throws GeneralSecurityException
   * @throws IOException
   */
  public GoogleCredential getCredential() throws GeneralSecurityException,
      IOException {
    List<String> scopes = new ArrayList<String>();
    scopes.add(WOB_PROD);

    return credential = new GoogleCredential.Builder()
        .setTransport(httpTransport).setJsonFactory(jsonFactory)
        .setServiceAccountId(serviceAccountId).setServiceAccountScopes(scopes)
        .setServiceAccountPrivateKey(rsaKey).build();
  }

  /**
   * Refreshes the access token and returns it
   *
   * @return OAuth access token
   * @throws GeneralSecurityException
   * @throws IOException
   */
  public String accessToken() throws GeneralSecurityException, IOException {
    if (credential == null) {
      credential = getCredential();
    }
    credential.refreshToken();
    return credential.getAccessToken();
  }

  public String generateWebserviceFailureResponseJwt (WebserviceResponse resp) throws
    SignatureException {
    return generateWebserviceResponseJwt(null, resp);
  }

  /**
   * Generates the linking/signup JWT from a Wallet Object
   *
   * @param object
   * @param resp
   * @return
   * @throws SignatureException
   */
  public String generateWebserviceResponseJwt(GenericJson object,
      WebserviceResponse resp) throws SignatureException {

    JsonToken token = new JsonToken(signer);
    token.setAudience(GOOGLE);
    token.setParam("typ", LOYALTY_WEB);
    token.setIssuedAt(new Instant(
        Calendar.getInstance().getTimeInMillis() - 5000L));
    WobPayload payload = new WobPayload();

    if (object != null) {
      object.setFactory(new GsonFactory());
      payload.addObject(object);
    }

    payload.setResponse(resp);
    JsonObject obj = gson.toJsonTree(payload).getAsJsonObject();
    token.getPayloadAsJsonObject().add("payload", obj);
    return token.serializeAndSign();
  }

  /**
   * Generates the Save to Wallet JWT from a Wallet Object
   *
   * @param object
   * @param origins
   * @return
   * @throws SignatureException
   */
  public String generateSaveJwt(GenericJson object, List<String> origins)
      throws SignatureException {
    WobPayload payload = new WobPayload();
    payload.addObject(object);
    return generateSaveJwt(payload, origins);
  }

  public String generateSaveJwt(WobPayload payload, List<String> origins)
      throws SignatureException {
    JsonToken token = new JsonToken(signer);
    token.setAudience(GOOGLE);
    token.setParam("typ", SAVE_TO_WALLET);
    try {
      if (origins.get(0).substring(0, 18).equals("http://thisisatest")) {
        token.setIssuedAt(new Instant(0));
      } else {
        token.setIssuedAt(new Instant(
            Calendar.getInstance().getTimeInMillis() - 5000L));
      }
    } catch (StringIndexOutOfBoundsException e) {
      token.setIssuedAt(new Instant(
          Calendar.getInstance().getTimeInMillis() - 5000L));
    }
    JsonObject obj = gson.toJsonTree(payload).getAsJsonObject();
    token.getPayloadAsJsonObject().add("payload", obj);
    token.getPayloadAsJsonObject().add("origins", gson.toJsonTree(origins));
    return token.serializeAndSign();
  }
  /**
   *
   * @param rfc3339
   * @return
   */
  public static DateTime toDateTime(String rfc3339) {
    return new DateTime()
        .setDate(com.google.api.client.util.DateTime.parseRfc3339(rfc3339));
  }

  /**
   *
   * @return
   */
  public String getServiceAccountId() {
    return serviceAccountId;
  }

  /**
   *
   * @return
   */
  public String getIssuerId() {
    return issuerId;
  }
}
