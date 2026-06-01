// Copyright (C) 2009-2023 Lemoine Automation Technologies
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
require('x-workinfo/x-workinfo');
require('x-defaultpie/x-defaultpie');
require('x-freetext/x-freetext');
require('x-zoominpagebutton/x-zoominpagebutton');
require('x-showrunningdialogbutton/x-showrunningdialogbutton');
require('x-tr/x-tr');

/**
 * Management Information Terminal page — hierarchical view with default
 * pies and operation info.
 *
 * Displays a group tree (`x-groupsingroup`) with, at each level, an
 * `x-defaultpie` summary, optional operation info (`x-workinfo`) and a
 * `x-zoominpagebutton` to drill down. Constructor forces `column=''`,
 * `row=''` to disable the standard grid layout (the page uses its own
 * hierarchical structure).
 *
 * Configurable options:
 *  - `showworkinfo`                                    : show `x-workinfo`
 *  - `productionpercentinpie`                          : pie text mode (`'true'` = percent, `'actualonly'`, `'actualtarget'`)
 *  - `thresholdtargetproduction` / `thresholdredproduction` : pie color thresholds
 *
 * Components: x-groupsingroup, x-defaultpie, x-workinfo, x-freetext,
 * x-machinedisplay, x-zoominpagebutton, x-showrunningdialogbutton,
 * x-periodmanager, x-ancestors.
 *
 * @extends pulsePage.BasePage
 */
class ManagementInformationTerminalPage extends pulsePage.BasePage {
  /**
   * Forces `column=''`, `row=''` to opt out of the shared grid layout.
   */
  constructor() {
    super();

    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Sections:
   *  1. `showworkinfo` — toggle `x-workinfo` visibility.
   *  2. Pie text mode — three exclusive radios (`#productionpercentinpie`,
   *     `#productionactualonlyinpie`, `#productionactualtargetinpie`)
   *     write to the `productionpercentinpie` config and dispatch
   *     `configChangeEvent`.
   *  3. Thresholds — `#thresholdtargetproduction` / `#thresholdredproduction`
   *     bound on `input` AND `change` for real-time validation via
   *     `_verficationThresholds`; on success dispatches
   *     `configChangeEvent { config: 'thresholdsupdated' }`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    var self = this;

    const showworkinfoEl = document.getElementById('showworkinfo');
    showworkinfoEl.checked = pulseConfig.getBool('showworkinfo');
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      showworkinfoEl.setAttribute('overridden', 'true');
    }
    showworkinfoEl.addEventListener('change', function () {
      pulseConfig.set('showworkinfo', this.checked);

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      if (showworkinfo) {
        document.querySelectorAll('x-workinfo').forEach(el => el.style.display = '');
      }
      else {
        document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
      }
    });

    const productionpercentinpieEl = document.getElementById('productionpercentinpie');
    const productionactualonlyinpieEl = document.getElementById('productionactualonlyinpie');
    const productionactualtargetinpieEl = document.getElementById('productionactualtargetinpie');

    productionpercentinpieEl.checked = 'true' == pulseConfig.getString('productionpercentinpie');
    productionactualonlyinpieEl.checked = 'actualonly' == pulseConfig.getString('productionpercentinpie');
    productionactualtargetinpieEl.checked = ('true' != pulseConfig.getString('productionpercentinpie')
      && ('actualonly' != pulseConfig.getString('productionpercentinpie')));

