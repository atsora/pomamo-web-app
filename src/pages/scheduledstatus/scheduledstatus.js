// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-grouplist/x-grouplist');
require('x-rotationprogress/x-rotationprogress');

require('x-machinedisplay/x-machinedisplay');
require('x-lastmachinestatetemplate/x-lastmachinestatetemplate');
require('x-tr/x-tr');

class ScheduledStatusPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    pulseConfig.set('column', '');
  }

  // CONFIG PANEL - Init
  initOptionValues() {
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    return '';
  }

  getMissingConfigs() {
    let missingConfigs = [];

    let groups = pulseConfig.getArray('group');
    let machines = pulseConfig.getArray('machine');
    if ((machines == null || machines.length == 0) &&
      (groups == null || groups.length == 0)) {
      missingConfigs.push({
        selector: 'x-machineselection, #editmachines, .group-machines',
        message: pulseConfig.pulseTranslate('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
  }

  buildContent() {
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new ScheduledStatusPage());
});
