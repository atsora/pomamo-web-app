// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseUtility = require('pulseUtility');
var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-groupsingroup/x-groupsingroup');

require('x-periodmanager/x-periodmanager');
require('x-ancestors/x-ancestors');
require('x-machinedisplay/x-machinedisplay');
require('x-productiontrackertable/x-productiontrackertable');
require('x-zoominpagebutton/x-zoominpagebutton');
require('x-showrunningdialogbutton/x-showrunningdialogbutton');
require('x-tr/x-tr');

class ProductionTrackerPage extends pulsePage.BasePage {
  constructor() {
    super();

    this.canConfigureColumns = false;
    this.canConfigureRows = false;
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  // CONFIG PANEL - Init
  initOptionValues() {
    var self = this;
    // Prepare custom inputs / Visibilities

    $('#thresholdtargetproduction').val(pulseConfig.getInt('thresholdtargetproduction'));
    var changetarget = function () {
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
        // Store
        if (pulseUtility.isInteger($('#thresholdtargetproduction').val())) {
          // Display / Dispatch
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdtargetproduction' });
        }
      }
    };
    $('#thresholdtargetproduction').bind('input', changetarget);
    $('#thresholdtargetproduction').change(changetarget);

    $('#thresholdredproduction').val(pulseConfig.getInt('thresholdredproduction'));
    var changeRed = function () {
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
        // Store
        if (pulseUtility.isInteger($('#thresholdredproduction').val())) {
          // Display / Dispatch
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdredproduction' });
        }
      }
    };
    $('#thresholdredproduction').bind('input', changeRed);
    $('#thresholdredproduction').change(changeRed);

    // showreservecapacity
    $('#showreservecapacity').prop('checked', pulseConfig.getBool('showreservecapacity'));
    if (pulseConfig.getDefaultBool('showreservecapacity') != pulseConfig.getBool('showreservecapacity')) {
      $('#showreservecapacity').attr('overridden', 'true');
    }
    $('#showreservecapacity').change(function () {
      pulseConfig.set('showreservecapacity', $('#showreservecapacity').is(':checked'));

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'showreservecapacity' });
    });

  }

  _verficationThresholds(targetValue, redValue) {
    // Find or create error message element
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      document.querySelector('.thresholdunitispart').appendChild(errorMessage);
    }

    // Check if values are valid numbers
    if (isNaN(redValue) || isNaN(targetValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdNaNError', 'Threshold values must be valid numbers');
      errorMessage.style.display = 'block';
      return false;
    }


    // values between 0 and 100
    if (redValue < 0 || targetValue <= 0) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Threshold values must be positive');
      errorMessage.style.display = 'block';
      return false;
    }

    // In percentage mode: target > red (normal logic)
    if (Number(targetValue) <= Number(redValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdError', 'Target threshold must be greater than red threshold');
      errorMessage.style.display = 'block';
      return false;
    }

    // Percentage cannot exceed 100
    if (redValue > 100 || targetValue > 100) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdMaxError', 'Percentage values cannot exceed 100');
      errorMessage.style.display = 'block';
      return false;
    }

    pulseConfig.set('thresholdtargetproduction', parseFloat(targetValue));
    pulseConfig.set('thresholdredproduction', parseFloat(redValue));

    errorMessage.style.display = 'none';

    eventBus.EventBus.dispatchToAll('configChangeEvent',
      {
        config: 'thresholdsupdated'
      });

    return true;
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    $('#thresholdtargetproduction').val(pulseConfig.getDefaultInt('thresholdtargetproduction'));
    $('#thresholdtargetproduction').change();
    $('#thresholdtargetproduction').removeAttr('overridden');

    $('#thresholdredproduction').val(pulseConfig.getDefaultInt('thresholdredproduction'));
    $('#thresholdredproduction').change();
    $('#thresholdredproduction').removeAttr('overridden');

    // showreservecapacity
    $('#showreservecapacity').prop('checked', pulseConfig.getDefaultBool('showreservecapacity'));
    $('#showreservecapacity').change();
    $('#showreservecapacity').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    let optionsValues = '';


    if (pulseUtility.isInteger($('#thresholdtargetproduction').val())) {
      optionsValues += '&thresholdtargetproduction=' + $('#thresholdtargetproduction').val();
    }
    if (pulseUtility.isInteger($('#thresholdredproduction').val())) {
      optionsValues += '&thresholdredproduction=' + $('#thresholdredproduction').val();
    }

    // showreservecapacity
    if ($('#showreservecapacity').is(':checked')) {
      optionsValues += '&showreservecapacity=true';
    }
    else {
      optionsValues += '&showreservecapacity=false';
    }

    return optionsValues;
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
  pulsePage.preparePage(new ProductionTrackerPage());
});
