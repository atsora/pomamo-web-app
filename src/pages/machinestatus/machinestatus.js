// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-currentworkinfo/x-currentworkinfo');
require('x-freetext/x-freetext');
require('x-performancetarget/x-performancetarget');
require('x-currentsequence/x-currentsequence');
require('x-currenttool/x-currenttool');
require('x-currenticoncncalarm/x-currenticoncncalarm');
require('x-stacklight/x-stacklight');
require('x-reasonslotpie/x-reasonslotpie');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack'); // pulls in all bar components
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

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

    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    if (!isLive) {
      // Historical mode: rotation hidden, infinite page, scroll CSS injected
      defaultLayoutChk.closest('.param-row').hide();
      defaultLayoutChk.parent().hide();
      rotationSettings.hide();

      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);

      defaultLayoutChk.prop('checked', false);
      machinesPerPageInput.val(10000);

      $('head').append(`
        <style>
          x-groupgrid {
            flex: 1 1 auto !important;
            height: 100% !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            display: block !important;
          }
          x-groupgrid .groupgrid-main {
            display: grid !important;
            height: auto !important;
            min-height: 100% !important;
            align-content: start !important;
            grid-auto-rows: minmax(200px, 1fr) !important;
            padding-bottom: 50px !important;
          }
        </style>
      `);
    } else {
      // Live mode: standard rotation layout
      defaultLayoutChk.prop('checked', pulseConfig.getBool('defaultlayout', true));

      defaultLayoutChk.change(() => {
        let isDefault = defaultLayoutChk.is(':checked');
        pulseConfig.set('defaultlayout', isDefault);
        if (isDefault) {
          rotationSettings.css('opacity', '0.5').find('input').prop('disabled', true);
          $('#machinesperpage').val(12).change();
        } else {
          rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
        }
      }).trigger('change');

      machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 12));
      $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
    }
    // --- END LIVE/HISTORICAL ---

    // showworkinfo = Show Operation
    $('#showworkinfo').prop('checked', pulseConfig.getBool('showworkinfo'));
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      $('#showworkinfo').attr('overridden', 'true');
    }
    $('#showworkinfo').change(function () {
      pulseConfig.set('showworkinfo', $('#showworkinfo').is(':checked'));

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      if (showworkinfo) {
        $('x-currentworkinfo').show();
      }
      else {
        $('x-currentworkinfo').hide();
      }
    });

    // Pie range: Shift or Day (mutually exclusive radios)
    $('#displayshiftrange').prop('checked', pulseConfig.getBool('displayshiftrange'));
    $('#pierangeisday').prop('checked', !pulseConfig.getBool('displayshiftrange'));
    $('#displayshiftrange').change(function () {
      let displayshiftrange = $('#displayshiftrange').is(':checked');
      // Store
      pulseConfig.set('displayshiftrange', displayshiftrange);
      // Display / Dispatch
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayshiftrange' });
    });
    $('#pierangeisday').change(function () {
      let displayshiftrange = !$('#pierangeisday').is(':checked');
      // Store
      pulseConfig.set('displayshiftrange', displayshiftrange);
      // Display / Dispatch
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayshiftrange' });
    });

    // Motion display: Time or Percent (mutually exclusive radios).
    // When time mode is selected, showtarget is unchecked and disabled (incompatible).
    $('#displaymotiontime').prop('checked', pulseConfig.getBool('displaymotiontime'));
    $('#displaymotionpercent').prop('checked', !pulseConfig.getBool('displaymotiontime'));
    $('#displaymotiontime').change(function () {
      let displaymotiontime = $('#displaymotiontime').is(':checked');
      // Store
      pulseConfig.set('displaymotiontime', displaymotiontime);
      // Display
      if (displaymotiontime) {
        // daily
        $('.machinestatus-daily-info').find('x-motiontime').show();
        $('.machinestatus-daily-info').find('x-motionpercentage').hide();
        // weekly
        $('.machinestatus-weekly-info').find('x-motiontime').show();
        $('.machinestatus-weekly-info').find('x-motionpercentage').hide();
        // Reset show target (incompatible with time mode)
        $('#showtarget').prop('checked', false);
        $('#showtarget').change();
        $('#showtarget').prop('disabled', true);  //hide();
      }
      else {
        /// daily
        $('.machinestatus-daily-info').find('x-motiontime').hide();
        $('.machinestatus-daily-info').find('x-motionpercentage').show();
        // weekly
        $('.machinestatus-weekly-info').find('x-motiontime').hide();
        $('.machinestatus-weekly-info').find('x-motionpercentage').show();
        // Allow show target
        $('#showtarget').prop('disabled', false); // .show();
      }
    });
    $('#displaymotionpercent').change(function () {
      let displaymotiontime = !$('#displaymotionpercent').is(':checked');
      // Store
      pulseConfig.set('displaymotiontime', displaymotiontime);
      // Display
      if (displaymotiontime) {
        /// daily
        $('.machinestatus-daily-info').find('x-motiontime').show();
        $('.machinestatus-daily-info').find('x-motionpercentage').hide();
        // weekly
        $('.machinestatus-weekly-info').find('x-motiontime').show();
        $('.machinestatus-weekly-info').find('x-motionpercentage').hide();
        // Reset show target (incompatible with time mode)
        $('#showtarget').prop('checked', false);
        $('#showtarget').change();
        $('#showtarget').prop('disabled', true); //.hide();
      }
      else {
        /// daily
        $('.machinestatus-daily-info').find('x-motiontime').hide();
        $('.machinestatus-daily-info').find('x-motionpercentage').show();
        // weekly
        $('.machinestatus-weekly-info').find('x-motiontime').hide();
        $('.machinestatus-weekly-info').find('x-motionpercentage').show();
        // Allow show target
        $('#showtarget').prop('disabled', false); //.show();
      }
    });

    // Target: shows/hides .machinestatus-target — disabled when in time mode
    $('#showtarget').prop('checked', pulseConfig.getBool('showtarget'));
    if (pulseConfig.getDefaultBool('showtarget') != pulseConfig.getBool('showtarget')) {
      $('#showtarget').attr('overridden', 'true');
    }
    $('#showtarget').change(function () {
      let showtarget = $('#showtarget').is(':checked');
      // Store
      pulseConfig.set('showtarget', showtarget);
      // Display
      if (showtarget) {
        $('.machinestatus-target').show();
      }
      else {
        $('.machinestatus-target').hide();
      }
    });

    // Current Tool / Sequence:
    // #showcurrent is a parent checkbox that controls .showcurrentdetails subgroup visibility.
    // #showcurrenttool and #showcurrentsequence are mutually exclusive: checking one unchecks the other.
    $('#showcurrent').prop('checked', (pulseConfig.getBool('showcurrenttool') || pulseConfig.getBool('showcurrentsequence')));
    $('#showcurrent').change(function () {
      let showcurrent = $('#showcurrent').is(':checked');
      // Store / Display
      if (showcurrent == false) {
        $('#showcurrenttool').prop('checked', false);
        $('#showcurrentsequence').prop('checked', false);
        $('#showcurrenttool').change();
        $('#showcurrentsequence').change();

        // Visibility of subgroups
        $('.showcurrentdetails').hide();
      }
      else {
        // Visibility of subgroups
        $('.showcurrentdetails').show();

        $('#showcurrenttool').change();
        $('#showcurrentsequence').change();
      }
    });
    $('#showcurrent').trigger('change'); // To open/close subgroup

    $('#showcurrenttool').prop('checked',
      pulseConfig.getBool('showcurrenttool'));
    if (pulseConfig.getDefaultBool('showcurrenttool') != pulseConfig.getBool('showcurrenttool'))
      $('#showcurrenttool').attr('overridden', 'true');
    $('#showcurrenttool').change(function () {
      let showcurrenttool = $('#showcurrenttool').is(':checked');
      // Store
      pulseConfig.set('showcurrenttool', showcurrenttool);
      // Display
      if (showcurrenttool) {
        $('.machinestatus-current-tool-div').show();
        // Mutually exclusive: hide sequence
        pulseConfig.set('showcurrentsequence', false);
        $('.machinestatus-current-sequence-div').hide();
      }
      else {
        $('.machinestatus-current-tool-div').hide();
      }
    });

    $('#showcurrentsequence').prop('checked', pulseConfig.getBool('showcurrentsequence'));
    if (pulseConfig.getDefaultBool('showcurrentsequence') != pulseConfig.getBool('showcurrentsequence'))
      $('#showcurrentsequence').attr('overridden', 'true');
    $('#showcurrentsequence').change(function () {
      let showcurrentsequence = $('#showcurrentsequence').is(':checked');
      // Store
      pulseConfig.set('showcurrentsequence', showcurrentsequence);
      // Display
      if (showcurrentsequence) {
        $('.machinestatus-current-sequence-div').show();
        // Mutually exclusive: hide tool
        pulseConfig.set('showcurrenttool', false);
        $('.machinestatus-current-tool-div').hide();
      }
      else {
        $('.machinestatus-current-sequence-div').hide();
      }
    });

    // Alarm
    $('#showalarm').prop('checked', pulseConfig.getBool('showalarm'));
    if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm')) {
      $('#showalarm').attr('overridden', 'true');
    }
    $('#showalarm').change(function () {
      let showalarm = $('#showalarm').is(':checked');
      // Store
      pulseConfig.set('showalarm', showalarm);
      // Display
      if (showalarm) {
        $('x-currenticoncncalarm').show();
      }
      else {
        $('x-currenticoncncalarm').hide();
      }
    });

    // Stacklight
    $('#showstacklight').prop('checked', pulseConfig.getBool('showstacklight'));
    if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight')) {
      $('#showstacklight').attr('overridden', 'true');
    }
    $('#showstacklight').change(function () {
      let showstacklight = $('#showstacklight').is(':checked');
      // Store
      pulseConfig.set('showstacklight', showstacklight);
      // Display
      if (showstacklight) {
        $('x-stacklight').show();
      }
      else {
        $('x-stacklight').hide();
      }
    });

    // Weekly bar: parent checkbox controls .machinestatus-weekly-info and .showweeklydetails subgroup
    $('#showweeklybar').prop('checked', pulseConfig.getBool('showweeklybar'));
    if (pulseConfig.getDefaultBool('showweeklybar') != pulseConfig.getBool('showweeklybar')) {
      $('#showweeklybar').attr('overridden', 'true');
    }
    $('#showweeklybar').change(function () {
      let showweeklybar = $('#showweeklybar').is(':checked');
      // Store
      pulseConfig.set('showweeklybar', showweeklybar);
      // Display
      if (showweeklybar) {
        $('.machinestatus-weekly-info').show();
        $('.machinestatus-weekly-bar-position').show();

        // Visibility of subgroups
        $('.showweeklydetails').show();
      }
      else {
        $('.machinestatus-weekly-info').hide();
        $('.machinestatus-weekly-bar-position').hide();

        // Visibility of subgroups
        $('.showweeklydetails').hide();
      }
    });
    $('#showweeklybar').trigger('change'); // To open/close subgroup

    // Weekly range: current week or last 7 days (mutually exclusive radios).
    // Drives #period-for-week attributes (exclude-now, displayweekrange) and .machinestatus-label text.
    let weeklyshowcurrentweek = pulseConfig.getBool('weeklyshowcurrentweek');
    $('#showlast7days').prop('checked', !weeklyshowcurrentweek);
    $('#showlast7days').change(function () {
      let weeklyshowcurrentweek = !$('#showlast7days').is(':checked');
      // Store
      pulseConfig.set('weeklyshowcurrentweek', weeklyshowcurrentweek);
      // Display
      if (weeklyshowcurrentweek) {
        $('#period-for-week')[0].setAttribute('exclude-now', 'false');
        $('#period-for-week')[0].setAttribute('displayweekrange', 'true');
        $('.machinestatus-label').html(pulseConfig.pulseTranslate('content.week', 'Week'));
      }
      else {
        $('#period-for-week')[0].setAttribute('exclude-now', 'true');
        $('#period-for-week')[0].setAttribute('displayweekrange', 'false');
        $('.machinestatus-label').html(pulseConfig.pulseTranslate('content.days', '(7 days)'));
      }
    });

    $('#showcurrentweek').prop('checked', weeklyshowcurrentweek);
    $('#showcurrentweek').change(function () {
      let weeklyshowcurrentweek = $('#showcurrentweek').is(':checked');
      // Store
      pulseConfig.set('weeklyshowcurrentweek', weeklyshowcurrentweek);
      // Display
      if (weeklyshowcurrentweek) {
        $('#period-for-week')[0].setAttribute('exclude-now', 'false');
        $('#period-for-week')[0].setAttribute('displayweekrange', 'true');
        $('.machinestatus-label').html(pulseConfig.pulseTranslate('content.week', 'Week'));
      }
      else {
        $('#period-for-week')[0].setAttribute('exclude-now', 'true');
        $('#period-for-week')[0].setAttribute('displayweekrange', 'false');
        $('.machinestatus-label').html(pulseConfig.pulseTranslate('content.days', '(7 days)'));
      }
    });
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
      const element = $('#' + id);
      element.prop('checked', pulseConfig.getDefaultBool(configKey));
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    // showworkinfo
    setDefaultChecked('showworkinfo');

    // Shift / Day
    setDefaultChecked('displayshiftrange');
    $('#pierangeisday').prop('checked', !pulseConfig.getDefaultBool('displayshiftrange'));
    $('#pierangeisday').change();
    $('#pierangeisday').removeAttr('overridden');

    // Percent / Time
    setDefaultChecked('displaymotiontime');
    $('#displaymotionpercent').prop('checked', !pulseConfig.getDefaultBool('displaymotiontime'));
    $('#displaymotionpercent').change();
    $('#displaymotionpercent').removeAttr('overridden');

    // Target
    setDefaultChecked('showtarget');

    // Tools / Sequence
    const showcurrentDefault = pulseConfig.getDefaultBool('showcurrenttool')
      || pulseConfig.getDefaultBool('showcurrentsequence');
    $('#showcurrent').prop('checked', showcurrentDefault);
    $('#showcurrent').change();
    $('#showcurrent').removeAttr('overridden');

    setDefaultChecked('showcurrenttool');
    setDefaultChecked('showcurrentsequence');

    // Alarm
    setDefaultChecked('showalarm');
    setDefaultChecked('showstacklight');
    setDefaultChecked('showweeklybar');

    $('#showcurrentweek').prop('checked',
      pulseConfig.getDefaultBool('weeklyshowcurrentweek'));
    $('#showcurrentweek').change();
    //$('#showcurrentweek').removeAttr('overridden');

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
      { id: 'showstacklight', type: 'checkbox' },
      { id: 'showweeklybar', type: 'checkbox' },
      // Rotation
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el || $(el).is(':hidden')) return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') {
        return `&${paramName}=${el.value}`;
      }
      return `&${paramName}=${el.checked}`;
    }).join('');

    // showcurrenttool and showcurrentsequence are conditional on parent #showcurrent
    if (document.getElementById('showcurrent')?.checked) {
      result += `&showcurrenttool=${document.getElementById('showcurrenttool')?.checked}`;
      result += `&showcurrentsequence=${document.getElementById('showcurrentsequence')?.checked}`;
    } else {
      result += '&showcurrenttool=false&showcurrentsequence=false';
    }

    // weeklyshowcurrentweek is only relevant when the weekly section is shown
    if (document.getElementById('showweeklybar')?.checked) {
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
      $('x-currentworkinfo').show();
    }
    else {
      $('x-currentworkinfo').hide();
    }

    let displaymotiontime = pulseConfig.getBool('displaymotiontime');
    if (displaymotiontime) {
      // daily
      $('.machinestatus-daily-info').find('x-motiontime').show();
      $('.machinestatus-daily-info').find('x-motionpercentage').hide();
      // weekly
      $('.machinestatus-weekly-info').find('x-motiontime').show();
      $('.machinestatus-weekly-info').find('x-motionpercentage').hide();
      // Reset show target (incompatible with time mode)
      $('#showtarget').prop('checked', false);
      $('#showtarget').change();
      $('#showtarget').prop('disabled', true); // .hide();
    }
    else {
      // daily
      $('.machinestatus-daily-info').find('x-motiontime').hide();
      $('.machinestatus-daily-info').find('x-motionpercentage').show();
      // weekly
      $('.machinestatus-weekly-info').find('x-motiontime').hide();
      $('.machinestatus-weekly-info').find('x-motionpercentage').show();
      // Allow show target
      $('#showtarget').prop('disabled', false); // .show();
    }

    let showtarget = pulseConfig.getBool('showtarget');
    if (showtarget) {
      $('.machinestatus-target').show();
    }
    else {
      $('.machinestatus-target').hide();
    }
    let showcurrenttool = pulseConfig.getBool('showcurrenttool');
    if (showcurrenttool) {
      $('.machinestatus-current-tool-div').show();
    }
    else {
      $('.machinestatus-current-tool-div').hide();
    }
    let showcurrentsequence = pulseConfig.getBool('showcurrentsequence');
    if (showcurrentsequence) {
      $('.machinestatus-current-sequence-div').show();
    }
    else {
      $('.machinestatus-current-sequence-div').hide();
    }
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      $('x-currenticoncncalarm').show();
    }
    else {
      $('x-currenticoncncalarm').hide();
    }
    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      $('x-stacklight').show();
    }
    else {
      $('x-stacklight').hide();
    }
    let showweeklybar = pulseConfig.getBool('showweeklybar');
    if (showweeklybar) {
      $('.machinestatus-weekly-info').show();
      $('.machinestatus-weekly-bar-position').show();
    }
    else {
      $('.machinestatus-weekly-info').hide();
      $('.machinestatus-weekly-bar-position').hide();
    }
    let weeklyshowcurrentweek = pulseConfig.getBool('weeklyshowcurrentweek');
    if (weeklyshowcurrentweek) {
      $('#period-for-week')[0].setAttribute('exclude-now', 'false');
      $('#period-for-week')[0].setAttribute('displayweekrange', 'true');
      $('.machinestatus-label').html(pulseConfig.pulseTranslate('content.week', 'Week'));
    }
    else {
      $('#period-for-week')[0].setAttribute('exclude-now', 'true');
      $('#period-for-week')[0].setAttribute('displayweekrange', 'false');
      $('.machinestatus-label').html(pulseConfig.pulseTranslate('content.days', '(7 days)'));
    }

  }
}

$(document).ready(function () {
  pulsePage.preparePage(new MachineStatusPage());
});
