// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');
var pulseUtility = require('pulseUtility');

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
require('x-defaultpie/x-defaultpie');
require('x-motionpercentage/x-motionpercentage');
require('x-scrapstatus/x-scrapstatus');
require('x-periodmanager/x-periodmanager');
require('x-productionbar/x-productionbar');
require('x-productiongauge/x-productiongauge');

class OperatorDashboardPage extends pulsePage.BasePage {
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
    const updateChronologyMargin = () => {
      const changedToolsVisible = document.querySelector('.changedtools-content') &&
        getComputedStyle(document.querySelector('.changedtools-content')).display !== 'none';
    };

    this._showOption('showChangedTools', function () {
      document.querySelector('.changedtools-content').style.display = 'flex';
      updateChronologyMargin();
    },
      function () {
        document.querySelector('.changedtools-content').style.display = 'none';
        updateChronologyMargin();
      });

    window.addEventListener('resize', updateChronologyMargin);


    // Open stop classification
    this._showOption('openStopClassification', this._createOpenStopClassificationListener, this._deleteOpenStopClassificationListener);

    // Stop classification reopen delay
    this._reopenStopClassificationDelay();


    // Production bar options
    this._showOption('showproductionbar',
      function () {
        const barElements = document.querySelectorAll('#performance-container');
        barElements.forEach(el => el.style.display = 'flex');
        document.querySelector('.showproductionbardetails').style.display = 'block';
      },
      function () {
        const barElements = document.querySelectorAll('#performance-container');
        barElements.forEach(el => el.style.display = 'none');
        document.querySelector('.showproductionbardetails').style.display = 'none';
      });

    // Display mode: percent or ratio
    this._productionBarDisplayMode();

    // Show/hide production display
    this._showOption('showproductiondisplay',
      function () {
        document.querySelector('.showproductiondisplaydetails').style.display = 'block';
        // Trigger the currently selected radio to apply its display logic
        const gaugeRadio = document.getElementById('productiongauge');
        const pieRadio = document.getElementById('productionpie');
        if (gaugeRadio.checked) {
          gaugeRadio.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (pieRadio.checked) {
          pieRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      },
      function () {
        document.querySelector('.showproductiondisplaydetails').style.display = 'none';
        // Hide both components
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.style.display = 'none';
        });
        document.querySelectorAll('x-defaultpie').forEach(el => {
          el.style.display = 'none';
        });
      });

    // Production display type: gauge or pie
    this._productionDisplayType();

    // Thresholds
    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');

    thresholdTarget.value = pulseConfig.getFloat('thresholdtargetproduction');
    thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction');

