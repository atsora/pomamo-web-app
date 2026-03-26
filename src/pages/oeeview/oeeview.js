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
//require('x-lastmachinestatus/x-lastmachinestatus');
require('x-rotationprogress/x-rotationprogress');
require('x-production/x-production');
require('x-productionshiftgoal/x-productionshiftgoal');
require('x-productiongauge/x-productiongauge');
require('x-periodtoolbar/x-periodtoolbar');
require('x-workinfo/x-workinfo');


class OeeViewPage extends pulsePage.BasePage {
  constructor() {
    super();
    // On garde la sélection de machine
    this.showMachineselection = true;
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

  // [MODIFICATION] Logique conditionnelle Live vs Historique
  initOptionValues() {
    // Vérification du contexte
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    // --- GESTION DES OPTIONS DE ROTATION ---
    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    if (!isLive) {
      // CAS HISTORIQUE : On désactive la rotation et on active le scroll

      // 1. Masquer les options de rotation dans le panneau
      // On cache le parent (la ligne entière .param-row) pour faire propre
      defaultLayoutChk.closest('.param-row').hide(); // Si structure param-row
      defaultLayoutChk.parent().hide(); // Fallback
      rotationSettings.hide();

      // 2. Forcer la configuration pour "Tout Afficher"
      // On force le mode "custom" (pas default) pour accepter notre grand nombre
      pulseConfig.set('defaultlayout', false);
      // On met un nombre énorme pour que le moteur croie que tout tient sur une page
      pulseConfig.set('machinesperpage', 10000);

      // On met à jour les inputs au cas où (pour ne pas créer de confusion)
      defaultLayoutChk.prop('checked', false);
      machinesPerPageInput.val(10000);

      // 3. Activer le Scroll (CSS Injection)
      // On force le conteneur de la grille à scroller verticalement
      // x-groupgrid contient .groupgrid-main
// 3. Activer le Scroll (CSS Injection)
      $('head').append(`
        <style>
          /* 1. Le composant x-groupgrid devient la zone de scroll */
          x-groupgrid {
            flex: 1 1 auto !important; /* Il prend l'espace dispo */
            height: 100% !important;   /* Reste calé au parent */
            min-height: 0 !important;  /* Empêche le débordement flex */
            overflow-y: auto !important; /* C'EST ICI QUE LE SCROLL APPARAIT */
            display: block !important;
          }

          /* 2. La grille à l'intérieur grandit autant que nécessaire */
          x-groupgrid .groupgrid-main {
            display: grid !important;
            height: auto !important; /* LAISSE GRANDIR LA HAUTEUR */
            min-height: 100% !important;
            align-content: start !important; /* Empile les éléments en haut */

            /* 3. CRUCIAL : On force une hauteur minimale par ligne */
            /* Sinon la grille essaie de diviser la hauteur d'écran par 100 machines */
            grid-auto-rows: minmax(300px, auto) !important;
            padding-bottom: 50px !important;
          }
        </style>
      `);

    } else {
      // CAS LIVE : Comportement Standard (Rotation)

      // Initialisation depuis la config
      defaultLayoutChk.prop('checked', pulseConfig.getBool('defaultlayout', true));

      // Si "Default" est coché, on grise/cache les options manuelles
      defaultLayoutChk.change(() => {
        let isDefault = defaultLayoutChk.is(':checked');
        pulseConfig.set('defaultlayout', isDefault);

        if (isDefault) {
          rotationSettings.css('opacity', '0.5').find('input').prop('disabled', true);
          $('#machinesperpage').val(12).change(); // Forcer le maximum
        } else {
          rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
        }
      }).trigger('change');

      // Initialisation des valeurs
      machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 12));
      $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
    }

    // --- AUTRES OPTIONS (Communes) ---

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

    // [MODIFICATION] Reset Layout seulement si Live
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if (tmpContexts && tmpContexts.includes('live')) {
        setDefaultChecked('defaultlayout'); // Reset layout only in live
    }
  }

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
      // [MODIF] Si l'élément est caché (mode historique), on ne l'envoie pas dans l'URL ou on envoie la config
      if (!el || $(el).is(':hidden')) return '';

      const paramName = opt.param || opt.id;
      if (opt.type === 'checkbox' || opt.type === 'radio') {
        return `&${paramName}=${el.checked}`;
      } else {
        return `&${paramName}=${el.value}`;
      }
    }).join('');
  }

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
  pulsePage.preparePage(new OeeViewPage());
  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  // Masquer la barre de période si le contexte est "live"
  if (tmpContexts && tmpContexts.includes('live')) {
    $('x-periodtoolbar').hide();
  }
});
