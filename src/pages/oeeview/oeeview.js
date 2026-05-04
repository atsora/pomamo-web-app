// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulsePage = require('pulsePage');
var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var eventBus = require('eventBus');

require('x-tr/x-tr');
require('x-periodmanager/x-periodmanager');
require('x-groupgrid/x-groupgrid');
require('x-machinedisplay/x-machinedisplay');
require('x-reasonbutton/x-reasonbutton');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-rotationprogress/x-rotationprogress');
require('x-production/x-production');
require('x-productionshiftgoal/x-productionshiftgoal');
require('x-productiongauge/x-productiongauge');
require('x-periodtoolbar/x-periodtoolbar');
require('x-workinfo/x-workinfo');


/**
 * OEE View page — displays OEE indicators per machine or group.
 *
 * Two operating modes depending on the `AppContext` URL parameter:
 *  - **live**       : automatic machine rotation, layout options enabled.
 *  - **historical** : rotation disabled, vertical scroll enabled via CSS injection,
 *                     all machines displayed on a single page (machinesperpage=10000).
 *
 * Components: x-groupgrid, x-periodmanager, x-machinedisplay,
 * x-production, x-productiongauge, x-workinfo, x-periodtoolbar, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class OeeViewPage extends pulsePage.BasePage {
  /**
   * Enables the machine selector in the header (inherited from BasePage).
   */
  constructor() {
    super();
    // Keep machine selection visible
    this.showMachineselection = true;
  }

  /**
   * Checks that the minimum required configuration is present before rendering.
   * Blocks rendering if no machine or group is selected,
   * pointing to available machine selectors in the UI.
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
   * Initializes the options panel and binds all UI listeners.
   *
   * Conditional behavior based on `AppContext` (URL):
   *  - **live**       : shows rotation options (defaultlayout, machinesperpage, rotationdelay).
   *  - **historical** : hides rotation options, forces machinesperpage=10000,
   *                     injects CSS to enable vertical scroll on x-groupgrid.
   *
   * Common options (live + historical):
   *  - Production gauge display mode (% or ratio)
   *  - Color thresholds (thresholdtargetproduction, thresholdredproduction)
   *  - Operation info display (showworkinfo → x-workinfo)
   *
   * Called by pulsePage.preparePage() after DOM is ready.
   */
  // [MODIFICATION] Conditional logic: Live vs Historical
  initOptionValues() {
    // Check context
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    // --- ROTATION LAYOUT OPTIONS ---
    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    if (!isLive) {
      // HISTORICAL MODE: disable rotation, enable vertical scroll

      // 1. Hide rotation options in the panel
      defaultLayoutChk.closest('.param-row').hide(); // if .param-row structure exists
      defaultLayoutChk.parent().hide(); // fallback
      rotationSettings.hide();

      // 2. Force "show all" configuration
      // Force custom mode (not default) to accept a large page count
      pulseConfig.set('defaultlayout', false);
      // Set a huge number so the rotation engine treats everything as one page
      pulseConfig.set('machinesperpage', 10000);

      // Sync inputs to avoid confusion
      defaultLayoutChk.prop('checked', false);
      machinesPerPageInput.val(10000);

      // Scroll & grid sizing handled by .pulse-content:not(.appcontext-live) overrides in oeeview.less

    } else {
      // LIVE MODE: standard behavior (rotation)

      // Initialize from config
      defaultLayoutChk.prop('checked', pulseConfig.getBool('defaultlayout', true));

      // When "Default" is checked, gray out manual inputs
      defaultLayoutChk.change(() => {
        let isDefault = defaultLayoutChk.is(':checked');
        pulseConfig.set('defaultlayout', isDefault);

        if (isDefault) {
          rotationSettings.css('opacity', '0.5').find('input').prop('disabled', true);
          $('#machinesperpage').val(12).change(); // force max
        } else {
          rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
        }
      }).trigger('change');

      // Initialize values
      machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 12));
      $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
    }

    // --- COMMON OPTIONS (live + historical) ---

    // Display mode: percent or ratio
    this._productionGaugeDisplayMode();

    // Thresholds
    const thresholdTarget = $('#thresholdtargetproductionbar');
    const thresholdRedInput = $('#thresholdredproductionbar');

    thresholdTarget.val(pulseConfig.getFloat('thresholdtargetproduction', 80));
    thresholdRedInput.val(pulseConfig.getFloat('thresholdredproduction', 60));

    if (pulseConfig.getDefaultFloat('thresholdtargetproduction') !== pulseConfig.getFloat('thresholdtargetproduction')) {
      thresholdTarget.attr('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat('thresholdredproduction') !== pulseConfig.getFloat('thresholdredproduction')) {
      thresholdRedInput.attr('overridden', 'true');
    }

    thresholdTarget.change(function () {
      this._verficationThresholds(thresholdTarget.val(), thresholdRedInput.val());
    }.bind(this));

    thresholdRedInput.change(function () {
      this._verficationThresholds(thresholdTarget.val(), thresholdRedInput.val());
    }.bind(this));

    // showworkinfo = Show Operation
    const showWorkInfoChk = $('#showworkinfo');
    showWorkInfoChk.prop('checked', pulseConfig.getBool('showworkinfo'));
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      showWorkInfoChk.attr('overridden', 'true');
    }

    showWorkInfoChk.change(function () {
      let isChecked = showWorkInfoChk.is(':checked');
      pulseConfig.set('showworkinfo', isChecked);

      if (isChecked) {
        $('x-workinfo').show();
      } else {
        $('x-workinfo').hide();
      }
    });
    showWorkInfoChk.trigger('change');
  }

  /**
   * Initializes the production gauge display mode radios (% or ratio).
   *
   * Reads `showpercent` config and checks the matching radio.
   * Marks radios as `overridden` if value differs from default.
   * Listeners update `pulseConfig` and the `display-mode` attribute
   * on all `x-productiongauge` elements.
   *
   * Config read: `showpercent` (bool)
   * Attribute set: `x-productiongauge[display-mode]` → 'percent' | 'ratio'
   */
  // Initialize the production gauge display mode radios
  _productionGaugeDisplayMode() {
    const showPercentRadio = $('#productiongaugepercent');
    const showRatioRadio = $('#productiongaugeratio');

    if (pulseConfig.getBool('showpercent')) {
      showPercentRadio.prop('checked', true);
    } else {
      showRatioRadio.prop('checked', true);
    }

    if (pulseConfig.getDefaultBool('showpercent') !== pulseConfig.getBool('showpercent')) {
      showPercentRadio.attr('overridden', 'true');
      showRatioRadio.attr('overridden', 'true');
    }

    showPercentRadio.change(function () {
      if (showPercentRadio.is(':checked')) {
        pulseConfig.set('showpercent', true);
        $('x-productiongauge').attr('display-mode', 'percent');
      }
    });

    showRatioRadio.change(function () {
      if (showRatioRadio.is(':checked')) {
        pulseConfig.set('showpercent', false);
        $('x-productiongauge').attr('display-mode', 'ratio');
      }
    });
  }

  /**
   * Validates and applies the production gauge color thresholds.
   *
   * Validation rules (in order):
   *  1. Both values must be valid numbers (not NaN).
   *  2. redValue >= 0, targetValue > 0.
   *  3. targetValue > redValue (target threshold must exceed red threshold).
   *  4. Both values <= 100 (they are percentages).
   *
   * On error: displays a message in `#thresholdErrorMessage` (created on the fly
   * if absent) and returns false without modifying the config.
   *
   * On success: persists values in pulseConfig and dispatches
   * `configChangeEvent { config: 'thresholdsupdated' }` via eventBus to
   * notify x-productiongauge / x-productionshiftgoal components.
   *
   * @param {number|string} targetValue - Target threshold (green → orange), in %.
   * @param {number|string} redValue    - Critical threshold (orange → red), in %.
   * @returns {boolean} true if valid and applied, false otherwise.
   */
  // Verify threshold values
  _verficationThresholds(targetValue, redValue) {
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      const errorContainer = document.querySelector('.thresholdunitispart')
        || document.querySelector('.showproductiongaugedetails');
      if (errorContainer) {
        errorContainer.appendChild(errorMessage);
      }
    }

    if (isNaN(redValue) || isNaN(targetValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdNaNError', 'Threshold values must be valid numbers');
      errorMessage.style.display = 'block';
      return false;
    }

    if (redValue < 0 || targetValue <= 0) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Threshold values must be positive');
      errorMessage.style.display = 'block';
      return false;
    }

    if (Number(targetValue) <= Number(redValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdError', 'Target threshold must be greater than red threshold');
      errorMessage.style.display = 'block';
      return false;
    }

    if (redValue > 100 || targetValue > 100) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdMaxError', 'Percentage values cannot exceed 100');
      errorMessage.style.display = 'block';
      return false;
    }

    pulseConfig.set('thresholdtargetproduction', parseFloat(targetValue));
    pulseConfig.set('thresholdredproduction', parseFloat(redValue));

    errorMessage.style.display = 'none';

    eventBus.EventBus.dispatchToAll('configChangeEvent',
      {
        config: 'thresholdsupdated'
      });

    return true;
  }

  /**
   * Resets all options to their default values (panel "reset" button).
   *
   * Uses three local helpers to factor out the reset logic:
   *  - `setDefaultChecked(id, configKey?)` : reset checkbox + remove `overridden`
   *  - `setDefaultValue(id, value)`        : reset numeric input + remove `overridden`
   *  - `setDefaultRadioGroup(value, map)`  : reset a radio group by semantic value
   *
   * Options reset:
   *  - showpercent radios (productiongaugepercent / productiongaugeratio)
   *  - thresholdtargetproduction / thresholdredproduction
   *  - showworkinfo checkbox
   *  - defaultlayout checkbox (live mode only — rotation does not exist in historical mode)
   */
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

    const setDefaultRadioGroup = (value, valueToIdMap, { trigger = true } = {}) => {
      Object.values(valueToIdMap).forEach((id) => {
        $('#' + id).removeAttr('overridden');
      });
      const targetId = valueToIdMap[value];
      if (targetId) {
        const element = $('#' + targetId);
        element.prop('checked', true);
        if (trigger) element.change();
      }
    };

    setDefaultRadioGroup(pulseConfig.getDefaultBool('showpercent') ? 'percent' : 'ratio', {
      percent: 'productiongaugepercent',
      ratio: 'productiongaugeratio'
    });

    setDefaultValue('thresholdtargetproductionbar', pulseConfig.getDefaultFloat('thresholdtargetproduction', 80));
    setDefaultValue('thresholdredproductionbar', pulseConfig.getDefaultFloat('thresholdredproduction', 60));

    // showworkinfo = Show Operation
    setDefaultChecked('showworkinfo');

    // [MODIFICATION] Reset layout only in live mode — rotation does not exist in historical mode
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if (tmpContexts && tmpContexts.includes('live')) {
        setDefaultChecked('defaultlayout'); // Reset layout only in live
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Iterates over the declared option list and builds `&param=value` for each.
   * Hidden elements (e.g. rotation options in historical mode) are skipped
   * to avoid encoding forced values that do not reflect user choices.
   *
   * @returns {string} Query string fragment, e.g. `&showpercent=true&showworkinfo=false`.
   */
  getOptionValues() {
    const options = [
      { id: 'productiongaugepercent', type: 'radio', param: 'showpercent' },
      { id: 'thresholdtargetproductionbar', type: 'value', param: 'thresholdtargetproduction' },
      { id: 'thresholdredproductionbar', type: 'value', param: 'thresholdredproduction' },
      { id: 'showworkinfo', type: 'checkbox' },
      // Rotation params
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      // [MODIF] If element is hidden (historical mode), skip it
      if (!el || $(el).is(':hidden')) return '';

      const paramName = opt.param || opt.id;
      if (opt.type === 'checkbox' || opt.type === 'radio') {
        return `&${paramName}=${el.checked}`;
      } else {
        return `&${paramName}=${el.value}`;
      }
    }).join('');
  }

  /**
   * Applies the current configuration to DOM components.
   *
   * Called by pulsePage after `initOptionValues()`, syncs the visual state
   * with values read from pulseConfig (URL params or localStorage):
   *  - `showpercent`  → `display-mode` attribute on x-productiongauge ('percent'|'ratio')
   *  - `showworkinfo` → show/hide x-workinfo
   */
  buildContent() {
    let showPercent = pulseConfig.getBool('showpercent');
    let displayMode = showPercent ? 'percent' : 'ratio';
    $('x-productiongauge').attr('display-mode', displayMode);

    let showworkinfo = pulseConfig.getBool('showworkinfo');
    if (showworkinfo) {
      $('x-workinfo').show();
    } else {
      $('x-workinfo').hide();
    }
  }
}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new OeeViewPage());

  // In live mode, the period is managed in real time by x-periodmanager —
  // x-periodtoolbar (manual period navigation) is irrelevant and hidden.
  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  // Hide period toolbar if context is "live"
  if (tmpContexts && tmpContexts.includes('live')) {
    $('x-periodtoolbar').hide();
  }
});
