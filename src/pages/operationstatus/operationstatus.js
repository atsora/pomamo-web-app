// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-groupgrid/x-groupgrid');

require('x-machinedisplay/x-machinedisplay');
require('x-currentworkinfo/x-currentworkinfo');
require('x-workinfo/x-workinfo');
require('x-production/x-production');
require('x-currentsequence/x-currentsequence');
require('x-currenttool/x-currenttool');
require('x-currenticoncncalarm/x-currenticoncncalarm');
require('x-defaultpie/x-defaultpie');
require('x-freetext/x-freetext');
require('x-currentisofile/x-currentisofile');
require('x-stacklight/x-stacklight');
require('x-toollifemachine/x-toollifemachine');
require('x-reasonbutton/x-reasonbutton');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-rotationprogress/x-rotationprogress');

/* For Bar display and some defaultpie */
require('x-periodmanager/x-periodmanager');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack'); // pulls in all bar components
/* end Bar display  */
require('x-motionpercentage/x-motionpercentage');

require('x-tr/x-tr');

/**
 * Operation Status page — grid view of per-machine operation dashboards.
 *
 * The most feature-rich page in the application. Combines: workinfo display,
 * machine status logo/letter, production tracking with thresholds, cycle progress pie,
 * current tool/sequence/override indicators, alarms, stacklight, ISO file, tool life,
 * and a utilization bar — all individually configurable.
 *
 * Supports both live (rotation) and historical (scroll) modes.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay`    : rotation — live mode only (12/page)
 *  - `showworkinfo`                         : show workinfo component; when `showproduction` is on,
 *                                             shows x-workinfo; otherwise x-currentworkinfo
 *  - `showworkinfobig` / `showworkinfosmall`: workinfo font size radios; drives `_applyTopDisplaySizing`
 *  - `showcurrentmachinestatuslogo`         : show x-reasonbutton (machine state icon)
 *  - `showcurrentmachinestatusletter`       : show x-lastmachinestatus (state letter)
 *  - `showproduction`                       : show x-production + sets `hidesecondproductiondisplay`;
 *                                             when on, x-workinfo used instead of x-currentworkinfo;
 *                                             sub-options: productionpercent radios (true/actualonly/actualtarget)
 *                                             + thresholds (_verficationThresholds)
 *  - `showcurrent`                          : parent for current display sub-options
 *  - `showcurrentdisplay`                   : 3-way radio (tool/sequence/override) — mutually exclusive;
 *                                             drives `updateCurrentDisplays`
 *  - `showalarm`                            : show alarm icon (left); sub-options: showAlarmBelowIcon
 *                                             (adds the bottom alarm+details below), showUnknownAlarm
 *  - `showpie`                              : show `.operationstatus-cycleprogress`;
 *                                             sub-option: productionpercentinpie radios
 *  - `showstacklight`                       : show x-stacklight
 *  - `showisofile`                          : show `.operationstatus-isofile-div`
 *  - `showtool`                             : show `.operationstatus-tool-div` (tool life);
 *                                             sub-options: toollabelname select, displayremainingcyclesbelowtool
 *  - `showbar`                              : show `.operationstatus-bar` (utilization bar);
 *                                             sub-options: displayshiftrange radios, barshowalarms, barshowpercent
 *
 * Live vs historical mode: detected via `AppContext` URL parameter containing 'live'.
 * Historical mode: rotation hidden, machinesperpage=10000, CSS injected for scrollable x-groupgrid.
 *
 * @extends pulsePage.BasePage
 */
class OperationStatusPage extends pulsePage.BasePage {
  constructor() {
    super();
    this.showMachineselection = true;
  }

  /**
   * Returns whether the workinfo is currently in 'big' mode.
   *
   * Checks the DOM radio first (during options panel interaction); falls back to pulseConfig.
   * Used by `_applyTopDisplaySizing` to set the appropriate font size.
   *
   * @returns {boolean} true if big mode is active.
   */
  _isWorkInfoBig() {
    const smallElement = document.getElementById('showworkinfosmall');
    if (smallElement) {
      return !smallElement.checked;
    }
    return pulseConfig.getBool('showworkinfobig');
  }

