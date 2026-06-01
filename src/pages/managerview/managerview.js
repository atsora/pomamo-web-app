// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouplist/x-grouplist');
require('x-rotationprogress/x-rotationprogress');

require('x-machinedisplay/x-machinedisplay');
require('x-datetimegraduation/x-datetimegraduation');
require('x-lastworkinformation/x-lastworkinformation');
require('x-currentcncvalue/x-currentcncvalue');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-periodmanager/x-periodmanager');
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-reasonbutton/x-reasonbutton');
require('x-tr/x-tr');

/**
 * Manager View page — list view of machines with temporal status bars.
 *
 * Displays a vertical list of machines (x-grouplist) with, for each machine,
 * a stack of bars (x-barstack) covering a configurable time range:
 * either the current shift (displayshiftrange=true) or a manually defined
 * number of days/hours.
 *
 * Configurable options:
 *  - `displayshiftrange`  : shows the active shift range (hides days/hours inputs)
 *  - `displaydaysrange`   : number of days to display (when shift is disabled)
 *  - `displayhoursrange`  : number of hours to display (when shift is disabled)
 *
 * Components: x-grouplist, x-barstack, x-machinedisplay,
 * x-lastworkinformation, x-currentcncvalue, x-motionpercentage, x-motiontime,
 * x-periodmanager, x-datetimegraduation, x-reasongroups, x-fieldlegends.
 *
 * @extends pulsePage.BasePage
 */
class ManagerViewPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Time range management:
   *  - If `displayshiftrange` is checked → hides days/hours inputs and dispatches
   *    `configChangeEvent { config: 'displayshiftrange' }`.
   *  - Otherwise → shows inputs and dispatches `configChangeEvent { config: 'displaydaysrange' }`
   *    or `displayhoursrange` on each valid change.
   *
   * Validation: if days=0 AND hours=0, both inputs get `.missing-config` class
   * without persisting to pulseConfig (a zero range has no meaning).
   *
   * Configs read/written: `displayshiftrange`, `displaydaysrange`, `displayhoursrange`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    // Shift
    const shiftRangeEl = document.getElementById('displayshiftrangemanagerview');
    const timeframeEl = document.getElementById('timeframemanagerview');
    if (shiftRangeEl) {
      shiftRangeEl.checked = pulseConfig.getBool('displayshiftrange');
      if (pulseConfig.getDefaultBool('displayshiftrange') != pulseConfig.getBool('displayshiftrange'))
        shiftRangeEl.setAttribute('overridden', 'true');
      shiftRangeEl.addEventListener('change', function () {
        let displayShift = shiftRangeEl.checked;
        // Store
        pulseConfig.set('displayshiftrange', displayShift);
        // Dispatch
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displayshiftrange' });
        // Show / Hide linked config
        if (timeframeEl) {
          timeframeEl.style.display = displayShift ? 'none' : '';
        }
      });
      shiftRangeEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Days / Hours
    const daysRangeEl = document.getElementById('displaydaysrange');
    const hoursRangeEl = document.getElementById('displayhoursrange');
    if (daysRangeEl) {
      daysRangeEl.value = pulseConfig.getInt('displaydaysrange');
      if (pulseConfig.getDefaultInt('displaydaysrange') != pulseConfig.getInt('displaydaysrange')) {
        daysRangeEl.setAttribute('overridden', 'true');
      }
    }
    var changeDays = function () {
      if (!daysRangeEl || !hoursRangeEl) return;
      daysRangeEl.setAttribute('overridden', 'true');
      let displaydaysrange = daysRangeEl.value;
      // Display
      let displayhoursrange = hoursRangeEl.value;
      if (displaydaysrange == '0' && displayhoursrange == '0') {
        daysRangeEl.classList.add('missing-config');
        hoursRangeEl.classList.add('missing-config');
      }
      else {
        // Store both in case of 0 value and previous missing config
        pulseConfig.set('displaydaysrange', displaydaysrange);
        pulseConfig.set('displayhoursrange', displayhoursrange);
        // Display
        daysRangeEl.classList.remove('missing-config');
        hoursRangeEl.classList.remove('missing-config');

        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displaydaysrange' });
      }
    };
    if (daysRangeEl) {
      daysRangeEl.addEventListener('input', changeDays);
      daysRangeEl.addEventListener('change', changeDays);
    }

    // Hours
    if (hoursRangeEl) {
      hoursRangeEl.value = pulseConfig.getInt('displayhoursrange');
      if (pulseConfig.getDefaultInt('displayhoursrange') != pulseConfig.getInt('displayhoursrange')) {
        hoursRangeEl.setAttribute('overridden', 'true');
      }
      hoursRangeEl.addEventListener('change', function () {
        this.setAttribute('overridden', 'true');
      });
    }
    var changeHours = function () {
      if (!daysRangeEl || !hoursRangeEl) return;
      hoursRangeEl.setAttribute('overridden', 'true');
      let displayhoursrange = hoursRangeEl.value;
      // Display
      let displaydaysrange = daysRangeEl.value;
      if (displaydaysrange == '0' && displayhoursrange == '0') {
        daysRangeEl.classList.add('missing-config');
        hoursRangeEl.classList.add('missing-config');
      }
      else {
        // Store both in case of 0 value and previous missing config
        pulseConfig.set('displaydaysrange', displaydaysrange);
        pulseConfig.set('displayhoursrange', displayhoursrange);
        // Display
        daysRangeEl.classList.remove('missing-config');
        hoursRangeEl.classList.remove('missing-config');

        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displayhoursrange' });
      }
    };
    if (hoursRangeEl) {
      hoursRangeEl.addEventListener('input', changeHours);
      hoursRangeEl.addEventListener('change', changeHours);
    }
  }

  /**
   * Resets options to their default values (reset button).
   *
   * Uses local helpers `setDefaultChecked` and `setDefaultValue`
   * (same pattern as oeeview) to reset each option and remove `overridden`.
   *
   * Default values applied:
   *  - displayhoursrange → 0
   *  - displaydaysrange  → 1
   *  - displayshiftrange → pulseConfig default value
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

    setDefaultValue('displayhoursrange', 0);
    setDefaultValue('displaydaysrange', 1);
    setDefaultChecked('displayshiftrangemanagerview', 'displayshiftrange');
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Uses the declarative pattern `{ id, type, param?, conditional? }`:
   *  - `param`       : URL parameter name when different from the DOM id.
   *  - `conditional` : guard function — if it returns false, the option is skipped.
   *
   * `displaydaysrange` and `displayhoursrange` are only included if:
   *  - shift is disabled,
   *  - the `overridden` attribute is present (user has modified the value),
   *  - the value is a valid integer.
   *
   * @returns {string} Query string fragment, e.g. `&displayshiftrange=false&displaydaysrange=2`.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'displayshiftrangemanagerview', type: 'checkbox', param: 'displayshiftrange' },
      { id: 'displaydaysrange', type: 'value', conditional: () => !document.getElementById('displayshiftrangemanagerview')?.checked && document.getElementById('displaydaysrange')?.hasAttribute('overridden') && pulseUtility.isInteger(document.getElementById('displaydaysrange')?.value) },
      { id: 'displayhoursrange', type: 'value', conditional: () => !document.getElementById('displayshiftrangemanagerview')?.checked && document.getElementById('displayhoursrange')?.hasAttribute('overridden') && pulseUtility.isInteger(document.getElementById('displayhoursrange')?.value) }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      if (opt.conditional && !opt.conditional()) return '';
      const paramName = opt.param || opt.id;
      const value = opt.type === 'checkbox' ? el.checked : el.value;
      return `&${paramName}=${value}`;
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
   * Applies the configuration to non-bar DOM components.
   *
   * Note: bars (x-barstack) read pulseConfig directly and do not need
   * to be driven here. Only non-barstack components are managed:
   *  - `x-lastworkinformation` : visible if `currentdisplay.displayjob` = true
   *  - `x-fieldlegends`        : visible if `showcoloredbar.cncvalue` = true
   *    (the CNC legend is only useful when the CNC bar is displayed)
   */
  buildContent() {
    // allows the native page configuration (not in options) of the bars : show reason bar == always -> idem for SHOW x-reasongroups

    let displayJob = pulseConfig.getBool('currentdisplay.displayjob', false);
    document.querySelectorAll('x-lastworkinformation').forEach(el => {
      el.style.display = displayJob ? '' : 'none';
    });

    const showCncValue = pulseConfig.getBool('showcoloredbar.cncvalue', false);
    document.querySelectorAll('x-fieldlegends').forEach(el => {
      el.style.display = showCncValue ? '' : 'none';
    });
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new ManagerViewPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new ManagerViewPage());
  });
}
