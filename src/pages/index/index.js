// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

//var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var pulseUtility = require('pulseUtility');

//require('x-loginconnection/x-loginconnection');

class IndexPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

  // This method is run only if missing config (cf getMissingConfigs)
  /*buildContent () {
  }*/

}

$(document).ready(function () {
  // if index.html does not exists -> load it
  if (-1 == window.location.href.indexOf('index.html')) {
    window.open(window.location.href + 'home.html', '_self');
    return;
  }

  // Go to login or home :
  let pageToDisplay = window.location.href;
  pageToDisplay = pulseUtility.changePageName(pageToDisplay, 'home'); // will move to 'login' if role = undefined
  window.open(pageToDisplay, '_self');

  // Configuration panel disabled
  $('#configpanelbtn').addClass('disabled');
  $('#pulse-panel-parameter').hide();

  // Prepare the page globally
  pulsePage.preparePage(new IndexPage());
});
