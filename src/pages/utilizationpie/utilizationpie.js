// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-reasonslotpie/x-reasonslotpie');
require('x-motionpercentage/x-motionpercentage');
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');
require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Utilization Pie page — grid view of utilization pie charts per machine.
 *
 * Displays a grid (x-groupgrid) with, for each machine, a reason-slot pie chart
 * (x-reasonslotpie). Rotation only — no additional display options.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 12 machines/page)
 *
 * Components: x-groupgrid, x-reasonslotpie, x-machinedisplay, x-motionpercentage,
 * x-periodmanager, x-machinemodelegends, x-reasongroups, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class UtilizationPiePage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout: `defaultlayout` checkbox grays out rotation inputs when checked
   * and forces `machinesperpage` to 12.
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    const defaultLayoutChk = document.getElementById('defaultlayout');
    const rotationSettings = document.querySelector('.rotation-settings');
    const machinesPerPageInput = document.getElementById('machinesperpage');

    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    if (!isLive) {
      if (defaultLayoutChk) {
        const paramRow = defaultLayoutChk.closest('.param-row');
        if (paramRow) paramRow.style.display = 'none';
        if (defaultLayoutChk.parentElement) defaultLayoutChk.parentElement.style.display = 'none';
        defaultLayoutChk.checked = false;
      }
      if (rotationSettings) rotationSettings.style.display = 'none';
      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);
      if (machinesPerPageInput) machinesPerPageInput.value = 10000;
    } else {
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
              machinesPerPageInput.value = 12;
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
      if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 12);
      const rotationDelayInput = document.getElementById('rotationdelay');
      if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
    }
  }

  /**
   * Resets layout options to their default values (defaultlayout=true, 12/page, delay=10s).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const defaultLayoutEl = document.getElementById('defaultlayout');
    if (defaultLayoutEl) {
      defaultLayoutEl.checked = true;
      defaultLayoutEl.dispatchEvent(new Event('change', { bubbles: true }));
      defaultLayoutEl.removeAttribute('overridden');
    }
    const machinesEl = document.getElementById('machinesperpage');
    if (machinesEl) {
      machinesEl.value = 12;
      machinesEl.removeAttribute('overridden');
    }
    const delayEl = document.getElementById('rotationdelay');
    if (delayEl) {
      delayEl.value = 10;
      delayEl.removeAttribute('overridden');
    }
  }

  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const isHidden = (el.offsetWidth === 0 && el.offsetHeight === 0) || el.offsetParent === null;
      if (isHidden) return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') return `&${paramName}=${el.value}`;
      return `&${paramName}=${el.checked}`;
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

  /** No components to drive at load time. */
  buildContent() {
  }
}


if (document.readyState !== 'loading') {
  pulsePage.preparePage(new UtilizationPiePage());
} else {
  document.addEventListener('DOMContentLoaded', function() {
    pulsePage.preparePage(new UtilizationPiePage());
  });
}
