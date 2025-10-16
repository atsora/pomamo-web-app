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

  initOptionValues() {
    const showChangedToolsCheckbox = document.getElementById('showChangedTools');
    showChangedToolsCheckbox.checked = pulseConfig.getBool('showChangedTools');
    if (pulseConfig.getDefaultBool('showChangedTools') !== pulseConfig.getBool('showChangedTools')) {
      showChangedToolsCheckbox.setAttribute('overridden', 'true');
    }
    showChangedToolsCheckbox.addEventListener('change', function (event) {
      pulseConfig.set('showChangedTools', showChangedToolsCheckbox.checked);
      if (event.target.checked) {
        document.querySelector('.changedtools-content').style.display = 'block';
      } else {
        document.querySelector('.changedtools-content').style.display = 'none';
      }
    });

    showChangedToolsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    // Production gauge options
    const showProductionGaugeCheckbox = document.getElementById('showproductiongauge');
    showProductionGaugeCheckbox.checked = pulseConfig.getBool('productiongauge.showproductiongauge');
    if (pulseConfig.getDefaultBool('productiongauge.showproductiongauge') !== pulseConfig.getBool('productiongauge.showproductiongauge')) {
      showProductionGaugeCheckbox.setAttribute('overridden', 'true');
    }
    showProductionGaugeCheckbox.addEventListener('change', function (event) {
      pulseConfig.set('productiongauge.showproductiongauge', showProductionGaugeCheckbox.checked);
      const gaugeElements = document.querySelectorAll('.performance-content');
      if (event.target.checked) {
        gaugeElements.forEach(el => el.style.display = 'flex');
        document.querySelector('.showproductiongaugedetails').style.display = 'block';
      } else {
        gaugeElements.forEach(el => el.style.display = 'none');
        document.querySelector('.showproductiongaugedetails').style.display = 'none';
      }
    });

    // Display mode: percent or ratio
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

    // Thresholds
    const thresholdTarget = document.getElementById('thresholdtargetproductiongauge');
    const thresholdOrangeInput = document.getElementById('thresholdorangeproductiongauge');
    const thresholdRedInput = document.getElementById('thresholdredproductiongauge');
    const thresholdModePercentageRadio = document.getElementById('thresholdmodepercentage');
    const thresholdModePieceRadio = document.getElementById('thresholdmodepiece');

    thresholdTarget.value = pulseConfig.getFloat('productiongauge.target', 80);
    thresholdOrangeInput.value = pulseConfig.getFloat('productiongauge.orange', 80);
    thresholdRedInput.value = pulseConfig.getFloat('productiongauge.red', 50);
    
    // Threshold mode
    const thresholdMode = pulseConfig.get('productiongauge.thresholdmode', 'percentage');
    if (thresholdMode === 'piece') {
      thresholdModePieceRadio.checked = true;
    } else {
      thresholdModePercentageRadio.checked = true;
    }

    if (pulseConfig.getDefaultFloat('productiongauge.target') !== pulseConfig.getFloat('productiongauge.target')) {
      thresholdTarget.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat('productiongauge.orange') !== pulseConfig.getFloat('productiongauge.orange')) {
      thresholdOrangeInput.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat('productiongauge.red') !== pulseConfig.getFloat('productiongauge.red')) {
      thresholdRedInput.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefault('productiongauge.thresholdmode') !== pulseConfig.get('productiongauge.thresholdmode')) {
      thresholdModePercentageRadio.setAttribute('overridden', 'true');
      thresholdModePieceRadio.setAttribute('overridden', 'true');
    }

    // Validation function for thresholds
    const validateThresholds = function () {
      const targetValue = parseFloat(thresholdTarget.value);
      const orangeValue = parseFloat(thresholdOrangeInput.value);
      const redValue = parseFloat(thresholdRedInput.value);
      const thresholdMode = thresholdModePieceRadio.checked ? 'piece' : 'percentage';

      // Find or create error message element
      let errorMessage = document.getElementById('thresholdErrorMessage');
      if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.id = 'thresholdErrorMessage';
        errorMessage.style.color = 'red';
        errorMessage.style.fontSize = '0.9em';
        errorMessage.style.marginTop = '5px';
        thresholdRedInput.parentNode.parentNode.appendChild(errorMessage);
      }

      // Check if values are valid numbers
      if (isNaN(orangeValue) || isNaN(redValue) || isNaN(targetValue)) {
        errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdNaNError', 'Threshold values must be valid numbers');
        errorMessage.style.display = 'block';
        return false;
      }

      // Check if target is positive
      if (targetValue <= 0) {
        errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Target value must be positive');
        errorMessage.style.display = 'block';
        return false;
      }

      // Validation depends on mode
      if (thresholdMode === 'piece') {
        // Piece mode: orange and red cannot be negative
        if (orangeValue < 0 || redValue < 0) {
          errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Threshold values must be positive');
          errorMessage.style.display = 'block';
          return false;
        }
        
        // In piece mode: red > orange (inverted logic)
        // Example: target=10, orange=2 (applies at 8), red=5 (applies at 5)
        if (redValue <= orangeValue) {
          errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPieceError', 'In piece mode, red threshold must be greater than orange threshold');
          errorMessage.style.display = 'block';
          return false;
        }
        
        // Values cannot exceed target
        if (orangeValue > targetValue || redValue > targetValue) {
          errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdExceedTargetError', 'Threshold values cannot exceed target value');
          errorMessage.style.display = 'block';
          return false;
        }
      } else {
        // Percentage mode: values between 0 and 100
        if (orangeValue < 0 || redValue < 0) {
          errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Threshold values must be positive');
          errorMessage.style.display = 'block';
          return false;
        }
        
        // In percentage mode: orange > red (normal logic)
        if (orangeValue <= redValue) {
          errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdError', 'Orange threshold must be greater than red threshold');
          errorMessage.style.display = 'block';
          return false;
        }
        
        // Percentage cannot exceed 100
        if (orangeValue > 100 || redValue > 100 || targetValue > 100) {
          errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdMaxError', 'Percentage values cannot exceed 100');
          errorMessage.style.display = 'block';
          return false;
        }
      }
      
      errorMessage.style.display = 'none';
      return true;
    };

    thresholdModePercentageRadio.addEventListener('change', function () {
      if (thresholdModePercentageRadio.checked) {
        pulseConfig.set('productiongauge.thresholdmode', 'percentage');
        validateThresholds(); // Re-validate when mode changes
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'productiongauge' });
      }
    });

    thresholdModePieceRadio.addEventListener('change', function () {
      if (thresholdModePieceRadio.checked) {
        pulseConfig.set('productiongauge.thresholdmode', 'piece');
        validateThresholds(); // Re-validate when mode changes
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'productiongauge' });
      }
    });

    thresholdTarget.addEventListener('change', function () {
      if (validateThresholds()) {
        pulseConfig.set('productiongauge.target', parseFloat(thresholdTarget.value));
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'productiongauge' });
      }
    });

    thresholdOrangeInput.addEventListener('change', function () {
      if (validateThresholds()) {
        pulseConfig.set('productiongauge.orange', parseFloat(thresholdOrangeInput.value));
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'productiongauge' });
      }
    });

    thresholdRedInput.addEventListener('change', function () {
      if (validateThresholds()) {
        pulseConfig.set('productiongauge.red', parseFloat(thresholdRedInput.value));
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'productiongauge' });
      }
    });

    // Initial validation
    validateThresholds();



    showProductionGaugeCheckbox.dispatchEvent(new Event('change', { bubbles: true }));


  }

  setDefaultOptionValues() {
    const showChangedToolsCheckbox = document.getElementById('showChangedTools');
    showChangedToolsCheckbox.checked = pulseConfig.getDefaultBool('showChangedTools');
    showChangedToolsCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    showChangedToolsCheckbox.removeAttribute('overridden');

    // Production gauge
    const showProductionGaugeCheckbox = document.getElementById('showproductiongauge');
    showProductionGaugeCheckbox.checked = pulseConfig.getDefaultBool('productiongauge.showproductiongauge');
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
    const thresholdOrangeInput = document.getElementById('thresholdorangeproductiongauge');
    const thresholdRedInput = document.getElementById('thresholdredproductiongauge');
    const thresholdModePercentageRadio = document.getElementById('thresholdmodepercentage');
    const thresholdModePieceRadio = document.getElementById('thresholdmodepiece');
    
    thresholdTarget.value = pulseConfig.getDefaultFloat('productiongauge.target', 80);
    thresholdOrangeInput.value = pulseConfig.getDefaultFloat('productiongauge.orange', 80);
    thresholdRedInput.value = pulseConfig.getDefaultFloat('productiongauge.red', 50);
    
    const defaultThresholdMode = pulseConfig.getDefault('productiongauge.thresholdmode', 'percentage');
    if (defaultThresholdMode === 'piece') {
      thresholdModePieceRadio.checked = true;
      thresholdModePieceRadio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      thresholdModePercentageRadio.checked = true;
      thresholdModePercentageRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    thresholdTarget.dispatchEvent(new Event('change', { bubbles: true }));
    thresholdOrangeInput.dispatchEvent(new Event('change', { bubbles: true }));
    thresholdRedInput.dispatchEvent(new Event('change', { bubbles: true }));
    thresholdTarget.removeAttribute('overridden');
    thresholdOrangeInput.removeAttribute('overridden');
    thresholdRedInput.removeAttribute('overridden');
    thresholdModePercentageRadio.removeAttribute('overridden');
    thresholdModePieceRadio.removeAttribute('overridden');
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

    // Production gauge
    const showProductionGaugeCheckbox = document.getElementById('showproductiongauge');
    if (showProductionGaugeCheckbox.checked) {
      optionsValues += '&productiongauge.showproductiongauge=true';
    } else {
      optionsValues += '&productiongauge.showproductiongauge=false';
    }

    const showPercentRadio = document.getElementById('productiongaugepercent');
    if (showPercentRadio.checked) {
      optionsValues += '&productiongauge.showpercent=true';
    } else {
      optionsValues += '&productiongauge.showpercent=false';
    }

    const thresholdTarget = document.getElementById('thresholdtargetproductiongauge');
    const thresholdOrangeInput = document.getElementById('thresholdorangeproductiongauge');
    const thresholdRedInput = document.getElementById('thresholdredproductiongauge');
    const thresholdModePercentageRadio = document.getElementById('thresholdmodepercentage');
    const thresholdModePieceRadio = document.getElementById('thresholdmodepiece');
    
    optionsValues += '&productiongauge.target=' + thresholdTarget.value;
    optionsValues += '&productiongauge.orange=' + thresholdOrangeInput.value;
    optionsValues += '&productiongauge.red=' + thresholdRedInput.value;
    
    if (thresholdModePieceRadio.checked) {
      optionsValues += '&productiongauge.thresholdmode=piece';
    } else {
      optionsValues += '&productiongauge.thresholdmode=percentage';
    }

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

    if (pulseConfig.getDefaultBool('openStopClassification')) {
      // Install a headless listener component to open the dialog when needed
      const container = document.body || document.documentElement;
      // Remove any previous
      let existing = container.querySelector('x-openstopclassificationlistener');
      if (!existing) {
        let listener = document.createElement('x-openstopclassificationlistener');
        // Wire contexts so it receives the same machine and period signals
        listener.setAttribute('machine-context', 'PulseWebApp');
        listener.setAttribute('period-context', 'operatordashboard');
        listener.setAttribute('status-context', 'PulseWebApp');
        container.appendChild(listener);
      }
    }

  }

}

$(document).ready(function () {
  pulsePage.preparePage(new MachinesDetailsPage());
});