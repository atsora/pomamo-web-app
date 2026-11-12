// Copyright (C) 2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulsePage from 'pulsePage';
import * as pulseConfig from 'pulseConfig';
import * as pulseUtility from 'pulseUtility';
import * as eventBus from 'eventBus';

import 'x-tr/x-tr';
import 'x-periodmanager/x-periodmanager';
import 'x-groupgrid/x-groupgrid';
import 'x-machinedisplay/x-machinedisplay';
import 'x-reasonbutton/x-reasonbutton';
import 'x-lastmachinestatus/x-lastmachinestatus';
import 'x-rotationprogress/x-rotationprogress';
import 'x-production/x-production';
import 'x-productionshiftgoal/x-productionshiftgoal';
import 'x-oeegauge/x-oeegauge';
import 'x-periodtoolbar/x-periodtoolbar';
import 'x-workinfo/x-workinfo';

/** Rate types of the gauges, with their default color thresholds (in %) */
const OEE_TYPES = {
  oee: { target: 85, red: 60 },
  ooe: { target: 75, red: 50 },
  teep: { target: 60, red: 40 }
};

/**
 * Is the page in live mode (AppContext=live in the URL) ?
 * @returns {boolean}
 */
function isLive () {
  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  return !!(tmpContexts && tmpContexts.includes('live'));
}

/**
 * Show or hide the elements matching a selector
 * @param {string} selector
 * @param {boolean} visible
 */
function setVisible (selector, visible) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = visible ? '' : 'none';
  });
}

/**
 * OEE / OOE / TEEP page: up to three gauges per machine or group, the OEE (TRS),
 * the OOE (TRG) and the TEEP (TRE), from the web service of the plugin
 * Lemoine.Plugin.Oee (x-oeegauge). Inspired by the oeeview page.
 *
 * Two operating modes depending on the `AppContext` URL parameter:
 *  - **live**       : automatic machine rotation, the gauges display the current shift,
 *  - **historical** : the gauges follow the period toolbar, all the machines on a single page.
 *
 * Options: display of each gauge (showoee / showooe / showteep), color thresholds
 * of each gauge (thresholdtarget<type> / thresholdred<type>), part count
 * (showpartcount, off by default) and operation (showworkinfo).
 *
 * @extends pulsePage.BasePage
 */
class OeeOoeTeepPage extends pulsePage.BasePage {
  constructor () {
    super();
    this.showMachineselection = true;
  }

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

  initOptionValues () {
    // --- ROTATION LAYOUT OPTIONS (same as oeeview) ---
    const defaultLayoutChk = document.getElementById('defaultlayout');
    const rotationSettings = document.querySelector('.rotation-settings');
    const machinesPerPageInput = document.getElementById('machinesperpage');

    if (!isLive()) {
      if (defaultLayoutChk) {
        if (defaultLayoutChk.parentElement) defaultLayoutChk.parentElement.style.display = 'none';
        defaultLayoutChk.checked = false;
      }
      if (rotationSettings) rotationSettings.style.display = 'none';

      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);

      if (machinesPerPageInput) machinesPerPageInput.value = 10000;
    }
    else {
      if (defaultLayoutChk) {
        defaultLayoutChk.checked = pulseConfig.getBool('defaultlayout', true);

        defaultLayoutChk.addEventListener('change', () => {
          let isDefault = defaultLayoutChk.checked;
          pulseConfig.set('defaultlayout', isDefault);

          if (rotationSettings) {
            rotationSettings.style.opacity = isDefault ? '0.5' : '1';
            rotationSettings.querySelectorAll('input').forEach(inp => inp.disabled = isDefault);
          }
          if (isDefault && machinesPerPageInput) {
            machinesPerPageInput.value = 12;
            machinesPerPageInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        defaultLayoutChk.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 12);
      const rotationDelayInput = document.getElementById('rotationdelay');
      if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
    }

    // --- GAUGES ---
    for (let oeeType of Object.keys(OEE_TYPES)) {
      this._initCheckbox('show' + oeeType, true, (checked) => {
        setVisible('x-oeegauge[oee-type="' + oeeType + '"]', checked);
        setVisible('.thresholds-' + oeeType, checked);
      });
      this._initThresholds(oeeType);
    }

    // --- PART COUNT / OPERATION ---
    this._initCheckbox('showpartcount', false, (checked) => setVisible('.oee-number', checked));
    this._initCheckbox('showworkinfo', true, (checked) => setVisible('x-workinfo', checked));
  }

  /**
   * Initialize a checkbox from its config key (= its id) and bind it
   * @param {string} id - id of the checkbox and config key
   * @param {boolean} defaultValue
   * @param {function(boolean)} apply - applies the value to the page
   */
  _initCheckbox (id, defaultValue, apply) {
    const checkbox = document.getElementById(id);
    if (!checkbox) {
      return;
    }
    checkbox.checked = pulseConfig.getBool(id, defaultValue);
    if (pulseConfig.getDefaultBool(id, defaultValue) != pulseConfig.getBool(id, defaultValue)) {
      checkbox.setAttribute('overridden', 'true');
    }
    checkbox.addEventListener('change', () => {
      pulseConfig.set(id, checkbox.checked);
      apply(checkbox.checked);
    });
    apply(checkbox.checked);
  }

  /**
   * Initialize the target / red threshold inputs of a gauge
   * @param {string} oeeType - oee, ooe or teep
   */
  _initThresholds (oeeType) {
    const targetInput = document.getElementById('thresholdtarget' + oeeType);
    const redInput = document.getElementById('thresholdred' + oeeType);
    if (!targetInput || !redInput) {
      return;
    }
    const targetKey = 'thresholdtarget' + oeeType;
    const redKey = 'thresholdred' + oeeType;
    const defaults = OEE_TYPES[oeeType];

    targetInput.value = pulseConfig.getFloat(targetKey, defaults.target);
    redInput.value = pulseConfig.getFloat(redKey, defaults.red);
    if (pulseConfig.getDefaultFloat(targetKey, defaults.target) !== pulseConfig.getFloat(targetKey, defaults.target)) {
      targetInput.setAttribute('overridden', 'true');
    }
    if (pulseConfig.getDefaultFloat(redKey, defaults.red) !== pulseConfig.getFloat(redKey, defaults.red)) {
      redInput.setAttribute('overridden', 'true');
    }

    const onChange = () => this._applyThresholds(oeeType, targetInput.value, redInput.value);
    targetInput.addEventListener('change', onChange);
    redInput.addEventListener('change', onChange);
  }

  /**
   * Validate and apply the color thresholds of a gauge
   *
   * @param {string} oeeType - oee, ooe or teep
   * @param {number|string} targetValue - target threshold (orange → green), in %
   * @param {number|string} redValue - red threshold (red → orange), in %
   * @returns {boolean} true if valid and applied
   */
  _applyThresholds (oeeType, targetValue, redValue) {
    const errorMessage = document.querySelector('.thresholds-' + oeeType + ' .threshold-error');
    const showError = (key, defaultMessage) => {
      if (errorMessage) {
        errorMessage.textContent = pulseConfig.pulseTranslate(key, defaultMessage);
        errorMessage.style.display = 'block';
      }
      return false;
    };

    if (targetValue === '' || redValue === '' || isNaN(redValue) || isNaN(targetValue)) {
      return showError('options.thresholdNaNError', 'Threshold values must be valid numbers');
    }
    let target = Number(targetValue);
    let red = Number(redValue);
    if (red < 0 || target <= 0) {
      return showError('options.thresholdPositiveError', 'Threshold values must be positive');
    }
    if (target <= red) {
      return showError('options.thresholdError', 'Target threshold must be greater than red threshold');
    }
    if (100 < red || 100 < target) {
      return showError('options.thresholdMaxError', 'Percentage values cannot exceed 100');
    }

    pulseConfig.set('thresholdtarget' + oeeType, target);
    pulseConfig.set('thresholdred' + oeeType, red);
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }

    eventBus.EventBus.dispatchToAll('configChangeEvent', { config: 'thresholdsupdated' });
    return true;
  }

  setDefaultOptionValues () {
    const resetCheckbox = (id, defaultValue) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.checked = pulseConfig.getDefaultBool(id, defaultValue);
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.removeAttribute('overridden');
    };
    const resetValue = (id, value) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.removeAttribute('overridden');
    };

