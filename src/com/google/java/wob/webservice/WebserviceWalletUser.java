package com.google.java.wob.webservice;

import java.util.List;

public class WebserviceWalletUser {
   String firstName;
   String middleName;
   String lastName;
   String streetAddress;
   String city;
   String state;
   String zipcode;
   String country;
   String email;
   String phone;
   String gender;
   String birthday;
   List<String> userModifiedFields;
   
   public WebserviceWalletUser() {}
   
   /**
   * @return the firstName
   */
  public String getFirstName() {
    return firstName;
  }

  /**
   * @param firstName the firstName to set
   */
  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  /**
   * @return the middleName
   */
  public String getMiddleName() {
    return middleName;
  }

  /**
   * @param middleName the middleName to set
   */
  public void setMiddleName(String middleName) {
    this.middleName = middleName;
  }

  /**
   * @return the lastName
   */
  public String getLastName() {
    return lastName;
  }

  /**
   * @param lastName the lastName to set
   */
  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  /**
   * @return the streetAddress
   */
  public String getStreetAddress() {
    return streetAddress;
  }

  /**
   * @param streetAddress the streetAddress to set
   */
  public void setStreetAddress(String streetAddress) {
    this.streetAddress = streetAddress;
  }

  /**
   * @return the city
   */
  public String getCity() {
    return city;
  }

  /**
   * @param city the city to set
   */
  public void setCity(String city) {
    this.city = city;
  }

  /**
   * @return the state
   */
  public String getState() {
    return state;
  }

  /**
   * @param state the state to set
   */
  public void setState(String state) {
    this.state = state;
  }

  /**
   * @return the zipcode
   */
  public String getZipcode() {
    return zipcode;
  }

  /**
   * @param zipcode the zipcode to set
   */
  public void setZipcode(String zipcode) {
    this.zipcode = zipcode;
  }

  /**
   * @return the country
   */
  public String getCountry() {
    return country;
  }

  /**
   * @param country the country to set
   */
  public void setCountry(String country) {
    this.country = country;
  }

  /**
   * @return the email
   */
  public String getEmail() {
    return email;
  }

  /**
   * @param email the email to set
   */
  public void setEmail(String email) {
    this.email = email;
  }

  /**
   * @return the phone
   */
  public String getPhone() {
    return phone;
  }

  /**
   * @param phone the phone to set
   */
  public void setPhone(String phone) {
    this.phone = phone;
  }

  /**
   * @return the gender
   */
  public String getGender() {
    return gender;
  }

  /**
   * @param gender the gender to set
   */
  public void setGender(String gender) {
    this.gender = gender;
  }

  /**
   * @return the birthday
   */
  public String getBirthday() {
    return birthday;
  }

  /**
   * @param birthday the birthday to set
   */
  public void setBirthday(String birthday) {
    this.birthday = birthday;
  }

  /**
   * @return the userModifiedFields
   */
  public List<String> getUserModifiedFields() {
    return userModifiedFields;
  }

  /**
   * @param userModifiedFields the userModifiedFields to set
   */
  public void setUserModifiedFields(List<String> userModifiedFields) {
    this.userModifiedFields = userModifiedFields;
  }
}
