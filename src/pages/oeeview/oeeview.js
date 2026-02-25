// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulsePage = require('pulsePage');
var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var eventBus = require('eventBus');

require('x-tr/x-tr');
require('x-periodmanager/x-periodmanager');
require('x-grouparray/x-grouparray');
require('x-machinedisplay/x-machinedisplay');
require('x-reasonbutton/x-reasonbutton');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-production/x-production');
require('x-productionshiftgoal/x-productionshiftgoal');
require('x-productiongauge/x-productiongauge');
require('x-periodtoolbar/x-periodtoolbar');
require('x-workinfo/x-workinfo');



class OeeViewPage extends pulsePage.BasePage {
  constructor() {
    super();
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

  initOptionValues() {
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

    // CORRECTION : Utilisation de .change() (jQuery) pour capter le Reset
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

    // CORRECTION : Utilisation de .change() (jQuery)
    showWorkInfoChk.change(function () {
      let isChecked = showWorkInfoChk.is(':checked');
      pulseConfig.set('showworkinfo', isChecked);

      if (isChecked) {
        $('x-workinfo').show();
      } else {
        $('x-workinfo').hide();
      }
    });
    // Déclenchement initial
    showWorkInfoChk.trigger('change');
  }

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

    // CORRECTION : Utilisation de .change() (jQuery) pour être compatible avec setDefaultOptionValues
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
        || document.querySelector('.showproductiongaugedetails');
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

    setDefaultRadioGroup(pulseConfig.getDefaultBool('showpercent') ? 'percent' : 'ratio', {
      percent: 'productiongaugepercent',
      ratio: 'productiongaugeratio'
    });

    setDefaultValue('thresholdtargetproductionbar', pulseConfig.getDefaultFloat('thresholdtargetproduction', 80));
    setDefaultValue('thresholdredproductionbar', pulseConfig.getDefaultFloat('thresholdredproduction', 60));

    // showworkinfo = Show Operation
    setDefaultChecked('showworkinfo');
  }

  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'productiongaugepercent', type: 'radio', param: 'showpercent' },
      // CORRECTION: Utilisation des noms de paramètres corrects pour pulseConfig
      { id: 'thresholdtargetproductionbar', type: 'value', param: 'thresholdtargetproduction' },
      { id: 'thresholdredproductionbar', type: 'value', param: 'thresholdredproduction' },
      { id: 'showworkinfo', type: 'checkbox' }
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
    // 1. Gestion du mode d'affichage de la jauge (Percent / Ratio)
    let showPercent = pulseConfig.getBool('showpercent');
    let displayMode = showPercent ? 'percent' : 'ratio';
    // On applique l'attribut à toutes les jauges (y compris les clones)
    $('x-productiongauge').attr('display-mode', displayMode);

    // 2. Gestion de l'affichage de WorkInfo
    let showworkinfo = pulseConfig.getBool('showworkinfo');
    if (showworkinfo) {
      $('x-workinfo').show();
    } else {
      $('x-workinfo').hide();
    }
  }
}



$(document).ready(function () {
  pulsePage.preparePage(new OeeViewPage());
  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  // Masquer la barre de période si le contexte est "live"
  if (tmpContexts && tmpContexts.includes('live')) {
    $('x-periodtoolbar').hide();
  }
});
