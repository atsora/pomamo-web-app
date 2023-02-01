// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-milestonesmanager/x-milestonesmanager');
require('x-machinedisplay/x-machinedisplay');

require('x-grouparray/x-grouparray');

class MilestonesPage extends pulsePage.BasePage {
  constructor() {
    super();
    this.canConfigureColumns = true;
    this.showMachineselection = true;
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    //
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

    let groups = pulseConfig.getArray('group');
    let machines = pulseConfig.getArray('machine');
    if ((machines == null || machines.length == 0) &&
      (groups == null || groups.length == 0)) {
      missingConfigs.push({
        selector: 'x-machineselection, #editmachines, .group-machines',
        message: 'Please select at least one machine before launching the page.'
      });
    }

    return missingConfigs;
  }

  // This method is run only if missing config (cf getMissingConfigs)
  buildContent () {
    // Remove config from displayed URL and store them
  }

}

$(document).ready(function () {
  // Prepare the page globally
  pulsePage.preparePage(new MilestonesPage());
});
