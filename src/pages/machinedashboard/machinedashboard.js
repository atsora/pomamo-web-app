// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-machinetab/x-machinetab');
require('x-machinetabnav/x-machinetabnav');
require('x-machinedisplay/x-machinedisplay');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-unansweredreasonnumber/x-unansweredreasonnumber');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-toollifemachine/x-toollifemachine');
require('x-productiontrackergraph/x-productiontrackergraph');
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');
require('x-productionshiftgoal/x-productionshiftgoal');
require('x-workinfo/x-workinfo');
require('x-production/x-production');
require('x-tr/x-tr');
require('x-openstopclassificationlistener/x-openstopclassificationlistener');
require('x-defaultpie/x-defaultpie');
require('x-motionpercentage/x-motionpercentage');
/* require('x-scrapstatus/x-scrapstatus'); */
require('x-periodmanager/x-periodmanager');
require('x-productionbar/x-productionbar');
require('x-productiongauge/x-productiongauge');
require('x-currenticoncncalarm/x-currenticoncncalarm');

// Vanilla helpers — keep call sites compact while still null-guarding.
function _setEach(selector, mutator) {
  document.querySelectorAll(selector).forEach(mutator);
}
function _setDisplayAll(selector, value) {
  _setEach(selector, el => { el.style.display = value; });
}

/**
 * Machine Dashboard page — detailed per-machine dashboard.
 *
 * Displays a horizontal grid of machines (x-machinetab) with, for each machine,
 * a rich set of configurable components: status bars (x-barstack),
 * production tracking graph (x-productiontrackergraph), production gauge or pie chart
 * (x-productiongauge / x-defaultpie), production bar (x-productionbar),
 * changed tools (x-toollifemachine), stop classification (x-openstopclassificationlistener).
 *
 * Configurable options:
 *  - `showChangedTools`              : display changed tools
 *  - `openStopClassification`        : stop classification popup (component injected dynamically)
 *  - `stopClassificationReopenDelay` : automatic reopen delay
 *  - `showproductiontrackergraph`    : production tracking graph
 *  - `showproductionbar`             : production bar + border
 *  - `showpercent`                   : display mode % or ratio (x-productionbar, x-productiongauge)
 *  - `showproductiondisplay`         : show production gauge/pie
 *  - `showproductiongauge`           : gauge (true) or pie chart (false)
 *  - `thresholdtargetproduction` / `thresholdredproduction` : color thresholds
 *  - `showalarm`                     : show the per-machine CNC alarm icon
 *  - `showUnknownAlarm`              : include unknown (non-focused) alarms in the icon query
 *
 * @extends pulsePage.BasePage
 */
