// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-periodmanager/x-periodmanager');
require('x-performancebar/x-performancebar');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');

require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Performance Bar page — grid view of performance bars per machine.
 *
 * Displays a grid (x-groupgrid) with, for each machine, a performance bar
 * (x-performancebar) and an optional motion indicator (x-motionpercentage or x-motiontime).
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 16 machines/page)
 *  - `showmotionpercentage` : show the motion indicator
 *  - `showmotiondisplay`    : indicator type — 'percent' (x-motionpercentage) or 'time' (x-motiontime)
 *
 * Components: x-groupgrid, x-performancebar, x-machinedisplay,
 * x-motionpercentage, x-motiontime, x-periodmanager, x-reasonbutton,
 * x-machinemodelegends, x-reasongroups, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class PerformanceBarPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout: same pattern as oeeview (defaultlayout grays out inputs when checked),
   * but with a default of 16 machines/page (instead of 12).
   *
   * Motion management (two nested levels):
   *  1. `showmotionpercentage` (checkbox): enables/disables motion display
   *     and shows/hides the `.showmotionpercentagedetails` option group.
   *  2. `showmotiondisplay` (percent/time radios): switches between x-motionpercentage
   *     and x-motiontime (mutually exclusive, via `updateMotionDisplay`).
   *
   * Local helpers:
   *  - `syncRadioGroup`      : checks the radio matching a config value
   *  - `bindRadioGroup`      : binds listeners on a radio group via a value→id map
   *  - `updateMotionDisplay` : applies show/hide based on the selected mode
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showmotionpercentage`, `showmotiondisplay`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    // Layout
    const defaultLayoutChk = document.getElementById('defaultlayout');
    const rotationSettings = document.querySelector('.rotation-settings');
    const machinesPerPageInput = document.getElementById('machinesperpage');

    if (defaultLayoutChk) {
      defaultLayoutChk.checked = pulseConfig.getBool('defaultlayout', true);
      if (pulseConfig.getDefaultBool('defaultlayout') !== pulseConfig.getBool('defaultlayout', true))
        defaultLayoutChk.setAttribute('overridden', 'true');

      defaultLayoutChk.addEventListener('change', () => {
        let isDefault = defaultLayoutChk.checked;
        pulseConfig.set('defaultlayout', isDefault);
        if (isDefault) {
          if (rotationSettings) {
            rotationSettings.style.opacity = '0.5';
            rotationSettings.querySelectorAll('input').forEach(inp => inp.disabled = true);
          }
          if (machinesPerPageInput) {
            machinesPerPageInput.value = 16;
            machinesPerPageInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          if (rotationSettings) {
            rotationSettings.style.opacity = '1';
            rotationSettings.querySelectorAll('input').forEach(inp => inp.disabled = false);
          }
        }
      });
      defaultLayoutChk.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 16);
    let rotationDelayInput = document.getElementById('rotationdelay');
    if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);

    // Show percent
    const syncRadioGroup = (value, valueToIdMap, fallbackValue) => {
      const targetId = valueToIdMap[value] || valueToIdMap[fallbackValue];
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.checked = true;
      }
    };

    const bindRadioGroup = (valueToIdMap, onSelect) => {
      Object.entries(valueToIdMap).forEach(([value, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', function () {
          if (this.checked) {
            onSelect(value);
          }
        });
      });
    };

    const updateMotionDisplay = (display) => {
      const showPercent = display === 'percent';
      if (showPercent) {
        document.querySelectorAll('x-motionpercentage').forEach(el => el.style.display = '');
        document.querySelectorAll('x-motiontime').forEach(el => el.style.display = 'none');
      }
      else {
        document.querySelectorAll('x-motionpercentage').forEach(el => el.style.display = 'none');
        document.querySelectorAll('x-motiontime').forEach(el => el.style.display = '');
      }
    };

    const showMotionPercentageChk = document.getElementById('showmotionpercentage');
    if (showMotionPercentageChk) {
      showMotionPercentageChk.checked = pulseConfig.getBool('showmotionpercentage');
      if (pulseConfig.getDefaultBool('showmotionpercentage') != pulseConfig.getBool('showmotionpercentage')) {
        showMotionPercentageChk.setAttribute('overridden', 'true');
      }
      showMotionPercentageChk.addEventListener('change', function () {
        const showMotionPercentage = showMotionPercentageChk.checked;
        pulseConfig.set('showmotionpercentage', showMotionPercentage);
        if (showMotionPercentage) {
          document.querySelectorAll('x-motionpercentage, x-motiontime').forEach(el => el.style.display = '');
          document.querySelectorAll('.showmotionpercentagedetails').forEach(el => el.style.display = '');
          updateMotionDisplay(pulseConfig.getString('showmotiondisplay') || 'percent');
        }
        else {
          document.querySelectorAll('x-motionpercentage, x-motiontime').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.showmotionpercentagedetails').forEach(el => el.style.display = 'none');
        }
      });
    }

    const motionDisplayMap = {
      percent: 'motiondisplaypercent',
      time: 'motiondisplaytime'
    };
    syncRadioGroup(pulseConfig.getString('showmotiondisplay'), motionDisplayMap, 'percent');
    bindRadioGroup(motionDisplayMap, (value) => {
      pulseConfig.set('showmotiondisplay', value);
      updateMotionDisplay(value);
    });

    updateMotionDisplay(pulseConfig.getString('showmotiondisplay') || 'percent');
    if (showMotionPercentageChk) showMotionPercentageChk.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Resets all options to their default values.
   *
   * Layout: directly forces defaultlayout=checked, machinesperpage=16, rotationdelay=10.
   * Motion: uses `setDefaultChecked` and `setDefaultRadioGroup` helpers.
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.checked = pulseConfig.getDefaultBool(configKey);
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

    const setIfPresent = (id, mutator) => {
      const el = document.getElementById(id);
      if (el) mutator(el);
    };

    // Layout
    setIfPresent('defaultlayout', el => {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.removeAttribute('overridden');
    });
    setIfPresent('machinesperpage', el => {
      el.value = 16;
      el.removeAttribute('overridden');
    });
    setIfPresent('rotationdelay', el => {
      el.value = 10;
      el.removeAttribute('overridden');
    });

    setDefaultChecked('showmotionpercentage');
    setDefaultRadioGroup(pulseConfig.getDefaultString('showmotiondisplay'), {
      percent: 'motiondisplaypercent',
      time: 'motiondisplaytime'
    });
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Hidden elements (e.g. rotation options) are skipped.
   * `showmotiondisplay` is appended separately after the main options map.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' },
      { id: 'showmotionpercentage', type: 'checkbox' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el || el.style.display === 'none') return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') return `&${paramName}=${el.value}`;
      return `&${paramName}=${el.checked}`;
    }).join('');

    if (document.getElementById('motiondisplaypercent')?.checked) {
      result += '&showmotiondisplay=percent';
    } else if (document.getElementById('motiondisplaytime')?.checked) {
      result += '&showmotiondisplay=time';
    }

    return result;
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
   * Applies the current configuration to DOM components.
   *
   * Motion indicator logic (two-level):
   *  - If `showmotionpercentage` is false → hide both x-motionpercentage and x-motiontime.
   *  - If true → show only the one matching `showmotiondisplay` ('percent' or 'time').
   */
  buildContent() {
    let showMotionPercentage = pulseConfig.getBool('showmotionpercentage');
    let display = pulseConfig.getString('showmotiondisplay') || 'percent';
    let showPercent = (display === 'percent');

    if (showMotionPercentage) {
      if (showPercent) {
        document.querySelectorAll('x-motionpercentage').forEach(el => el.style.display = '');
        document.querySelectorAll('x-motiontime').forEach(el => el.style.display = 'none');
      } else {
        document.querySelectorAll('x-motionpercentage').forEach(el => el.style.display = 'none');
        document.querySelectorAll('x-motiontime').forEach(el => el.style.display = '');
      }
    } else {
      document.querySelectorAll('x-motionpercentage').forEach(el => el.style.display = 'none');
      document.querySelectorAll('x-motiontime').forEach(el => el.style.display = 'none');
    }
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new PerformanceBarPage());
} else {
  document.addEventListener('DOMContentLoaded', function() {
    pulsePage.preparePage(new PerformanceBarPage());
  });
}
