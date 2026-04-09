// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-motionpercentage/x-motionpercentage');
require('x-datetimegraduation/x-datetimegraduation');
require('x-clock/x-clock');
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Utilization Bar page — grid view of utilization bars per machine.
 *
 * Displays a grid (x-groupgrid) with, for each machine, a stacked utilization bar
 * (x-barstack) and an optional clock (x-clock).
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 16 machines/page)
 *  - `showclock`                                           : show x-clock per machine
 *  - `displaydaysrange` / `displayhoursrange`              : time range — driven by a shared
 *    `#displaydayshours` input and `#displayisdays` / `#displayishours` radio selectors
 *
 * Special getMissingConfigs: also blocks rendering when `displaydaysrange` = 0
 * AND `displayhoursrange` = 0 (min 1 hour required).
 *
 * Components: x-groupgrid, x-barstack, x-machinedisplay, x-motionpercentage,
 * x-datetimegraduation, x-clock, x-periodmanager, x-machinemodelegends,
 * x-reasongroups, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class UtilizationBarPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout: same pattern as other grid pages — defaultlayout grays out inputs,
   * default 16 machines/page.
   *
   * Clock option: `#showclockutilization` maps to config key `showclock`. Shows/hides
   * all `x-clock` elements immediately on change.
   *
   * Days/Hours range: a single `#displaydayshours` numeric input is shared between
   * days mode and hours mode. The active mode is selected by `#displayisdays` /
   * `#displayishours` radios. On any change, writes to either `displaydaysrange`
   * (days mode) or `displayhoursrange` (hours mode) and zeroes the other, then
   * dispatches `configChangeEvent { config: 'displaydaysrange' }`.
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showclock`, `displaydaysrange`, `displayhoursrange`.
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
        machinesPerPageInput.val(16).change();
      } else {
        rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
      }
    }).trigger('change');

    machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 16));
    $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));

    // show clock
    $('#showclockutilization').prop('checked', pulseConfig.getBool('showclock'));
    if (pulseConfig.getDefaultBool('showclock') != pulseConfig.getBool('showclock'))
      $('#showclockutilization').attr('overridden', true);
    $('#showclockutilization').change(function () {
      let showclock = $('#showclockutilization').is(':checked');
      // Store
      pulseConfig.set('showclock', showclock);
      // Display
      if (showclock) {
        $('x-clock').show();
      }
      else {
        $('x-clock').hide();
      }
    });

    // Days / Hours: load current range — if days > 0, show in days mode; otherwise hours mode
    let days = pulseConfig.getInt('displaydaysrange');
    let hours = pulseConfig.getInt('displayhoursrange');
    if (days > 0) {
      $('#displaydayshours').val(days);

      $('#displayisdays').prop('checked', true);
      $('#displayishours').prop('checked', false);
    }
    else {
      $('#displaydayshours').val(hours);

      $('#displayisdays').prop('checked', false);
      $('#displayishours').prop('checked', true);
    }

    var changeDaysHours = function () {
      let isDays = $('#displayisdays').is(':checked');

      let nb = ($('#displaydayshours').val());
      pulseConfig.set('displaydaysrange', isDays ? nb : 0);
      pulseConfig.set('displayhoursrange', isDays ? 0 : nb);

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displaydaysrange' });
    };

    $('#displaydayshours').bind('input', changeDaysHours);
    $('#displayisdays').change(changeDaysHours);
    $('#displayishours').change(changeDaysHours);
  }

  /**
   * Resets all options to their default values.
   *
   * Days/Hours: resets to the default days range value with days mode selected.
   * Layout: defaultlayout=true, 16/page, delay=10s.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.prop('checked', pulseConfig.getDefaultBool(configKey));
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.val(value);
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    setDefaultChecked('showclockutilization', 'showclock');

    // 1 day
    setDefaultValue('displaydayshours', pulseConfig.getDefaultInt('displaydaysrange'));
    $('#displayisdays').prop('checked', true);
    $('#displayisdays').change();
    $('#displayisdays').removeAttr('overridden');

    // Layout: default rotation (defaultlayout=true, 16 per page)
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(16).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Days/Hours is serialized separately: writes `displaydaysrange` (and `displayhoursrange=0`)
   * in days mode, or `displaydaysrange=0&displayhoursrange=N` in hours mode.
   * Only written when `#displaydayshours` holds a valid integer.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'showclockutilization', type: 'checkbox', param: 'showclock' },
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    let optionsValues = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el || $(el).is(':hidden')) return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') return `&${paramName}=${el.value}`;
      return `&${paramName}=${el.checked}`;
    }).join('');

    // Handle days/hours logic
    const displayDaysHours = document.getElementById('displaydayshours');
    if (displayDaysHours && pulseUtility.isInteger(displayDaysHours.value)) {
      if (document.getElementById('displayisdays')?.checked) {
        optionsValues += `&displaydaysrange=${displayDaysHours.value}`;
      } else {
        optionsValues += `&displaydaysrange=0&displayhoursrange=${displayDaysHours.value}`;
      }
    }

    return optionsValues;
  }

  /**
   * Checks that the minimum required configuration is present before rendering.
   *
   * Two conditions block rendering:
   *  1. No machine or group selected.
   *  2. The time range is zero (both displaydaysrange and displayhoursrange are 0) —
   *     at least 1 hour must be configured.
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

    if (pulseConfig.getInt('displaydayshours') == 0) {
      missingConfigs.push({
        selector: 'label[for="displaydayshours"], label[for="displaydayshours"], .group-options',
        message: pulseConfig.pulseTranslate('error.min1hour', 'Please select at least 1 hour')
      });
    }

    return missingConfigs;
  }

  /**
   * Applies the current configuration to DOM components at load time.
   * Shows or hides `x-clock` based on the `showclock` config value.
   */
  buildContent() {
    // show clock
    let showclock = pulseConfig.getBool('showclock');
    if (showclock) {
      $('x-clock').show();
    }
    else {
      $('x-clock').hide();
    }

  }

}

$(document).ready(function () {
  pulsePage.preparePage(new UtilizationBarPage());
});
