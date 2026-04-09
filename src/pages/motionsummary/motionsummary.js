// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
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
    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    defaultLayoutChk.prop('checked', pulseConfig.getBool('defaultlayout', true));
    if (pulseConfig.getDefaultBool('defaultlayout') !== pulseConfig.getBool('defaultlayout', true))
      defaultLayoutChk.attr('overridden', true);

    defaultLayoutChk.change(() => {
      let isDefault = defaultLayoutChk.is(':checked');
      pulseConfig.set('defaultlayout', isDefault);
      if (isDefault) {
        rotationSettings.css('opacity', '0.5').find('input').prop('disabled', true);
        machinesPerPageInput.val(16).change();
      } else {
        rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
      }
    }).trigger('change');

    machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 16));
    $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
  }

  /**
   * Resets layout options to their default values (defaultlayout=true, 16/page, delay=10s).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(16).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');
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
      if (!el || $(el).is(':hidden')) return '';
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

$(document).ready(function() {
  pulsePage.preparePage(new MotionSummaryPage());
});
