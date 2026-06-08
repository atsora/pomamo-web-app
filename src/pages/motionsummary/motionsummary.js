// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Motion Summary page — grid view of motion summary bars per machine.
 *
 * Displays a grid (x-groupgrid) with, for each machine, a motion summary bar.
 * Rotation only — no additional display options.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 16 machines/page)
 *
 * Components: x-groupgrid, x-machinedisplay, x-machinemodelegends, x-reasongroups,
 * x-reasonbutton, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class MotionSummaryPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout: `defaultlayout` checkbox grays out rotation inputs when checked
   * and forces `machinesperpage` to 16.
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`.
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
            rotationSettings.querySelectorAll('input').forEach(input => input.disabled = true);
          }
          if (machinesPerPageInput) {
            machinesPerPageInput.value = 16;
            machinesPerPageInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          if (rotationSettings) {
            rotationSettings.style.opacity = '1';
            rotationSettings.querySelectorAll('input').forEach(input => input.disabled = false);
          }
        }
      });
      defaultLayoutChk.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 16);
    const rotationDelayInput = document.getElementById('rotationdelay');
    if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
  }

  /**
   * Resets layout options to their default values (defaultlayout=true, 16/page, delay=10s).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
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
   * Hidden elements (e.g. rotation inputs when defaultlayout=true) are skipped.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const isHidden = el.style.display === 'none';
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
  initMotionSummaryPage();
} else {
  document.addEventListener('DOMContentLoaded', initMotionSummaryPage);
}

function initMotionSummaryPage() {
  pulsePage.preparePage(new MotionSummaryPage());
}
