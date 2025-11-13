// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouparray/x-grouparray');
require('x-machinetab/x-machinetab');
require('x-machinedisplay/x-machinedisplay');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-datetimegraduation/x-datetimegraduation');
require('x-operationcyclebar/x-operationcyclebar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-cncalarmbar/x-cncalarmbar');
require('x-redstacklightbar/x-redstacklightbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-isofileslotbar/x-isofileslotbar');
require('x-toollifemachine/x-toollifemachine');
require('x-productiontrackergraph/x-productiontrackergraph');
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');
require('x-productionshiftgoal/x-productionshiftgoal');
require('x-workinfo/x-workinfo');
require('x-production/x-production');
require('x-tr/x-tr');
require('x-openstopclassificationlistener/x-openstopclassificationlistener');
require('x-productiongauge/x-productiongauge');
require('x-scrapstatus/x-scrapstatus');

class MachinesDetailsPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
    this.canConfigureRows = false;
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

  // Initialize an option checkbox
  _showOption(option, functionCheck, functionUncheck) {
    const checkbox = document.getElementById(option);
    checkbox.checked = pulseConfig.getBool(option);
    if (pulseConfig.getDefaultBool(option) !== pulseConfig.getBool(option)) {
      checkbox.setAttribute('overridden', 'true');
    }

    checkbox.addEventListener('change', function (event) {
      pulseConfig.set(option, checkbox.checked);
      if (functionCheck && event.target.checked) {
        functionCheck();
      }
      else if (functionUncheck) {
        functionUncheck();
      }
    })
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  initOptionValues() {
    // Show changed tools
    this._showOption('showChangedTools', function () {
      document.querySelector('.changedtools-content').style.display = 'block';
    },
      function () {
        document.querySelector('.changedtools-content').style.display = 'none';
      });


    // Open stop classification
    this._showOption('openStopClassification', this._createOpenStopClassificationListener, this._deleteOpenStopClassificationListener);

    // Stop classification reopen delay
    this._reopenStopClassificationDelay();


    // Production gauge options
    this._showOption('showproductiongauge',
      function () {
        const gaugeElements = document.querySelectorAll('.performance-content');
        gaugeElements.forEach(el => el.style.display = 'flex');
        document.querySelector('.showproductiongaugedetails').style.display = 'block';
      },
      function () {
        const gaugeElements = document.querySelectorAll('.performance-content');
        gaugeElements.forEach(el => el.style.display = 'none');
        document.querySelector('.showproductiongaugedetails').style.display = 'none';
      });

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

  // Create the open stop classification listener element
  _createOpenStopClassificationListener() {
    document.querySelector('.openStopClassificationDetails').style.display = 'block';
    const container = document.body || document.documentElement;
    let existing = container.querySelector('x-openstopclassificationlistener');
    if (!existing) {
      let listener = document.createElement('x-openstopclassificationlistener');
      listener.setAttribute('machine-context', 'PulseWebApp');
      listener.setAttribute('period-context', 'operatordashboard');
      listener.setAttribute('status-context', 'PulseWebApp');
      container.appendChild(listener);
    }
  }

  // Delete the open stop classification listener element
  _deleteOpenStopClassificationListener() {
    document.querySelector('.openStopClassificationDetails').style.display = 'none';
    const container = document.body || document.documentElement;
    let existing = container.querySelector('x-openstopclassificationlistener');
    if (existing) {
      existing.remove();
    }
  }

  // Initialize the reopen stop classification delay input
  _reopenStopClassificationDelay() {
    const stopClassificationReopenDelayInput = document.getElementById('stopClassificationReopenDelay');
    stopClassificationReopenDelayInput.value = pulseConfig.getInt('stopClassificationReopenDelay', 5);
    if (pulseConfig.getDefaultInt('stopClassificationReopenDelay') !== pulseConfig.getInt('stopClassificationReopenDelay')) {
      stopClassificationReopenDelayInput.setAttribute('overridden', 'true');
    }
    stopClassificationReopenDelayInput.addEventListener('change', function () {
      const value = parseInt(stopClassificationReopenDelayInput.value);
      if (!isNaN(value) && value >= 0) {
        pulseConfig.set('stopClassificationReopenDelay', value);
      }
    });
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
    const showChangedToolsCheckbox = document.getElementById('showChangedTools');
    showChangedToolsCheckbox.checked = pulseConfig.getDefaultBool('showChangedTools');
    showChangedToolsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    showChangedToolsCheckbox.removeAttribute('overridden');

    const openStopClassificationCheckbox = document.getElementById('openStopClassification');
    openStopClassificationCheckbox.checked = pulseConfig.getDefaultBool('openStopClassification');
    openStopClassificationCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    openStopClassificationCheckbox.removeAttribute('overridden');

    const stopClassificationReopenDelayInput = document.getElementById('stopClassificationReopenDelay');
    stopClassificationReopenDelayInput.value = pulseConfig.getDefaultInt('stopClassificationReopenDelay', 0);
    stopClassificationReopenDelayInput.dispatchEvent(new Event('change', { bubbles: true }));
    stopClassificationReopenDelayInput.removeAttribute('overridden');

    // Production gauge
    const showProductionGaugeCheckbox = document.getElementById('showproductiongauge');
    showProductionGaugeCheckbox.checked = pulseConfig.getDefaultBool('showproductiongauge');
    showProductionGaugeCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    showProductionGaugeCheckbox.removeAttribute('overridden');

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

    // showChangedTools
    const showChangedToolsCheckbox = document.getElementById('showChangedTools');
    if (showChangedToolsCheckbox.checked) {
      optionsValues += '&showChangedTools=true';
    } else {
      optionsValues += '&showChangedTools=false';
    }

    // Open stop classification
    const openStopClassificationCheckbox = document.getElementById('openStopClassification');
    if (openStopClassificationCheckbox.checked) {
      optionsValues += '&openStopClassification=true';
    } else {
      optionsValues += '&openStopClassification=false';
    }

    // Stop classification reopen delay
    const stopClassificationReopenDelayInput = document.getElementById('stopClassificationReopenDelay');
    optionsValues += '&stopClassificationReopenDelay=' + stopClassificationReopenDelayInput.value;

    // Production gauge
    const showProductionGaugeCheckbox = document.getElementById('showproductiongauge');
    if (showProductionGaugeCheckbox.checked) {
      optionsValues += '&showproductiongauge=true';
    } else {
      optionsValues += '&showproductiongauge=false';
    }

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

  buildContent() {
    // show Bars
    let showBar = pulseConfig.getBool('showcoloredbar.cycle', false);
    if (showBar) {
      $('x-operationcyclebar').show();
    }
    else {
      $('x-operationcyclebar').hide();
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

    document.querySelectorAll('.periodtoolbar-li-btn').forEach(el => {
      el.classList.add('border');
    });

    document.querySelectorAll('.periodtoolbar-li-text').forEach(el => {
      el.classList.add('border');
    });

    document.querySelectorAll('.pulse-cellbar-past-data').forEach(el => {
      el.classList.add('border');
    });

    document.querySelectorAll('.productionshiftgoal-data').forEach(el => {
      el.classList.add('number-content');
    });

  }

}

$(document).ready(function () {
  pulsePage.preparePage(new MachinesDetailsPage());
});