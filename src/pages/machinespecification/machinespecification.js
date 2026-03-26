// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-machinedisplay/x-machinedisplay');
require('x-currentcncvalue/x-currentcncvalue');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-periodmanager/x-periodmanager');
// LEGENDS
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

class MachineSpecificationPage extends pulsePage.BasePage {
  constructor() {
    super();

    // because many row/col is not ready (fixed height) -> //TODO
    pulseConfig.set('defaultlayout', false);
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  // CONFIG PANEL - Init
  initOptionValues() {
    // Always 1 machine per page
    $('#machinesperpage').val(1).change();
    $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    $('#rotationdelay').val(10).removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const delay = document.getElementById('rotationdelay');
    const result = (delay && !$(delay).is(':hidden')) ? `&rotationdelay=${delay.value}` : '';
    return `&machinesperpage=1${result}`;
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

  buildContent() {
  }
}

$(document).ready(function() {
  pulsePage.preparePage(new MachineSpecificationPage());
});
