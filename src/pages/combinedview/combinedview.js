// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-runningbutton/x-runningbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-performancetarget/x-performancetarget');
require('x-currenticoncncalarm/x-currenticoncncalarm');
require('x-stacklight/x-stacklight');
require('x-runningslotpie/x-runningslotpie');
require('x-motionpercentage/x-motionpercentage');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-runninglegends/x-runninglegends');
require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Combined View page — grid view combining status bars and machine indicators.
 *
 * Displays a grid of machines (x-groupgrid) with, for each machine:
 * a stack of bars (x-barstack), a motion percentage indicator,
 * and optional components (performance target, CNC alarm, stack light).
 *
 * Notable: two x-periodmanager elements are present in the DOM with distinct
 * `period-context` values (`combinedview_today` and `combinedview_6days`)
 * to simultaneously display today's period and the last 6 days.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation management
 *  - `showtarget`     : x-performancetarget (performance target)
 *  - `showalarm`      : x-currenticoncncalarm (CNC alarm icon)
 *  - `showstacklight` : x-stacklight (stack light)
 *
 * Components: x-groupgrid, x-barstack, x-machinedisplay, x-runningbutton,
 * x-performancetarget, x-currenticoncncalarm, x-stacklight, x-runningslotpie,
 * x-motionpercentage, x-periodmanager, x-machinemodelegends, x-runninglegends.
 *
 * @extends pulsePage.BasePage
 */
class CombinedViewPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout management (same pattern as oeeview):
   *  - If `defaultlayout` is checked → grays out manual inputs and forces machinesperpage=12.
   *  - Otherwise → enables machinesperpage and rotationdelay inputs.
   *
   * Optional component options (uniform pattern):
   *  - Read config → check checkbox → bind change listener → set config + show/hide component.
   *  - Mark `overridden` if value differs from default.
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showtarget`, `showalarm`, `showstacklight`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    const defaultLayoutChk = document.getElementById('defaultlayout');
    const rotationSettings = document.querySelector('.rotation-settings');
    const machinesPerPageInput = document.getElementById('machinesperpage');

    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    if (!isLive) {
      if (defaultLayoutChk) {
        const paramRow = defaultLayoutChk.closest('.param-row');
        if (paramRow) paramRow.style.display = 'none';
        if (defaultLayoutChk.parentElement) defaultLayoutChk.parentElement.style.display = 'none';
        defaultLayoutChk.checked = false;
      }
      if (rotationSettings) rotationSettings.style.display = 'none';
      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);
      if (machinesPerPageInput) machinesPerPageInput.value = 10000;
      // Scroll & grid sizing handled by .pulse-content:not(.appcontext-live) overrides in combinedview.less
    } else {
      if (defaultLayoutChk) {
        defaultLayoutChk.checked = pulseConfig.getBool('defaultlayout', true);
        if (pulseConfig.getDefaultBool('defaultlayout') !== pulseConfig.getBool('defaultlayout', true))
          defaultLayoutChk.setAttribute('overridden', true);
        defaultLayoutChk.addEventListener('change', () => {
          let isDefault = defaultLayoutChk.checked;
          pulseConfig.set('defaultlayout', isDefault);
          if (isDefault) {
            if (rotationSettings) {
              rotationSettings.style.opacity = '0.5';
              rotationSettings.querySelectorAll('input').forEach(input => input.disabled = true);
            }
            if (machinesPerPageInput) {
              machinesPerPageInput.value = 12;
              machinesPerPageInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            if (rotationSettings) {
              rotationSettings.style.opacity = '1';
              rotationSettings.querySelectorAll('input').forEach(input => input.disabled = false);
            }
          }
        });
        defaultLayoutChk.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 12);
      let rotationDelayInput = document.getElementById('rotationdelay');
      if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
    }

    const showTargetChk = document.getElementById('showtarget');
    if (showTargetChk) {
      showTargetChk.checked = pulseConfig.getBool('showtarget');
      if (pulseConfig.getDefaultBool('showtarget') != pulseConfig.getBool('showtarget')) {
        showTargetChk.setAttribute('overridden', 'true');
      }
      showTargetChk.addEventListener('change', function () {
        let showtarget = showTargetChk.checked;
        // Store
        pulseConfig.set('showtarget', showtarget);
        // Display
        if (showtarget) {
          document.querySelectorAll('x-performancetarget').forEach(el => el.style.display = '');
        }
        else {
          document.querySelectorAll('x-performancetarget').forEach(el => el.style.display = 'none');
        }
      });
    }

    const showAlarmChk = document.getElementById('showalarm');
    if (showAlarmChk) {
      showAlarmChk.checked = pulseConfig.getBool('showalarm');
      if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm')) {
        showAlarmChk.setAttribute('overridden', 'true');
      }
      // Sub-options visible only while the alarm icon is shown
      document.querySelectorAll('.showalarmdetails').forEach(el => {
        el.style.display = showAlarmChk.checked ? '' : 'none';
      });
      showAlarmChk.addEventListener('change', function () {
        let showalarm = showAlarmChk.checked;
        // Store
        pulseConfig.set('showalarm', showalarm);
        // Display
        if (showalarm) {
          document.querySelectorAll('x-currenticoncncalarm').forEach(el => el.style.display = '');
        }
        else {
          document.querySelectorAll('x-currenticoncncalarm').forEach(el => el.style.display = 'none');
        }
        document.querySelectorAll('.showalarmdetails').forEach(el => {
          el.style.display = showalarm ? '' : 'none';
        });
      });
    }

    // Alarm sub-option: include unknown (non-focused) alarms in the icon query
    const showUnknownAlarmChk = document.getElementById('showUnknownAlarm');
    if (showUnknownAlarmChk) {
      showUnknownAlarmChk.checked = pulseConfig.getBool('showUnknownAlarm');
      if (pulseConfig.getDefaultBool('showUnknownAlarm') != pulseConfig.getBool('showUnknownAlarm')) {
        showUnknownAlarmChk.setAttribute('overridden', 'true');
      }
      showUnknownAlarmChk.addEventListener('change', function () {
        pulseConfig.set('showUnknownAlarm', showUnknownAlarmChk.checked);
        eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showUnknownAlarm' });
      });
    }

    const showStacklightChk = document.getElementById('showstacklight');
    if (showStacklightChk) {
      showStacklightChk.checked = pulseConfig.getBool('showstacklight');
      if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight')) {
        showStacklightChk.setAttribute('overridden', 'true');
      }
      showStacklightChk.addEventListener('change', function () {
        let showstacklight = showStacklightChk.checked;
        // Store
        pulseConfig.set('showstacklight', showstacklight);
        // Display
        if (showstacklight) {
          document.querySelectorAll('x-stacklight').forEach(el => el.style.display = '');
        }
        else {
          document.querySelectorAll('x-stacklight').forEach(el => el.style.display = 'none');
        }
      });
    }
  }

  /**
   * Resets all options to their default values.
   *
   * Layout: directly forces `defaultlayout=checked`, `machinesperpage=12`, `rotationdelay=10`
   * (hardcoded values since these are the known defaults, not read from pulseConfig.getDefault*).
   *
   * Optional components: uses `setDefaultChecked` with trigger to immediately
   * sync visual state (show/hide).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.checked = pulseConfig.getDefaultBool(configKey);
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    // Layout
    const defaultLayoutEl = document.getElementById('defaultlayout');
    if (defaultLayoutEl) {
      defaultLayoutEl.checked = true;
      defaultLayoutEl.dispatchEvent(new Event('change', { bubbles: true }));
      defaultLayoutEl.removeAttribute('overridden');
    }
    const machinesPerPageEl = document.getElementById('machinesperpage');
    if (machinesPerPageEl) {
      machinesPerPageEl.value = 12;
      machinesPerPageEl.removeAttribute('overridden');
    }
    const rotationDelayEl = document.getElementById('rotationdelay');
    if (rotationDelayEl) {
      rotationDelayEl.value = 10;
      rotationDelayEl.removeAttribute('overridden');
    }

    setDefaultChecked('showtarget');
    setDefaultChecked('showalarm');
    setDefaultChecked('showUnknownAlarm');
    setDefaultChecked('showstacklight');
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Note: all options are checkboxes — `el.checked` is used for all,
   * including machinesperpage and rotationdelay (latent bug: these inputs are numeric,
   * but the map uses `el.checked` instead of `el.value`).
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' },
      { id: 'showtarget', type: 'checkbox' },
      { id: 'showalarm', type: 'checkbox' },
      { id: 'showUnknownAlarm', type: 'checkbox' },
      { id: 'showstacklight', type: 'checkbox' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const paramName = opt.param || opt.id;
      return `&${paramName}=${el.checked}`;
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
   * Applies the current configuration to optional DOM components.
   *
   * Syncs visual state at page load (option listeners handle real-time changes,
   * but buildContent ensures the initial state based on URL params / localStorage).
   *
   * Components driven: x-performancetarget, x-stacklight, x-currenticoncncalarm.
   */
  buildContent() {
    let showtarget = pulseConfig.getBool('showtarget');
    if (showtarget) {
      document.querySelectorAll('x-performancetarget').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-performancetarget').forEach(el => el.style.display = 'none');
    }
    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      document.querySelectorAll('x-stacklight').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-stacklight').forEach(el => el.style.display = 'none');
    }
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      document.querySelectorAll('x-currenticoncncalarm').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-currenticoncncalarm').forEach(el => el.style.display = 'none');
    }
  }
}

if (document.readyState !== 'loading') {
  initCombinedViewPage();
} else {
  document.addEventListener('DOMContentLoaded', initCombinedViewPage);
}

function initCombinedViewPage() {
  // Start the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
  pulsePage.preparePage(new CombinedViewPage());
}
