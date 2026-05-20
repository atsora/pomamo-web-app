// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
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
        machinesPerPageInput.val(12).change();
      } else {
        rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
      }
    }).trigger('change');

    machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 12));
    $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
  }

  /**
   * Resets the rotation options to their hardcoded defaults
   * (`defaultlayout=true`, `machinesperpage=12`, `rotationdelay=10`).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(12).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');
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

$(document).ready(function () {
  pulsePage.preparePage(new MilestonesPage());
});
