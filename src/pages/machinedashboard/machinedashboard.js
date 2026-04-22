// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-machinetab/x-machinetab');
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

/**
 * Machine Dashboard page — detailed per-machine dashboard.
 *
 * Displays a horizontal grid of machines (x-grouparray) with, for each machine,
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
  // Initialize an option checkbox
  _showOption(option, functionCheck, functionUncheck) {
    const checkbox = document.getElementById(option);
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
    })
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Initializes the options panel and binds all UI listeners.
   *
   * Initialization sequence (8 blocks):
   *  1. showChangedTools       — display changed tools (`.changedtools-content`)
   *  2. openStopClassification — dynamically create/destroy x-openstopclassificationlistener
   *  3. stopClassificationReopenDelay — numeric delay input
   *  4. showproductiontrackergraph — tracking graph
   *  5. showproductionbar + %/ratio mode — production bar
   *  6. showpercent            — % vs ratio radios (x-productionbar + x-productiongauge)
   *  7. showproductiondisplay + showproductiongauge — gauge vs pie (nested)
   *  8. thresholds             — color thresholds (validated via `_verficationThresholds`)
   *
   * Final triggers: manually fires key option listeners to sync visual state
   * as soon as the panel opens.
   */
  initOptionValues() {
    // --- 1. SHOW CHANGED TOOLS ---
    $('#showChangedTools').prop('checked', pulseConfig.getBool('showChangedTools'));
    if (pulseConfig.getDefaultBool('showChangedTools') != pulseConfig.getBool('showChangedTools'))
      $('#showChangedTools').attr('overridden', 'true');
    $('#showChangedTools').change(function () {
      let show = $('#showChangedTools').is(':checked');
      pulseConfig.set('showChangedTools', show);
      if (show) $('.changedtools-content').css('display', 'flex');
      else $('.changedtools-content').hide();
    });

    // --- 2. OPEN STOP CLASSIFICATION ---
    $('#openStopClassification').prop('checked', pulseConfig.getBool('openStopClassification'));
    if (pulseConfig.getDefaultBool('openStopClassification') != pulseConfig.getBool('openStopClassification'))
      $('#openStopClassification').attr('overridden', 'true');
    $('#openStopClassification').change(() => {
      let show = $('#openStopClassification').is(':checked');
      pulseConfig.set('openStopClassification', show);
      if (show) this._createOpenStopClassificationListener();
      else this._deleteOpenStopClassificationListener();
    });

    // --- 3. REOPEN DELAY ---
    this._reopenStopClassificationDelay();

    // --- 4. SHOW PRODUCTION TRACKER GRAPH ---
    $('#showproductiontrackergraph').prop('checked', pulseConfig.getBool('showproductiontrackergraph'));
    if (pulseConfig.getDefaultBool('showproductiontrackergraph') != pulseConfig.getBool('showproductiontrackergraph'))
      $('#showproductiontrackergraph').attr('overridden', 'true');
    $('#showproductiontrackergraph').change(function () {
      let show = $('#showproductiontrackergraph').is(':checked');
      pulseConfig.set('showproductiontrackergraph', show);
      if (show) $('x-productiontrackergraph').show();
      else $('x-productiontrackergraph').hide();
    });

    // --- 5. SHOW PRODUCTION BAR ---
    $('#showproductionbar').prop('checked', pulseConfig.getBool('showproductionbar'));
    if (pulseConfig.getDefaultBool('showproductionbar') != pulseConfig.getBool('showproductionbar'))
      $('#showproductionbar').attr('overridden', 'true');
    $('#showproductionbar').change(function () {
      let show = $('#showproductionbar').is(':checked');
      pulseConfig.set('showproductionbar', show);
      if (show) {
        $('x-productionbar').show();
        $('.performancebar-bar-border').show();
      } else {
        $('x-productionbar').hide();
        $('.performancebar-bar-border').hide();
      }
    });

    // --- 6. PERCENT VS RATIO ---
    if (pulseConfig.getBool('showpercent')) {
      $('#productionbarpercent').prop('checked', true);
    } else {
      $('#productionbarratio').prop('checked', true);
    }
    if (pulseConfig.getDefaultBool('showpercent') !== pulseConfig.getBool('showpercent')) {
      $('#productionbarpercent').attr('overridden', 'true');
      $('#productionbarratio').attr('overridden', 'true');
    }
    $('#productionbarpercent, #productionbarratio').change(function () {
      let isPercent = $('#productionbarpercent').is(':checked');
      pulseConfig.set('showpercent', isPercent);
      let mode = isPercent ? 'percent' : 'ratio';
      // Applies to existing elements; buildContent() will handle future clones
      $('x-productionbar').attr('display-mode', mode);
      $('x-productiongauge').attr('display-mode', mode);
    });

    // --- 7. SHOW PRODUCTION DISPLAY (main toggle) ---
    $('#showproductiondisplay').prop('checked', pulseConfig.getBool('showproductiondisplay'));
    if (pulseConfig.getDefaultBool('showproductiondisplay') != pulseConfig.getBool('showproductiondisplay'))
      $('#showproductiondisplay').attr('overridden', 'true');
    $('#showproductiondisplay').change(function () {
      let show = $('#showproductiondisplay').is(':checked');
      pulseConfig.set('showproductiondisplay', show);
      if (show) {
        $('.showproductiondisplaydetails').show();
        let isGauge = $('#productiongauge').is(':checked');
        if (isGauge) {
          $('x-productiongauge').show();
          $('x-defaultpie').hide();
        } else {
          $('x-productiongauge').hide();
          $('x-defaultpie').show();
        }
      } else {
        $('.showproductiondisplaydetails').hide();
        $('x-productiongauge').hide();
        $('x-defaultpie').hide();
      }
    });

    // --- 7. GAUGE VS PIE ---
    if (pulseConfig.getBool('showproductiongauge')) {
      $('#productiongauge').prop('checked', true);
    } else {
      $('#productionpie').prop('checked', true);
    }
    if (pulseConfig.getDefaultBool('showproductiongauge') !== pulseConfig.getBool('showproductiongauge')) {
      $('#productiongauge').attr('overridden', 'true');
      $('#productionpie').attr('overridden', 'true');
    }
    $('#productiongauge, #productionpie').change(function () {
      let isGauge = $('#productiongauge').is(':checked');
      pulseConfig.set('showproductiongauge', isGauge);
      if ($('#showproductiondisplay').is(':checked')) {
        if (isGauge) {
          $('x-productiongauge').show();
          $('x-defaultpie').hide();
        } else {
          $('x-productiongauge').hide();
          $('x-defaultpie').show();
        }
      }
    });

    // --- 8. THRESHOLDS ---
    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');
    thresholdTarget.value = pulseConfig.getFloat('thresholdtargetproduction', 80);
    thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction', 60);
    if (pulseConfig.getDefaultFloat('thresholdtargetproduction', 80) !== pulseConfig.getFloat('thresholdtargetproduction', 80)) {
      thresholdTarget.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat('thresholdredproduction', 60) !== pulseConfig.getFloat('thresholdredproduction', 60)) {
      thresholdRedInput.setAttribute('overridden', 'true');
    }
    thresholdTarget.addEventListener('change', () => this._verficationThresholds(thresholdTarget.value, thresholdRedInput.value, true));
    thresholdRedInput.addEventListener('change', () => this._verficationThresholds(thresholdTarget.value, thresholdRedInput.value, true));

    // Initial triggers to sync the UI state
    $('#showChangedTools').trigger('change');
    $('#openStopClassification').trigger('change');
    $('#showproductionbar').trigger('change');
    $('#showproductiondisplay').trigger('change');
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
  // Create the open stop classification listener element
  _createOpenStopClassificationListener() {
    document.querySelector('.openStopClassificationDetails').style.display = 'block';
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
  // Delete the open stop classification listener element
  _deleteOpenStopClassificationListener() {
    document.querySelector('.openStopClassificationDetails').style.display = 'none';
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
  // Initialize the reopen stop classification delay input
  _reopenStopClassificationDelay() {
    const stopClassificationReopenDelayInput = document.getElementById('stopClassificationReopenDelay');
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
   * Initializes the production bar display mode radios (% or ratio).
   *
   * Note: this method is not called from initOptionValues — the equivalent logic
   * is inlined in block 6. It remains available as a refactored alternative.
   * Simultaneously affects x-productionbar and x-productiongauge via `setAttribute('display-mode')`.
   */
  // Initialize the production bar display mode radios
  _productionBarDisplayMode() {
    const showPercentRadio = document.getElementById('productionbarpercent');
    const showRatioRadio = document.getElementById('productionbarratio');

    if (pulseConfig.getBool('showpercent')) {
      showPercentRadio.checked = true;
    } else {
      showRatioRadio.checked = true;
    }

    if (pulseConfig.getDefaultBool('showpercent') !== pulseConfig.getBool('showpercent')) {
      showPercentRadio.setAttribute('overridden', 'true');
      showRatioRadio.setAttribute('overridden', 'true');
    }

    showPercentRadio.addEventListener('change', function () {
      if (showPercentRadio.checked) {
        pulseConfig.set('showpercent', true);
        document.querySelectorAll('x-productionbar').forEach(el => {
          el.setAttribute('display-mode', 'percent');
        });
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'percent');
        });
      }
    });

    showRatioRadio.addEventListener('change', function () {
      if (showRatioRadio.checked) {
        pulseConfig.set('showpercent', false);
        document.querySelectorAll('x-productionbar').forEach(el => {
          el.setAttribute('display-mode', 'ratio');
        });
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.setAttribute('display-mode', 'ratio');
        });
      }
    });
  }

  /**
   * Initializes the production display type radios (gauge vs pie chart).
   *
   * Note: this method is not called from initOptionValues — the equivalent logic
   * is inlined in block 7. It remains available as a refactored alternative.
   * Show/hide depends on `showproductiondisplay`: if production is not displayed,
   * both components are hidden regardless of the gauge/pie choice.
   */
  // Initialize the production display type radios (gauge vs pie)
  _productionDisplayType() {
    const showGaugeRadio = document.getElementById('productiongauge');
    const showPieRadio = document.getElementById('productionpie');

    if (pulseConfig.getBool('showproductiongauge')) {
      showGaugeRadio.checked = true;
    } else {
      showPieRadio.checked = true;
    }

    if (pulseConfig.getDefaultBool('showproductiongauge') !== pulseConfig.getBool('showproductiongauge')) {
      showGaugeRadio.setAttribute('overridden', 'true');
      showPieRadio.setAttribute('overridden', 'true');
    }

    showGaugeRadio.addEventListener('change', function () {
      if (showGaugeRadio.checked) {
        pulseConfig.set('showproductiongauge', true);
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.style.display = 'block';
        });
        document.querySelectorAll('x-defaultpie').forEach(el => {
          el.style.display = 'none';
        });
      }
    });

    showPieRadio.addEventListener('change', function () {
      if (showPieRadio.checked) {
        pulseConfig.set('showproductiongauge', false);
        document.querySelectorAll('x-productiongauge').forEach(el => {
          el.style.display = 'none';
        });
        document.querySelectorAll('x-defaultpie').forEach(el => {
          el.style.display = 'block';
        });
      }
    });

    // Apply initial state based on options
    const showProductionDisplayCheckbox = document.getElementById('showproductiondisplay');
    if (showProductionDisplayCheckbox && showProductionDisplayCheckbox.checked) {
      if (showGaugeRadio.checked) {
        showGaugeRadio.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        showPieRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      document.querySelectorAll('x-productiongauge').forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll('x-defaultpie').forEach(el => {
        el.style.display = 'none';
      });
    }
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
  // Verify threshold values
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
   *   → production bar + %/ratio mode → production display → gauge/pie → thresholds.
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
      { id: 'thresholdredproductionbar', type: 'value', param: 'thresholdredproduction' }
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
   * URL params / localStorage. Also handles clones created by x-grouparray
   * that do not yet exist when initOptionValues runs.
   *
   * Components driven:
   *  - `showproductiondisplay` + `showproductiongauge` → x-productiongauge / x-defaultpie
   *  - `showproductiontrackergraph`                    → x-productiontrackergraph
   *  - `showproductionbar`                             → x-productionbar + `.performancebar-bar-border`
   *  - `showChangedTools`                              → `.changedtools-content`
   *  - `showpercent`                                   → `display-mode` attribute on x-productionbar + x-productiongauge
   *
   * Note: bars (x-barstack) read pulseConfig directly — no need to drive them here.
   */
  buildContent() {
    // Bars are managed by x-barstack reading pulseConfig directly.

    // --- APPLY TO X-GROUPARRAY CLONES ---
    let showproductiondisplay = pulseConfig.getBool('showproductiondisplay');
    let showproductiongauge = pulseConfig.getBool('showproductiongauge');
    if (showproductiondisplay) {
      if (showproductiongauge) {
        $('x-productiongauge').show();
        $('x-defaultpie').hide();
      } else {
        $('x-productiongauge').hide();
        $('x-defaultpie').show();
      }
    } else {
      $('x-productiongauge').hide();
      $('x-defaultpie').hide();
    }

    let showproductiontrackergraph = pulseConfig.getBool('showproductiontrackergraph');
    if (showproductiontrackergraph) $('x-productiontrackergraph').show();
    else $('x-productiontrackergraph').hide();

    let showproductionbar = pulseConfig.getBool('showproductionbar');
    if (showproductionbar) {
      $('x-productionbar').show();
      $('.performancebar-bar-border').show();
    } else {
      $('x-productionbar').hide();
      $('.performancebar-bar-border').hide();
    }

    let showChangedTools = pulseConfig.getBool('showChangedTools');
    if (showChangedTools) {
      $('.changedtools-content').css('display', 'flex');
    } else {
      $('.changedtools-content').hide();
    }

    // Apply display mode (percent/ratio) to freshly created clones
    let showPercent = pulseConfig.getBool('showpercent');
    let displayMode = showPercent ? 'percent' : 'ratio';
    $('x-productionbar').attr('display-mode', displayMode);
    $('x-productiongauge').attr('display-mode', displayMode);
  }

}

$(document).ready(function () {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new machinedashboardPage());
});
