// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouplist/x-grouplist');
require('x-rotationprogress/x-rotationprogress');
require('x-machinedisplay/x-machinedisplay');
require('x-toollifemachine/x-toollifemachine');
require('x-tr/x-tr');

/**
 * Tool Life page — list view of machine tool life indicators.
 *
 * Displays a vertical list of machines (x-grouplist) with, for each machine,
 * the tool life status (x-toollifemachine) showing remaining life per tool.
 *
 * Forces `column=''` to disable grid mode (list display).
 *
 * Configurable options:
 *  - `toollifemachine.toollabelname`                    : tool label type to display (select)
 *  - `toollifemachine.displayremainingcyclesbelowtool`  : show remaining cycles below each tool
 *
 * Components: x-grouplist, x-toollifemachine, x-machinedisplay.
 *
 * @extends pulsePage.BasePage
 */
class ToolLifePage extends pulsePage.BasePage {
  /**
   * Forces `column=''` to disable grid mode (x-grouplist renders as a list).
   */
  constructor() {
    super();

    // General configuration
    pulseConfig.set('column', '');
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Tool selector: populates a `<select>` from `toollifemachine.toollabelsselections`
   * (array of {name, display} objects from config), sets current selection,
   * and dispatches `configChangeEvent { config: 'toollabelname' }` on change.
   *
   * Remaining cycles checkbox: standard pattern (read config → check → mark overridden
   * if differs from default → bind listener → dispatch on change).
   *
   * Configs read/written: `toollifemachine.toollabelname`,
   *                       `toollifemachine.displayremainingcyclesbelowtool`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    // TOOLS detail
    let toollabelname = pulseConfig.getString('toollifemachine.toollabelname');
    $('#showtoolselector').empty();
    let toollabelsselections = pulseConfig.getArray('toollifemachine.toollabelsselections');
    let toolLabels = (typeof ATSORA_CATALOG !== 'undefined' && ATSORA_CATALOG.general && ATSORA_CATALOG.general.toolLabels) || {};
    for (let iTool = 0; iTool < toollabelsselections.length; iTool++) {
      let label = toollabelsselections[iTool];
      let displayText = toolLabels[label.name] || label.name;
      $('#showtoolselector').append('<option id="tool-' + label.name + '" value="' + label.name + '">' + displayText + '</option>');
    }
    // Set selection
    $('#showtoolselector').val(toollabelname);

    $('#showtoolselector').change(function () {
      let toollabelname = $('#showtoolselector').val();
      // Store
      pulseConfig.set('toollifemachine.toollabelname', String(toollabelname));
      // Display = dispatch message
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'toollabelname' });
    });

    // TOOLS remaining
    $('#showtoolremaining').prop('checked',
      pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'));
    if (pulseConfig.getDefaultBool('toollifemachine.displayremainingcyclesbelowtool')
      != pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'))
      $('#showtoolremaining').attr('overridden', 'true');
    $('#showtoolremaining').change(function () {
      let showtoolremaining = $('#showtoolremaining').is(':checked');
      // Store
      pulseConfig.set('toollifemachine.displayremainingcyclesbelowtool', showtoolremaining);
      // Display / Dispatch
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayremainingcyclesbelowtool' });
    });
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Uses the declarative pattern with `param` to map DOM id to config key
   * (e.g. `showtoolselector` → `toollifemachine.toollabelname`).
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues () {
    const options = [
      { id: 'showtoolselector', type: 'value', param: 'toollifemachine.toollabelname' },
      { id: 'showtoolremaining', type: 'checkbox', param: 'toollifemachine.displayremainingcyclesbelowtool' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const paramName = opt.param || opt.id;
      const value = opt.type === 'checkbox' ? el.checked : el.value;
      return `&${paramName}=${value}`;
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
   * Resets options to their default values.
   *
   * Resets the tool label selector and the remaining cycles checkbox
   * via the standard `setDefaultValue` and `setDefaultChecked` helpers.
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

    // expiring tools
    setDefaultValue('showtoolselector', pulseConfig.getDefaultString('toollifemachine.toollabelname'));

    // remaining cycles
    setDefaultChecked('showtoolremaining', 'toollifemachine.displayremainingcyclesbelowtool');
  }

  /**
   * No components to drive at load time — x-toollifemachine reads pulseConfig directly.
   */
  buildContent() {
  }
}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new ToolLifePage());
});
