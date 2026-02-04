// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouparray/x-grouparray');
require('x-machinedisplay/x-machinedisplay');
require('x-toollifemachine/x-toollifemachine');
require('x-tr/x-tr');

class ToolLifePage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
    pulseConfig.set('column', '');
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    // TOOLS detail
    let toollabelname = pulseConfig.getString('toollifemachine.toollabelname');
    $('#showtoolselector').empty();
    let toollabelsselections = pulseConfig.getArray('toollifemachine.toollabelsselections');
    for (let iTool = 0; iTool < toollabelsselections.length; iTool++) {
      let label = toollabelsselections[iTool];
      $('#showtoolselector').append('<option id="tool-' + label.name + '" value="' + label.name + '">' + label.display + '</option>');
    }
    // Set selection
    $('#showtoolselector').val(toollabelname);

    $('#showtoolselector').change(function () {
      let toollabelname = $('#showtoolselector').val();
      // Store
      pulseConfig.set('toollabelname', String(toollabelname));
      // Display = dispatch message
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'toollabelname' });
    });

    // TOOLS remaining
    $('#showtoolremaining').prop('checked',
      pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'));
    if (pulseConfig.getDefaultBool('showbar')
      != pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'))
      $('#showtoolremaining').attr('overridden', 'true');
    $('#showtoolremaining').change(function () {
      let showtoolremaining = $('#showtoolremaining').is(':checked');
      // Store
      pulseConfig.set('displayremainingcyclesbelowtool', showtoolremaining);
      // Display / Dispatch
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayremainingcyclesbelowtool' });
    });
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';

    // TOOLS DETAILS
    let tmpVal = $('#showtoolselector').val();
    optionsValues += '&toollabelname=' + tmpVal;

    let showtoolremaining = $('#showtoolremaining').is(':checked');
    optionsValues += '&toollifemachine.displayremainingcyclesbelowtool=' + showtoolremaining;

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
        message: pulseConfig.pulseTranslate('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  buildContent () {
    // Remove config from displayed URL and store them
    // Remove config from displayed URL and store them
    let needReload = false;
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    params.forEach((value, key) => {
      needReload = true;
      pulseConfig.set(key, value);
      url.searchParams.delete(key);
    });

    if (needReload) {
      window.open(url.toString(), '_self');
    }
    // End remove config

  }
}

$(document).ready(function () {
  pulsePage.preparePage(new ToolLifePage());
});
