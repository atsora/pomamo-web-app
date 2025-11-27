// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulsePage = require('pulsePage');
var pulseConfig = require('pulseConfig');
var eventBus = require('eventBus');

require('x-tr/x-tr');
require('x-periodmanager/x-periodmanager');
require('x-grouparray/x-grouparray');
require('x-machinedisplay/x-machinedisplay');
require('x-reasonbutton/x-reasonbutton');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-production/x-production');
require('x-productionshiftgoal/x-productionshiftgoal');
require('x-productiongauge/x-productiongauge');



class TrsViewPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  buildContent() {

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

  initOptionValues() {
    // Display mode: percent or ratio
    this._productionGaugeDisplayMode();

    // Thresholds
    const thresholdTarget = document.getElementById('thresholdtargetproductiongauge');
    const thresholdRedInput = document.getElementById('thresholdredproductiongauge');

    thresholdTarget.value = pulseConfig.getFloat('thresholdorangeproduction', 80);
    thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction', 60);

    if (pulseConfig.getDefaultFloat('thresholdorangeproduction') !== pulseConfig.getFloat('thresholdorangeproduction')) {
      thresholdTarget.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat('thresholdredproduction') !== pulseConfig.getFloat('thresholdredproduction')) {
      thresholdRedInput.setAttribute('overridden', 'true');
    }

    thresholdTarget.addEventListener('change', function () {
      this._verficationThresholds(thresholdTarget.value, thresholdRedInput.value, true)
    }.bind(this));

    thresholdRedInput.addEventListener('change', function () {
      this._verficationThresholds(thresholdTarget.value, thresholdRedInput.value, true)
    }.bind(this));
  }

  // Initialize the production gauge display mode radios
  _productionGaugeDisplayMode() {
    const showPercentRadio = document.getElementById('productiongaugepercent');
    const showRatioRadio = document.getElementById('productiongaugeratio');

    if (pulseConfig.getBool('productiongauge.showpercent')) {
      showPercentRadio.checked = true;
    } else {
      showRatioRadio.checked = true;
    }

    if (pulseConfig.getDefaultBool('productiongauge.showpercent') !== pulseConfig.getBool('productiongauge.showpercent')) {
      showPercentRadio.setAttribute('overridden', 'true');
      showRatioRadio.setAttribute('overridden', 'true');
    }

    showPercentRadio.addEventListener('change', function () {
      if (showPercentRadio.checked) {
        pulseConfig.set('productiongauge.showpercent', true);
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'percent');
        });
      }
    });

    showRatioRadio.addEventListener('change', function () {
      if (showRatioRadio.checked) {
        pulseConfig.set('productiongauge.showpercent', false);
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'ratio');
        });
      }
    });
  }

  // Verify threshold values
  _verficationThresholds(targetValue, redValue) {
    // Find or create error message element
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      document.querySelector('.showproductiongaugedetails').appendChild(errorMessage);
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

    // store values
    pulseConfig.set('thresholdorangeproduction', parseFloat(targetValue));
    pulseConfig.set('thresholdredproduction', parseFloat(redValue));

    errorMessage.style.display = 'none';

    // Dispatch to update displays
    eventBus.EventBus.dispatchToAll('configChangeEvent',
      {
        config: 'thresholdsupdated'
      });

    return true;
  }

  setDefaultOptionValues() {
    const showPercentRadio = document.getElementById('productiongaugepercent');
    const showRatioRadio = document.getElementById('productiongaugeratio');
    if (pulseConfig.getDefaultBool('productiongauge.showpercent')) {
      showPercentRadio.checked = true;
      showPercentRadio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      showRatioRadio.checked = true;
      showRatioRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    showPercentRadio.removeAttribute('overridden');
    showRatioRadio.removeAttribute('overridden');

    const thresholdTarget = document.getElementById('thresholdtargetproductiongauge');
    const thresholdRedInput = document.getElementById('thresholdredproductiongauge');

    thresholdTarget.value = pulseConfig.getDefaultFloat('thresholdorangeproduction', 80);
    thresholdRedInput.value = pulseConfig.getDefaultFloat('thresholdredproduction', 60);

    thresholdTarget.dispatchEvent(new Event('change', { bubbles: true }));
    thresholdRedInput.dispatchEvent(new Event('change', { bubbles: true }));

    thresholdTarget.removeAttribute('overridden');
    thresholdRedInput.removeAttribute('overridden');
  }

  getOptionValues() {
    let optionsValues = '';

    const showPercentRadio = document.getElementById('productiongaugepercent');
    if (showPercentRadio.checked) {
      optionsValues += '&productiongauge.showpercent=true';
    } else {
      optionsValues += '&productiongauge.showpercent=false';
    }

    const thresholdTarget = document.getElementById('thresholdtargetproductiongauge');
    const thresholdRedInput = document.getElementById('thresholdredproductiongauge');

    optionsValues += '&productiongauge.target=' + thresholdTarget.value;
    optionsValues += '&productiongauge.red=' + thresholdRedInput.value;

    return optionsValues;
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new TrsViewPage());
});