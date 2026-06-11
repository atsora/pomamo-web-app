// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as pulseUtility from 'pulseUtility';
import * as pulsePage from 'pulsePage';
import * as eventBus from 'eventBus';

import 'x-reasonbutton/x-reasonbutton';
import 'x-machinedisplay/x-machinedisplay';
import 'x-barstack/x-barstack'; // pulls in all bar components
import 'x-motionpercentage/x-motionpercentage';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-clock/x-clock';
import 'x-periodmanager/x-periodmanager';
import 'x-machinemodelegends/x-machinemodelegends';
import 'x-reasongroups/x-reasongroups';

import 'x-groupgrid/x-groupgrid';
import 'x-rotationprogress/x-rotationprogress';
import 'x-tr/x-tr';

/**
 * Utilization Bar page — grid view of utilization bars per machine.
 *
 * Displays a grid (x-groupgrid) with, for each machine, a stacked utilization bar
 * (x-barstack) and an optional clock (x-clock).
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 16 machines/page)
 *  - `showclock`                                           : show x-clock per machine
 *  - `displaydaysrange` / `displayhoursrange`              : time range — driven by a shared
 *    `#displaydayshours` input and `#displayisdays` / `#displayishours` radio selectors
 *
 * Special getMissingConfigs: also blocks rendering when `displaydaysrange` = 0
 * AND `displayhoursrange` = 0 (min 1 hour required).
 *
 * Components: x-groupgrid, x-barstack, x-machinedisplay, x-motionpercentage,
 * x-datetimegraduation, x-clock, x-periodmanager, x-machinemodelegends,
 * x-reasongroups, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class UtilizationBarPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout: same pattern as other grid pages — defaultlayout grays out inputs,
   * default 16 machines/page.
   *
   * Clock option: `#showclockutilization` maps to config key `showclock`. Shows/hides
   * all `x-clock` elements immediately on change.
   *
   * Days/Hours range: a single `#displaydayshours` numeric input is shared between
   * days mode and hours mode. The active mode is selected by `#displayisdays` /
   * `#displayishours` radios. On any change, writes to either `displaydaysrange`
   * (days mode) or `displayhoursrange` (hours mode) and zeroes the other, then
   * dispatches `configChangeEvent { config: 'displaydaysrange' }`.
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showclock`, `displaydaysrange`, `displayhoursrange`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    const defaultLayoutChk = document.getElementById('defaultlayout');
    const rotationSettings = document.querySelector('.rotation-settings');
    const machinesPerPageInput = document.getElementById('machinesperpage');

    if (defaultLayoutChk) {
      defaultLayoutChk.checked = pulseConfig.getBool('defaultlayout', true);
      if (pulseConfig.getDefaultBool('defaultlayout') !== pulseConfig.getBool('defaultlayout', true))
        defaultLayoutChk.setAttribute('overridden', true);

      defaultLayoutChk.addEventListener('change', () => {
        let isDefault = defaultLayoutChk.checked;
        pulseConfig.set('defaultlayout', isDefault);
        if (isDefault) {
          if (rotationSettings) {
            rotationSettings.style.opacity = '0.5';
            rotationSettings.querySelectorAll('input').forEach(inp => inp.disabled = true);
          }
          if (machinesPerPageInput) {
            machinesPerPageInput.value = 16;
            machinesPerPageInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          if (rotationSettings) {
            rotationSettings.style.opacity = '1';
            rotationSettings.querySelectorAll('input').forEach(inp => inp.disabled = false);
          }
        }
      });
      defaultLayoutChk.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 16);
    const rotationDelayInput = document.getElementById('rotationdelay');
    if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);

    const showclockutilizationEl = document.getElementById('showclockutilization');
    if (showclockutilizationEl) {
      showclockutilizationEl.checked = pulseConfig.getBool('showclock');
      if (pulseConfig.getDefaultBool('showclock') != pulseConfig.getBool('showclock'))
        showclockutilizationEl.setAttribute('overridden', true);
      showclockutilizationEl.addEventListener('change', function () {
        let showclock = this.checked;
        pulseConfig.set('showclock', showclock);
        document.querySelectorAll('x-clock').forEach(el => {
          el.style.display = showclock ? '' : 'none';
        });
      });
    }

    let days = pulseConfig.getInt('displaydaysrange');
    let hours = pulseConfig.getInt('displayhoursrange');
    const displayDaysHoursEl = document.getElementById('displaydayshours');
    const displayIsDaysEl = document.getElementById('displayisdays');
    const displayIsHoursEl = document.getElementById('displayishours');

    if (days > 0) {
      displayDaysHoursEl.value = days;
      displayIsDaysEl.checked = true;
      displayIsHoursEl.checked = false;
    }
    else {
      displayDaysHoursEl.value = hours;
      displayIsDaysEl.checked = false;
      displayIsHoursEl.checked = true;
    }

    var changeDaysHours = function () {
      let isDays = displayIsDaysEl.checked;
      let nb = displayDaysHoursEl.value;
      pulseConfig.set('displaydaysrange', isDays ? nb : 0);
      pulseConfig.set('displayhoursrange', isDays ? 0 : nb);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displaydaysrange' });
    };

    displayDaysHoursEl.addEventListener('input', changeDaysHours);
    displayIsDaysEl.addEventListener('change', changeDaysHours);
    displayIsHoursEl.addEventListener('change', changeDaysHours);
  }

  /**
   * Resets all options to their default values.
   *
   * Days/Hours: resets to the default days range value with days mode selected.
   * Layout: defaultlayout=true, 16/page, delay=10s.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.checked = pulseConfig.getDefaultBool(configKey);
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.value = value;
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    setDefaultChecked('showclockutilization', 'showclock');

    setDefaultValue('displaydayshours', pulseConfig.getDefaultInt('displaydaysrange'));
    const displayIsDaysEl = document.getElementById('displayisdays');
    if (displayIsDaysEl) {
      displayIsDaysEl.checked = true;
      displayIsDaysEl.dispatchEvent(new Event('change', { bubbles: true }));
      displayIsDaysEl.removeAttribute('overridden');
    }

    const defaultLayoutEl = document.getElementById('defaultlayout');
    if (defaultLayoutEl) {
      defaultLayoutEl.checked = true;
      defaultLayoutEl.dispatchEvent(new Event('change', { bubbles: true }));
      defaultLayoutEl.removeAttribute('overridden');
    }
    const machinesPerPageEl = document.getElementById('machinesperpage');
    if (machinesPerPageEl) {
      machinesPerPageEl.value = 16;
      machinesPerPageEl.removeAttribute('overridden');
    }
    const rotationDelayEl = document.getElementById('rotationdelay');
    if (rotationDelayEl) {
      rotationDelayEl.value = 10;
      rotationDelayEl.removeAttribute('overridden');
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Days/Hours is serialized separately: writes `displaydaysrange` (and `displayhoursrange=0`)
   * in days mode, or `displaydaysrange=0&displayhoursrange=N` in hours mode.
   * Only written when `#displaydayshours` holds a valid integer.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'showclockutilization', type: 'checkbox', param: 'showclock' },
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    let optionsValues = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const isHidden = (el.offsetWidth === 0 && el.offsetHeight === 0) || el.offsetParent === null;
      if (isHidden) return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') return `&${paramName}=${el.value}`;
      return `&${paramName}=${el.checked}`;
    }).join('');

    // Handle days/hours logic
    const displayDaysHours = document.getElementById('displaydayshours');
    if (displayDaysHours && pulseUtility.isInteger(displayDaysHours.value)) {
      if (document.getElementById('displayisdays')?.checked) {
        optionsValues += `&displaydaysrange=${displayDaysHours.value}`;
      } else {
        optionsValues += `&displaydaysrange=0&displayhoursrange=${displayDaysHours.value}`;
      }
    }

    return optionsValues;
  }

  /**
   * Checks that the minimum required configuration is present before rendering.
   *
   * Two conditions block rendering:
   *  1. No machine or group selected.
   *  2. The time range is zero (both displaydaysrange and displayhoursrange are 0) —
   *     at least 1 hour must be configured.
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

    if (pulseConfig.getInt('displaydayshours') == 0) {
      missingConfigs.push({
        selector: 'label[for="displaydayshours"], label[for="displaydayshours"], .group-options',
        message: pulseConfig.pulseTranslate('error.min1hour', 'Please select at least 1 hour')
      });
    }

    return missingConfigs;
  }

  /**
   * Applies the current configuration to DOM components at load time.
   * Shows or hides `x-clock` based on the `showclock` config value.
   */
  buildContent() {
    let showclock = pulseConfig.getBool('showclock');
    document.querySelectorAll('x-clock').forEach(el => {
      el.style.display = showclock ? '' : 'none';
    });
  }

}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new UtilizationBarPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new UtilizationBarPage());
  });
}
