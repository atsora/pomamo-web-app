// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-grouparray/x-grouparray');
require('x-machinetab/x-machinetab');
require('x-machinedisplay/x-machinedisplay');
require('x-lastserialnumber/x-lastserialnumber');
require('x-lastworkinformation/x-lastworkinformation');
require('x-lastmachinestatetemplate/x-lastmachinestatetemplate');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-periodmanager/x-periodmanager');
require('x-datetimegraduation/x-datetimegraduation');
require('x-shiftslotbar/x-shiftslotbar');
require('x-machinestatebar/x-machinestatebar');
require('x-observationstatebar/x-observationstatebar');
require('x-operationcyclebar/x-operationcyclebar');
require('x-operationslotbar/x-operationslotbar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-cncalarmbar/x-cncalarmbar');
require('x-redstacklightbar/x-redstacklightbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-isofileslotbar/x-isofileslotbar');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');

require('x-savemachinestatetemplate/x-savemachinestatetemplate');
require('x-sequencebar/x-sequencebar'); // to remove 6.0
require('x-cycleprogressbar/x-cycleprogressbar');
require('x-performancebar/x-performancebar');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-toollifemachine/x-toollifemachine');

require('x-cyclesinperiod/x-cyclesinperiod');

require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');

// Pies
require('x-partproductionstatuspie/x-partproductionstatuspie');
require('x-performancegauge/x-performancegauge');

require('x-tr/x-tr');

class MachinesPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
    this.canConfigureRows = false;
  }

  getMissingConfigs () {
    let missingConfigs = [];

    let groups = pulseConfig.getArray('group');
    let machines = pulseConfig.getArray('machine');
    if ((machines == null || machines.length == 0) &&
      (groups == null || groups.length == 0)) {
      missingConfigs.push({
        selector: 'x-machineselection, #editmachines, .group-machines',
        message: pulseConfig.pulseTranslate ('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  buildContent () {
    // show Bars
    let showBar = pulseConfig.getBool('showcoloredbar.shift', false);
    if (showBar) {
      $('x-shiftslotbar').show();
    }
    else {
      $('x-shiftslotbar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.machinestate', false);
    if (showBar) {
      $('x-machinestatebar').show();
    }
    else {
      $('x-machinestatebar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.observationstate', false);
    if (showBar) {
      $('x-observationstatebar').show();
    }
    else {
      $('x-observationstatebar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.cycle', false);
    if (showBar) {
      $('x-operationcyclebar').show();
    }
    else {
      $('x-operationcyclebar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.operation', false);
    if (showBar) {
      $('x-operationslotbar').show();
    }
    else {
      $('x-operationslotbar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.isofile', false);
    if (showBar) {
      $('x-isofileslotbar').show();
    }
    else {
      $('x-isofileslotbar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.cncalarm', false);
    if (showBar) {
      $('x-cncalarmbar').show();
    }
    else {
      $('x-cncalarmbar').hide();
    }
    showBar = pulseConfig.getBool('showcoloredbar.redstacklight', false);
    if (showBar) {
      $('x-redstacklightbar').show();
    }
    else {
      $('x-redstacklightbar').hide();
    }
    // show reason bar == always -> idem for SHOW x-reasongroups
    showBar = pulseConfig.getBool('showcoloredbar.cncvalue', false);
    if (showBar) {
      $('x-cncvaluebar').show();
      $('x-fieldlegends').show();
    }
    else {
      $('x-cncvaluebar').hide();
      $('x-fieldlegends').hide();
    }

    // find components to display
    let componentsToDisplay = pulseConfig.getArray('componentsToDisplay', []);
    let componentsString = componentsToDisplay.join(',');
    console.log('Components to display: ' + componentsString);

    $('.machine-component').hide(); // Hide all - Not possible in css :(
    for (let i = 0; i < componentsToDisplay.length; i++) {
      $(componentsToDisplay[i]).parents('.machine-component').show();

      if (componentsToDisplay[i] == 'coloredbar') {
        $('.div-bar-and-percent').parents('.machine-component').show();
      }
      if (componentsToDisplay[i] == 'coloredbarwithpercent') {
        $('.div-bar-and-percent').parents('.machine-component').show();
        $('.right-percent').show();
      }
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new MachinesPage());
});