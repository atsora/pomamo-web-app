// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as pulsePage from 'pulsePage';
import * as eventBus from 'eventBus';

/**
 * Calls `mutator` on every element matching `selector`.
 *
 * @param {string}   selector - CSS selector.
 * @param {Function} mutator  - Called with each element.
 */
export function setEach (selector, mutator) {
  document.querySelectorAll(selector).forEach(mutator);
}

/**
 * Sets the `display` style of every element matching `selector`.
 *
 * @param {string} selector - CSS selector.
 * @param {string} value    - `display` value ('' to restore the stylesheet one).
 */
export function setDisplayAll (selector, value) {
  setEach(selector, el => { el.style.display = value; });
}

/**
 * Base of the per-machine dashboard pages (machinedashboard, machinestatusdashboard).
 *
 * Handles the options the dashboards share:
 *  - `showChangedTools`              : changed tools (`.changedtools-content`)
 *  - `openStopClassification`        : stop classification popup (component injected dynamically)
 *  - `stopClassificationReopenDelay` : automatic reopen delay
 *  - `showtasklist`                  : task list (`.tasklist-content`)
 *  - `showalarm`                     : per-machine CNC alarm icon (`.cncalarmicon-content`)
 *  - `showUnknownAlarm`              : include unknown (non-focused) alarms in the icon query
 *
 * A page adds its own options by overriding `initOptionValues`, `setDefaultOptionValues`,
 * `getOptionDescriptors` and `buildContent`, calling the base method first.
 *
 * @extends pulsePage.BasePage
 */