    for (let oeeType of Object.keys(OEE_TYPES)) {
      resetCheckbox('show' + oeeType, true);
      resetValue('thresholdtarget' + oeeType, pulseConfig.getDefaultFloat('thresholdtarget' + oeeType, OEE_TYPES[oeeType].target));
      resetValue('thresholdred' + oeeType, pulseConfig.getDefaultFloat('thresholdred' + oeeType, OEE_TYPES[oeeType].red));
    }
    resetCheckbox('showpartcount', false);
    resetCheckbox('showworkinfo', true);

    // Rotation only exists in live mode
    if (isLive()) {
      resetCheckbox('defaultlayout', true);
    }
  }

  getOptionValues () {
    const options = [
      { id: 'showoee', type: 'checkbox' },
      { id: 'showooe', type: 'checkbox' },
      { id: 'showteep', type: 'checkbox' },
      { id: 'thresholdtargetoee', type: 'value' },
      { id: 'thresholdredoee', type: 'value' },
      { id: 'thresholdtargetooe', type: 'value' },
      { id: 'thresholdredooe', type: 'value' },
      { id: 'thresholdtargetteep', type: 'value' },
      { id: 'thresholdredteep', type: 'value' },
      { id: 'showpartcount', type: 'checkbox' },
      { id: 'showworkinfo', type: 'checkbox' },
      // Rotation params
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      // Hidden elements (rotation in historical mode, thresholds of a hidden gauge) are skipped
      if (!el || (el.offsetWidth === 0 && el.offsetHeight === 0 && el.getClientRects().length === 0)) return '';
      return (opt.type === 'checkbox') ? `&${opt.id}=${el.checked}` : `&${opt.id}=${el.value}`;
    }).join('');
  }

  buildContent () {
    for (let oeeType of Object.keys(OEE_TYPES)) {
      setVisible('x-oeegauge[oee-type="' + oeeType + '"]', pulseConfig.getBool('show' + oeeType, true));
    }
    setVisible('.oee-number', pulseConfig.getBool('showpartcount', false));
    setVisible('x-workinfo', pulseConfig.getBool('showworkinfo', true));
  }
}

function start () {
  if (isLive()) {
    // Live: the gauges display the current shift, whatever the period, and no period toolbar
    document.querySelectorAll('x-oeegauge').forEach(el => el.setAttribute('current-shift', ''));
  }
  pulsePage.preparePage(new OeeOoeTeepPage());
  if (isLive()) {
    document.querySelectorAll('x-periodtoolbar').forEach(el => el.style.display = 'none');
  }
}

if (document.readyState !== 'loading') {
  start();
}
else {
  document.addEventListener('DOMContentLoaded', start);
}
