package com.google.java.wob.webservice;

public class WebserviceRequest {
  String apiVersion;
  String method;  //link, signup
  WebserviceParams params;
  
  public WebserviceRequest() {}
  
  /**
   * @return the apiVersion
   */
  public String getApiVersion() {
    return apiVersion;
  }

  /**
   * @param apiVersion the apiVersion to set
   */
  public void setApiVersion(String apiVersion) {
    this.apiVersion = apiVersion;
  }

  /**
   * @return the method
   */
  public String getMethod() {
    return method;
  }

  /**
   * @param method the method to set
   */
  public void setMethod(String method) {
    this.method = method;
  }

  /**
   * @return the params
   */
  public WebserviceParams getParams() {
    return params;
  }

  /**
   * @param params the params to set
   */
  public void setParams(WebserviceParams params) {
    this.params = params;
  }
  
}