export class DashboardBasePage extends pulsePage.BasePage {
  /**
   * @param {string} periodContext - period context of the page (`period-context` attributes).
   */
  constructor (periodContext) {
    super();
    this.periodContext = periodContext;
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
   * Initializes a checkbox from a boolean config key.
   *
   * Checks the checkbox from pulseConfig, marks it `overridden` if the value differs from
   * the default, applies the current value right away (without storing it), then stores
   * and applies the value on each change.
   *
   * @param {string}   id        - DOM id of the checkbox.
   * @param {Function} apply     - Called with the checked state (may be null).
   * @param {string}   configKey - Config key (default: `id`).
   * @returns {HTMLInputElement|null} The checkbox, null if it is not in the page.
   */
  bindCheckbox (id, apply, configKey = id) {
    const checkbox = document.getElementById(id);
    if (!checkbox) return null;
    checkbox.checked = pulseConfig.getBool(configKey);
    if (pulseConfig.getDefaultBool(configKey) != pulseConfig.getBool(configKey)) {
      checkbox.setAttribute('overridden', 'true');
    }
    checkbox.addEventListener('change', () => {
      pulseConfig.set(configKey, checkbox.checked);
      if (apply) apply(checkbox.checked);
    });
    if (apply) apply(checkbox.checked);
    return checkbox;
  }

  /**
   * Initializes the options panel: options shared by the dashboards.
   */
  initOptionValues () {
    // Changed tools
    this.bindCheckbox('showChangedTools',
      show => setDisplayAll('.changedtools-content', show ? 'flex' : 'none'));

    // Stop classification popup
    this.bindCheckbox('openStopClassification', show => {
      if (show) this._createOpenStopClassificationListener();
      else this._deleteOpenStopClassificationListener();
    });
    this._reopenStopClassificationDelay();

    // Task list
    this.bindCheckbox('showtasklist',
      show => setDisplayAll('.tasklist-content', show ? '' : 'none'));

    // CNC alarm icon
    this.bindCheckbox('showalarm', show => {
      setDisplayAll('.cncalarmicon-content', show ? 'flex' : 'none');
      setDisplayAll('.showalarmdetails', show ? '' : 'none');
    });

    // Alarm sub-option: include unknown (non-focused) alarms in the icon query
    const showUnknownAlarmCB = this.bindCheckbox('showUnknownAlarm', null);
    if (showUnknownAlarmCB) {
      showUnknownAlarmCB.addEventListener('change', function () {
        eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showUnknownAlarm' });
      });
    }
  }

  /**
   * Creates and injects the x-openstopclassificationlistener element into the DOM.
   *
   * The component is appended to the body (outside the tile template) because it is
   * page-global — it listens to all stops and opens a classification popup.
   * Checks for an existing component before injecting (idempotent).
   */
  _createOpenStopClassificationListener () {
    setDisplayAll('.openStopClassificationDetails', 'block');
    const container = document.body || document.documentElement;
    let existing = container.querySelector('x-openstopclassificationlistener');
    if (!existing) {
      let listener = document.createElement('x-openstopclassificationlistener');
      listener.setAttribute('machine-context', 'PulseWebApp');
      listener.setAttribute('period-context', this.periodContext);
      listener.setAttribute('status-context', 'PulseWebApp');
      container.appendChild(listener);
    }
  }

  /**
   * Removes the x-openstopclassificationlistener element from the DOM and hides its UI.
   * Inverse operation of `_createOpenStopClassificationListener()`.
   */
  _deleteOpenStopClassificationListener () {
    setDisplayAll('.openStopClassificationDetails', 'none');
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
  _reopenStopClassificationDelay () {
    const input = document.getElementById('stopClassificationReopenDelay');
    if (!input) return;
    input.value = pulseConfig.getInt('stopClassificationReopenDelay', 5);
    if (pulseConfig.getDefaultInt('stopClassificationReopenDelay') !== pulseConfig.getInt('stopClassificationReopenDelay')) {
      input.setAttribute('overridden', 'true');
    }
    input.addEventListener('change', function () {
      const value = parseInt(input.value);
      if (!isNaN(value) && value >= 0) {
        pulseConfig.set('stopClassificationReopenDelay', value);
      }
    });
  }

  /**
   * Resets a checkbox to the default value of its config key.
   */
  setDefaultChecked (id, configKey = id, { trigger = true, clearOverride = true } = {}) {
    const element = document.getElementById(id);
    if (!element) return;
    element.checked = pulseConfig.getDefaultBool(configKey);
    if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
    if (clearOverride) element.removeAttribute('overridden');
  }

  /**
   * Resets an input to the given value.
   */
  setDefaultValue (id, value, { trigger = true, clearOverride = true } = {}) {
    const element = document.getElementById(id);
    if (!element) return;
    element.value = value;
    if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
    if (clearOverride) element.removeAttribute('overridden');
  }

  /**
   * Checks the radio of a group that matches `value`.
   *
   * @param {string} value        - Key of the radio to check in `valueToIdMap`.
   * @param {Object} valueToIdMap - Value → DOM id of the radio.
   */
  setDefaultRadioGroup (value, valueToIdMap, { trigger = true } = {}) {
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
  }

  /**
   * Resets the shared options to their default values (panel "reset" button).
   */
  setDefaultOptionValues () {
    this.setDefaultChecked('showChangedTools');
    this.setDefaultChecked('openStopClassification');
    this.setDefaultValue('stopClassificationReopenDelay', pulseConfig.getDefaultInt('stopClassificationReopenDelay', 0));
    this.setDefaultChecked('showtasklist');
    this.setDefaultChecked('showalarm');
    this.setDefaultChecked('showUnknownAlarm');
  }

  /**
   * Options exported in the URL, as `{ id, type, param? }`: `type` is `checkbox`, `radio`
   * (exported as checked or not) or `value`; `param` is the URL parameter (default: `id`).
   *
   * @returns {Array<{id: string, type: string, param?: string}>}
   */
  getOptionDescriptors () {
    return [
      { id: 'showChangedTools', type: 'checkbox' },
      { id: 'showtasklist', type: 'checkbox' },
      { id: 'openStopClassification', type: 'checkbox' },
      { id: 'stopClassificationReopenDelay', type: 'value' },
      { id: 'showalarm', type: 'checkbox' },
      { id: 'showUnknownAlarm', type: 'checkbox' }
    ];
  }

  /**
   * Serializes the options of `getOptionDescriptors` as URL query string parameters.
   *
   * @returns {string} Query string fragment.
   */
  getOptionValues () {
    return this.getOptionDescriptors().map(opt => {
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
   * Applies the shared options to the DOM components.
   * Bars (x-barstack) read pulseConfig directly — no need to drive them here.
   */
  buildContent () {
    setDisplayAll('.tasklist-content', pulseConfig.getBool('showtasklist') ? '' : 'none');
    setDisplayAll('.changedtools-content', pulseConfig.getBool('showChangedTools') ? 'flex' : 'none');
    setDisplayAll('.cncalarmicon-content', pulseConfig.getBool('showalarm') ? 'flex' : 'none');
  }
}

/**
 * Starts the page lifecycle (getMissingConfigs → initOptionValues → buildContent).
 *
 * @param {Function} createPage - Returns the page (a DashboardBasePage), once the DOM is loaded.
 */
export function startDashboardPage (createPage) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      pulsePage.preparePage(createPage());
    });
  } else {
    pulsePage.preparePage(createPage());
  }
}
