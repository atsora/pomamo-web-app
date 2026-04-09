// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-grouplist/x-grouplist');
require('x-rotationprogress/x-rotationprogress');

require('x-machinedisplay/x-machinedisplay');
require('x-lastmachinestatetemplate/x-lastmachinestatetemplate');
require('x-tr/x-tr');

/**
 * Scheduled Status page — list view of scheduled machine state templates.
 *
 * Displays a vertical list of machines (x-grouplist) with, for each machine,
 * the scheduled state template (x-lastmachinestatetemplate).
 *
 * No configurable options — this page is read-only.
 * Forces `column=''` to disable grid mode.
 *
 * Components: x-grouplist, x-lastmachinestatetemplate, x-machinedisplay.
 *
 * @extends pulsePage.BasePage
 */
class ScheduledStatusPage extends pulsePage.BasePage {
  /**
   * Forces `column=''` to disable grid mode (x-grouplist renders as a list).
   */
  constructor() {
    super();

    // General configuration
    pulseConfig.set('column', '');
  }

  /** No configurable options on this page. */
  // CONFIG PANEL - Init
  initOptionValues() {
  }

  /** No options to serialize. */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    return '';
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

  /** No options to reset. */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
  }

  /** No components to drive at load time. */
  buildContent() {
  }
}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → buildContent).
  pulsePage.preparePage(new ScheduledStatusPage());
});
