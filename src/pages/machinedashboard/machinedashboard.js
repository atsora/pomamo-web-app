// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouparray/x-grouparray');
require('x-machinetab/x-machinetab');
require('x-machinedisplay/x-machinedisplay');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-datetimegraduation/x-datetimegraduation');
require('x-operationcyclebar/x-operationcyclebar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-cncalarmbar/x-cncalarmbar');
require('x-redstacklightbar/x-redstacklightbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-isofileslotbar/x-isofileslotbar');
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

class machinedashboardPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
    this.canConfigureRows = false;
  }

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

    // --- 4. SHOW PRODUCTION BAR ---
    $('#showproductionbar').prop('checked', pulseConfig.getBool('showproductionbar'));
    if (pulseConfig.getDefaultBool('showproductionbar') != pulseConfig.getBool('showproductionbar'))
      $('#showproductionbar').attr('overridden', 'true');
    $('#showproductionbar').change(function () {
      let show = $('#showproductionbar').is(':checked');
      pulseConfig.set('showproductionbar', show);
      if (show) {
        $('x-productionbar').show();
        $('.perf-tool-container').css('display', 'flex'); // Corrigé ici
      } else {
        $('x-productionbar').hide();
        $('.perf-tool-container').hide(); // Corrigé ici
      }
    });

    // --- 5. PERCENT VS RATIO ---
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
      // S'applique aux éléments existants, et buildContent() gérera les clones futurs
      $('x-productionbar').attr('display-mode', mode);
      $('x-productiongauge').attr('display-mode', mode);
    });

    // --- 6. SHOW PRODUCTION DISPLAY (Le bouton principal) ---
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
    thresholdTarget.value = pulseConfig.getFloat('thresholdtargetproduction');
    thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction');
    if (pulseConfig.getDefaultFloat('thresholdtargetproduction') !== pulseConfig.getFloat('thresholdtargetproduction')) {
      thresholdTarget.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat('thresholdredproduction') !== pulseConfig.getFloat('thresholdredproduction')) {
      thresholdRedInput.setAttribute('overridden', 'true');
    }
    thresholdTarget.addEventListener('change', () => this._verficationThresholds(thresholdTarget.value, thresholdRedInput.value, true));
    thresholdRedInput.addEventListener('change', () => this._verficationThresholds(thresholdTarget.value, thresholdRedInput.value, true));

    // Déclencheurs initiaux pour aligner l'interface
    $('#showChangedTools').trigger('change');
    $('#openStopClassification').trigger('change');
    $('#showproductionbar').trigger('change');
    $('#showproductiondisplay').trigger('change');
  }

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

  // Delete the open stop classification listener element
  _deleteOpenStopClassificationListener() {
    document.querySelector('.openStopClassificationDetails').style.display = 'none';
    const container = document.body || document.documentElement;
    let existing = container.querySelector('x-openstopclassificationlistener');
    if (existing) {
      existing.remove();
    }
  }

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

  getOptionValues() {
    const options = [
      { id: 'showChangedTools', type: 'checkbox' },
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


  buildContent() {
let showBar = pulseConfig.getBool('showcoloredbar.cycle', false);
    if (showBar) $('x-operationcyclebar').show(); else $('x-operationcyclebar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.isofile', false);
    if (showBar) $('x-isofileslotbar').show(); else $('x-isofileslotbar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.cncalarm', false);
    if (showBar) $('x-cncalarmbar').show(); else $('x-cncalarmbar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.redstacklight', false);
    if (showBar) $('x-redstacklightbar').show(); else $('x-redstacklightbar').hide();

    // --- APPLICATION SUR LES CLONES DE X-GROUPARRAY ---
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

    let showproductionbar = pulseConfig.getBool('showproductionbar');
    if (showproductionbar) {
      $('x-productionbar').show();
      $('.perf-tool-container').css('display', 'flex');
    } else {
      $('x-productionbar').hide();
      $('.perf-tool-container').hide();
    }

    let showChangedTools = pulseConfig.getBool('showChangedTools');
    if (showChangedTools) {
      $('.changedtools-content').css('display', 'flex');
    } else {
      $('.changedtools-content').hide();
    }

    // NOUVEAU : Application des modes (percent/ratio) aux clones fraîchement créés
    let showPercent = pulseConfig.getBool('showpercent');
    let displayMode = showPercent ? 'percent' : 'ratio';
    $('x-productionbar').attr('display-mode', displayMode);
    $('x-productiongauge').attr('display-mode', displayMode);
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new machinedashboardPage());
});
