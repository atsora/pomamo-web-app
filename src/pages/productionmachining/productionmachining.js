// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-grouparray/x-grouparray');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-machinedisplay/x-machinedisplay');

class ProductionMachiningPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
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

  buildContent () {
    //let col = 1; // pulseConfig.getInt('column'); -> not a LIVE page == NO column
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new ProductionMachiningPage());
});
