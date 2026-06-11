// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as pulsePage from 'pulsePage';

import 'x-machinedisplay/x-machinedisplay';
import 'x-currentcncvalue/x-currentcncvalue';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-barstack/x-barstack';
import 'x-motionpercentage/x-motionpercentage';
import 'x-motiontime/x-motiontime';
import 'x-periodmanager/x-periodmanager';
// LEGENDS
import 'x-reasongroups/x-reasongroups';
import 'x-fieldlegends/x-fieldlegends';

import 'x-groupgrid/x-groupgrid';
import 'x-rotationprogress/x-rotationprogress';
import 'x-tr/x-tr';

/**
 * Machine Specification page — single-machine detailed view with rotation.
 *
 * Displays one machine at a time through an `x-groupgrid` paginated to
 * `machinesperpage = 1`, with a stack of bars (`x-barstack`), current
 * CNC value, motion indicators and legends. Cycles through the selected
 * machines every `rotationdelay` seconds.
 *
 * Constructor forces `defaultlayout=false`, `column=''`, `row=''` to
 * disable the standard grid layout while the single-machine layout
 * settles.
 *
 * Configurable options:
 *  - `rotationdelay`   : seconds between two machines (default 10)
 *  - `machinesperpage` : forced to 1 by `initOptionValues`
 *
 * Components: x-groupgrid, x-rotationprogress, x-barstack, x-machinedisplay,
 * x-currentcncvalue, x-motionpercentage, x-motiontime, x-periodmanager,
 * x-reasongroups, x-fieldlegends.
 *
 * @extends pulsePage.BasePage
 */
class MachineSpecificationPage extends pulsePage.BasePage {
  /**
   * Forces `defaultlayout=false`, `column=''`, `row=''` to opt out of
   * the shared grid layout.
   */
  constructor() {
    super();

    pulseConfig.set('defaultlayout', false);
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  /**
   * Initializes the options panel: locks `machinesperpage` to 1 and
   * reads `rotationdelay` from pulseConfig.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    const machinesPerPageInput = document.getElementById('machinesperpage');
    if (machinesPerPageInput) {
      machinesPerPageInput.value = 1;
      machinesPerPageInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const rotationDelayInput = document.getElementById('rotationdelay');
    if (rotationDelayInput) {
      rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
    }
  }

  /**
   * Resets `rotationdelay` to its default (10 s); `machinesperpage`
   * stays locked at 1.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const rotationDelayInput = document.getElementById('rotationdelay');
    if (rotationDelayInput) {
      rotationDelayInput.value = 10;
      rotationDelayInput.removeAttribute('overridden');
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   * `machinesperpage` is always emitted as 1; `rotationdelay` is
   * appended only when the input is visible.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const delay = document.getElementById('rotationdelay');
    const isHidden = delay && delay.style.display === 'none';
    const result = (delay && !isHidden) ? `&rotationdelay=${delay.value}` : '';
    return `&machinesperpage=1${result}`;
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
   * No additional content to build — the grid and child components
   * pick up pulseConfig directly.
   */
  buildContent() {
  }
}

if (document.readyState !== 'loading') {
  initMachineSpecificationPage();
} else {
  document.addEventListener('DOMContentLoaded', initMachineSpecificationPage);
}

function initMachineSpecificationPage() {
  pulsePage.preparePage(new MachineSpecificationPage());
}
