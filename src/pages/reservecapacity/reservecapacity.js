// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as pulseUtility from 'pulseUtility';
import * as pulsePage from 'pulsePage';
import * as eventBus from 'eventBus';

import 'x-periodmanager/x-periodmanager';
import 'x-ancestors/x-ancestors';
import 'x-machinedisplay/x-machinedisplay';
import 'x-groupsingroup/x-groupsingroup';
import 'x-zoominpagebutton/x-zoominpagebutton';
import 'x-showrunningdialogbutton/x-showrunningdialogbutton';
import 'x-tr/x-tr';

import 'x-chartreservecapacity/x-chartreservecapacity';

/**
 * Reserve Capacity page — hierarchical reserve-capacity chart view.
 *
 * Displays a group tree (`x-groupsingroup`) with, at each level, an
 * `x-chartreservecapacity` plot bounded by optional Y-axis min/max
 * values. Constructor forces `column=''`, `row=''` to disable the
 * standard grid layout (the page uses its own hierarchical structure).
 *
 * Configurable options:
 *  - `minchartvalue` : Y-axis minimum (checkbox `#minchartcheck` enables
 *    the bound; empty string disables it, default −70)
 *  - `maxchartvalue` : Y-axis maximum (checkbox `#maxchartcheck` enables
 *    the bound; empty string disables it, default 30)
 *
 * Components: x-groupsingroup, x-chartreservecapacity, x-periodmanager,
 * x-ancestors, x-machinedisplay, x-zoominpagebutton,
 * x-showrunningdialogbutton.
 *
 * @extends pulsePage.BasePage
 */
