// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-validatetoken/x-validatetoken');

class ValidatePage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false; // useful only if createTableCell is defined
    this.canConfigureRows = false; // useful only if createTableCell is defined
    this.showMachineselection = false;
  }

  // CONFIG PANEL - Init
  initOptionValues () {
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';
    return optionsValues;
  }

  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

  buildContent () {
    if ('' == pulseConfig.getString('code')) {
      // if no code, go back to login
      pulseConfig.goToPageLogin();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new ValidatePage());
});
