// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-machinedisplay/x-machinedisplay');
require('x-currentcncvalue/x-currentcncvalue');
// BARS
require('x-datetimegraduation/x-datetimegraduation');
require('x-reasonslotbar/x-reasonslotbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-datetimegraduation/x-datetimegraduation');
require('x-runningslotbar/x-runningslotbar');
// End BARS
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-periodmanager/x-periodmanager');
// LEGENDS
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');

require('x-grouparray/x-grouparray');
require('x-tr/x-tr');

class MachineSpecificationPage extends pulsePage.BasePage {
  constructor() {
    super();

    // because many row/col is not ready (fixed height) -> //TODO
    this.canConfigureColumns = false;
    this.canConfigureRows = false;
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  getMissingConfigs () {
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

  buildContent () {
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new MachineSpecificationPage());
});
