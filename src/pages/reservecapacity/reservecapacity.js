// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-periodmanager/x-periodmanager');
require('x-ancestors/x-ancestors');
require('x-machinedisplay/x-machinedisplay');
require('x-groupsingroup/x-groupsingroup');
require('x-zoominpagebutton/x-zoominpagebutton');
require('x-showrunningdialogbutton/x-showrunningdialogbutton');
require('x-tr/x-tr');

require('x-chartreservecapacity/x-chartreservecapacity');

/**
 * Reserve Capacity page — hierarchical reserve-capacity chart view.
 *
 * Displays a group tree (`x-groupsingroup`) with, at each level, an
 * `x-chartreservecapacity` plot bounded by optional Y-axis min/max
 * values. Constructor forces `column=''`, `row=''` to disable the
 * standard grid layout (the page uses its own hierarchical structure).
 *
 * Configurable options:
 *  - `minchartvalue` : Y-axis minimum (checkbox `#minchartcheck` enables
 *    the bound; empty string disables it, default −70)
 *  - `maxchartvalue` : Y-axis maximum (checkbox `#maxchartcheck` enables
 *    the bound; empty string disables it, default 30)
 *
 * Components: x-groupsingroup, x-chartreservecapacity, x-periodmanager,
 * x-ancestors, x-machinedisplay, x-zoominpagebutton,
 * x-showrunningdialogbutton.
 *
 * @extends pulsePage.BasePage
 */
class ReserveCapacityPage extends pulsePage.BasePage {
  /**
   * Forces `column=''`, `row=''` to opt out of the shared grid layout.
   */
  constructor() {
    super();

    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  /**
   * Initializes the options panel and binds the two checkbox/value pairs.
   *
   * Each axis bound (`minchartvalue` / `maxchartvalue`) follows the same
   * pattern: a checkbox toggles the value input (and stores `''` when
   * unchecked, the saved value otherwise); the value input is bound on
   * `input` and `change` to dispatch `configChangeEvent` for live
   * updates of `x-chartreservecapacity`.
   *
   * Configs read/written: `minchartvalue`, `maxchartvalue`.
   */
  // CONFIG PANEL - Init
  initOptionValues () {
    // Check - minchart
    let minchartvalue = pulseConfig.get('minchartvalue');
    $('#minchartcheck').change(function () {
      let useMinChart = $('#minchartcheck').is(':checked');
      // Show / Hide linked config + Store
      if (useMinChart) {
        $('#minchartvalue').show();
        // Store
        let minchartvalue = $('#minchartvalue').val();
        if ((undefined == minchartvalue) || ('' == minchartvalue)) {
          minchartvalue = pulseConfig.getDefault('minchartvalue');
          if ((undefined == minchartvalue) || ('' == minchartvalue)) {
            minchartvalue = -70;
          }
          $('#minchartvalue').val(minchartvalue);
        }
        pulseConfig.set('minchartvalue', minchartvalue);
      }
      else {
        $('#minchartvalue').hide();
        // Store
        pulseConfig.set('minchartvalue', '');
      }

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'minchartvalue' });
    });
    if ((undefined == minchartvalue) || ('' == minchartvalue)) {
      $('#minchartcheck').prop('checked', false);
      //$('#minchartvalue').val(default); -> Not useful
    }
    else {
      $('#minchartcheck').prop('checked', true);
      $('#minchartvalue').val(minchartvalue);
    }
    $('#minchartcheck').change();

