// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as pulseUtility from 'pulseUtility';
import * as pulsePage from 'pulsePage';

import 'x-grouplist/x-grouplist';
import 'x-rotationprogress/x-rotationprogress';

import 'x-machinedisplay/x-machinedisplay';
import 'x-productionmachiningstatus/x-productionmachiningstatus';
import 'x-lastworkinformation/x-lastworkinformation';
import 'x-currentcncvalue/x-currentcncvalue';
import 'x-lastshift/x-lastshift';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-barstack/x-barstack'; // pulls in all bar components
import 'x-motionpercentage/x-motionpercentage';
import 'x-motiontime/x-motiontime';
import 'x-periodtoolbar/x-periodtoolbar';
import 'x-reasonbutton/x-reasonbutton';
import 'x-clock/x-clock';
import 'x-productionstatelegends/x-productionstatelegends';
import 'x-reasongroups/x-reasongroups';
import 'x-fieldlegends/x-fieldlegends';
import 'x-machinemodelegends/x-machinemodelegends';
import 'x-tr/x-tr';

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
    let allowproductionbar = pulseConfig.getBool('allowproductionbar');
    if (!allowproductionbar) {
      document.querySelector('.group-options').style.display = 'none';
    }

    const showproductionbarEl = document.getElementById('showproductionbar');
    showproductionbarEl.checked = pulseConfig.getBool('showproductionbar');
    const applyBarChoice = (showproductionbar) => {
      pulseConfig.set('showproductionbar', showproductionbar);
      document.querySelectorAll('x-barstack').forEach(el => {
        if (el._applySwitch) el._applySwitch();
      });
      if (showproductionbar) {
        document.querySelectorAll('x-reasongroups').forEach(el => el.style.display = 'none');
        document.querySelectorAll('x-productionstatelegends').forEach(el => el.style.display = '');
      }
      else {
        document.querySelectorAll('x-reasongroups').forEach(el => el.style.display = '');
        document.querySelectorAll('x-productionstatelegends').forEach(el => el.style.display = 'none');
      }
    };
    showproductionbarEl.addEventListener('change', function () {
      applyBarChoice(this.checked);
    });

    const showreasonbarEl = document.getElementById('showreasonbar');
    showreasonbarEl.checked = !pulseConfig.getBool('showproductionbar');
    showreasonbarEl.addEventListener('change', function () {
      applyBarChoice(!this.checked);
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
      const element = document.getElementById(id);
      element.checked = pulseConfig.getDefaultBool(configKey);
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    // BAR (reason / production state)
    setDefaultChecked('showproductionbar');

    document.getElementById('showreasonbar').checked = !pulseConfig.getDefaultBool('showproductionbar');
    document.getElementById('showreasonbar').dispatchEvent(new Event('change', { bubbles: true }));
    document.getElementById('showreasonbar').removeAttribute('overridden');
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
    let addProductionMachining = pulseConfig.getBool('currentdisplay.displayjobshiftpartcount', false);
    let displayJob = pulseConfig.getBool('currentdisplay.displayjob', true);
    let displayShift = pulseConfig.getBool('currentdisplay.displayshift', true);
    let displayCNCValue = pulseConfig.getBool('currentdisplay.displaycncvalue', true);

    if (addProductionMachining) {
      document.querySelectorAll('x-productionmachiningstatus').forEach(el => el.style.display = '');
    } else {
      document.querySelectorAll('x-productionmachiningstatus').forEach(el => el.style.display = 'none');
    }
    if (displayJob) {
      document.querySelectorAll('x-lastworkinformation').forEach(el => el.style.display = '');
    } else {
      document.querySelectorAll('x-lastworkinformation').forEach(el => el.style.display = 'none');
    }
    if (displayShift) {
      document.querySelectorAll('x-lastShift').forEach(el => el.style.display = '');
    } else {
      document.querySelectorAll('x-lastShift').forEach(el => el.style.display = 'none');
    }
    if (displayCNCValue) {
      document.querySelectorAll('x-currentcncvalue').forEach(el => el.style.display = '');
    } else {
      document.querySelectorAll('x-currentcncvalue').forEach(el => el.style.display = 'none');
    }

    const showCncValue = pulseConfig.getBool('showcoloredbar.cncvalue', true);
    document.querySelectorAll('x-fieldlegends').forEach(el => {
      el.style.display = showCncValue ? '' : 'none';
    });

    const showproductionbar = pulseConfig.getBool('showproductionbar', false);
    document.querySelectorAll('x-reasongroups').forEach(el => {
      el.style.display = showproductionbar ? 'none' : '';
    });
    document.querySelectorAll('x-productionstatelegends').forEach(el => {
      el.style.display = showproductionbar ? '' : 'none';
    });
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new RunningPage());

  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  if (tmpContexts && tmpContexts.includes('live')) {
    document.querySelector('.running-header').style.display = 'none';
  }

  document.querySelectorAll('x-datetimegraduation').forEach(el => el.load());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new RunningPage());
  });
}
