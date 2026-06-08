// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-milestonesmanager/x-milestonesmanager');
require('x-machinedisplay/x-machinedisplay');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Milestones page — grid view of per-machine milestone managers.
 *
 * Displays a grid of machines (`x-groupgrid`) where each tile hosts an
 * `x-milestonesmanager` (machine label + milestones table + add button).
 * The grid cycles through machines according to the rotation settings.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 12 machines/page)
 *
 * Components: x-groupgrid, x-milestonesmanager, x-machinedisplay,
 * x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class MilestonesPage extends pulsePage.BasePage {
  constructor() {
    super();
    this.showMachineselection = true;
  }

  /**
   * Initializes the options panel and binds rotation listeners.
   *
   * When `defaultlayout` is checked, the manual `machinesperpage` /
   * `rotationdelay` inputs are disabled and `machinesperpage` is forced
   * to 12; otherwise both inputs become editable and reflect the saved
   * values.
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
            machinesPerPageInput.value = 12;
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

    if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 12);
    const rotationDelayInput = document.getElementById('rotationdelay');
    if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
  }

  /**
   * Resets the rotation options to their hardcoded defaults
   * (`defaultlayout=true`, `machinesperpage=12`, `rotationdelay=10`).
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
      machinesPerPageEl.value = 12;
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
      const paramName = opt.param || opt.id;
      return `&${paramName}=${el.type === 'checkbox' ? el.checked : el.value}`;
    }).join('');
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
        message: pulseConfig.pulseTranslate('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  /**
   * No additional content to build — the grid and the milestones
   * manager pull pulseConfig directly.
   */
  buildContent () {
  }

}

if (document.readyState !== 'loading') {
  initMilestonesPage();
} else {
  document.addEventListener('DOMContentLoaded', initMilestonesPage);
}

function initMilestonesPage() {
  pulsePage.preparePage(new MilestonesPage());
}