    // Value - minchart
    /*if ('' != minchartvalue) { // Already done before
      $('#minchartvalue').val(pulseConfig.getInt('minchartvalue'));
    }*/
    var changeMin = function () {
      let minchartvalue = $('#minchartvalue').val();
      // Store
      pulseConfig.set('minchartvalue', minchartvalue);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'minchartvalue' });
    };
    $('#minchartvalue').bind('input', changeMin);
    $('#minchartvalue').change(changeMin);


    // Check - maxchart
    let maxchartvalue = pulseConfig.get('maxchartvalue');
    $('#maxchartcheck').change(function () {
      let useMaxChart = $('#maxchartcheck').is(':checked');
      // Show / Hide linked config + Store
      if (useMaxChart) {
        $('#maxchartvalue').show();
        // Store
        let maxchartvalue = $('#maxchartvalue').val();
        if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
          maxchartvalue = pulseConfig.getDefault('maxchartvalue');
          if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
            maxchartvalue = 30;
          }
          $('#maxchartvalue').val(maxchartvalue);
        }
        pulseConfig.set('maxchartvalue', maxchartvalue);
      }
      else {
        $('#maxchartvalue').hide();
        // Store
        pulseConfig.set('maxchartvalue', '');
      }

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'maxchartvalue' });
    });
    if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
      $('#maxchartcheck').prop('checked', false);
      //$('#maxchartvalue').val(default); -> not useful
    }
    else {
      $('#maxchartcheck').prop('checked', true);
      $('#maxchartvalue').val(maxchartvalue);
    }
    $('#maxchartcheck').change();

    // Value - maxchart
    /*if ('' != maxchartvalue) { // Already done before
      $('#maxchartvalue').val(pulseConfig.getInt('maxchartvalue'));
    }*/
    var changeMax = function () {
      let maxchartvalue = $('#maxchartvalue').val();
      // Store
      pulseConfig.set('maxchartvalue', maxchartvalue);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'maxchartvalue' });
    };
    $('#maxchartvalue').bind('input', changeMax);
    $('#maxchartvalue').change(changeMax);
  }

  /**
   * Resets the two checkbox/value pairs to their defaults
   * (`pulseConfig.getDefault('minchartvalue' / 'maxchartvalue')`).
   * An empty default leaves the checkbox unchecked; otherwise the
   * default value is written to the input.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    const setDefaultCheckedValue = (id, checked, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.prop('checked', checked);
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.val(value);
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    // MinChart
    let minchartvalue = pulseConfig.getDefault('minchartvalue');
    if ((undefined == minchartvalue) || ('' == minchartvalue)) {
      setDefaultCheckedValue('minchartcheck', false);
      //$('#minchartvalue').val(-70); // Not useful. Keep previous value
    }
    else {
      setDefaultCheckedValue('minchartcheck', true);
      setDefaultValue('minchartvalue', minchartvalue);
    }

    // MaxChart
    let maxchartvalue = pulseConfig.getDefault('maxchartvalue');
    if ((undefined == maxchartvalue) || ('' == maxchartvalue)) {
      setDefaultCheckedValue('maxchartcheck', false);
      //$('#maxchartvalue').val(30); // Not useful. Keep previous value
    }
    else {
      setDefaultCheckedValue('maxchartcheck', true);
      setDefaultValue('maxchartvalue', maxchartvalue);
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   * Emits `minchartvalue=` / `maxchartvalue=` (empty) when the
   * corresponding checkbox is unchecked or the input does not hold a
   * valid integer.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let result = '';

    // Min chart
    if (document.getElementById('minchartcheck')?.checked) {
      const minVal = document.getElementById('minchartvalue')?.value;
      if (minVal && pulseUtility.isInteger(minVal)) {
        result += `&minchartvalue=${minVal}`;
      } else {
        result += '&minchartvalue=';
      }
    } else {
      result += '&minchartvalue=';
    }

    // Max chart
    if (document.getElementById('maxchartcheck')?.checked) {
      const maxVal = document.getElementById('maxchartvalue')?.value;
      if (maxVal && pulseUtility.isInteger(maxVal)) {
        result += `&maxchartvalue=${maxVal}`;
      } else {
        result += '&maxchartvalue=';
      }
    } else {
      result += '&maxchartvalue=';
    }

    return result;
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
        message: pulseConfig.pulseTranslate ('error.machineRequired','Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  /**
   * No additional content to build — the group tree and chart read
   * pulseConfig directly.
   */
  buildContent () {
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new ReserveCapacityPage());
});
