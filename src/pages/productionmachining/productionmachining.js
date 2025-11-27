// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');
var pulseUtility = require('pulseUtility');

require('x-grouparray/x-grouparray');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-machinedisplay/x-machinedisplay');
require('x-tr/x-tr');

class ProductionMachiningPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
  }

  initOptionValues() {
    var self = this;
    // Prepare custom inputs / Visibilities

    $('#thresholdorangeproduction').val(pulseConfig.getInt('thresholdorangeproduction'));
    var changeOrange = function () {
      if (self._verficationThresholds($('#thresholdorangeproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
        // Store
        if (pulseUtility.isInteger($('#thresholdorangeproduction').val())) {
          // Display / Dispatch
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdorangeproduction' });
        }
      }
    };
    $('#thresholdorangeproduction').bind('input', changeOrange);
    $('#thresholdorangeproduction').change(changeOrange);

    $('#thresholdredproduction').val(pulseConfig.getInt('thresholdredproduction'));
    var changeRed = function () {
      if (self._verficationThresholds($('#thresholdorangeproduction').val(), $('#thresholdredproduction').val())) {
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

    // In percentage mode: orange > red (normal logic)
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

    pulseConfig.set('thresholdorangeproduction', parseFloat(targetValue));
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
    $('#thresholdorangeproduction').val(pulseConfig.getDefaultInt('thresholdorangeproduction'));
    $('#thresholdorangeproduction').change();
    $('#thresholdorangeproduction').removeAttr('overridden');

    $('#thresholdredproduction').val(pulseConfig.getDefaultInt('thresholdredproduction'));
    $('#thresholdredproduction').change();
    $('#thresholdredproduction').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    let optionsValues = '';


    if (pulseUtility.isInteger($('#thresholdorangeproduction').val())) {
      optionsValues += '&thresholdorangeproduction=' + $('#thresholdorangeproduction').val();
    }
    if (pulseUtility.isInteger($('#thresholdredproduction').val())) {
      optionsValues += '&thresholdredproduction=' + $('#thresholdredproduction').val();
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
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new ProductionMachiningPage());
});
