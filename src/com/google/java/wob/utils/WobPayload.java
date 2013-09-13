package com.google.java.wob.utils;


import java.util.ArrayList;
import java.util.List;

import com.google.api.client.json.GenericJson;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.walletobjects.model.BoardingPassClass;
import com.google.api.services.walletobjects.model.BoardingPassObject;
import com.google.api.services.walletobjects.model.GenericClass;
import com.google.api.services.walletobjects.model.GenericObject;
import com.google.api.services.walletobjects.model.LoyaltyClass;
import com.google.api.services.walletobjects.model.LoyaltyObject;
import com.google.api.services.walletobjects.model.OfferClass;
import com.google.api.services.walletobjects.model.OfferObject;
import com.google.gson.Gson;
import com.google.java.wob.webservice.WebserviceResponse;

/**
 * Bean to represent the Wob payload object
 *
 * @author pying
 *
 */
public class WobPayload {
  private List<GenericJson> loyaltyClasses = new ArrayList<GenericJson>();
  private List<GenericJson> offerClasses = new ArrayList<GenericJson>();
  private List<GenericJson> genericClasses = new ArrayList<GenericJson>();
  private List<GenericJson> boardingPassClasses = new ArrayList<GenericJson>();

  private List<GenericJson> loyaltyObjects = new ArrayList<GenericJson>();
  private List<GenericJson> offerObjects = new ArrayList<GenericJson>();
  private List<GenericJson> genericObjects = new ArrayList<GenericJson>();
  private List<GenericJson> boardingPassObjects = new ArrayList<GenericJson>();

  private WebserviceResponse webserviceResponse;

  private transient Gson gson = new Gson();
  private transient JsonFactory jsonFactory = new GsonFactory();

  public WobPayload(){}

  public void addObject(GenericJson object){
    object.setFactory(jsonFactory);

    if (LoyaltyObject.class.isAssignableFrom(object.getClass())) {
      addLoyaltyObject(gson.fromJson(object.toString(), GenericJson.class));
    } else if (OfferObject.class.isAssignableFrom(object.getClass())) {
      addOfferObject(gson.fromJson(object.toString(), GenericJson.class));
    } else if (GenericObject.class.isAssignableFrom(object.getClass())) {
      addGenericObject(gson.fromJson(object.toString(), GenericJson.class));
    } else if (BoardingPassObject.class.isAssignableFrom(object.getClass())) {
      addBoardingPassObject(gson.fromJson(object.toString(),
          GenericJson.class));
    } else if (BoardingPassClass.class.isAssignableFrom(object.getClass())) {
      addBoardingPassClass(gson.fromJson(object.toString(),
          GenericJson.class));
    } else if (LoyaltyClass.class.isAssignableFrom(object.getClass())) {
      addLoyaltyClass(gson.fromJson(object.toString(),
          GenericJson.class));
    } else if (OfferClass.class.isAssignableFrom(object.getClass())) {
      addOfferClass(gson.fromJson(object.toString(),
          GenericJson.class));
    } else if (GenericClass.class.isAssignableFrom(object.getClass())) {
      addGenericClass(gson.fromJson(object.toString(),
          GenericJson.class));
    } else
      throw new IllegalArgumentException("Invalid Object type: "
          + object.getClass());
  }

  public void addLoyaltyObject(GenericJson object){
    loyaltyObjects.add(object);
  }

  public List<GenericJson> getLoyaltyObjects() {
    return loyaltyObjects;
  }

  public void setLoyaltyObjects(List<GenericJson> loyaltyObject) {
    this.loyaltyObjects = loyaltyObject;
  }

  public void addOfferObject(GenericJson object){
    offerObjects.add(object);
  }

  public List<GenericJson> getOfferObjects() {
    return offerObjects;
  }

  public void setOfferObjects(List<GenericJson> offerObject) {
    this.offerObjects = offerObject;
  }

  public void addGenericObject(GenericJson object){
    genericObjects.add(object);
  }

  public List<GenericJson> getGenericObjects() {
    return genericObjects;
  }

  public void setGenericObjects(List<GenericJson> genericObject) {
    this.genericObjects = genericObject;
  }

  public WebserviceResponse getResponse() {
    return webserviceResponse;
  }

  public void setResponse(WebserviceResponse resp) {
    this.webserviceResponse = resp;
  }

  public List<GenericJson> getBoardingPassObjects() {
    return boardingPassObjects;
  }

  public void setBoardingPassObjects(List<GenericJson> boardingPassObjects) {
    this.boardingPassObjects = boardingPassObjects;
  }

  public void addBoardingPassObject(GenericJson object){
    boardingPassObjects.add(object);
  }

  /**
   * @return the loyaltyClasses
   */
  public List<GenericJson> getLoyaltyClasses() {
    return loyaltyClasses;
  }

  /**
   * @param loyaltyClasses the loyaltyClasses to set
   */
  public void setLoyaltyClasses(List<GenericJson> loyaltyClasses) {
    this.loyaltyClasses = loyaltyClasses;
  }

  public void addLoyaltyClass(GenericJson object){
    loyaltyClasses.add(object);
  }

  /**
   * @return the offerClasses
   */
  public List<GenericJson> getOfferClasses() {
    return offerClasses;
  }

  /**
   * @param offerClasses the offerClasses to set
   */
  public void setOfferClasses(List<GenericJson> offerClasses) {
    this.offerClasses = offerClasses;
  }

  public void addOfferClass(GenericJson object){
    offerClasses.add(object);
  }
  /**
   * @return the genericClasses
   */
  public List<GenericJson> getGenericClasses() {
    return genericClasses;
  }

  /**
   * @param genericClasses the genericClasses to set
   */
  public void setGenericClasses(List<GenericJson> genericClasses) {
    this.genericClasses = genericClasses;
  }

  public void addGenericClass(GenericJson object){
    genericClasses.add(object);
  }

  /**
   * @return the boardingPassClasses
   */
  public List<GenericJson> getBoardingPassClasses() {
    return boardingPassClasses;
  }

  /**
   * @param boardingPassClasses the boardingPassClasses to set
   */
  public void setBoardingPassClasses(List<GenericJson> boardingPassClasses) {
    this.boardingPassClasses = boardingPassClasses;
  }

  public void addBoardingPassClass(GenericJson object){
    boardingPassClasses.add(object);
  }

}
