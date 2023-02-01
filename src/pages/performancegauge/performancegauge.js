// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
//var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-periodmanager/x-periodmanager');
require('x-performancegauge/x-performancegauge');
require('x-motionpercentage/x-motionpercentage');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-grouparray/x-grouparray');

class PerformanceGaugePage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  getMissingConfigs() {
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

  buildContent() {
  }
}

$(document).ready(function() {
  pulsePage.preparePage(new PerformanceGaugePage());
});