class machinedashboardPage extends pulsePage.BasePage {
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
   * Generic helper to initialize a checkbox option.
   *
   * Reads the value from pulseConfig, checks the checkbox, marks `overridden` if
   * the value differs from the default, then binds a listener that persists the value
   * and calls `functionCheck` or `functionUncheck` based on the state.
   *
   * @param {string}   option          - Config key AND DOM id of the checkbox.
   * @param {Function} functionCheck   - Callback when the checkbox is checked.
   * @param {Function} functionUncheck - Callback when the checkbox is unchecked.
   */
  _showOption(option, functionCheck, functionUncheck) {
    const checkbox = document.getElementById(option);
    if (!checkbox) return;
    checkbox.checked = pulseConfig.getBool(option);
    if (pulseConfig.getDefaultBool(option) !== pulseConfig.getBool(option)) {
      checkbox.setAttribute('overridden', 'true');
    }

    checkbox.addEventListener('change', function (event) {
      pulseConfig.set(option, checkbox.checked);
      if (functionCheck && event.target.checked) {
        functionCheck();
      }
      else if (functionUncheck) {
        functionUncheck();
      }
    });
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Initializes the options panel and binds all UI listeners.
   *
   * Initialization sequence (9 blocks):
   *  1. showChangedTools       — display changed tools (`.changedtools-content`)
   *  2. openStopClassification — dynamically create/destroy x-openstopclassificationlistener
   *  3. stopClassificationReopenDelay — numeric delay input
   *  4. showproductiontrackergraph — tracking graph
   *  5. showproductionbar + %/ratio mode — production bar
   *  6. showpercent            — % vs ratio radios (x-productionbar + x-productiongauge)
   *  7. showproductiondisplay + showproductiongauge — gauge vs pie (nested)
   *  8. thresholds             — color thresholds (validated via `_verficationThresholds`)
   *  9. showalarm              — CNC alarm icon visibility (+ showUnknownAlarm sub-option)
   *
   * Final triggers: manually fires key option listeners to sync visual state
   * as soon as the panel opens.
   */
  initOptionValues() {
    // --- 1. SHOW CHANGED TOOLS ---
    const showChangedToolsCB = document.getElementById('showChangedTools');
    if (showChangedToolsCB) {
      showChangedToolsCB.checked = pulseConfig.getBool('showChangedTools');
      if (pulseConfig.getDefaultBool('showChangedTools') != pulseConfig.getBool('showChangedTools'))
        showChangedToolsCB.setAttribute('overridden', 'true');
      showChangedToolsCB.addEventListener('change', function () {
        let show = showChangedToolsCB.checked;
        pulseConfig.set('showChangedTools', show);
        _setDisplayAll('.changedtools-content', show ? 'flex' : 'none');
      });
    }

    // --- 2. OPEN STOP CLASSIFICATION ---
    const openStopCB = document.getElementById('openStopClassification');
    if (openStopCB) {
      openStopCB.checked = pulseConfig.getBool('openStopClassification');
      if (pulseConfig.getDefaultBool('openStopClassification') != pulseConfig.getBool('openStopClassification'))
        openStopCB.setAttribute('overridden', 'true');
      openStopCB.addEventListener('change', () => {
        let show = openStopCB.checked;
        pulseConfig.set('openStopClassification', show);
        if (show) this._createOpenStopClassificationListener();
        else this._deleteOpenStopClassificationListener();
      });
    }

    // --- 3. REOPEN DELAY ---
    this._reopenStopClassificationDelay();

    // --- 4. SHOW PRODUCTION TRACKER GRAPH ---
    const showTrackerGraphCB = document.getElementById('showproductiontrackergraph');
    if (showTrackerGraphCB) {
      showTrackerGraphCB.checked = pulseConfig.getBool('showproductiontrackergraph');
      if (pulseConfig.getDefaultBool('showproductiontrackergraph') != pulseConfig.getBool('showproductiontrackergraph'))
        showTrackerGraphCB.setAttribute('overridden', 'true');
      showTrackerGraphCB.addEventListener('change', function () {
        let show = showTrackerGraphCB.checked;
        pulseConfig.set('showproductiontrackergraph', show);
        _setDisplayAll('x-productiontrackergraph', show ? '' : 'none');
      });
    }

    // --- 5. SHOW PRODUCTION BAR ---
    const showBarCB = document.getElementById('showproductionbar');
    if (showBarCB) {
      showBarCB.checked = pulseConfig.getBool('showproductionbar');
      if (pulseConfig.getDefaultBool('showproductionbar') != pulseConfig.getBool('showproductionbar'))
        showBarCB.setAttribute('overridden', 'true');
      showBarCB.addEventListener('change', function () {
        let show = showBarCB.checked;
        pulseConfig.set('showproductionbar', show);
        _setDisplayAll('x-productionbar', show ? '' : 'none');
        _setDisplayAll('.performancebar-bar-border', show ? '' : 'none');
      });
    }

    // --- 6. PERCENT VS RATIO ---
    const productionBarPercent = document.getElementById('productionbarpercent');
    const productionBarRatio = document.getElementById('productionbarratio');
    if (productionBarPercent && productionBarRatio) {
      if (pulseConfig.getBool('showpercent')) {
        productionBarPercent.checked = true;
      } else {
        productionBarRatio.checked = true;
      }
      if (pulseConfig.getDefaultBool('showpercent') !== pulseConfig.getBool('showpercent')) {
        productionBarPercent.setAttribute('overridden', 'true');
        productionBarRatio.setAttribute('overridden', 'true');
      }
      const onPercentRatioChange = function () {
        let isPercent = productionBarPercent.checked;
        pulseConfig.set('showpercent', isPercent);
        let mode = isPercent ? 'percent' : 'ratio';
        // Applies to existing elements; buildContent() will handle future clones
        _setEach('x-productionbar', el => el.setAttribute('display-mode', mode));
        _setEach('x-productiongauge', el => el.setAttribute('display-mode', mode));
      };
      productionBarPercent.addEventListener('change', onPercentRatioChange);
      productionBarRatio.addEventListener('change', onPercentRatioChange);
    }

    // --- 7. SHOW PRODUCTION DISPLAY (main toggle) ---
    const showProdDisplayCB = document.getElementById('showproductiondisplay');
    if (showProdDisplayCB) {
      showProdDisplayCB.checked = pulseConfig.getBool('showproductiondisplay');
      if (pulseConfig.getDefaultBool('showproductiondisplay') != pulseConfig.getBool('showproductiondisplay'))
        showProdDisplayCB.setAttribute('overridden', 'true');
      showProdDisplayCB.addEventListener('change', function () {
        let show = showProdDisplayCB.checked;
        pulseConfig.set('showproductiondisplay', show);
        if (show) {
          _setDisplayAll('.showproductiondisplaydetails', '');
          let gaugeRadio = document.getElementById('productiongauge');
          let isGauge = gaugeRadio ? gaugeRadio.checked : true;
          _setDisplayAll('x-productiongauge', isGauge ? '' : 'none');
          _setDisplayAll('x-defaultpie', isGauge ? 'none' : '');
        } else {
          _setDisplayAll('.showproductiondisplaydetails', 'none');
          _setDisplayAll('x-productiongauge', 'none');
          _setDisplayAll('x-defaultpie', 'none');
        }
      });
    }

    // --- 7. GAUGE VS PIE ---
    const productionGaugeRadio = document.getElementById('productiongauge');
    const productionPieRadio = document.getElementById('productionpie');
    if (productionGaugeRadio && productionPieRadio) {
      if (pulseConfig.getBool('showproductiongauge')) {
        productionGaugeRadio.checked = true;
      } else {
        productionPieRadio.checked = true;
      }
      if (pulseConfig.getDefaultBool('showproductiongauge') !== pulseConfig.getBool('showproductiongauge')) {
        productionGaugeRadio.setAttribute('overridden', 'true');
        productionPieRadio.setAttribute('overridden', 'true');
      }
      const onGaugePieChange = function () {
        let isGauge = productionGaugeRadio.checked;
        pulseConfig.set('showproductiongauge', isGauge);
        let productionDisplayCB = document.getElementById('showproductiondisplay');
        if (productionDisplayCB && productionDisplayCB.checked) {
          _setDisplayAll('x-productiongauge', isGauge ? '' : 'none');
          _setDisplayAll('x-defaultpie', isGauge ? 'none' : '');
        }
      };
      productionGaugeRadio.addEventListener('change', onGaugePieChange);
      productionPieRadio.addEventListener('change', onGaugePieChange);
    }

    // --- 8. THRESHOLDS ---
    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');
    if (thresholdTarget) {
      thresholdTarget.value = pulseConfig.getFloat('thresholdtargetproduction', 80);
      if (pulseConfig.getDefaultFloat('thresholdtargetproduction', 80) !== pulseConfig.getFloat('thresholdtargetproduction', 80)) {
        thresholdTarget.setAttribute('overridden', 'true');
      }
      thresholdTarget.addEventListener('change',
        () => this._verficationThresholds(thresholdTarget.value, thresholdRedInput ? thresholdRedInput.value : '', true));
    }
    if (thresholdRedInput) {
      thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction', 60);
      if (pulseConfig.getDefaultFloat('thresholdredproduction', 60) !== pulseConfig.getFloat('thresholdredproduction', 60)) {
        thresholdRedInput.setAttribute('overridden', 'true');
      }
      thresholdRedInput.addEventListener('change',
        () => this._verficationThresholds(thresholdTarget ? thresholdTarget.value : '', thresholdRedInput.value, true));
    }

    // --- 9. SHOW CURRENT ALARM (CNC alarm icon) ---
    const showAlarmCB = document.getElementById('showalarm');
    if (showAlarmCB) {
      showAlarmCB.checked = pulseConfig.getBool('showalarm');
      if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm'))
        showAlarmCB.setAttribute('overridden', 'true');
      showAlarmCB.addEventListener('change', function () {
        let show = showAlarmCB.checked;
        pulseConfig.set('showalarm', show);
        _setDisplayAll('.cncalarmicon-content', show ? 'flex' : 'none');
        document.querySelectorAll('.showalarmdetails').forEach(el => {
          el.style.display = show ? '' : 'none';
        });
      });
    }

    // Alarm sub-option: include unknown (non-focused) alarms in the icon query
    const showUnknownAlarmCB = document.getElementById('showUnknownAlarm');
    if (showUnknownAlarmCB) {
      showUnknownAlarmCB.checked = pulseConfig.getBool('showUnknownAlarm');
      if (pulseConfig.getDefaultBool('showUnknownAlarm') != pulseConfig.getBool('showUnknownAlarm'))
        showUnknownAlarmCB.setAttribute('overridden', 'true');
      showUnknownAlarmCB.addEventListener('change', function () {
        pulseConfig.set('showUnknownAlarm', showUnknownAlarmCB.checked);
        eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showUnknownAlarm' });
      });
    }

    // Initial triggers to sync the UI state
    if (showChangedToolsCB) showChangedToolsCB.dispatchEvent(new Event('change', { bubbles: true }));
    if (openStopCB) openStopCB.dispatchEvent(new Event('change', { bubbles: true }));
    if (showBarCB) showBarCB.dispatchEvent(new Event('change', { bubbles: true }));
    if (showProdDisplayCB) showProdDisplayCB.dispatchEvent(new Event('change', { bubbles: true }));
    if (showAlarmCB) showAlarmCB.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Creates and injects the x-openstopclassificationlistener element into the DOM.
   *
   * The component is appended to the body (outside the tile template) because it is
   * page-global — it listens to all stops and opens a classification popup.
   * Checks for an existing component before injecting (idempotent).
   *
   * Attributes injected: machine-context="PulseWebApp", period-context="machinedashboard",
   *                      status-context="PulseWebApp".
   */
  _createOpenStopClassificationListener() {
    let details = document.querySelector('.openStopClassificationDetails');
    if (details) details.style.display = 'block';
    const container = document.body || document.documentElement;
    let existing = container.querySelector('x-openstopclassificationlistener');
    if (!existing) {
      let listener = document.createElement('x-openstopclassificationlistener');
      listener.setAttribute('machine-context', 'PulseWebApp');
      listener.setAttribute('period-context', 'machinedashboard');
      listener.setAttribute('status-context', 'PulseWebApp');
      container.appendChild(listener);
    }
  }

  /**
   * Removes the x-openstopclassificationlistener element from the DOM and hides its UI.
   * Inverse operation of `_createOpenStopClassificationListener()`.
   */
  _deleteOpenStopClassificationListener() {
    let details = document.querySelector('.openStopClassificationDetails');
    if (details) details.style.display = 'none';
    const container = document.body || document.documentElement;
    let existing = container.querySelector('x-openstopclassificationlistener');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Initializes the stop classification reopen delay numeric input.
   *
   * Reads `stopClassificationReopenDelay` (default: 5s), marks `overridden` if modified,
   * and persists to pulseConfig on each valid change (integer >= 0).
   */
  _reopenStopClassificationDelay() {
    const stopClassificationReopenDelayInput = document.getElementById('stopClassificationReopenDelay');
    if (!stopClassificationReopenDelayInput) return;
    stopClassificationReopenDelayInput.value = pulseConfig.getInt('stopClassificationReopenDelay', 5);
    if (pulseConfig.getDefaultInt('stopClassificationReopenDelay') !== pulseConfig.getInt('stopClassificationReopenDelay')) {
      stopClassificationReopenDelayInput.setAttribute('overridden', 'true');
    }
    stopClassificationReopenDelayInput.addEventListener('change', function () {
      const value = parseInt(stopClassificationReopenDelayInput.value);
      if (!isNaN(value) && value >= 0) {
        pulseConfig.set('stopClassificationReopenDelay', value);
      }
    });
  }

  /**
   * Validates and applies the production bar/gauge color thresholds.
   *
   * Same logic as oeeview._verficationThresholds — see that file for details.
   * Difference: the error container falls back to `.showproductionbardetails`
   * (instead of `.showproductiongaugedetails` in oeeview).
   *
   * On success, dispatches `configChangeEvent { config: 'thresholdsupdated' }`
   * to notify x-productionbar and x-productiongauge components.
   *
   * @param {number|string} targetValue - Target threshold (green → orange), in %.
   * @param {number|string} redValue    - Critical threshold (orange → red), in %.
   * @returns {boolean} true if valid and applied, false otherwise.
   */
  _verficationThresholds(targetValue, redValue) {
    // Find or create error message element
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      const errorContainer = document.querySelector('.thresholdunitispart')
        || document.querySelector('.showproductionbardetails');
      if (errorContainer) {
        errorContainer.appendChild(errorMessage);
      }
    }

    // Check if values are valid numbers
    if (isNaN(redValue) || isNaN(targetValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdNaNError', 'Threshold values must be valid numbers');
      errorMessage.style.display = 'block';
      return false;
    }

    // values between 0 and 100
    if (redValue < 0 || targetValue <= 0) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Threshold values must be positive');
      errorMessage.style.display = 'block';
      return false;
    }

    // In percentage mode: target > red (normal logic)
    if (Number(targetValue) <= Number(redValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdError', 'Target threshold must be greater than red threshold');
      errorMessage.style.display = 'block';
      return false;
    }

    // Percentage cannot exceed 100
    if (redValue > 100 || targetValue > 100) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdMaxError', 'Percentage values cannot exceed 100');
      errorMessage.style.display = 'block';
      return false;
    }

    // store values
    pulseConfig.set('thresholdtargetproduction', parseFloat(targetValue));
    pulseConfig.set('thresholdredproduction', parseFloat(redValue));

    errorMessage.style.display = 'none';

    // Dispatch to update displays
    eventBus.EventBus.dispatchToAll('configChangeEvent',
      {
        config: 'thresholdsupdated'
      });

    return true;
  }

  /**
   * Resets all options to their default values (panel "reset" button).
   *
   * Uses the three standard local helpers (setDefaultChecked, setDefaultValue,
   * setDefaultRadioGroup) to cover all input types in the panel.
   *
   * Reset order: changed tools → stop classification → delay → production graph
   *   → production bar + %/ratio mode → production display → gauge/pie → thresholds → cnc alarm icon.
   */
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.checked = pulseConfig.getDefaultBool(configKey);
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.value = value;
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultRadioGroup = (value, valueToIdMap, { trigger = true } = {}) => {
      Object.values(valueToIdMap).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.removeAttribute('overridden');
      });
      const targetId = valueToIdMap[value];
      if (targetId) {
        const element = document.getElementById(targetId);
        if (!element) return;
        element.checked = true;
        if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    setDefaultChecked('showChangedTools');
    setDefaultChecked('openStopClassification');
    setDefaultValue('stopClassificationReopenDelay', pulseConfig.getDefaultInt('stopClassificationReopenDelay', 0));

    // Production tracker graph
    setDefaultChecked('showproductiontrackergraph');

    // Production bar
    setDefaultChecked('showproductionbar');
    setDefaultRadioGroup(pulseConfig.getDefaultBool('showpercent') ? 'percent' : 'ratio', {
      percent: 'productionbarpercent',
      ratio: 'productionbarratio'
    });

    // Show production display
    setDefaultChecked('showproductiondisplay');

    // Production display type
    setDefaultRadioGroup(pulseConfig.getDefaultBool('showproductiongauge') ? 'gauge' : 'pie', {
      gauge: 'productiongauge',
      pie: 'productionpie'
    });

    setDefaultValue('thresholdtargetproductionbar', pulseConfig.getDefaultFloat('thresholdtargetproduction'));
    setDefaultValue('thresholdredproductionbar', pulseConfig.getDefaultFloat('thresholdredproduction'));

    // CNC alarm icon
    setDefaultChecked('showalarm');
    setDefaultChecked('showUnknownAlarm');
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Uses the unified declarative pattern `{ id, type, param? }`.
   * Radios (productionbarpercent, productiongauge) are exported via their
   * semantic `param` (showpercent, showproductiongauge).
   *
   * @returns {string} Query string fragment.
   */
  getOptionValues() {
    const options = [
      { id: 'showChangedTools', type: 'checkbox' },
      { id: 'showproductiontrackergraph', type: 'checkbox' },
      { id: 'openStopClassification', type: 'checkbox' },
      { id: 'stopClassificationReopenDelay', type: 'value' },
      { id: 'showproductionbar', type: 'checkbox' },
      { id: 'productionbarpercent', type: 'radio', param: 'showpercent' },
      { id: 'showproductiondisplay', type: 'checkbox' },
      { id: 'productiongauge', type: 'radio', param: 'showproductiongauge' },
      { id: 'thresholdtargetproductionbar', type: 'value', param: 'thresholdtargetproduction' },
      { id: 'thresholdredproductionbar', type: 'value', param: 'thresholdredproduction' },
      { id: 'showalarm', type: 'checkbox' },
      { id: 'showUnknownAlarm', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';

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
   * Called after option initialization to sync the visual state with
   * URL params / localStorage. Also handles per-machine clones that
   * do not yet exist when initOptionValues runs.
   *
   * Components driven:
   *  - `showproductiondisplay` + `showproductiongauge` → x-productiongauge / x-defaultpie
   *  - `showproductiontrackergraph`                    → x-productiontrackergraph
   *  - `showproductionbar`                             → x-productionbar + `.performancebar-bar-border`
   *  - `showChangedTools`                              → `.changedtools-content`
   *  - `showpercent`                                   → `display-mode` attribute on x-productionbar + x-productiongauge
   *  - `showalarm`                                     → `.cncalarmicon-content`
   *
   * Note: bars (x-barstack) read pulseConfig directly — no need to drive them here.
   */
  buildContent() {
    // Bars are managed by x-barstack reading pulseConfig directly.

    // --- APPLY TO X-GROUPARRAY CLONES ---
    let showproductiondisplay = pulseConfig.getBool('showproductiondisplay');
    let showproductiongauge = pulseConfig.getBool('showproductiongauge');
    if (showproductiondisplay) {
      _setDisplayAll('x-productiongauge', showproductiongauge ? '' : 'none');
      _setDisplayAll('x-defaultpie', showproductiongauge ? 'none' : '');
    } else {
      _setDisplayAll('x-productiongauge', 'none');
      _setDisplayAll('x-defaultpie', 'none');
    }

    let showproductiontrackergraph = pulseConfig.getBool('showproductiontrackergraph');
    _setDisplayAll('x-productiontrackergraph', showproductiontrackergraph ? '' : 'none');

    let showproductionbar = pulseConfig.getBool('showproductionbar');
    _setDisplayAll('x-productionbar', showproductionbar ? '' : 'none');
    _setDisplayAll('.performancebar-bar-border', showproductionbar ? '' : 'none');

    let showChangedTools = pulseConfig.getBool('showChangedTools');
    _setDisplayAll('.changedtools-content', showChangedTools ? 'flex' : 'none');

    let showCncAlarmIcon = pulseConfig.getBool('showalarm');
    _setDisplayAll('.cncalarmicon-content', showCncAlarmIcon ? 'flex' : 'none');

    // Apply display mode (percent/ratio) to freshly created clones
    let showPercent = pulseConfig.getBool('showpercent');
    let displayMode = showPercent ? 'percent' : 'ratio';
    _setEach('x-productionbar', el => el.setAttribute('display-mode', displayMode));
    _setEach('x-productiongauge', el => el.setAttribute('display-mode', displayMode));
  }

}

// Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new machinedashboardPage());
  });
} else {
  pulsePage.preparePage(new machinedashboardPage());
}
