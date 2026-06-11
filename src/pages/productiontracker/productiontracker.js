// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseUtility from 'pulseUtility';
import * as pulseConfig from 'pulseConfig';
import * as pulsePage from 'pulsePage';
import * as eventBus from 'eventBus';

import 'x-groupsingroup/x-groupsingroup';

import 'x-periodmanager/x-periodmanager';
import 'x-ancestors/x-ancestors';
import 'x-machinedisplay/x-machinedisplay';
import 'x-productiontrackertable/x-productiontrackertable';
import 'x-zoominpagebutton/x-zoominpagebutton';
import 'x-showrunningdialogbutton/x-showrunningdialogbutton';
import 'x-tr/x-tr';

/**
 * Production Tracker page — production tracking by machine group (table view).
 *
 * Displays a group tree (x-groupsingroup) with, at each level,
 * a summary table (x-productiontrackertable) and production indicators.
 *
 * Structural note: `column` and `row` are forced to '' in pulseConfig
 * to disable the standard grid layout — the page uses its own hierarchical
 * structure (groups within groups).
 *
 * Configurable options:
 *  - `thresholdtargetproduction` / `thresholdredproduction` : cell color thresholds
 *  - `showreservecapacity` : show reserve capacity column in the table
 *
 * Components: x-groupsingroup, x-productiontrackertable, x-periodmanager,
 * x-ancestors, x-machinedisplay, x-zoominpagebutton, x-showrunningdialogbutton.
 *
 * @extends pulsePage.BasePage
 */
class ProductionTrackerPage extends pulsePage.BasePage {
  /**
   * Forces `column=''` and `row=''` to disable the standard grid layout
   * (the page uses x-groupsingroup for its own hierarchy).
   */
  constructor() {
    super();

    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Threshold management: listeners are bound to both `input` AND `change`
   * to react on every keystroke (real-time validation via `_verficationThresholds`).
   * The `overridden` attribute is set only after successful validation.
   *
   * Options:
   *  - `thresholdtargetproduction` : target threshold (%, integer)
   *  - `thresholdredproduction`    : red threshold (%, integer)
   *  - `showreservecapacity`       : checkbox, dispatches `configChangeEvent` on each change
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    var self = this;

    const thresholdTargetEl = document.getElementById('thresholdtargetproduction');
    const thresholdRedEl = document.getElementById('thresholdredproduction');

    if (thresholdTargetEl) {
      thresholdTargetEl.value = pulseConfig.getInt('thresholdtargetproduction');
      var changetarget = function () {
        if (self._verficationThresholds(thresholdTargetEl.value, thresholdRedEl ? thresholdRedEl.value : '')) {
          thresholdTargetEl.setAttribute('overridden', true);
          if (pulseUtility.isInteger(thresholdTargetEl.value)) {
            eventBus.EventBus.dispatchToAll('configChangeEvent',
              { 'config': 'thresholdtargetproduction' });
          }
        }
      };
      thresholdTargetEl.addEventListener('input', changetarget);
      thresholdTargetEl.addEventListener('change', changetarget);
    }

    if (thresholdRedEl) {
      thresholdRedEl.value = pulseConfig.getInt('thresholdredproduction');
      var changeRed = function () {
        if (self._verficationThresholds(thresholdTargetEl ? thresholdTargetEl.value : '', thresholdRedEl.value)) {
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

    const showreservecapacityEl = document.getElementById('showreservecapacity');
    if (showreservecapacityEl) {
      showreservecapacityEl.checked = pulseConfig.getBool('showreservecapacity');
      if (pulseConfig.getDefaultBool('showreservecapacity') != pulseConfig.getBool('showreservecapacity')) {
        showreservecapacityEl.setAttribute('overridden', 'true');
      }
      showreservecapacityEl.addEventListener('change', function () {
        pulseConfig.set('showreservecapacity', this.checked);
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'showreservecapacity' });
      });
    }
  }

  /**
   * Validates and applies the production table color thresholds.
   *
   * Same logic as oeeview._verficationThresholds and machinedashboard._verficationThresholds.
   * Difference: the error container is `.thresholdunitispart` (no fallback).
   * Values are integers (not floats) on this page.
   *
   * On success, dispatches `configChangeEvent { config: 'thresholdsupdated' }`
   * to notify x-productiontrackertable.
   *
   * @param {number|string} targetValue - Target threshold (%), integer.
   * @param {number|string} redValue    - Red threshold (%), integer.
   * @returns {boolean} true if valid and applied, false otherwise.
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

    pulseConfig.set('thresholdtargetproduction', parseFloat(targetValue));
    pulseConfig.set('thresholdredproduction', parseFloat(redValue));

    errorMessage.style.display = 'none';

    eventBus.EventBus.dispatchToAll('configChangeEvent',
      {
        config: 'thresholdsupdated'
      });

    return true;
  }

  /**
   * Resets options to their default values.
   * Resets thresholds and the showreservecapacity checkbox via the standard helpers.
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

    setDefaultValue('thresholdtargetproduction', pulseConfig.getDefaultInt('thresholdtargetproduction'));
    setDefaultValue('thresholdredproduction', pulseConfig.getDefaultInt('thresholdredproduction'));
    setDefaultChecked('showreservecapacity');
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Numeric inputs (thresholds) are only included if their value is a valid integer
   * (filtered via `pulseUtility.isInteger`).
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'thresholdtargetproduction', type: 'value' },
      { id: 'thresholdredproduction', type: 'value' },
      { id: 'showreservecapacity', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      if (opt.type === 'value' && !pulseUtility.isInteger(el.value)) return '';
      const value = opt.type === 'checkbox' ? el.checked : el.value;
      return `&${opt.id}=${value}`;
    }).join('');
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
   * No components to drive at load time — x-productiontrackertable and
   * x-groupsingroup read pulseConfig directly via their own mechanisms.
   */
  buildContent() {

  }

}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new ProductionTrackerPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new ProductionTrackerPage());
  });
}
