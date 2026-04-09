// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-runningbutton/x-runningbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-performancetarget/x-performancetarget');
require('x-currenticoncncalarm/x-currenticoncncalarm');
require('x-stacklight/x-stacklight');
require('x-runningslotpie/x-runningslotpie');
require('x-motionpercentage/x-motionpercentage');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-runninglegends/x-runninglegends');
require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Combined View page — grid view combining status bars and machine indicators.
 *
 * Displays a grid of machines (x-groupgrid) with, for each machine:
 * a stack of bars (x-barstack), a motion percentage indicator,
 * and optional components (performance target, CNC alarm, stack light).
 *
 * Notable: two x-periodmanager elements are present in the DOM with distinct
 * `period-context` values (`combinedview_today` and `combinedview_6days`)
 * to simultaneously display today's period and the last 6 days.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation management
 *  - `showtarget`     : x-performancetarget (performance target)
 *  - `showalarm`      : x-currenticoncncalarm (CNC alarm icon)
 *  - `showstacklight` : x-stacklight (stack light)
 *
 * Components: x-groupgrid, x-barstack, x-machinedisplay, x-runningbutton,
 * x-performancetarget, x-currenticoncncalarm, x-stacklight, x-runningslotpie,
 * x-motionpercentage, x-periodmanager, x-machinemodelegends, x-runninglegends.
 *
 * @extends pulsePage.BasePage
 */
class CombinedViewPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout management (same pattern as oeeview):
   *  - If `defaultlayout` is checked → grays out manual inputs and forces machinesperpage=12.
   *  - Otherwise → enables machinesperpage and rotationdelay inputs.
   *
   * Optional component options (uniform pattern):
   *  - Read config → check checkbox → bind change listener → set config + show/hide component.
   *  - Mark `overridden` if value differs from default.
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showtarget`, `showalarm`, `showstacklight`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    // Layout
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

    $('#showtarget').prop('checked', pulseConfig.getBool('showtarget'));
    if (pulseConfig.getDefaultBool('showtarget') != pulseConfig.getBool('showtarget')) {
      $('#showtarget').attr('overridden', 'true');
    }
    $('#showtarget').change(function () {
      let showtarget = $('#showtarget').is(':checked');
      // Store
      pulseConfig.set('showtarget', showtarget);
      // Display
      if (showtarget) {
        $('x-performancetarget').show();
      }
      else {
        $('x-performancetarget').hide();
      }
    });

    $('#showalarm').prop('checked', pulseConfig.getBool('showalarm'));
    if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm')) {
      $('#showalarm').attr('overridden', 'true');
    }
    $('#showalarm').change(function () {
      let showalarm = $('#showalarm').is(':checked');
      // Store
      pulseConfig.set('showalarm', showalarm);
      // Display
      if (showalarm) {
        $('x-currenticoncncalarm').show();
      }
      else {
        $('x-currenticoncncalarm').hide();
      }
    });

    $('#showstacklight').prop('checked', pulseConfig.getBool('showstacklight'));
    if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight')) {
      $('#showstacklight').attr('overridden', 'true');
    }
    $('#showstacklight').change(function () {
      let showstacklight = $('#showstacklight').is(':checked');
      // Store
      pulseConfig.set('showstacklight', showstacklight);
      // Display
      if (showstacklight) {
        $('x-stacklight').show();
      }
      else {
        $('x-stacklight').hide();
      }
    });
  }

  /**
   * Resets all options to their default values.
   *
   * Layout: directly forces `defaultlayout=checked`, `machinesperpage=12`, `rotationdelay=10`
   * (hardcoded values since these are the known defaults, not read from pulseConfig.getDefault*).
   *
   * Optional components: uses `setDefaultChecked` with trigger to immediately
   * sync visual state (show/hide).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.prop('checked', pulseConfig.getDefaultBool(configKey));
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    // Layout
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(12).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');

    setDefaultChecked('showtarget');
    setDefaultChecked('showalarm');
    setDefaultChecked('showstacklight');
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Note: all options are checkboxes — `el.checked` is used for all,
   * including machinesperpage and rotationdelay (latent bug: these inputs are numeric,
   * but the map uses `el.checked` instead of `el.value`).
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' },
      { id: 'showtarget', type: 'checkbox' },
      { id: 'showalarm', type: 'checkbox' },
      { id: 'showstacklight', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const paramName = opt.param || opt.id;
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

  /**
   * Applies the current configuration to optional DOM components.
   *
   * Syncs visual state at page load (option listeners handle real-time changes,
   * but buildContent ensures the initial state based on URL params / localStorage).
   *
   * Components driven: x-performancetarget, x-stacklight, x-currenticoncncalarm.
   */
  buildContent() {
    let showtarget = pulseConfig.getBool('showtarget');
    if (showtarget) {
      $('x-performancetarget').show();
    }
    else {
      $('x-performancetarget').hide();
    }
    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      $('x-stacklight').show();
    }
    else {
      $('x-stacklight').hide();
    }
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      $('x-currenticoncncalarm').show();
    }
    else {
      $('x-currenticoncncalarm').hide();
    }
  }
}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new CombinedViewPage());
});
