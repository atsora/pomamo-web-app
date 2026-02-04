// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-groupsingroup/x-groupsingroup');

require('x-chartreservecapacity/x-chartreservecapacity');

class ReserveCapacityPage extends pulsePage.BasePage {
  constructor() {
    super();

    this.canConfigureColumns = false;
    this.canConfigureRows = false;
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    // Check - minchart
    let minchartvalue = pulseConfig.get('minchartvalue');
    $('#minchartcheck').change(function () {
      let useMinChart = $('#minchartcheck').is(':checked');
      // Show / Hide linked config + Store
      if (useMinChart) {
        $('#minchartvalue').show();
        // Store
        let minchartvalue = $('#minchartvalue').val();
        if ((undefined == minchartvalue) || ('' == minchartvalue)) {
          minchartvalue = pulseConfig.getDefault('minchartvalue');
          if ((undefined == minchartvalue) || ('' == minchartvalue)) {
            minchartvalue = -70;
          }
          $('#minchartvalue').val(minchartvalue);
        }
        pulseConfig.set('minchartvalue', minchartvalue);
      }
      else {
        $('#minchartvalue').hide();
        // Store
        pulseConfig.set('minchartvalue', '');
      }

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'minchartvalue' });
    });
    if ((undefined == minchartvalue) || ('' == minchartvalue)) {
      $('#minchartcheck').prop('checked', false);
      //$('#minchartvalue').val(default); -> Not useful
    }
    else {
      $('#minchartcheck').prop('checked', true);
      $('#minchartvalue').val(minchartvalue);
    }
    $('#minchartcheck').change();

    // Value - minchart
    /*if ('' != minchartvalue) { // Already done before
      $('#minchartvalue').val(pulseConfig.getInt('minchartvalue'));
    }*/
    var changeMin = function () {
      let minchartvalue = $('#minchartvalue').val();
      // Store
      pulseConfig.set('minchartvalue', minchartvalue);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'minchartvalue' });
    };
    $('#minchartvalue').bind('input', changeMin);
    $('#minchartvalue').change(changeMin);


    // Check - maxchart
    let maxchartvalue = pulseConfig.get('maxchartvalue');
    $('#maxchartcheck').change(function () {
      let useMaxChart = $('#maxchartcheck').is(':checked');
      // Show / Hide linked config + Store
      if (useMaxChart) {
        $('#maxchartvalue').show();
        // Store
        let maxchartvalue = $('#maxchartvalue').val();
        if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
          maxchartvalue = pulseConfig.getDefault('maxchartvalue');
          if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
            maxchartvalue = 30;
          }
          $('#maxchartvalue').val(maxchartvalue);
        }
        pulseConfig.set('maxchartvalue', maxchartvalue);
      }
      else {
        $('#maxchartvalue').hide();
        // Store
        pulseConfig.set('maxchartvalue', '');
      }

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'maxchartvalue' });
    });
    if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
      $('#maxchartcheck').prop('checked', false);
      //$('#maxchartvalue').val(default); -> not useful
    }
    else {
      $('#maxchartcheck').prop('checked', true);
      $('#maxchartvalue').val(maxchartvalue);
    }
    $('#maxchartcheck').change();

    // Value - maxchart
    /*if ('' != maxchartvalue) { // Already done before
      $('#maxchartvalue').val(pulseConfig.getInt('maxchartvalue'));
    }*/
    var changeMax = function () {
      let maxchartvalue = $('#maxchartvalue').val();
      // Store
      pulseConfig.set('maxchartvalue', maxchartvalue);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'maxchartvalue' });
    };
    $('#maxchartvalue').bind('input', changeMax);
    $('#maxchartvalue').change(changeMax);
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    // MinChart
    let minchartvalue = pulseConfig.getDefault('minchartvalue');
    if ((undefined == minchartvalue) || ('' == minchartvalue)) {
      $('#minchartcheck').prop('checked', false);
      //$('#minchartvalue').val(-70); // Not useful. Keep previous value
    }
    else {
      $('#minchartcheck').prop('checked', true);
      $('#minchartvalue').val(minchartvalue);
    }
    $('#minchartcheck').change();

    // MaxChart
    let maxchartvalue = pulseConfig.getDefault('maxchartvalue');
    if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
      $('#maxchartcheck').prop('checked', false);
      //$('#maxchartvalue').val(30); // Not useful. Keep previous value
    }
    else {
      $('#maxchartcheck').prop('checked', true);
      $('#maxchartvalue').val(maxchartvalue);
    }
    $('#maxchartcheck').change();
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';

    // Min
    if ($('#minchartcheck').is(':checked')) {
      optionsValues += '&minchartvalue=';
      if (pulseUtility.isInteger($('#minchartvalue').val())) {
        optionsValues += $('#minchartvalue').val();
      }
    }
    else {
      optionsValues += '&minchartvalue=';
    }

    // Max
    if ($('#maxchartcheck').is(':checked')) {
      optionsValues += '&maxchartvalue=';
      if (pulseUtility.isInteger($('#maxchartvalue').val())) {
        optionsValues += $('#maxchartvalue').val();
      }
    }
    else {
      optionsValues += '&maxchartvalue=';
    }

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
        message: pulseConfig.pulseTranslate ('error.machineRequired','Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  buildContent () {
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new ReserveCapacityPage());
});
