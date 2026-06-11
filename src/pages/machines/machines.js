// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-machinetab/x-machinetab');
require('x-machinetabnav/x-machinetabnav');
require('x-machinedisplay/x-machinedisplay');
require('x-lastserialnumber/x-lastserialnumber');
require('x-lastworkinformationbar/x-lastworkinformationbar');
require('x-lastmachinestatetemplate/x-lastmachinestatetemplate');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-unansweredreasonnumber/x-unansweredreasonnumber');
require('x-reasonbutton/x-reasonbutton');
require('x-periodmanager/x-periodmanager');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');

require('x-savemachinestatetemplate/x-savemachinestatetemplate');
require('x-cycleprogressbar/x-cycleprogressbar');
require('x-performancebar/x-performancebar');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-toollifemachine/x-toollifemachine');

require('x-cyclesinperiod/x-cyclesinperiod');

require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');

// Pies
require('x-partproductionstatuspie/x-partproductionstatuspie');
require('x-performancegauge/x-performancegauge');

require('x-tr/x-tr');

/**
 * Machines page — detailed per-machine view with stacked status bars.
 *
 * Displays a list of machines (x-machinetab) with, for each selected machine,
 * a configurable set of components driven by `componentsToDisplay`:
 * status bars (x-barstack), performance gauge, cycle progress,
 * serial number, operation info, etc.
 *
 * The list of visible components is dynamically controlled by the
 * `componentsToDisplay` config (array of CSS selectors / component names).
 *
 * Components registered: x-machinetab, x-barstack,
 * x-performancebar, x-cycleprogressbar, x-reasongroups, x-fieldlegends,
 * x-machinemodelegends, x-partproductionstatuspie, x-performancegauge, etc.
 *
 * @extends pulsePage.BasePage
 */
class MachinesPage extends pulsePage.BasePage {
  /**
   * No additional local state — the page delegates everything to pulseConfig.
   */
  constructor() {
    super();

    // General configuration
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
        message: pulseConfig.pulseTranslate ('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  /**
   * Applies the `componentsToDisplay` config to show/hide components in each machine tile.
   *
   * Strategy: first hides ALL `.machine-component` elements, then reveals only
   * those whose selector appears in `componentsToDisplay`.
   *
   * Special cases handled explicitly:
   *  - `'coloredbar'`             : shows `.div-bar-and-percent` (without right-side %)
   *  - `'coloredbarwithpercent'`  : shows `.div-bar-and-percent` + `.right-percent`
   *  - `'x-reasonbutton'`         : shows the reason button inside `.tile-title`
   *  - `'title-lastmachinestatus'`: shows the last status inside the tile title
   *
   * Config read: `componentsToDisplay` (Array<string>)
   */
  buildContent () {
    // find components to display
    let componentsToDisplay = pulseConfig.getArray('componentsToDisplay', []);
    let componentsString = componentsToDisplay.join(',');
    console.log('Components to display: ' + componentsString);

    let machineComponents = document.querySelectorAll('.machine-component');
    machineComponents.forEach(el => el.style.display = 'none');

    let reasonButtons = document.querySelectorAll('.tile-title x-reasonbutton');
    reasonButtons.forEach(el => el.style.display = 'none');

    let lastStatusElements = document.querySelectorAll('.title-lastmachinestatus');
    lastStatusElements.forEach(el => el.style.display = 'none');

    for (let i = 0; i < componentsToDisplay.length; i++) {
      // querySelectorAll (not querySelector): reveal the component on EVERY machine
      // tile, matching the original jQuery $(sel).parents('.machine-component').show().
      document.querySelectorAll(componentsToDisplay[i]).forEach(function (component) {
        let parent = component.closest('.machine-component');
        if (parent) parent.style.display = '';
      });

      if (componentsToDisplay[i] == 'coloredbar') {
        let bars = document.querySelectorAll('.div-bar-and-percent');
        bars.forEach(bar => {
          let parent = bar.closest('.machine-component');
          if (parent) parent.style.display = '';
        });
      }
      if (componentsToDisplay[i] == 'coloredbarwithpercent') {
        let bars = document.querySelectorAll('.div-bar-and-percent');
        bars.forEach(bar => {
          let parent = bar.closest('.machine-component');
          if (parent) parent.style.display = '';
        });
        let percents = document.querySelectorAll('.right-percent');
        percents.forEach(el => el.style.display = '');
      }
      if (componentsToDisplay[i] == 'x-reasonbutton') {
        let buttons = document.querySelectorAll('.tile-title x-reasonbutton');
        buttons.forEach(el => el.style.display = '');
      }
      if (componentsToDisplay[i] == 'title-lastmachinestatus') {
        let statuses = document.querySelectorAll('.title-lastmachinestatus');
        statuses.forEach(el => el.style.display = '');
      }
    }
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new MachinesPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new MachinesPage());
  });
}
