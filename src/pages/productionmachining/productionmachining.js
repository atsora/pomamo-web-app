// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');
var pulseUtility = require('pulseUtility');

require('x-grouplist/x-grouplist');
require('x-rotationprogress/x-rotationprogress');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-machinedisplay/x-machinedisplay');
require('x-tr/x-tr');

/**
 * Production Machining page — list view of machining production status per machine.
 *
 * Displays a vertical list of machines (x-grouplist) with, for each machine,
 * the current machining production status (x-productionmachiningstatus).
 *
 * Configurable options:
 *  - `thresholdtargetproduction` / `thresholdredproduction` : color thresholds (integer %)
 *
 * Components: x-grouplist, x-productionmachiningstatus, x-machinedisplay.
 *
 * @extends pulsePage.BasePage
 */
class ProductionMachiningPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Threshold management: listeners are bound to both `input` AND `change`
   * for real-time validation. The `overridden` attribute is set only after
   * successful validation via `_verficationThresholds`.
   *
   * Configs read/written: `thresholdtargetproduction`, `thresholdredproduction`.
   */
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

  }

  /**
   * Validates and applies the production color thresholds.
   *
   * Same logic as oeeview._verficationThresholds — see that file for full details.
   * Error container: `.thresholdunitispart` (no fallback).
   * Values are integers (not floats) on this page.
   *
   * On success, dispatches `configChangeEvent { config: 'thresholdsupdated' }`
   * to notify x-productionmachiningstatus.
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
   * Resets thresholds to their default values via the standard `setDefaultValue` helper.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.val(value);
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    setDefaultValue('thresholdtargetproduction', pulseConfig.getDefaultInt('thresholdtargetproduction'));
    setDefaultValue('thresholdredproduction', pulseConfig.getDefaultInt('thresholdredproduction'));
  }

  /**
   * Serializes active options as URL query string parameters.
   * Only includes threshold values if they are valid integers.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'thresholdtargetproduction', type: 'value', conditional: () => pulseUtility.isInteger(document.getElementById('thresholdtargetproduction')?.value) },
      { id: 'thresholdredproduction', type: 'value', conditional: () => pulseUtility.isInteger(document.getElementById('thresholdredproduction')?.value) }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      if (opt.conditional && !opt.conditional()) return '';
      return `&${opt.id}=${el.value}`;
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
   * No components to drive at load time — x-productionmachiningstatus reads
   * pulseConfig directly via its own mechanisms.
   */
  buildContent() {
  }

}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new ProductionMachiningPage());
});
