// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulsePage = require('pulsePage');
var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
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
require('x-periodtoolbar/x-periodtoolbar');
require('x-workinfo/x-workinfo');



class OeeViewPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  buildContent() {
    this._updateComponents(true);
    let showPeriodToolBar = pulseConfig.getBool('showPeriodtoolbar');

    if (showPeriodToolBar) {
      const container = document.getElementsByClassName('main-table-box')[0];

      const periodToolBar = document.createElement('x-periodtoolbar');
      periodToolBar.setAttribute('period-context', 'oeeview');
      periodToolBar.setAttribute('displayshiftrange', true);

      eventBus.EventBus.removeEventListenerBySignal(this, 'dateTimeRangeChangeEvent');
      eventBus.EventBus.addEventListener(this,
        'dateTimeRangeChangeEvent',
        'oeeview',
        this._onDateTimeRangeChange.bind(this));

      const groupArray = container.querySelector('x-grouparray');
      container.insertBefore(periodToolBar, groupArray);
    }
  }

  _onDateTimeRangeChange(event) {
    let newRange = event.target.daterange;
    if (!newRange._lower || !newRange._upper) return false;

    const now = new Date();

    const isIncluded = now >= newRange._lower && now < newRange._upper;

    this._updateComponents(isIncluded);
  }

  _updateComponents(isNowIncluded) {
    document.querySelectorAll('x-productionshiftgoal').forEach(el => {
      if (isNowIncluded) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
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
    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');

    thresholdTarget.value = pulseConfig.getFloat('thresholdtargetproduction', 80);
    thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction', 60);

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

    // showworkinfo = Show Operation
    document.getElementById('showworkinfo').checked = pulseConfig.getBool('showworkinfo');
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      document.getElementById('showworkinfo').setAttribute('overridden', 'true');
    }
    document.getElementById('showworkinfo').addEventListener('change', function () {
      pulseConfig.set('showworkinfo', document.getElementById('showworkinfo').checked);

      let showworkinfo = pulseConfig.getBool('showworkinfo');

      if (showworkinfo) {
        document.querySelectorAll('x-workinfo').forEach(el => {
          el.style.display = '';
        });
      } else {
        document.querySelectorAll('x-workinfo').forEach(el => {
          el.style.display = 'none';
        });
      }
    });
    document.getElementById('showworkinfo').dispatchEvent(new Event('change'));
  }

  // Initialize the production gauge display mode radios
  _productionGaugeDisplayMode() {
    const showPercentRadio = document.getElementById('productiongaugepercent');
    const showRatioRadio = document.getElementById('productiongaugeratio');

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
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'percent');
        });
      }
    });

    showRatioRadio.addEventListener('change', function () {
      if (showRatioRadio.checked) {
        pulseConfig.set('showpercent', false);
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
      const errorContainer = document.querySelector('.thresholdunitispart')
        || document.querySelector('.showproductiongaugedetails');
      if (errorContainer) {
        errorContainer.appendChild(errorMessage);
      }
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
    const showPercentRadio = document.getElementById('productiongaugepercent');
    const showRatioRadio = document.getElementById('productiongaugeratio');
    if (pulseConfig.getDefaultBool('showpercent')) {
      showPercentRadio.checked = true;
      showRatioRadio.checked = false;
      showPercentRadio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      showPercentRadio.checked = false;
      showRatioRadio.checked = true;
      showRatioRadio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    showPercentRadio.removeAttribute('overridden');
    showRatioRadio.removeAttribute('overridden');

    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');

    thresholdTarget.value = pulseConfig.getDefaultFloat('thresholdtargetproduction', 80);
    thresholdRedInput.value = pulseConfig.getDefaultFloat('thresholdredproduction', 60);

    thresholdTarget.dispatchEvent(new Event('change', { bubbles: true }));
    thresholdRedInput.dispatchEvent(new Event('change', { bubbles: true }));

    thresholdTarget.removeAttribute('overridden');
    thresholdRedInput.removeAttribute('overridden');

    // showworkinfo = Show Operation
    const showworkinfoCheckbox = document.getElementById('showworkinfo');
    if (pulseConfig.getDefaultBool('showworkinfo')) {
      showworkinfoCheckbox.checked = true;
    } else {
      showworkinfoCheckbox.checked = false;
    }
    showworkinfoCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
    showworkinfoCheckbox.removeAttribute('overridden');
  }

  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'productiongaugepercent', type: 'radio', param: 'showpercent' },
      { id: 'thresholdtargetproductionbar', type: 'value', param: 'productiongauge.target' },
      { id: 'thresholdredproductionbar', type: 'value', param: 'productiongauge.red' },
      { id: 'showworkinfo', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';

      const paramName = opt.param || opt.id;
      if (opt.type === 'checkbox' || opt.type === 'radio') {
        return `&${paramName}=${el.checked}`;
      } else {
        return `&${paramName}=${el.value}`;
      }
    }).join('');
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new OeeViewPage());
});