    const handleProductionPercentChange = function () {
      if (productionpercentinpieEl.checked) {
        pulseConfig.set('productionpercentinpie', 'true');
      }
      if (productionactualonlyinpieEl.checked) {
        pulseConfig.set('productionpercentinpie', 'actualonly');
      }
      if (productionactualtargetinpieEl.checked) {
        pulseConfig.set('productionpercentinpie', 'actualtarget');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'productionpercentinpie' });
    };

    productionpercentinpieEl.addEventListener('change', handleProductionPercentChange);
    productionactualonlyinpieEl.addEventListener('change', handleProductionPercentChange);
    productionactualtargetinpieEl.addEventListener('change', handleProductionPercentChange);

    const thresholdTargetEl = document.getElementById('thresholdtargetproduction');
    const thresholdRedEl = document.getElementById('thresholdredproduction');

    thresholdTargetEl.value = pulseConfig.getInt('thresholdtargetproduction');
    var changetarget = function () {
      if (self._verficationThresholds(thresholdTargetEl.value, thresholdRedEl.value)) {
        thresholdTargetEl.setAttribute('overridden', true);
        if (pulseUtility.isInteger(thresholdTargetEl.value)) {
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdtargetproduction' });
        }
      }
    };
    thresholdTargetEl.addEventListener('input', changetarget);
    thresholdTargetEl.addEventListener('change', changetarget);

    thresholdRedEl.value = pulseConfig.getInt('thresholdredproduction');
    var changeRed = function () {
      if (self._verficationThresholds(thresholdTargetEl.value, thresholdRedEl.value)) {
        thresholdRedEl.setAttribute('overridden', true);
        if (pulseUtility.isInteger(thresholdRedEl.value)) {
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdredproduction' });
        }
      }
    };
    thresholdRedEl.addEventListener('input', changeRed);
    thresholdRedEl.addEventListener('change', changeRed);
  }

  /**
   * Validates and applies the pie color thresholds (integer percentages).
   *
   * On success, dispatches `configChangeEvent { config: 'thresholdsupdated' }`
   * so that x-defaultpie picks up the new colors.
   *
   * @param {number|string} targetValue Target threshold (%).
   * @param {number|string} redValue    Red threshold (%).
   * @returns {boolean} `true` when valid and applied, `false` otherwise.
   */
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

    // Store values
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

  /**
   * Resets options to their defaults: `showworkinfo`,
   * `productionpercentinpie` (radio group), and the two thresholds.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.checked = pulseConfig.getDefaultBool(configKey);
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.value = value;
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultRadioGroup = (value, valueToIdMap, { trigger = true } = {}) => {
      Object.values(valueToIdMap).forEach((id) => {
        document.getElementById(id).removeAttribute('overridden');
      });
      const targetId = valueToIdMap[value];
      if (targetId) {
        const element = document.getElementById(targetId);
        element.checked = true;
        if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    setDefaultChecked('showworkinfo');

    setDefaultRadioGroup(pulseConfig.getDefaultString('productionpercentinpie'), {
      true: 'productionpercentinpie',
      actualonly: 'productionactualonlyinpie',
      actualtarget: 'productionactualtargetinpie'
    });

    setDefaultValue('thresholdtargetproduction', pulseConfig.getDefaultInt('thresholdtargetproduction'));
    setDefaultValue('thresholdredproduction', pulseConfig.getDefaultInt('thresholdredproduction'));
  }

  /**
   * Serializes active options as URL query string parameters.
   * The pie text mode is emitted as a single `productionpercentinpie`
   * key driven by which of the three radios is checked. Thresholds are
   * only emitted when their input holds a valid integer.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    let optionsValues = '';

    const options = [
      { id: 'showworkinfo', type: 'checkbox' },
      { id: 'thresholdtargetproduction', type: 'value' },
      { id: 'thresholdredproduction', type: 'value' }
    ];

    // showworkinfo
    const showworkinfo = document.getElementById('showworkinfo');
    if (showworkinfo) {
      optionsValues += '&showworkinfo=' + showworkinfo.checked;
    }

    // Prod in pie - custom logic with radio buttons
    const productionpercentinpie = document.getElementById('productionpercentinpie');
    const productionactualonlyinpie = document.getElementById('productionactualonlyinpie');
    if (productionpercentinpie && productionpercentinpie.checked) {
      optionsValues += '&productionpercentinpie=true';
    } else if (productionactualonlyinpie && productionactualonlyinpie.checked) {
      optionsValues += '&productionpercentinpie=actualonly';
    } else {
      optionsValues += '&productionpercentinpie=actualtarget';
    }

    // Thresholds
    const thresholdTarget = document.getElementById('thresholdtargetproduction');
    const thresholdRed = document.getElementById('thresholdredproduction');
    if (thresholdTarget && pulseUtility.isInteger(thresholdTarget.value)) {
      optionsValues += '&thresholdtargetproduction=' + thresholdTarget.value;
    }
    if (thresholdRed && pulseUtility.isInteger(thresholdRed.value)) {
      optionsValues += '&thresholdredproduction=' + thresholdRed.value;
    }

    return optionsValues;
  }

  /**
   * Checks that the minimum required configuration is present before rendering.
   * Blocks rendering if no machine or group is selected.
   *
   * @returns {Array<{selector: string, message: string}>} List of missing configs.
   */
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

  /**
   * Applies the `showworkinfo` config to drive `x-workinfo` visibility.
   */
  buildContent() {
    let showworkinfo = pulseConfig.getBool('showworkinfo');
    if (showworkinfo) {
      document.querySelectorAll('x-workinfo').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
    }
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new ManagementInformationTerminalPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new ManagementInformationTerminalPage());
  });
}