    if (pulseConfig.getDefaultFloat('thresholdtargetproduction') !== pulseConfig.getFloat('thresholdtargetproduction')) {
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

  // Initialize the production bar display mode radios
  _productionBarDisplayMode() {
    const showPercentRadio = document.getElementById('productionbarpercent');
    const showRatioRadio = document.getElementById('productionbarratio');

    if (pulseConfig.getBool('showpercent')) {
      showPercentRadio.checked = true;
    } else {
      showRatioRadio.checked = true;
    }

    if (pulseConfig.getDefaultBool('showpercent') !== pulseConfig.getBool('showpercent')) {
      showPercentRadio.setAttribute('overridden', 'true');
      showRatioRadio.setAttribute('overridden', 'true');
    }

    showPercentRadio.addEventListener('change', function () {
      if (showPercentRadio.checked) {
        pulseConfig.set('showpercent', true);
        document.querySelectorAll('x-productionbar').forEach(el => {
          el.setAttribute('display-mode', 'percent');
        });
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'percent');
        });
      }
    });

    showRatioRadio.addEventListener('change', function () {
      if (showRatioRadio.checked) {
        pulseConfig.set('showpercent', false);
        document.querySelectorAll('x-productionbar').forEach(el => {
          el.setAttribute('display-mode', 'ratio');
        });
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'ratio');
        });
      }
    });
  }

  // Initialize the production display type radios (gauge vs pie)
  _productionDisplayType() {
    const showGaugeRadio = document.getElementById('productiongauge');
    const showPieRadio = document.getElementById('productionpie');

    if (pulseConfig.getBool('showproductiongauge')) {
      showGaugeRadio.checked = true;
    } else {
      showPieRadio.checked = true;
    }

    if (pulseConfig.getDefaultBool('showproductiongauge') !== pulseConfig.getBool('showproductiongauge')) {
      showGaugeRadio.setAttribute('overridden', 'true');
      showPieRadio.setAttribute('overridden', 'true');
    }

    showGaugeRadio.addEventListener('change', function () {
      if (showGaugeRadio.checked) {
        pulseConfig.set('showproductiongauge', true);
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.style.display = 'block';
        });
        document.querySelectorAll('x-defaultpie').forEach(el => {
          el.style.display = 'none';
        });
      }
    });

    showPieRadio.addEventListener('change', function () {
      if (showPieRadio.checked) {
        pulseConfig.set('showproductiongauge', false);
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.style.display = 'none';
        });
        document.querySelectorAll('x-defaultpie').forEach(el => {
          el.style.display = 'block';
        });
      }
    });

    // Apply initial state based on options
    const showProductionDisplayCheckbox = document.getElementById('showproductiondisplay');
    if (showProductionDisplayCheckbox && showProductionDisplayCheckbox.checked) {
      if (showGaugeRadio.checked) {
        showGaugeRadio.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        showPieRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      document.querySelectorAll('x-productiongauge').forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll('x-defaultpie').forEach(el => {
        el.style.display = 'none';
      });
    }
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
      document.querySelector('.showproductionbardetails').appendChild(errorMessage);
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

    // store values
    pulseConfig.set('thresholdtargetproduction', parseFloat(targetValue));
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

    // Production bar
    const showProductionBarCheckbox = document.getElementById('showproductionbar');
    showProductionBarCheckbox.checked = pulseConfig.getDefaultBool('showproductionbar');
    showProductionBarCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    showProductionBarCheckbox.removeAttribute('overridden');

    const showPercentRadio = document.getElementById('productionbarpercent');
    const showRatioRadio = document.getElementById('productionbarratio');
    if (pulseConfig.getDefaultBool('showpercent')) {
      showPercentRadio.checked = true;
      showPercentRadio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      showRatioRadio.checked = true;
      showRatioRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    showPercentRadio.removeAttribute('overridden');
    showRatioRadio.removeAttribute('overridden');

    // Show production display
    const showProductionDisplayCheckbox = document.getElementById('showproductiondisplay');
    showProductionDisplayCheckbox.checked = pulseConfig.getDefaultBool('showproductiondisplay');
    showProductionDisplayCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    showProductionDisplayCheckbox.removeAttribute('overridden');

    // Production display type
    const showGaugeRadio = document.getElementById('productiongauge');
    const showPieRadio = document.getElementById('productionpie');
    if (pulseConfig.getDefaultBool('showproductiongauge')) {
      showGaugeRadio.checked = true;
      showGaugeRadio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      showPieRadio.checked = true;
      showPieRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    showGaugeRadio.removeAttribute('overridden');
    showPieRadio.removeAttribute('overridden');

    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');

    thresholdTarget.value = pulseConfig.getDefaultFloat('thresholdtargetproduction');
    thresholdRedInput.value = pulseConfig.getDefaultFloat('thresholdredproduction');

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

    // Production bar
    const showProductionBarCheckbox = document.getElementById('showproductionbar');
    if (showProductionBarCheckbox.checked) {
      optionsValues += '&showproductionbar=true';
    } else {
      optionsValues += '&showproductionbar=false';
    }

    const showPercentRadio = document.getElementById('productionbarpercent');
    if (showPercentRadio.checked) {
      optionsValues += '&showpercent=true';
    } else {
      optionsValues += '&showpercent=false';
    }

    // Show production display
    const showProductionDisplayCheckbox = document.getElementById('showproductiondisplay');
    if (showProductionDisplayCheckbox.checked) {
      optionsValues += '&showproductiondisplay=true';
    } else {
      optionsValues += '&showproductiondisplay=false';
    }

    // Production display type
    const showGaugeRadio = document.getElementById('productiongauge');
    if (showGaugeRadio.checked) {
      optionsValues += '&showproductiongauge=true';
    } else {
      optionsValues += '&showproductiongauge=false';
    }

    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');

    optionsValues += '&target=' + thresholdTarget.value;
    optionsValues += '&red=' + thresholdRedInput.value;
    return optionsValues;
  }

  buildContent() {
    // URL parameters
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

    document.querySelectorAll('.periodtoolbar-toolbar').forEach(el => {
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
  pulsePage.preparePage(new OperatorDashboardPage());
});
