// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');

require('x-grouplist/x-grouplist');
require('x-rotationprogress/x-rotationprogress');

require('x-machinedisplay/x-machinedisplay');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-lastworkinformation/x-lastworkinformation');
require('x-currentcncvalue/x-currentcncvalue');
require('x-lastshift/x-lastshift');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-periodtoolbar/x-periodtoolbar');
require('x-reasonbutton/x-reasonbutton');
require('x-clock/x-clock');
require('x-productionstatelegends/x-productionstatelegends');
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');
require('x-tr/x-tr');

/**
 * Running page — real-time per-machine view with status bars and operation info.
 *
 * Displays a list of machines (x-grouplist) with, for each machine:
 * a stack of bars (x-barstack), current info (job, shift, CNC),
 * and the reason entry button (x-reasonbutton).
 *
 * Two mutually exclusive bar modes:
 *  - **Production bar** (showproductionbar=true)  : x-productionstatelegends visible,
 *    x-reasongroups hidden.
 *  - **Reason bar**     (showproductionbar=false) : x-reasongroups visible,
 *    x-productionstatelegends hidden.
 *
 * The bar option is only exposed if `allowproductionbar` = true in the config.
 *
 * Components: x-grouplist, x-barstack, x-machinedisplay, x-lastworkinformation,
 * x-currentcncvalue, x-lastshift, x-productionmachiningstatus, x-periodtoolbar, x-clock,
 * x-reasonbutton, x-reasongroups, x-fieldlegends, x-machinemodelegends,
 * x-productionstatelegends.
 *
 * @extends pulsePage.BasePage
 */
class RunningPage extends pulsePage.BasePage {
  /**
   * Forces `column=''` in pulseConfig to disable column mode
   * (x-grouplist must render as a list, not a grid).
   */
  constructor() {
    super();

    // General configuration
    pulseConfig.set('column', '');
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Hides the options group if `allowproductionbar` = false (the production bar
   * is not available in this deployed configuration).
   *
   * Bar radio management (showproductionbar / showreasonbar):
   *  - The two radios are linked in inverse logic (one is the NOT of the other).
   *  - `applyBarChoice(bool)` centralizes the change: updates pulseConfig,
   *    forces barstack reload, and alternates the visible legend.
   *
   * Configs read/written: `allowproductionbar` (read-only), `showproductionbar`.
   */
  // CONFIG PANEL - Init
  initOptionValues () {
    // Allow choose production bar display
    let allowproductionbar = pulseConfig.getBool('allowproductionbar');
    if (!allowproductionbar) {
      $('.group-options').hide();
    }

    // BAR : day / shift
    $('#showproductionbar').prop('checked',
      pulseConfig.getBool('showproductionbar'));
    const applyBarChoice = (showproductionbar) => {
      pulseConfig.set('showproductionbar', showproductionbar);
      document.querySelectorAll('x-barstack').forEach(el => el._applySwitch());
      if (showproductionbar) {
        $('x-reasongroups').hide();
        $('x-productionstatelegends').show();
      }
      else {
        $('x-reasongroups').show();
        $('x-productionstatelegends').hide();
      }
    };
    $('#showproductionbar').change(function () {
      applyBarChoice($('#showproductionbar').is(':checked'));
    });
    $('#showreasonbar').prop('checked', !pulseConfig.getBool('showproductionbar'));
    $('#showreasonbar').change(function () {
      applyBarChoice(!$('#showreasonbar').is(':checked'));
    });
  }

  /**
   * Resets options to their default values.
   *
   * Resets `showproductionbar` via `setDefaultChecked`, then manually syncs
   * the inverse radio `showreasonbar` (= !showproductionbar)
   * since it is not stored directly in pulseConfig.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.prop('checked', pulseConfig.getDefaultBool(configKey));
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    // BAR (reason / production state)
    setDefaultChecked('showproductionbar');

    $('#showreasonbar').prop('checked', !pulseConfig.getDefaultBool('showproductionbar'));
    $('#showreasonbar').change();
    $('#showreasonbar').removeAttr('overridden');
  }

  /**
   * Serializes active options as URL query string parameters.
   * Only `showproductionbar` is exported (showreasonbar is its inverse and is not stored).
   *
   * @returns {string} Query string fragment, e.g. `&showproductionbar=true`.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues () {
    const options = [
      { id: 'showproductionbar', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      return `&${opt.id}=${el.checked}`;
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
   * Applies the current configuration to DOM components.
   *
   * Components driven by `currentdisplay.*` (independent configs, not linked):
   *  - `displayjobshiftpartcount` → x-productionmachiningstatus
   *  - `displayjob`               → x-lastworkinformation
   *  - `displayshift`             → x-lastShift
   *  - `displaycncvalue`          → x-currentcncvalue
   *
   * Components driven by other configs:
   *  - `showcoloredbar.cncvalue` → x-fieldlegends (CNC legend)
   *  - `showproductionbar`       → x-reasongroups / x-productionstatelegends (mutually exclusive)
   *
   * Note: bars (x-barstack) read pulseConfig directly — no need to drive them here.
   */
  buildContent () {

    //Link between these displays are removed - In case of bad config, job can be displayed twice (ex: dev)
    let addProductionMachining = pulseConfig.getBool('currentdisplay.displayjobshiftpartcount', false);
    let displayJob = pulseConfig.getBool('currentdisplay.displayjob', true);
    let displayShift = pulseConfig.getBool('currentdisplay.displayshift', true);
    let displayCNCValue = pulseConfig.getBool('currentdisplay.displaycncvalue', true);

    if (addProductionMachining) {
      $('x-productionmachiningstatus').show();
    }
    else {
      $('x-productionmachiningstatus').hide();
    }
    if (displayJob) { // == LastWorkinformation
      $('x-lastworkinformation').show();
    }
    else {
      $('x-lastworkinformation').hide();
    }
    if (displayShift) {
      $('x-lastShift').show();
    }
    else {
      $('x-lastShift').hide();
    }
    if (displayCNCValue) {
      $('x-currentcncvalue').show();
    }
    else {
      $('x-currentcncvalue').hide();
    }

    // Bars are now managed by x-barstack reading pulseConfig directly.
    // Only non-bar elements need explicit show/hide here.

    const showCncValue = pulseConfig.getBool('showcoloredbar.cncvalue', true);
    if (showCncValue) {
      $('x-fieldlegends').show();
    }
    else {
      $('x-fieldlegends').hide();
    }

    const showproductionbar = pulseConfig.getBool('showproductionbar', false);
    if (showproductionbar) {
      $('x-reasongroups').hide();
      $('x-productionstatelegends').show();
    }
    else {
      $('x-reasongroups').show();
      $('x-productionstatelegends').hide();
    }
  }
}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new RunningPage());

  // In live mode, the time navigation header is hidden
  // (the live running page has no period selection).
  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  if (tmpContexts && tmpContexts.includes('live')) {
    $('.running-header').hide();
  }

  // x-datetimegraduation cannot handle resize when hidden at mount time —
  // force load after the page is visible.
  $('x-datetimegraduation').load(); // DTG can not manage resize when hidden
});