  /**
   * Toggles the workinfo size class on all `.operationstatus-top-div` elements.
   * Font sizing is defined in operationstatus.less (cqh in live mode, em in normal mode).
   *
   * Called after any layout change that affects the top div dimensions
   * (workinfo size radios, alarm, pie, stacklight toggles).
   */
  _applyTopDisplaySizing() {
    const isBig = this._isWorkInfoBig();
    document.querySelectorAll('.operationstatus-top-div').forEach(el => {
      el.classList.toggle('workinfo-big', isBig);
      el.classList.toggle('workinfo-small', !isBig);
    });
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Local helpers defined inline:
   *  - `syncRadioGroup(value, valueToIdMap, fallbackValue)`: checks the radio matching `value`
   *  - `bindRadioGroup(valueToIdMap, onSelect)`: binds change listeners on a radio group
   *  - `updateCurrentDisplays()`: applies show/hide to tool/sequence/override divs
   *  - `syncCurrentSelection(value)`: writes all three showcurrent* configs and calls updateCurrentDisplays
   *
   * Live vs historical branching (detected once at init):
   *  - Historical: hides rotation controls, sets machinesperpage=10000, injects scroll CSS.
   *  - Live: standard rotation layout (defaultlayout checkbox, 12/page default).
   *
   * Section overview:
   *  1. Layout / rotation (live only)
   *  2. showworkinfo + workinfo size radios (small/big)
   *  3. showcurrentmachinestatuslogo → x-reasonbutton
   *  4. showcurrentmachinestatusletter → x-lastmachinestatus
   *  5. showproductionoperation (`showproduction`) + `hidesecondproductiondisplay` side-effect;
   *     workinfo display logic: production on → x-workinfo, off → x-currentworkinfo
   *  6. Production percent radios (true/actualonly/actualtarget)
   *  7. Thresholds (target, red) validated via `_verficationThresholds`
   *  8. Current display: showcurrent parent + 3-way radio (tool/sequence/override)
   *  9. Alarm: showalarmoperation (left icon) + showAlarmBelowIcon (adds bottom icon+details) + showUnknownAlarm
   * 10. Pie: showpie + productionpercentinpie radios
   * 11. Stacklight
   * 12. ISO file
   * 13. Tool: showtooloperation + tool label select + showtoolremaining
   * 14. Bar: showbaroperation + day/shift radios + showbar-alarms + showbar-percent
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *   `showworkinfo`, `showworkinfobig`, `showcurrentmachinestatuslogo`,
   *   `showcurrentmachinestatusletter`, `showproduction`, `hidesecondproductiondisplay`,
   *   `productionpercent`, `thresholdtargetproduction`, `thresholdredproduction`,
   *   `showcurrent`, `showcurrentdisplay`, `showcurrenttool`, `showcurrentsequence`,
   *   `showcurrentoverride`, `showalarm`, `currenticoncncalarm.showAlarmBelowIcon`,
   *   `showUnknownAlarm`, `showpie`, `productionpercentinpie`, `showstacklight`,
   *   `showisofile`, `showtool`, `toollifemachine.toollabelname`, `toollabelname`,
   *   `toollifemachine.displayremainingcyclesbelowtool`, `showbar`, `displayshiftrange`,
   *   `barshowalarms`, `barshowpercent`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    var self = this;

    // --- LIVE vs HISTORICAL ---
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    const defaultLayoutChk = document.getElementById('defaultlayout');
    const rotationSettings = document.querySelector('.rotation-settings');
    const machinesPerPageInput = document.getElementById('machinesperpage');

    if (!isLive) {
      // Historical mode: rotation hidden, infinite page, scroll CSS injected
      if (defaultLayoutChk) {
        let row = defaultLayoutChk.closest('.param-row');
        if (row) row.style.display = 'none';
        if (defaultLayoutChk.parentElement) defaultLayoutChk.parentElement.style.display = 'none';
        defaultLayoutChk.checked = false;
      }
      if (rotationSettings) rotationSettings.style.display = 'none';

      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);

      if (machinesPerPageInput) machinesPerPageInput.value = 10000;

    } else {
      // Live mode: standard rotation layout
      if (defaultLayoutChk) {
        defaultLayoutChk.checked = pulseConfig.getBool('defaultlayout', true);

        defaultLayoutChk.addEventListener('change', () => {
          let isDefault = defaultLayoutChk.checked;
          pulseConfig.set('defaultlayout', isDefault);

          if (isDefault) {
            if (rotationSettings) {
              rotationSettings.style.opacity = '0.5';
              rotationSettings.querySelectorAll('input').forEach(inp => inp.disabled = true);
            }
            if (machinesPerPageInput) {
              machinesPerPageInput.value = 12;
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

      if (machinesPerPageInput) machinesPerPageInput.value = pulseConfig.getInt('machinesperpage', 12);
      let rotationDelayInput = document.getElementById('rotationdelay');
      if (rotationDelayInput) rotationDelayInput.value = pulseConfig.getInt('rotationdelay', 10);
    }
    // --- END LIVE/HISTORICAL ---


    const syncRadioGroup = (value, valueToIdMap, fallbackValue) => {
      const targetId = valueToIdMap[value] || valueToIdMap[fallbackValue];
      if (targetId) {
        document.getElementById(targetId).checked = true;
      }
    };

    const bindRadioGroup = (valueToIdMap, onSelect) => {
      Object.entries(valueToIdMap).forEach(([value, id]) => {
        document.getElementById(id).addEventListener('change', function () {
          if (this.checked) {
            onSelect(value);
          }
        });
      });
    };

    const showworkinfoEl = document.getElementById('showworkinfo');
    showworkinfoEl.checked = pulseConfig.getBool('showworkinfo');
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      showworkinfoEl.setAttribute('overridden', 'true');
    }
    showworkinfoEl.addEventListener('change', function () {
      pulseConfig.set('showworkinfo', this.checked);

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      let showproduction = pulseConfig.getBool('showproduction');

      if (showproduction) {
        document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
        if (showworkinfo) {
          document.querySelectorAll('x-workinfo').forEach(el => el.style.display = '');
        } else {
          document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
        }
      } else {
        document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
        if (showworkinfo) {
          document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = '');
        } else {
          document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
        }
      }
      document.querySelectorAll('.showworkinfodetails').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showworkinfoEl.dispatchEvent(new Event('change', { bubbles: true }));

    // Workinfo size radios (small/big): drives _applyTopDisplaySizing for font size
    const workInfoSizeMap = { small: 'showworkinfosmall', big: 'showworkinfobig' };
    const workInfoSize = pulseConfig.getBool('showworkinfobig') ? 'big' : 'small';
    syncRadioGroup(workInfoSize, workInfoSizeMap, 'small');
    bindRadioGroup(workInfoSizeMap, (value) => {
      pulseConfig.set('showworkinfobig', value === 'big' ? 'true' : 'false');
      self._applyTopDisplaySizing();
    });
    self._applyTopDisplaySizing();

    const showcurrentmachinestatuslogoEl = document.getElementById('showcurrentmachinestatuslogo');
    showcurrentmachinestatuslogoEl.checked = pulseConfig.getBool('showcurrentmachinestatuslogo');
    if (pulseConfig.getDefaultBool('showcurrentmachinestatuslogo') != pulseConfig.getBool('showcurrentmachinestatuslogo'))
      showcurrentmachinestatuslogoEl.setAttribute('overridden', 'true');
    showcurrentmachinestatuslogoEl.addEventListener('change', function () {
      pulseConfig.set('showcurrentmachinestatuslogo', this.checked);
      document.querySelectorAll('x-reasonbutton').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showcurrentmachinestatuslogoEl.dispatchEvent(new Event('change', { bubbles: true }));

    const showcurrentmachinestatusletterEl = document.getElementById('showcurrentmachinestatusletter');
    showcurrentmachinestatusletterEl.checked = pulseConfig.getBool('showcurrentmachinestatusletter');
    if (pulseConfig.getDefaultBool('showcurrentmachinestatusletter') != pulseConfig.getBool('showcurrentmachinestatusletter'))
      showcurrentmachinestatusletterEl.setAttribute('overridden', 'true');
    showcurrentmachinestatusletterEl.addEventListener('change', function () {
      pulseConfig.set('showcurrentmachinestatusletter', this.checked);
      document.querySelectorAll('x-lastmachinestatus').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showcurrentmachinestatusletterEl.dispatchEvent(new Event('change', { bubbles: true }));

    const showproductionoperationEl = document.getElementById('showproductionoperation');
    showproductionoperationEl.checked = pulseConfig.getBool('showproduction');
    if (pulseConfig.getDefaultBool('showproduction') != pulseConfig.getBool('showproduction'))
      showproductionoperationEl.setAttribute('overridden', 'true');
    showproductionoperationEl.addEventListener('change', function () {
      pulseConfig.set('showproduction', this.checked);
      if (this.checked) {
        pulseConfig.set('hidesecondproductiondisplay', 'true');
      } else {
        pulseConfig.set('hidesecondproductiondisplay', 'false');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'hidesecondproductiondisplay' });

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      let showproduction = pulseConfig.getBool('showproduction');
      if (showproduction) {
        document.querySelectorAll('x-production').forEach(el => el.style.display = '');
        document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
        if (showworkinfo) {
          document.querySelectorAll('x-workinfo').forEach(el => el.style.display = '');
        } else {
          document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
        }
      } else {
        document.querySelectorAll('x-production').forEach(el => el.style.display = 'none');
        document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
        if (showworkinfo) {
          document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = '');
        } else {
          document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
        }
      }

      document.querySelectorAll('.showproductionoperationdetails').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showproductionoperationEl.dispatchEvent(new Event('change', { bubbles: true }));

    // Production Percent radios: true (full %) / actualonly / actualtarget
    let productionpercent = pulseConfig.getString('productionpercent');
    const productionPercentMap = {
      true: 'productionpercent',
      actualonly: 'productionactualonly',
      actualtarget: 'productionactualtarget'
    };
    syncRadioGroup(productionpercent, productionPercentMap, 'actualtarget');
    bindRadioGroup(productionPercentMap, (value) => {
      pulseConfig.set('productionpercent', value);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'productionpercent' });
    });

    const thresholdTargetEl = document.getElementById('thresholdtargetproduction');
    const thresholdRedEl = document.getElementById('thresholdredproduction');

    thresholdTargetEl.value = pulseConfig.getInt('thresholdtargetproduction');
    var changetarget = function () {
      if (self._verficationThresholds(thresholdTargetEl.value, thresholdRedEl.value)) {
        thresholdTargetEl.setAttribute('overridden', true);
      }
    };
    thresholdTargetEl.addEventListener('input', changetarget);
    thresholdTargetEl.addEventListener('change', changetarget);

    thresholdRedEl.value = pulseConfig.getInt('thresholdredproduction');
    var changeRed = function () {
      if (self._verficationThresholds(thresholdTargetEl.value, thresholdRedEl.value)) {
        thresholdRedEl.setAttribute('overridden', true);
      }
    };
    thresholdRedEl.addEventListener('input', changeRed);
    thresholdRedEl.addEventListener('change', changeRed);

    const updateCurrentDisplays = () => {
      const showcurrent = document.getElementById('showcurrent').checked;
      const showcurrenttool = document.getElementById('showcurrenttool').checked;
      const showcurrentsequence = document.getElementById('showcurrentsequence').checked;
      const showcurrentoverride = document.getElementById('showcurrentoverride').checked;

      document.querySelectorAll('.operationstatus-current-tool-div').forEach(el => {
        el.style.display = (showcurrent && showcurrenttool) ? '' : 'none';
      });

      document.querySelectorAll('.operationstatus-current-sequence-div').forEach(el => {
        el.style.display = (showcurrent && showcurrentsequence) ? '' : 'none';
      });

      document.querySelectorAll('.operationstatus-current-override-div').forEach(el => {
        el.style.display = (showcurrent && showcurrentoverride) ? '' : 'none';
      });

      self._applyTopDisplaySizing();
    };

    // syncCurrentSelection: writes all three showcurrent* configs atomically and refreshes DOM
    const syncCurrentSelection = (value) => {
      pulseConfig.set('showcurrentdisplay', value);
      pulseConfig.set('showcurrenttool', value === 'tool');
      pulseConfig.set('showcurrentsequence', value === 'sequence');
      pulseConfig.set('showcurrentoverride', value === 'override');
      updateCurrentDisplays();
    };

    // Current display 3-way radio: tool / sequence / override (mutually exclusive)
    const currentSelectionMap = {
      tool: 'showcurrenttool',
      sequence: 'showcurrentsequence',
      override: 'showcurrentoverride'
    };
    syncRadioGroup(pulseConfig.getString('showcurrentdisplay'), currentSelectionMap, 'tool');
    bindRadioGroup(currentSelectionMap, (value) => {
      syncCurrentSelection(value);
    });

    const showcurrentEl = document.getElementById('showcurrent');
    const showcurrentRaw = pulseConfig.getString('showcurrent');
    const hasExplicitShowCurrent = showcurrentRaw === 'true' || showcurrentRaw === 'false';
    const showcurrentValue = hasExplicitShowCurrent
      ? showcurrentRaw === 'true'
      : (pulseConfig.getString('showcurrentdisplay') === 'tool'
        || pulseConfig.getString('showcurrentdisplay') === 'sequence'
        || pulseConfig.getString('showcurrentdisplay') === 'override');
    showcurrentEl.checked = showcurrentValue;
    if (hasExplicitShowCurrent && pulseConfig.getDefaultBool('showcurrent') != showcurrentValue) {
      showcurrentEl.setAttribute('overridden', 'true');
    }
    showcurrentEl.addEventListener('change', function () {
      const showcurrent = this.checked;
      pulseConfig.set('showcurrent', showcurrent);
      updateCurrentDisplays();
      document.querySelectorAll('.showcurrentdetails').forEach(el => {
        el.style.display = showcurrent ? '' : 'none';
      });
    });
    showcurrentEl.dispatchEvent(new Event('change', { bubbles: true }));

    const showalarmoperationEl = document.getElementById('showalarmoperation');
    showalarmoperationEl.checked = pulseConfig.getBool('showalarm');
    if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm'))
      showalarmoperationEl.setAttribute('overridden', 'true');
    showalarmoperationEl.addEventListener('change', function () {
      let showalarm = this.checked;
      pulseConfig.set('showalarm', showalarm);
      if (showalarm) {
        let showAlarmBelowIcon = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
        document.querySelectorAll('.operationstatus-alarm-left-div').forEach(el => el.style.display = '');
        document.querySelectorAll('.operationstatus-alarm-bottom-div').forEach(el => {
          el.style.display = showAlarmBelowIcon ? '' : 'none';
        });
      } else {
        document.querySelectorAll('.operationstatus-alarm-left-div').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.operationstatus-alarm-bottom-div').forEach(el => el.style.display = 'none');
      }
      self._applyTopDisplaySizing();
      document.querySelectorAll('.showalarmdetails').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showalarmoperationEl.dispatchEvent(new Event('change', { bubbles: true }));

    const showAlarmBelowIconEl = document.getElementById('showAlarmBelowIcon');
    showAlarmBelowIconEl.checked = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
    if (pulseConfig.getDefaultBool('currenticoncncalarm.showAlarmBelowIcon') != pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon'))
      showAlarmBelowIconEl.setAttribute('overridden', 'true');

    showAlarmBelowIconEl.addEventListener('change', function () {
      let showAlarmBelowIcon = this.checked;
      pulseConfig.set('currenticoncncalarm.showAlarmBelowIcon', showAlarmBelowIcon);
      document.querySelectorAll('.operationstatus-alarm-bottom-div').forEach(el => {
        el.style.display = showAlarmBelowIcon ? '' : 'none';
      });
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showAlarmBelowIcon' });
    });

    const showUnknownAlarmEl = document.getElementById('showUnknownAlarm');
    showUnknownAlarmEl.checked = pulseConfig.getBool('showUnknownAlarm');
    if (pulseConfig.getDefaultBool('showUnknownAlarm') != pulseConfig.getBool('showUnknownAlarm'))
      showUnknownAlarmEl.setAttribute('overridden', 'true');

    showUnknownAlarmEl.addEventListener('change', function () {
      pulseConfig.set('showUnknownAlarm', this.checked);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showUnknownAlarm' });
    });

    const showpieEl = document.getElementById('showpie');
    showpieEl.checked = pulseConfig.getBool('showpie');
    if (pulseConfig.getDefaultBool('showpie') != pulseConfig.getBool('showpie'))
      showpieEl.setAttribute('overridden', 'true');
    showpieEl.addEventListener('change', function () {
      let showpie = this.checked;
      pulseConfig.set('showpie', showpie);
      document.querySelectorAll('.operationstatus-cycleprogress').forEach(el => {
        el.style.display = showpie ? '' : 'none';
      });
      self._applyTopDisplaySizing();
      document.querySelectorAll('.showpiedetails').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showpieEl.dispatchEvent(new Event('change', { bubbles: true }));

    // Production percent in pie radios: true / actualonly / actualtarget
    const productionPercentInPieMap = {
      true: 'productionpercentinpie',
      actualonly: 'productionactualonlyinpie',
      actualtarget: 'productionactualtargetinpie'
    };
    syncRadioGroup(pulseConfig.getString('productionpercentinpie'), productionPercentInPieMap, 'actualtarget');
    bindRadioGroup(productionPercentInPieMap, (value) => {
      pulseConfig.set('productionpercentinpie', value);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'productionpercentinpie' });
    });

    const showstacklightEl = document.getElementById('showstacklight');
    showstacklightEl.checked = pulseConfig.getBool('showstacklight');
    if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight'))
      showstacklightEl.setAttribute('overridden', 'true');
    showstacklightEl.addEventListener('change', function () {
      let showstacklight = this.checked;
      pulseConfig.set('showstacklight', showstacklight);
      document.querySelectorAll('x-stacklight').forEach(el => {
        el.style.display = showstacklight ? '' : 'none';
      });
      self._applyTopDisplaySizing();
    });

    const showisofireEl = document.getElementById('showisofile');
    showisofireEl.checked = pulseConfig.getBool('showisofile');
    if (pulseConfig.getDefaultBool('showisofile') != pulseConfig.getBool('showisofile'))
      showisofireEl.setAttribute('overridden', 'true');
    showisofireEl.addEventListener('change', function () {
      let showisofile = this.checked;
      pulseConfig.set('showisofile', showisofile);
      document.querySelectorAll('.operationstatus-isofile-div').forEach(el => {
        el.style.display = showisofile ? '' : 'none';
      });
    });
    showisofireEl.dispatchEvent(new Event('change', { bubbles: true }));

    const showtooloperationEl = document.getElementById('showtooloperation');
    showtooloperationEl.checked = pulseConfig.getBool('showtool');
    if (pulseConfig.getDefaultBool('showtool') != pulseConfig.getBool('showtool'))
      showtooloperationEl.setAttribute('overridden', 'true');
    showtooloperationEl.addEventListener('change', function () {
      let showtool = this.checked;
      pulseConfig.set('showtool', showtool);
      document.querySelectorAll('.operationstatus-tool-div').forEach(el => {
        el.style.display = showtool ? '' : 'none';
      });
      document.querySelectorAll('.showtoolsdetails').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showtooloperationEl.dispatchEvent(new Event('change', { bubbles: true }));

    let toollabelname = pulseConfig.getString('toollifemachine.toollabelname');
    const showtoolselectorEl = document.getElementById('showtoolselector');
    showtoolselectorEl.replaceChildren();
    let toollabelsselections = pulseConfig.getArray('toollifemachine.toollabelsselections');
    let toolLabels = (typeof ATSORA_CATALOG !== 'undefined' && ATSORA_CATALOG.general && ATSORA_CATALOG.general.toolLabels) || {};
    for (let iTool = 0; iTool < toollabelsselections.length; iTool++) {
      let label = toollabelsselections[iTool];
      let displayText = toolLabels[label.name] || label.name;
      const option = document.createElement('option');
      option.id = 'tool-' + label.name;
      option.value = label.name;
      option.textContent = displayText;
      showtoolselectorEl.appendChild(option);
    }
    showtoolselectorEl.value = toollabelname;

    showtoolselectorEl.addEventListener('change', function () {
      let toollabelname = this.value;
      pulseConfig.set('toollabelname', String(toollabelname));
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'toollabelname' });
    });

    const showtoolremainingEl = document.getElementById('showtoolremaining');
    showtoolremainingEl.checked = pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool');
    if (pulseConfig.getDefaultBool('showbar') != pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'))
      showtoolremainingEl.setAttribute('overridden', 'true');
    showtoolremainingEl.addEventListener('change', function () {
      let showtoolremaining = this.checked;
      pulseConfig.set('toollifemachine.displayremainingcyclesbelowtool', showtoolremaining);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'displayremainingcyclesbelowtool' });
    });

    const showbaroperationEl = document.getElementById('showbaroperation');
    showbaroperationEl.checked = pulseConfig.getBool('showbar');
    if (pulseConfig.getDefaultBool('showbar') != pulseConfig.getBool('showbar'))
      showbaroperationEl.setAttribute('overridden', 'true');
    showbaroperationEl.addEventListener('change', function () {
      let showbar = this.checked;
      pulseConfig.set('showbar', showbar);
      document.querySelectorAll('.operationstatus-bar').forEach(el => {
        el.style.display = showbar ? '' : 'none';
      });
      document.querySelectorAll('.showbardetails').forEach(el => {
        el.style.display = this.checked ? '' : 'none';
      });
    });
    showbaroperationEl.dispatchEvent(new Event('change', { bubbles: true }));

    const barPeriodMap = { day: 'barrangeisday', shift: 'displayshiftrange' };
    const barPeriod = pulseConfig.getBool('displayshiftrange') ? 'shift' : 'day';
    syncRadioGroup(barPeriod, barPeriodMap, 'day');
    bindRadioGroup(barPeriodMap, (value) => {
      pulseConfig.set('displayshiftrange', value === 'shift');
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'displayshiftrange' });
    });

    const showbaralarmsEl = document.getElementById('showbar-alarms');
    showbaralarmsEl.checked = pulseConfig.getBool('barshowalarms');
    if (pulseConfig.getDefaultBool('barshowalarms') != pulseConfig.getBool('barshowalarms')) {
      showbaralarmsEl.setAttribute('overridden', 'true');
    }
    document.querySelectorAll('.main-table-box').forEach(el => {
      el.classList.toggle('barshowalarms-active', pulseConfig.getBool('barshowalarms'));
    });
    showbaralarmsEl.addEventListener('change', function () {
      let barshowalarms = this.checked;
      pulseConfig.set('barshowalarms', barshowalarms);
      document.querySelectorAll('.main-table-box').forEach(el => {
        el.classList.toggle('barshowalarms-active', barshowalarms);
      });
    });

    const showbarpercentEl = document.getElementById('showbar-percent');
    showbarpercentEl.checked = pulseConfig.getBool('barshowpercent');
    if (pulseConfig.getDefaultBool('barshowpercent') != pulseConfig.getBool('barshowpercent')) {
      showbarpercentEl.setAttribute('overridden', 'true');
    }
    showbarpercentEl.addEventListener('change', function () {
      let barshowpercent = this.checked;
      pulseConfig.set('barshowpercent', barshowpercent);
      document.querySelectorAll('.div-percent').forEach(el => {
        el.style.display = barshowpercent ? '' : 'none';
      });
      document.querySelectorAll('x-datetimegraduation').forEach(el => {
        if (el.load) el.load();
      });
    });
  }

  /**
   * Validates and applies the production color thresholds.
   *
   * Error container: `.thresholdunitispart` (with null check — no fallback).
   * Validation rules: both values must be numbers, positive, target > red, both ≤ 100.
   * On success: writes to pulseConfig and dispatches `configChangeEvent { config: 'thresholdsupdated' }`.
   *
   * @param {number|string} targetValue - Target threshold (%), integer.
   * @param {number|string} redValue    - Red threshold (%), integer.
   * @returns {boolean} true if valid and applied, false otherwise.
   */
  // Verify threshold values
  _verficationThresholds(targetValue, redValue) {
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      if (document.querySelector('.thresholdunitispart')) document.querySelector('.thresholdunitispart').appendChild(errorMessage);
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

    eventBus.EventBus.dispatchToAll('configChangeEvent', {
      config: 'thresholdsupdated'
    });

    return true;
  }

  /**
   * Resets all options to their default values.
   *
   * Uses standard `setDefaultChecked`, `setDefaultValue`, and `setDefaultRadioGroup` helpers.
   * All option groups reset in the same order as initOptionValues.
   * Layout reset only applies in live mode (rotation controls are hidden in historical mode).
   */
  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.checked = pulseConfig.getDefaultBool(configKey);
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = document.getElementById(id);
      element.value = value;
      if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      if (clearOverride) element.removeAttribute('overridden');
    };

    const setDefaultRadioGroup = (value, valueToIdMap, { trigger = true } = {}) => {
      Object.values(valueToIdMap).forEach((id) => {
        document.getElementById(id).removeAttribute('overridden');
      });
      const targetId = valueToIdMap[value];
      if (targetId) {
        const element = document.getElementById(targetId);
        element.checked = true;
        if (trigger) element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    setDefaultChecked('showworkinfo');
    setDefaultRadioGroup(pulseConfig.getDefaultBool('showworkinfosmall') ? 'small' : 'big', {
      small: 'showworkinfosmall',
      big: 'showworkinfobig'
    });
    setDefaultChecked('showcurrentmachinestatuslogo');
    setDefaultChecked('showcurrentmachinestatusletter');
    setDefaultValue('thresholdtargetproduction', pulseConfig.getDefaultInt('thresholdtargetproduction'));
    setDefaultValue('thresholdredproduction', pulseConfig.getDefaultInt('thresholdredproduction'));
    setDefaultChecked('showproductionoperation', 'showproduction');
    setDefaultRadioGroup(pulseConfig.getDefaultString('productionpercent'), {
      true: 'productionpercent',
      actualonly: 'productionactualonly',
      actualtarget: 'productionactualtarget'
    });
    setDefaultChecked('showcurrent');
    setDefaultRadioGroup(pulseConfig.getDefaultString('showcurrentdisplay'), {
      tool: 'showcurrenttool',
      sequence: 'showcurrentsequence',
      override: 'showcurrentoverride'
    });
    setDefaultChecked('showalarmoperation', 'showalarm');
    setDefaultChecked('showAlarmBelowIcon', 'currenticoncncalarm.showAlarmBelowIcon');
    setDefaultChecked('showUnknownAlarm');
    setDefaultChecked('showpie');
    setDefaultRadioGroup(pulseConfig.getDefaultString('productionpercentinpie'), {
      true: 'productionpercentinpie',
      actualonly: 'productionactualonlyinpie',
      actualtarget: 'productionactualtargetinpie'
    });
    setDefaultChecked('showstacklight');
    setDefaultChecked('showisofile');
    setDefaultChecked('showtooloperation', 'showtool');
    const showtoolselectorEl = document.getElementById('showtoolselector');
    showtoolselectorEl.value = pulseConfig.getString('toollabelname');
    showtoolselectorEl.removeAttribute('overridden');
    setDefaultChecked('showtoolremaining', 'toollifemachine.displayremainingcyclesbelowtool');
    setDefaultChecked('showbaroperation', 'showbar');
    setDefaultRadioGroup(pulseConfig.getDefaultBool('displayshiftrange') ? 'shift' : 'day', {
      day: 'barrangeisday',
      shift: 'displayshiftrange'
    });
    setDefaultChecked('showbar-alarms', 'barshowalarms');
    setDefaultChecked('showbar-percent', 'barshowpercent');

    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if (tmpContexts && tmpContexts.includes('live')) {
        setDefaultChecked('defaultlayout');
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Hidden elements are skipped (handles historical mode where rotation controls are hidden).
   * Conditional sections: production (thresholds, productionpercent only when showproduction on),
   * current display radio only when showcurrent on, alarm sub-options, pie productionpercentinpie,
   * tool sub-options (label, remaining), bar sub-options (period, alarms, percent).
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const options = [
      { id: 'showworkinfo', type: 'checkbox' },
      { id: 'showworkinfosmall', type: 'checkbox' },
      { id: 'showcurrentmachinestatuslogo', type: 'checkbox' },
      { id: 'showcurrentmachinestatusletter', type: 'checkbox' },
      { id: 'showcurrent', type: 'checkbox' },
      { id: 'showproductionoperation', type: 'checkbox', param: 'showproduction' },
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const isHidden = (el.offsetWidth === 0 && el.offsetHeight === 0) || el.offsetParent === null;
      if (isHidden) return '';

      const paramName = opt.param || opt.id;
      if (opt.type === 'checkbox' || opt.type === 'radio') {
        return `&${paramName}=${el.checked}`;
      } else {
        return `&${paramName}=${el.value}`;
      }
    }).join('');

    // Production sub-options: only when showproduction is on
    if (document.getElementById('showproductionoperation')?.checked) {
      if (document.getElementById('productionpercent')?.checked) {
        result += '&productionpercent=true';
      } else if (document.getElementById('productionactualonly')?.checked) {
        result += '&productionpercent=actualonly';
      } else {
        result += '&productionpercent=actualtarget';
      }
      if (pulseUtility.isInteger(document.getElementById('thresholdtargetproduction')?.value)) {
        result += `&thresholdtargetproduction=${document.getElementById('thresholdtargetproduction')?.value}`;
      }
      if (pulseUtility.isInteger(document.getElementById('thresholdredproduction')?.value)) {
        result += `&thresholdredproduction=${document.getElementById('thresholdredproduction')?.value}`;
      }
    } else {
      result += '&productionpercent=false';
    }

    // Current display radio: serialized as showcurrentdisplay enum value
    if (document.getElementById('showcurrenttool')?.checked) {
      result += '&showcurrentdisplay=tool';
    } else if (document.getElementById('showcurrentsequence')?.checked) {
      result += '&showcurrentdisplay=sequence';
    } else if (document.getElementById('showcurrentoverride')?.checked) {
      result += '&showcurrentdisplay=override';
    }

    // Alarm + sub-options
    const showalarmEl = document.getElementById('showalarmoperation');
    result += `&showalarm=${showalarmEl?.checked}`;
    if (showalarmEl?.checked) {
      result += `&showAlarmBelowIcon=${document.getElementById('showAlarmBelowIcon')?.checked}`;
      result += `&showUnknownAlarm=${document.getElementById('showUnknownAlarm')?.checked}`;
    }

    // Pie + sub-options
    const showpieEl = document.getElementById('showpie');
    result += `&showpie=${showpieEl?.checked}`;
    if (showpieEl?.checked) {
      if (document.getElementById('productionpercentinpie')?.checked) {
        result += '&productionpercentinpie=true';
      } else if (document.getElementById('productionactualonlyinpie')?.checked) {
        result += '&productionpercentinpie=actualonly';
      } else {
        result += '&productionpercentinpie=actualtarget';
      }
    }

    result += `&showstacklight=${document.getElementById('showstacklight')?.checked}`;
    result += `&showisofile=${document.getElementById('showisofile')?.checked}`;

    // Tool + sub-options
    const showtoolEl = document.getElementById('showtooloperation');
    result += `&showtool=${showtoolEl?.checked}`;
    if (showtoolEl?.checked) {
      const toolSelector = document.getElementById('showtoolselector');
      if (toolSelector?.value) {
        result += `&toollabelname=${toolSelector.value}`;
      }
      result += `&displayremainingcyclesbelowtool=${document.getElementById('showtoolremaining')?.checked}`;
    }

    // Bar + sub-options
    const showbarEl = document.getElementById('showbaroperation');
    result += `&showbar=${showbarEl?.checked}`;
    if (showbarEl?.checked) {
      result += `&displayshiftrange=${document.getElementById('displayshiftrange')?.checked}`;
      result += `&barshowalarms=${document.getElementById('showbar-alarms')?.checked}`;
      result += `&barshowpercent=${document.getElementById('showbar-percent')?.checked}`;
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
   * Applies the current configuration to all DOM components at load time.
   *
   * Mirrors the show/hide logic from initOptionValues change listeners, reading from pulseConfig.
   * Handles:
   *  - workinfo / production routing (x-workinfo vs x-currentworkinfo)
   *  - pie / cycle progress
   *  - stacklight
   *  - current tool/sequence/override (reads showcurrentdisplay, falls back to individual flags)
   *  - alarm (left vs bottom layout based on showAlarmBelowIcon)
   *  - ISO file
   *  - tool life
   *  - _applyTopDisplaySizing (called once for all layout changes)
   *  - utilization bar + barshowpercent
   */
  buildContent() {
    let showworkinfo = pulseConfig.getBool('showworkinfo');
    let showproduction = pulseConfig.getBool('showproduction');

    if (showproduction) {
      document.querySelectorAll('x-production').forEach(el => el.style.display = '');
      document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
      if (showworkinfo) {
        document.querySelectorAll('x-workinfo').forEach(el => el.style.display = '');
      } else {
        document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
      }
    } else {
      document.querySelectorAll('x-production').forEach(el => el.style.display = 'none');
      document.querySelectorAll('x-workinfo').forEach(el => el.style.display = 'none');
      if (showworkinfo) {
        document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = '');
      } else {
        document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
      }
    }

    let showpie = pulseConfig.getBool('showpie');
    document.querySelectorAll('.operationstatus-cycleprogress').forEach(el => {
      el.style.display = showpie ? '' : 'none';
    });

    let showstacklight = pulseConfig.getBool('showstacklight');
    document.querySelectorAll('x-stacklight').forEach(el => {
      el.style.display = showstacklight ? '' : 'none';
    });

    let showcurrent = pulseConfig.getBool('showcurrent');
    const currentDisplay = pulseConfig.getString('showcurrentdisplay');
    const hasCurrentDisplay = currentDisplay === 'tool' || currentDisplay === 'sequence' || currentDisplay === 'override';
    let showcurrenttool = hasCurrentDisplay ? currentDisplay === 'tool' : pulseConfig.getBool('showcurrenttool');
    document.querySelectorAll('.operationstatus-current-tool-div').forEach(el => {
      el.style.display = (showcurrent && showcurrenttool) ? '' : 'none';
    });

    let showcurrentsequence = hasCurrentDisplay ? currentDisplay === 'sequence' : pulseConfig.getBool('showcurrentsequence');
    document.querySelectorAll('.operationstatus-current-sequence-div').forEach(el => {
      el.style.display = (showcurrent && showcurrentsequence) ? '' : 'none';
    });

    let showcurrentoverride = hasCurrentDisplay ? currentDisplay === 'override' : pulseConfig.getBool('showcurrentoverride');
    document.querySelectorAll('.operationstatus-current-override-div').forEach(el => {
      el.style.display = (showcurrent && showcurrentoverride) ? '' : 'none';
    });

    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      let showAlarmBelowIcon = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
      document.querySelectorAll('.operationstatus-alarm-left-div').forEach(el => el.style.display = '');
      document.querySelectorAll('.operationstatus-alarm-bottom-div').forEach(el => {
        el.style.display = showAlarmBelowIcon ? '' : 'none';
      });
    } else {
      document.querySelectorAll('.operationstatus-alarm-left-div').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.operationstatus-alarm-bottom-div').forEach(el => el.style.display = 'none');
    }

    let showisofile = pulseConfig.getBool('showisofile');
    document.querySelectorAll('.operationstatus-isofile-div').forEach(el => {
      el.style.display = showisofile ? '' : 'none';
    });

    let showtool = pulseConfig.getBool('showtool');
    document.querySelectorAll('.operationstatus-tool-div').forEach(el => {
      el.style.display = showtool ? '' : 'none';
    });

    this._applyTopDisplaySizing();

    let showbar = pulseConfig.getBool('showbar');
    document.querySelectorAll('.operationstatus-bar').forEach(el => {
      el.style.display = showbar ? '' : 'none';
    });

    let barshowpercent = pulseConfig.getBool('barshowpercent');
    document.querySelectorAll('.div-percent').forEach(el => {
      el.style.display = barshowpercent ? '' : 'none';
    });
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new OperationStatusPage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new OperationStatusPage());
  });
}
