package com.google.java.wob.utils;

public class WobCredentials {
  String serviceAccountId;
  String serviceAccountPrivateKey;
  String applicationName;
  String issuerId;

  public WobCredentials(String serviceAccountId, String privateKey,
      String applicationName, String issuerId) {
    setServiceAccountId(serviceAccountId);
    setServiceAccountPrivateKey(privateKey);
    setApplicationName(applicationName);
    setIssuerId(issuerId);
  }

  /**
   * @return the serviceAccountId
   */
  public String getServiceAccountId() {
    return serviceAccountId;
  }
  /**
   * @param serviceAccountId the serviceAccountId to set
   */
  public void setServiceAccountId(String serviceAccountId) {
    this.serviceAccountId = serviceAccountId;
  }
  /**
   * @return the serviceAccountPrivateKey
   */
  public String getServiceAccountPrivateKey() {
    return serviceAccountPrivateKey;
  }
  /**
   * @param serviceAccountPrivateKey the serviceAccountPrivateKey to set
   */
  public void setServiceAccountPrivateKey(String serviceAccountPrivateKey) {
    this.serviceAccountPrivateKey = serviceAccountPrivateKey;
  }
  /**
   * @return the applicationName
   */
  public String getApplicationName() {
    return applicationName;
  }
  /**
   * @param applicationName the applicationName to set
   */
  public void setApplicationName(String applicationName) {
    this.applicationName = applicationName;
  }
  /**
   * @return the issuerId
   */
  public String getIssuerId() {
    return issuerId;
  }
  /**
   * @param issuerId the issuerId to set
   */
  public void setIssuerId(String issuerId) {
    this.issuerId = issuerId;
  }
}
