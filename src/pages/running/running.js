// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');

require('x-grouparray/x-grouparray');

require('x-machinedisplay/x-machinedisplay');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-lastworkinformation/x-lastworkinformation');
require('x-currentcncvalue/x-currentcncvalue');
require('x-lastshift/x-lastshift');
/* Replace x-RCB */
require('x-datetimegraduation/x-datetimegraduation');
require('x-shiftslotbar/x-shiftslotbar');
require('x-machinestatebar/x-machinestatebar');
require('x-observationstatebar/x-observationstatebar');
require('x-operationcyclebar/x-operationcyclebar');
require('x-operationslotbar/x-operationslotbar');
require('x-productionstatebar/x-productionstatebar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-cncalarmbar/x-cncalarmbar');
require('x-redstacklightbar/x-redstacklightbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-isofileslotbar/x-isofileslotbar');
/* end replace RCB */
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-periodtoolbar/x-periodtoolbar');
require('x-reasonbutton/x-reasonbutton');
require('x-clock/x-clock');
require('x-productionstatelegends/x-productionstatelegends');
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');
require('x-tr/x-tr');

class RunningPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
    pulseConfig.set('column', '');
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    // Allow choose production bar display
    let allowproductionbar = pulseConfig.getBool('allowproductionbar');
    if (!allowproductionbar) {
      $('.group-options').hide();
    }

    // BAR : day / shift
    $('#showproductionbar').prop('checked',
      pulseConfig.getBool('showproductionbar'));
    $('#showproductionbar').change(function () {
      let showproductionbar = $('#showproductionbar').is(':checked');
      // Store
      pulseConfig.set('showproductionbar', showproductionbar);
      // Display
      if (showproductionbar) {
        $('x-reasonslotbar').hide();
        $('x-reasongroups').hide();
        $('x-productionstatebar').show();
        $('x-productionstatelegends').show();
      }
      else {
        $('x-reasonslotbar').show();
        $('x-reasongroups').show();
        $('x-productionstatebar').hide();
        $('x-productionstatelegends').hide();
      }
    });
    $('#showreasonbar').prop('checked', !pulseConfig.getBool('showproductionbar'));
    $('#showreasonbar').change(function () {
      let showproductionbar = !$('#showreasonbar').is(':checked');
      // Store
      pulseConfig.set('showproductionbar', showproductionbar);
      // Display
      if (showproductionbar) {
        $('x-reasonslotbar').hide();
        $('x-reasongroups').hide();
        $('x-productionstatebar').show();
        $('x-productionstatelegends').show();
      }
      else {
        $('x-reasonslotbar').show();
        $('x-reasongroups').show();
        $('x-productionstatebar').hide();
        $('x-productionstatelegends').hide();
      }
    });
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    // BAR (reason / production state)
    $('#showproductionbar').prop('checked',
      pulseConfig.getDefaultBool('showproductionbar'));
    $('#showproductionbar').change();
    $('#showproductionbar').removeAttr('overridden');

    $('#showreasonbar').prop('checked', !pulseConfig.getDefaultBool('showproductionbar'));
    $('#showreasonbar').change();
    $('#showreasonbar')
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    const options = [
      { id: 'showproductionbar', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      return `&${opt.id}=${el.checked}`;
    }).join('');
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

    //pulseConfig.set('column', 1); // Always ! -> Not here, in x-grouparray

    // Link between these displays are removed - In case of bad config, job can be displayed twice (ex: dev)
    let addProductionMachining = pulseConfig.getBool('currentdisplay.displayjobshiftpartcount', false);
    let displayJob = pulseConfig.getBool('currentdisplay.displayjob', true);
    let displayShift = pulseConfig.getBool('currentdisplay.displayshift', true);
    let displayCNCValue = pulseConfig.getBool('currentdisplay.displaycncvalue', true);

    if (addProductionMachining) {
      $('x-productionmachiningstatus').show();
    }
    else {
      $('x-productionmachiningstatus').hide();
    }
    if (displayJob) { // == LastWorkinformation
      $('x-lastworkinformation').show();
    }
    else {
      $('x-lastworkinformation').hide();
    }
    if (displayShift) {
      $('x-lastShift').show();
    }
    else {
      $('x-lastShift').hide();
    }
    if (displayCNCValue) {
      $('x-currentcncvalue').show();
    }
    else {
      $('x-currentcncvalue').hide();
    }

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
    // show reason bar == always -> idem for SHOW x-reasongroups - see below
    showBar = pulseConfig.getBool('showcoloredbar.cncvalue', false);
    if (showBar) {
      $('x-cncvaluebar').show();
      $('x-fieldlegends').show();
    }
    else {
      $('x-cncvaluebar').hide();
      $('x-fieldlegends').hide();
    }

    // Reason bar and x-reasongroups CAN be replaced by production state
    let showproductionbar = pulseConfig.getBool('showproductionbar', false);
    if (showproductionbar) {
      $('x-reasonslotbar').hide();
      $('x-reasongroups').hide();
      $('x-productionstatebar').show();
      $('x-productionstatelegends').show();
    }
    else {
      $('x-reasonslotbar').show();
      $('x-reasongroups').show();
      $('x-productionstatebar').hide();
      $('x-productionstatelegends').hide();
    }

    // $('x-datetimegraduation').load(); // DTG can not manage resize when hidden
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new RunningPage());

  $('x-datetimegraduation').load(); // DTG can not manage resize when hidden
});
