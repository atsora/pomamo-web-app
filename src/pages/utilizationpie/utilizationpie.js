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
    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    if (!isLive) {
      defaultLayoutChk.closest('.param-row').hide();
      defaultLayoutChk.parent().hide();
      rotationSettings.hide();
      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);
      defaultLayoutChk.prop('checked', false);
      machinesPerPageInput.val(10000);
      // Scroll & grid sizing handled by .pulse-content:not(.appcontext-live) overrides in utilizationpie.less
    } else {
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
  }

  /**
   * Resets layout options to their default values (defaultlayout=true, 12/page, delay=10s).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    // Layout: default rotation (defaultlayout=true, 12 per page)
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(12).removeAttr('overridden');
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
  pulsePage.preparePage(new UtilizationPiePage());
});
