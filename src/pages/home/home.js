// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulsePage = require('pulsePage');
var pulseConfig = require('pulseConfig');

require('x-tr/x-tr');

class HomePage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  getMissingConfigs () {
    let missingConfigs = [];
    // Keep structure empty to close panel
    return missingConfigs;
  }

}

$(document).ready(function () {
  // Disable the navigation panel
  $('#homebtn').addClass('disabled');

  // Prepare the page globally
  pulsePage.preparePage(new HomePage());
});