class ReserveCapacityPage extends pulsePage.BasePage {
  /**
   * Forces `column=''`, `row=''` to opt out of the shared grid layout.
   */
  constructor() {
    super();

    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  /**
   * Initializes the options panel and binds the two checkbox/value pairs.
   *
   * Each axis bound (`minchartvalue` / `maxchartvalue`) follows the same
   * pattern: a checkbox toggles the value input (and stores `''` when
   * unchecked, the saved value otherwise); the value input is bound on
   * `input` and `change` to dispatch `configChangeEvent` for live
   * updates of `x-chartreservecapacity`.
   *
   * Configs read/written: `minchartvalue`, `maxchartvalue`.
   */
  // CONFIG PANEL - Init
  initOptionValues () {
    const minchartcheckEl = document.getElementById('minchartcheck');
    const minchartvalueEl = document.getElementById('minchartvalue');
    const maxchartcheckEl = document.getElementById('maxchartcheck');
    const maxchartvalueEl = document.getElementById('maxchartvalue');

    let minchartvalue = pulseConfig.get('minchartvalue');
    minchartcheckEl.addEventListener('change', function () {
      let useMinChart = this.checked;
      if (useMinChart) {
        minchartvalueEl.style.display = '';
        let minchartvalue = minchartvalueEl.value;
        if ((undefined == minchartvalue) || ('' == minchartvalue)) {
          minchartvalue = pulseConfig.getDefault('minchartvalue');
          if ((undefined == minchartvalue) || ('' == minchartvalue)) {
            minchartvalue = -70;
          }
          minchartvalueEl.value = minchartvalue;
        }
        pulseConfig.set('minchartvalue', minchartvalue);
      }
      else {
        minchartvalueEl.style.display = 'none';
        pulseConfig.set('minchartvalue', '');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'minchartvalue' });
    });
    if ((undefined == minchartvalue) || ('' == minchartvalue)) {
      minchartcheckEl.checked = false;
    }
    else {
      minchartcheckEl.checked = true;
      minchartvalueEl.value = minchartvalue;
    }
    minchartcheckEl.dispatchEvent(new Event('change', { bubbles: true }));

    var changeMin = function () {
      let minchartvalue = minchartvalueEl.value;
      pulseConfig.set('minchartvalue', minchartvalue);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'minchartvalue' });
    };
    minchartvalueEl.addEventListener('input', changeMin);
    minchartvalueEl.addEventListener('change', changeMin);

    let maxchartvalue = pulseConfig.get('maxchartvalue');
    maxchartcheckEl.addEventListener('change', function () {
      let useMaxChart = this.checked;
      if (useMaxChart) {
        maxchartvalueEl.style.display = '';
        let maxchartvalue = maxchartvalueEl.value;
        if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
          maxchartvalue = pulseConfig.getDefault('maxchartvalue');
          if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
            maxchartvalue = 30;
          }
          maxchartvalueEl.value = maxchartvalue;
        }
        pulseConfig.set('maxchartvalue', maxchartvalue);
      }
      else {
        maxchartvalueEl.style.display = 'none';
        pulseConfig.set('maxchartvalue', '');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'maxchartvalue' });
    });
    if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
      maxchartcheckEl.checked = false;
    }
    else {
      maxchartcheckEl.checked = true;
      maxchartvalueEl.value = maxchartvalue;
    }
    maxchartcheckEl.dispatchEvent(new Event('change', { bubbles: true }));

    var changeMax = function () {
      let maxchartvalue = maxchartvalueEl.value;
      pulseConfig.set('maxchartvalue', maxchartvalue);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'maxchartvalue' });
    };
    maxchartvalueEl.addEventListener('input', changeMax);
    maxchartvalueEl.addEventListener('change', changeMax);
  }

  /**
   * Resets the two checkbox/value pairs to their defaults
   * (`pulseConfig.getDefault('minchartvalue' / 'maxchartvalue')`).
   * An empty default leaves the checkbox unchecked; otherwise the
   * default value is written to the input.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    const setDefaultCheckedValue = (id, checked, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.checked = checked;
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.value = value;
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    let minchartvalue = pulseConfig.getDefault('minchartvalue');
    if ((undefined == minchartvalue) || ('' == minchartvalue)) {
      setDefaultCheckedValue('minchartcheck', false);
    }
    else {
      setDefaultCheckedValue('minchartcheck', true);
      setDefaultValue('minchartvalue', minchartvalue);
    }

    let maxchartvalue = pulseConfig.getDefault('maxchartvalue');
    if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
      setDefaultCheckedValue('maxchartcheck', false);
    }
    else {
      setDefaultCheckedValue('maxchartcheck', true);
      setDefaultValue('maxchartvalue', maxchartvalue);
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   * Emits `minchartvalue=` / `maxchartvalue=` (empty) when the
   * corresponding checkbox is unchecked or the input does not hold a
   * valid integer.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let result = '';

    // Min chart
    if (document.getElementById('minchartcheck')?.checked) {
      const minVal = document.getElementById('minchartvalue')?.value;
      if (minVal && pulseUtility.isInteger(minVal)) {
        result += `&minchartvalue=${minVal}`;
      } else {
        result += '&minchartvalue=';
      }
    } else {
      result += '&minchartvalue=';
    }

    // Max chart
    if (document.getElementById('maxchartcheck')?.checked) {
      const maxVal = document.getElementById('maxchartvalue')?.value;
      if (maxVal && pulseUtility.isInteger(maxVal)) {
        result += `&maxchartvalue=${maxVal}`;
      } else {
        result += '&maxchartvalue=';
      }
    } else {
      result += '&maxchartvalue=';
    }

    return result;
  }

  /**
   * Checks that the minimum required configuration is present before rendering.
   * Blocks rendering if no machine or group is selected.
   *
   * @returns {Array<{selector: string, message: string}>} List of missing configs.
   */
  getMissingConfigs () {
    let missingConfigs = [];

    let groups = pulseConfig.getArray('group');
    let machines = pulseConfig.getArray('machine');
    if ((machines == null || machines.length == 0) &&
      (groups == null || groups.length == 0)) {
      missingConfigs.push({
        selector: 'x-machineselection, #editmachines, .group-machines',
        message: pulseConfig.pulseTranslate ('error.machineRequired','Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  /**
   * No additional content to build — the group tree and chart read
   * pulseConfig directly.
   */
  buildContent () {
  }

}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new ReserveCapacityPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new ReserveCapacityPage());
  });
}
