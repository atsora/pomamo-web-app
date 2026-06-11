// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as pulseUtility from 'pulseUtility';
import * as pulsePage from 'pulsePage';
import * as eventBus from 'eventBus';

import 'x-reasonbutton/x-reasonbutton';
import 'x-machinedisplay/x-machinedisplay';
import 'x-currentworkinfo/x-currentworkinfo';
import 'x-freetext/x-freetext';
import 'x-performancetarget/x-performancetarget';
import 'x-currentsequence/x-currentsequence';
import 'x-currenttool/x-currenttool';
import 'x-currenticoncncalarm/x-currenticoncncalarm';
import 'x-stacklight/x-stacklight';
import 'x-reasonslotpie/x-reasonslotpie';
import 'x-motionpercentage/x-motionpercentage';
import 'x-motiontime/x-motiontime';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-barstack/x-barstack'; // pulls in all bar components
import 'x-periodmanager/x-periodmanager';
import 'x-machinemodelegends/x-machinemodelegends';
import 'x-reasongroups/x-reasongroups';

import 'x-groupgrid/x-groupgrid';
import 'x-rotationprogress/x-rotationprogress';
import 'x-tr/x-tr';

/**
 * Machine Status page — grid view of per-machine status dashboards.
 *
 * One of the most feature-rich pages: combines daily info (pie, bars, motion, target),
 * optional tool/sequence indicators, alarm, stacklight, and a weekly bar section.
 * Supports both live (rotation) and historical (scroll) modes.
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation — live mode only (default: 12/page)
 *  - `showworkinfo`                  : show x-currentworkinfo (operation name)
 *  - `displayshiftrange`             : pie range — shift (true) or day (false, default)
 *  - `displaymotiontime`             : motion display — time (true) or percent (false, default);
 *                                      switching to time disables and unchecks `showtarget`
 *  - `showtarget`                    : show `.machinestatus-target` (x-performancetarget);
 *                                      forced to false and disabled when displaymotiontime=true
 *  - `showcurrenttool`               : show tool indicator — mutually exclusive with showcurrentsequence
 *  - `showcurrentsequence`           : show sequence indicator — mutually exclusive with showcurrenttool;
 *                                      parent checkbox `#showcurrent` controls subgroup visibility
 *  - `showalarm`                     : show x-currenticoncncalarm
 *  - `showstacklight`                : show x-stacklight
 *  - `showweeklybar`                 : show weekly bar section (.machinestatus-weekly-info);
 *                                      parent controls subgroup visibility
 *  - `weeklyshowcurrentweek`         : weekly range — current week (true) or last 7 days (false);
 *                                      drives `#period-for-week` attributes and `.machinestatus-label`
 *
 * Live vs historical mode: detected via `AppContext` URL parameter containing 'live'.
 * Historical mode: rotation hidden, machinesperpage=10000, CSS injected for scrollable x-groupgrid.
 *
 * Components: x-groupgrid, x-machinedisplay, x-currentworkinfo, x-freetext,
 * x-performancetarget, x-currentsequence, x-currenttool, x-currenticoncncalarm,
 * x-stacklight, x-reasonslotpie, x-motionpercentage, x-motiontime,
 * x-datetimegraduation, x-barstack, x-periodmanager, x-machinemodelegends,
 * x-reasongroups, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class MachineStatusPage extends pulsePage.BasePage {
  constructor() {
    super();
    this.showMachineselection = true;
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Live vs historical branching (detected once at init):
   *  - Historical: hides rotation controls, sets machinesperpage=10000, injects scroll CSS.
   *  - Live: standard rotation layout (defaultlayout checkbox, 12/page default).
   *
   * Section overview:
   *  1. Layout / rotation (live only)
   *  2. showworkinfo — shows/hides x-currentworkinfo
   *  3. Pie range — `#displayshiftrange` / `#pierangeisday` radios (shift or day)
   *  4. Motion display — `#displaymotiontime` / `#displaymotionpercent` radios (time or percent);
   *     selecting time mode unchecks and disables `#showtarget`
   *  5. Target — `#showtarget` shows/hides `.machinestatus-target`
   *  6. Current tool/sequence — `#showcurrent` parent controls `.showcurrentdetails` subgroup;
   *     `#showcurrenttool` and `#showcurrentsequence` are mutually exclusive (checking one hides the other)
   *  7. Alarm — `#showalarm` shows/hides x-currenticoncncalarm
   *  8. Stacklight — `#showstacklight` shows/hides x-stacklight
   *  9. Weekly bar — `#showweeklybar` parent controls `.machinestatus-weekly-info` and
   *     `.showweeklydetails` subgroup; `#showcurrentweek` / `#showlast7days` radios drive
   *     `#period-for-week` attributes (`exclude-now`, `displayweekrange`) and the week label
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showworkinfo`, `displayshiftrange`, `displaymotiontime`,
   *                       `showtarget`, `showcurrenttool`, `showcurrentsequence`,
   *                       `showalarm`, `showstacklight`, `showweeklybar`, `weeklyshowcurrentweek`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
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

      // Scroll & grid sizing handled by .pulse-content:not(.appcontext-live) overrides in machinestatus.less
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
    // --- END LIVE/HISTORICAL ---

    // showworkinfo = Show Operation
    const showWorkInfoChk = document.getElementById('showworkinfo');
    if (showWorkInfoChk) {
      showWorkInfoChk.checked = pulseConfig.getBool('showworkinfo');
      if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
        showWorkInfoChk.setAttribute('overridden', 'true');
      }
      showWorkInfoChk.addEventListener('change', function () {
        pulseConfig.set('showworkinfo', showWorkInfoChk.checked);

        let showworkinfo = pulseConfig.getBool('showworkinfo');
        if (showworkinfo) {
          document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = '');
        }
        else {
          document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
        }
      });
    }

    // Pie range: Shift or Day (mutually exclusive radios)
    const displayShiftRangeRadio = document.getElementById('displayshiftrange');
    const pieRangeIsDayRadio = document.getElementById('pierangeisday');
    if (displayShiftRangeRadio && pieRangeIsDayRadio) {
      displayShiftRangeRadio.checked = pulseConfig.getBool('displayshiftrange');
      pieRangeIsDayRadio.checked = !pulseConfig.getBool('displayshiftrange');
      displayShiftRangeRadio.addEventListener('change', function () {
        let displayshiftrange = displayShiftRangeRadio.checked;
        // Store
        pulseConfig.set('displayshiftrange', displayshiftrange);
        // Display / Dispatch
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displayshiftrange' });
      });
      pieRangeIsDayRadio.addEventListener('change', function () {
        let displayshiftrange = !pieRangeIsDayRadio.checked;
        // Store
        pulseConfig.set('displayshiftrange', displayshiftrange);
        // Display / Dispatch
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displayshiftrange' });
      });
    }

    // Motion display: Time or Percent (mutually exclusive radios).
    // When time mode is selected, showtarget is unchecked and disabled (incompatible).
    const displayMotionTimeRadio = document.getElementById('displaymotiontime');
    const displayMotionPercentRadio = document.getElementById('displaymotionpercent');
    if (displayMotionTimeRadio && displayMotionPercentRadio) {
      displayMotionTimeRadio.checked = pulseConfig.getBool('displaymotiontime');
      displayMotionPercentRadio.checked = !pulseConfig.getBool('displaymotiontime');
      displayMotionTimeRadio.addEventListener('change', function () {
        let displaymotiontime = displayMotionTimeRadio.checked;
        // Store
        pulseConfig.set('displaymotiontime', displaymotiontime);
        // Display
        if (displaymotiontime) {
          // daily
          document.querySelectorAll('.machinestatus-daily-info x-motiontime').forEach(el => el.style.display = 'block');
          document.querySelectorAll('.machinestatus-daily-info x-motionpercentage').forEach(el => el.style.display = 'none');
          // weekly
          document.querySelectorAll('.machinestatus-weekly-info x-motiontime').forEach(el => el.style.display = 'block');
          document.querySelectorAll('.machinestatus-weekly-info x-motionpercentage').forEach(el => el.style.display = 'none');
          // Reset show target (incompatible with time mode)
          const showTargetChk = document.getElementById('showtarget');
          if (showTargetChk) {
            showTargetChk.checked = false;
            showTargetChk.dispatchEvent(new Event('change', { bubbles: true }));
            showTargetChk.disabled = true;
          }
        }
        else {
          // daily
          document.querySelectorAll('.machinestatus-daily-info x-motiontime').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.machinestatus-daily-info x-motionpercentage').forEach(el => el.style.display = 'block');
          // weekly
          document.querySelectorAll('.machinestatus-weekly-info x-motiontime').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.machinestatus-weekly-info x-motionpercentage').forEach(el => el.style.display = 'block');
          // Allow show target
          const showTargetChk = document.getElementById('showtarget');
          if (showTargetChk) showTargetChk.disabled = false;
        }
      });
      displayMotionPercentRadio.addEventListener('change', function () {
        let displaymotiontime = !displayMotionPercentRadio.checked;
        // Store
        pulseConfig.set('displaymotiontime', displaymotiontime);
        // Display
        if (displaymotiontime) {
          // daily
          document.querySelectorAll('.machinestatus-daily-info x-motiontime').forEach(el => el.style.display = 'block');
          document.querySelectorAll('.machinestatus-daily-info x-motionpercentage').forEach(el => el.style.display = 'none');
          // weekly
          document.querySelectorAll('.machinestatus-weekly-info x-motiontime').forEach(el => el.style.display = 'block');
          document.querySelectorAll('.machinestatus-weekly-info x-motionpercentage').forEach(el => el.style.display = 'none');
          // Reset show target (incompatible with time mode)
          const showTargetChk = document.getElementById('showtarget');
          if (showTargetChk) {
            showTargetChk.checked = false;
            showTargetChk.dispatchEvent(new Event('change', { bubbles: true }));
            showTargetChk.disabled = true;
          }
        }
        else {
          // daily
          document.querySelectorAll('.machinestatus-daily-info x-motiontime').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.machinestatus-daily-info x-motionpercentage').forEach(el => el.style.display = 'block');
          // weekly
          document.querySelectorAll('.machinestatus-weekly-info x-motiontime').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.machinestatus-weekly-info x-motionpercentage').forEach(el => el.style.display = 'block');
          // Allow show target
          const showTargetChk = document.getElementById('showtarget');
          if (showTargetChk) showTargetChk.disabled = false;
        }
      });
    }

    // Target: shows/hides .machinestatus-target — disabled when in time mode
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
          document.querySelectorAll('.machinestatus-target').forEach(el => el.style.display = '');
        }
        else {
          document.querySelectorAll('.machinestatus-target').forEach(el => el.style.display = 'none');
        }
      });
    }

    // Current Tool / Sequence:
    // #showcurrent is a parent checkbox that controls .showcurrentdetails subgroup visibility.
    // #showcurrenttool and #showcurrentsequence are mutually exclusive: checking one unchecks the other.
    const showCurrentChk = document.getElementById('showcurrent');
    const showCurrentToolChk = document.getElementById('showcurrenttool');
    const showCurrentSequenceChk = document.getElementById('showcurrentsequence');
    if (showCurrentChk && showCurrentToolChk && showCurrentSequenceChk) {
      showCurrentChk.checked = (pulseConfig.getBool('showcurrenttool') || pulseConfig.getBool('showcurrentsequence'));
      showCurrentChk.addEventListener('change', function () {
        let showcurrent = showCurrentChk.checked;
        // Store / Display
        if (showcurrent == false) {
          showCurrentToolChk.checked = false;
          showCurrentSequenceChk.checked = false;
          showCurrentToolChk.dispatchEvent(new Event('change', { bubbles: true }));
          showCurrentSequenceChk.dispatchEvent(new Event('change', { bubbles: true }));

          // Visibility of subgroups
          document.querySelectorAll('.showcurrentdetails').forEach(el => el.style.display = 'none');
        }
        else {
          // Visibility of subgroups
          document.querySelectorAll('.showcurrentdetails').forEach(el => el.style.display = '');

          // Default: auto-check tool if neither tool nor sequence is checked
          if (!showCurrentToolChk.checked && !showCurrentSequenceChk.checked) {
            showCurrentToolChk.checked = true;
            pulseConfig.set('showcurrenttool', true);
          }

          showCurrentToolChk.dispatchEvent(new Event('change', { bubbles: true }));
          showCurrentSequenceChk.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      showCurrentChk.dispatchEvent(new Event('change', { bubbles: true }));

      showCurrentToolChk.checked = pulseConfig.getBool('showcurrenttool');
      if (pulseConfig.getDefaultBool('showcurrenttool') != pulseConfig.getBool('showcurrenttool'))
        showCurrentToolChk.setAttribute('overridden', 'true');
      showCurrentToolChk.addEventListener('change', function () {
        let showcurrenttool = showCurrentToolChk.checked;
        // Store
        pulseConfig.set('showcurrenttool', showcurrenttool);
        // Display
        if (showcurrenttool) {
          document.querySelectorAll('.machinestatus-current-tool-div').forEach(el => el.style.display = '');
          // Mutually exclusive: hide sequence
          pulseConfig.set('showcurrentsequence', false);
          document.querySelectorAll('.machinestatus-current-sequence-div').forEach(el => el.style.display = 'none');
        }
        else {
          document.querySelectorAll('.machinestatus-current-tool-div').forEach(el => el.style.display = 'none');
        }
      });

      showCurrentSequenceChk.checked = pulseConfig.getBool('showcurrentsequence');
      if (pulseConfig.getDefaultBool('showcurrentsequence') != pulseConfig.getBool('showcurrentsequence'))
        showCurrentSequenceChk.setAttribute('overridden', 'true');
      showCurrentSequenceChk.addEventListener('change', function () {
        let showcurrentsequence = showCurrentSequenceChk.checked;
        // Store
        pulseConfig.set('showcurrentsequence', showcurrentsequence);
        // Display
        if (showcurrentsequence) {
          document.querySelectorAll('.machinestatus-current-sequence-div').forEach(el => el.style.display = '');
          // Mutually exclusive: hide tool
          pulseConfig.set('showcurrenttool', false);
          document.querySelectorAll('.machinestatus-current-tool-div').forEach(el => el.style.display = 'none');
        }
        else {
          document.querySelectorAll('.machinestatus-current-sequence-div').forEach(el => el.style.display = 'none');
        }
      });
    }

    // Alarm
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

    // Stacklight
    const showStackLightChk = document.getElementById('showstacklight');
    if (showStackLightChk) {
      showStackLightChk.checked = pulseConfig.getBool('showstacklight');
      if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight')) {
        showStackLightChk.setAttribute('overridden', 'true');
      }
      showStackLightChk.addEventListener('change', function () {
        let showstacklight = showStackLightChk.checked;
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

    // Weekly bar: parent checkbox controls .machinestatus-weekly-info and .showweeklydetails subgroup
    const showWeeklyBarChk = document.getElementById('showweeklybar');
    if (showWeeklyBarChk) {
      showWeeklyBarChk.checked = pulseConfig.getBool('showweeklybar');
      if (pulseConfig.getDefaultBool('showweeklybar') != pulseConfig.getBool('showweeklybar')) {
        showWeeklyBarChk.setAttribute('overridden', 'true');
      }
      showWeeklyBarChk.addEventListener('change', function () {
        let showweeklybar = showWeeklyBarChk.checked;
        // Store
        pulseConfig.set('showweeklybar', showweeklybar);
        // Display
        if (showweeklybar) {
          document.querySelectorAll('.machinestatus-weekly-info').forEach(el => el.style.display = '');
          document.querySelectorAll('.machinestatus-weekly-bar-position').forEach(el => el.style.display = '');

          // Visibility of subgroups
          document.querySelectorAll('.showweeklydetails').forEach(el => el.style.display = '');
        }
        else {
          document.querySelectorAll('.machinestatus-weekly-info').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.machinestatus-weekly-bar-position').forEach(el => el.style.display = 'none');

          // Visibility of subgroups
          document.querySelectorAll('.showweeklydetails').forEach(el => el.style.display = 'none');
        }
      });
      showWeeklyBarChk.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Weekly range: current week or last 7 days (mutually exclusive radios).
    // Drives #period-for-week attributes (exclude-now, displayweekrange) and .machinestatus-label text.
    let weeklyshowcurrentweek = pulseConfig.getBool('weeklyshowcurrentweek');
    const showLast7DaysRadio = document.getElementById('showlast7days');
    const showCurrentWeekRadio = document.getElementById('showcurrentweek');
    if (showLast7DaysRadio && showCurrentWeekRadio) {
      showLast7DaysRadio.checked = !weeklyshowcurrentweek;
      showLast7DaysRadio.addEventListener('change', function () {
        let weeklyshowcurrentweek = !showLast7DaysRadio.checked;
        // Store
        pulseConfig.set('weeklyshowcurrentweek', weeklyshowcurrentweek);
        // Display
        const periodForWeekEl = document.getElementById('period-for-week');
        if (periodForWeekEl) {
          if (weeklyshowcurrentweek) {
            periodForWeekEl.setAttribute('exclude-now', 'false');
            periodForWeekEl.setAttribute('displayweekrange', 'true');
            document.querySelectorAll('.machinestatus-label').forEach(el => el.textContent = pulseConfig.pulseTranslate('content.week', 'Week'));
          }
          else {
            periodForWeekEl.setAttribute('exclude-now', 'true');
            periodForWeekEl.setAttribute('displayweekrange', 'false');
            document.querySelectorAll('.machinestatus-label').forEach(el => el.textContent = pulseConfig.pulseTranslate('content.days', '(7 days)'));
          }
        }
      });

      showCurrentWeekRadio.checked = weeklyshowcurrentweek;
      showCurrentWeekRadio.addEventListener('change', function () {
        let weeklyshowcurrentweek = showCurrentWeekRadio.checked;
        // Store
        pulseConfig.set('weeklyshowcurrentweek', weeklyshowcurrentweek);
        // Display
        const periodForWeekEl = document.getElementById('period-for-week');
        if (periodForWeekEl) {
          if (weeklyshowcurrentweek) {
            periodForWeekEl.setAttribute('exclude-now', 'false');
            periodForWeekEl.setAttribute('displayweekrange', 'true');
            document.querySelectorAll('.machinestatus-label').forEach(el => el.textContent = pulseConfig.pulseTranslate('content.week', 'Week'));
          }
          else {
            periodForWeekEl.setAttribute('exclude-now', 'true');
            periodForWeekEl.setAttribute('displayweekrange', 'false');
            document.querySelectorAll('.machinestatus-label').forEach(el => el.textContent = pulseConfig.pulseTranslate('content.days', '(7 days)'));
          }
        }
      });
    }
  }

  /**
   * Resets all options to their default values.
   *
   * Uses the standard `setDefaultChecked` helper for all checkboxes.
   * Manually resets the `#pierangeisday` and `#displaymotionpercent` complementary radios.
   * `#showcurrent` is derived from the defaults of showcurrenttool and showcurrentsequence.
   * Layout reset only applies in live mode (rotation controls are hidden in historical mode).
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

    // showworkinfo
    setDefaultChecked('showworkinfo');

    // Shift / Day
    setDefaultChecked('displayshiftrange');
    const pieRangeEl = document.getElementById('pierangeisday');
    if (pieRangeEl) {
      pieRangeEl.checked = !pulseConfig.getDefaultBool('displayshiftrange');
      pieRangeEl.dispatchEvent(new Event('change', { bubbles: true }));
      pieRangeEl.removeAttribute('overridden');
    }

    // Percent / Time
    setDefaultChecked('displaymotiontime');
    const displayMotionPercentEl = document.getElementById('displaymotionpercent');
    if (displayMotionPercentEl) {
      displayMotionPercentEl.checked = !pulseConfig.getDefaultBool('displaymotiontime');
      displayMotionPercentEl.dispatchEvent(new Event('change', { bubbles: true }));
      displayMotionPercentEl.removeAttribute('overridden');
    }

    // Target
    setDefaultChecked('showtarget');

    // Tools / Sequence
    const showcurrentDefault = pulseConfig.getDefaultBool('showcurrenttool')
      || pulseConfig.getDefaultBool('showcurrentsequence');
    const showCurrentEl = document.getElementById('showcurrent');
    if (showCurrentEl) {
      showCurrentEl.checked = showcurrentDefault;
      showCurrentEl.dispatchEvent(new Event('change', { bubbles: true }));
      showCurrentEl.removeAttribute('overridden');
    }

    setDefaultChecked('showcurrenttool');
    setDefaultChecked('showcurrentsequence');

    // Alarm
    setDefaultChecked('showalarm');
    setDefaultChecked('showUnknownAlarm');
    setDefaultChecked('showstacklight');
    setDefaultChecked('showweeklybar');

    const showCurrentWeekEl = document.getElementById('showcurrentweek');
    if (showCurrentWeekEl) {
      showCurrentWeekEl.checked = pulseConfig.getDefaultBool('weeklyshowcurrentweek');
      showCurrentWeekEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Layout - live mode only
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if (tmpContexts && tmpContexts.includes('live')) {
      setDefaultChecked('defaultlayout');
    }
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Hidden elements are skipped (handles historical mode where rotation controls are hidden).
   * `showcurrenttool` and `showcurrentsequence` are appended conditionally based on `#showcurrent`.
   * `weeklyshowcurrentweek` is appended only when `showweeklybar` is checked.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'showworkinfo', type: 'checkbox' },
      { id: 'displayshiftrange', type: 'checkbox' },
      { id: 'displaymotiontime', type: 'checkbox' },
      { id: 'showtarget', type: 'checkbox' },
      { id: 'showalarm', type: 'checkbox' },
      { id: 'showUnknownAlarm', type: 'checkbox' },
      { id: 'showstacklight', type: 'checkbox' },
      { id: 'showweeklybar', type: 'checkbox' },
      // Rotation
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const isHidden = el.style.display === 'none';
      if (isHidden) return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') {
        return `&${paramName}=${el.value}`;
      }
      return `&${paramName}=${el.checked}`;
    }).join('');

    // showcurrenttool and showcurrentsequence are conditional on parent #showcurrent
    const showCurrentEl = document.getElementById('showcurrent');
    if (showCurrentEl?.checked) {
      result += `&showcurrenttool=${document.getElementById('showcurrenttool')?.checked}`;
      result += `&showcurrentsequence=${document.getElementById('showcurrentsequence')?.checked}`;
    } else {
      result += '&showcurrenttool=false&showcurrentsequence=false';
    }

    // weeklyshowcurrentweek is only relevant when the weekly section is shown
    const showWeeklyBarEl = document.getElementById('showweeklybar');
    if (showWeeklyBarEl?.checked) {
      result += `&weeklyshowcurrentweek=${document.getElementById('showcurrentweek')?.checked}`;
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
        message: 'Please select at least one machine before launching the page.'
      });
    }

    return missingConfigs;
  }

  /**
   * Applies the current configuration to all DOM components at load time.
   *
   * Drives the same show/hide logic as the change listeners, reading directly from
   * pulseConfig. Also applies the weekly range attributes to `#period-for-week`.
   *
   * Note: reason bar is always shown (no option for it) — comment retained as documentation.
   */
  buildContent() {
    // allows the native page configuration (not in options) of the bars : show reason bar == always -> idem for SHOW x-reasongroups
    let showworkinfo = pulseConfig.getBool('showworkinfo');
    if (showworkinfo) {
      document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-currentworkinfo').forEach(el => el.style.display = 'none');
    }

    let displaymotiontime = pulseConfig.getBool('displaymotiontime');
    if (displaymotiontime) {
      // daily
      document.querySelectorAll('.machinestatus-daily-info x-motiontime').forEach(el => el.style.display = 'block');
      document.querySelectorAll('.machinestatus-daily-info x-motionpercentage').forEach(el => el.style.display = 'none');
      // weekly
      document.querySelectorAll('.machinestatus-weekly-info x-motiontime').forEach(el => el.style.display = 'block');
      document.querySelectorAll('.machinestatus-weekly-info x-motionpercentage').forEach(el => el.style.display = 'none');
      // Reset show target (incompatible with time mode)
      const showTargetEl = document.getElementById('showtarget');
      showTargetEl.checked = false;
      showTargetEl.dispatchEvent(new Event('change', { bubbles: true }));
      showTargetEl.disabled = true;
    }
    else {
      // daily
      document.querySelectorAll('.machinestatus-daily-info x-motiontime').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.machinestatus-daily-info x-motionpercentage').forEach(el => el.style.display = 'block');
      // weekly
      document.querySelectorAll('.machinestatus-weekly-info x-motiontime').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.machinestatus-weekly-info x-motionpercentage').forEach(el => el.style.display = 'block');
      // Allow show target
      document.getElementById('showtarget').disabled = false;
    }

    let showtarget = pulseConfig.getBool('showtarget');
    if (showtarget) {
      document.querySelectorAll('.machinestatus-target').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('.machinestatus-target').forEach(el => el.style.display = 'none');
    }
    let showcurrenttool = pulseConfig.getBool('showcurrenttool');
    if (showcurrenttool) {
      document.querySelectorAll('.machinestatus-current-tool-div').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('.machinestatus-current-tool-div').forEach(el => el.style.display = 'none');
    }
    let showcurrentsequence = pulseConfig.getBool('showcurrentsequence');
    if (showcurrentsequence) {
      document.querySelectorAll('.machinestatus-current-sequence-div').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('.machinestatus-current-sequence-div').forEach(el => el.style.display = 'none');
    }
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      document.querySelectorAll('x-currenticoncncalarm').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-currenticoncncalarm').forEach(el => el.style.display = 'none');
    }
    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      document.querySelectorAll('x-stacklight').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('x-stacklight').forEach(el => el.style.display = 'none');
    }
    let showweeklybar = pulseConfig.getBool('showweeklybar');
    if (showweeklybar) {
      document.querySelectorAll('.machinestatus-weekly-info').forEach(el => el.style.display = '');
      document.querySelectorAll('.machinestatus-weekly-bar-position').forEach(el => el.style.display = '');
    }
    else {
      document.querySelectorAll('.machinestatus-weekly-info').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.machinestatus-weekly-bar-position').forEach(el => el.style.display = 'none');
    }
    let weeklyshowcurrentweek = pulseConfig.getBool('weeklyshowcurrentweek');
    const periodForWeekEl = document.getElementById('period-for-week');
    if (weeklyshowcurrentweek) {
      periodForWeekEl.setAttribute('exclude-now', 'false');
      periodForWeekEl.setAttribute('displayweekrange', 'true');
      document.querySelectorAll('.machinestatus-label').forEach(el => el.textContent = pulseConfig.pulseTranslate('content.week', 'Week'));
    }
    else {
      periodForWeekEl.setAttribute('exclude-now', 'true');
      periodForWeekEl.setAttribute('displayweekrange', 'false');
      document.querySelectorAll('.machinestatus-label').forEach(el => el.textContent = pulseConfig.pulseTranslate('content.days', '(7 days)'));
    }

  }
}

if (document.readyState !== 'loading') {
  initMachineStatusPage();
} else {
  document.addEventListener('DOMContentLoaded', initMachineStatusPage);
}

function initMachineStatusPage() {
  pulsePage.preparePage(new MachineStatusPage());
}
