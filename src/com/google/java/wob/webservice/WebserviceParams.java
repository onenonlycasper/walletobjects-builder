package com.google.java.wob.webservice;

public class WebserviceParams {
  String linkingId;
  WebserviceWalletUser walletUser;
  Boolean promotionalEmailOptIn;
  Boolean tosUserAcceptance;
  
  public WebserviceParams() {}
  
  /**
   * @return the linkingId
   */
  public String getLinkingId() {
    return linkingId;
  }

  /**
   * @param linkingId the linkingId to set
   */
  public void setLinkingId(String linkingId) {
    this.linkingId = linkingId;
  }

  /**
   * @return the walletUser
   */
  public WebserviceWalletUser getWalletUser() {
    return walletUser;
  }

  /**
   * @param walletUser the walletUser to set
   */
  public void setWalletUser(WebserviceWalletUser walletUser) {
    this.walletUser = walletUser;
  }

  /**
   * @return the promotionalEmailOptIn
   */
  public Boolean getPromotionalEmailOptIn() {
    return promotionalEmailOptIn;
  }

  /**
   * @param promotionalEmailOptIn the promotionalEmailOptIn to set
   */
  public void setPromotionalEmailOptIn(Boolean promotionalEmailOptIn) {
    this.promotionalEmailOptIn = promotionalEmailOptIn;
  }

  /**
   * @return the tosUserAcceptance
   */
  public Boolean getTosUserAcceptance() {
    return tosUserAcceptance;
  }

  /**
   * @param tosUserAcceptance the tosUserAcceptance to set
   */
  public void setTosUserAcceptance(Boolean tosUserAcceptance) {
    this.tosUserAcceptance = tosUserAcceptance;
  }
}
