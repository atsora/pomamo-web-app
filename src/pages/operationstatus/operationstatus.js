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
 *  - `showalarm`                            : show alarm icon; sub-options: showAlarmBelowIcon (layout),
 *                                             showUnknownAlarm
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
    $('.operationstatus-top-div')
      .toggleClass('workinfo-big', isBig)
      .toggleClass('workinfo-small', !isBig);
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
   *  9. Alarm: showalarmoperation + showAlarmBelowIcon (left/bottom layout) + showUnknownAlarm
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

    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    if (!isLive) {
      // Historical mode: rotation hidden, infinite page, scroll CSS injected
      defaultLayoutChk.closest('.param-row').hide();
      defaultLayoutChk.parent().hide(); // Fallback
      rotationSettings.hide();

      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000); // Fake infinite page

      defaultLayoutChk.prop('checked', false);
      machinesPerPageInput.val(10000);

      // Scroll & grid sizing handled by .pulse-content:not(.appcontext-live) overrides in operationstatus.less
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


    const syncRadioGroup = (value, valueToIdMap, fallbackValue) => {
      const targetId = valueToIdMap[value] || valueToIdMap[fallbackValue];
      if (targetId) {
        $('#' + targetId).prop('checked', true);
      }
    };

    const bindRadioGroup = (valueToIdMap, onSelect) => {
      Object.entries(valueToIdMap).forEach(([value, id]) => {
        $('#' + id).change(function () {
          if ($(this).is(':checked')) {
            onSelect(value);
          }
        });
      });
    };

    // showworkinfo = Show Operation.
    // When showproduction is on: x-workinfo is used instead of x-currentworkinfo.
    // The .showworkinfodetails subgroup is shown/hidden based on the checkbox state.
    $('#showworkinfo').prop('checked', pulseConfig.getBool('showworkinfo'));
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      $('#showworkinfo').attr('overridden', 'true');
    }
    $('#showworkinfo').change(function () {
      pulseConfig.set('showworkinfo', $('#showworkinfo').is(':checked'));

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      let showproduction = pulseConfig.getBool('showproduction');

      if (showproduction) {
        $('x-currentworkinfo').hide();
        if (showworkinfo) {
          $('x-workinfo').show();
        } else {
          $('x-workinfo').hide();
        }
      } else {
        $('x-workinfo').hide();
        if (showworkinfo) {
          $('x-currentworkinfo').show();
        } else {
          $('x-currentworkinfo').hide();
        }
      }
      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showworkinfodetails').show();
      } else {
        $('.showworkinfodetails').hide();
      }
    });
    $('#showworkinfo').trigger('change');

    // Workinfo size radios (small/big): drives _applyTopDisplaySizing for font size
    const workInfoSizeMap = { small: 'showworkinfosmall', big: 'showworkinfobig' };
    const workInfoSize = pulseConfig.getBool('showworkinfobig') ? 'big' : 'small';
    syncRadioGroup(workInfoSize, workInfoSizeMap, 'small');
    bindRadioGroup(workInfoSizeMap, (value) => {
      pulseConfig.set('showworkinfobig', value === 'big' ? 'true' : 'false');
      self._applyTopDisplaySizing();
    });
    self._applyTopDisplaySizing();

    // showcurrentmachinestatuslogo: shows/hides x-reasonbutton (machine state icon)
    $('#showcurrentmachinestatuslogo').prop('checked', pulseConfig.getBool('showcurrentmachinestatuslogo'));
    if (pulseConfig.getDefaultBool('showcurrentmachinestatuslogo') != pulseConfig.getBool('showcurrentmachinestatuslogo'))
      $('#showcurrentmachinestatuslogo').attr('overridden', 'true');
    $('#showcurrentmachinestatuslogo').change(function () {
      pulseConfig.set('showcurrentmachinestatuslogo', $('#showcurrentmachinestatuslogo').is(':checked'));
      if ($('#showcurrentmachinestatuslogo').is(':checked')) {
        $('x-reasonbutton').show();
      } else {
        $('x-reasonbutton').hide();
      }
    });
    $('#showcurrentmachinestatuslogo').change();

    // showcurrentmachinestatusletter: shows/hides x-lastmachinestatus (state letter badge)
    $('#showcurrentmachinestatusletter').prop('checked', pulseConfig.getBool('showcurrentmachinestatusletter'));
    if (pulseConfig.getDefaultBool('showcurrentmachinestatusletter') != pulseConfig.getBool('showcurrentmachinestatusletter'))
      $('#showcurrentmachinestatusletter').attr('overridden', 'true');
    $('#showcurrentmachinestatusletter').change(function () {
      pulseConfig.set('showcurrentmachinestatusletter', $('#showcurrentmachinestatusletter').is(':checked'));
      if ($('#showcurrentmachinestatusletter').is(':checked')) {
        $('x-lastmachinestatus').show();
      } else {
        $('x-lastmachinestatus').hide();
      }
    });
    $('#showcurrentmachinestatusletter').change();

    // showproductionoperation (maps to config key 'showproduction').
    // Side-effect: sets hidesecondproductiondisplay (suppresses duplicate production display in x-production).
    // Workinfo routing: production on → x-workinfo; off → x-currentworkinfo.
    // .showproductionoperationdetails subgroup shown when checked.
    $('#showproductionoperation').prop('checked', pulseConfig.getBool('showproduction'));
    if (pulseConfig.getDefaultBool('showproduction') != pulseConfig.getBool('showproduction'))
      $('#showproductionoperation').attr('overridden', 'true');
    $('#showproductionoperation').change(function () {
      pulseConfig.set('showproduction', $('#showproductionoperation').is(':checked'));
      if ($('#showproductionoperation').is(':checked')) {
        pulseConfig.set('hidesecondproductiondisplay', 'true');
      } else {
        pulseConfig.set('hidesecondproductiondisplay', 'false');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'hidesecondproductiondisplay' });

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      let showproduction = pulseConfig.getBool('showproduction');
      if (showproduction) {
        $('x-production').show();
        $('x-currentworkinfo').hide();
        if (showworkinfo) {
          $('x-workinfo').show();
        } else {
          $('x-workinfo').hide();
        }
      } else {
        $('x-production').hide();
        $('x-workinfo').hide();
        if (showworkinfo) {
          $('x-currentworkinfo').show();
        } else {
          $('x-currentworkinfo').hide();
        }
      }

      if ($(this).is(':checked')) {
        $('.showproductionoperationdetails').show();
      } else {
        $('.showproductionoperationdetails').hide();
      }
    });
    $('#showproductionoperation').trigger('change');

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

    // Thresholds (target and red): validated via _verficationThresholds on every input/change event
    $('#thresholdtargetproduction').val(pulseConfig.getInt('thresholdtargetproduction'));
    var changetarget = function () {
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
      }
    };
    $('#thresholdtargetproduction').bind('input', changetarget);
    $('#thresholdtargetproduction').change(changetarget);

    $('#thresholdredproduction').val(pulseConfig.getInt('thresholdredproduction'));
    var changeRed = function () {
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
      }
    };
    $('#thresholdredproduction').bind('input', changeRed);
    $('#thresholdredproduction').change(changeRed);

    // updateCurrentDisplays: applies show/hide to tool/sequence/override divs
    // based on parent #showcurrent and the selected radio.
    const updateCurrentDisplays = () => {
      const showcurrent = $('#showcurrent').is(':checked');
      const showcurrenttool = $('#showcurrenttool').is(':checked');
      const showcurrentsequence = $('#showcurrentsequence').is(':checked');
      const showcurrentoverride = $('#showcurrentoverride').is(':checked');

      if (showcurrent && showcurrenttool) {
        $('.operationstatus-current-tool-div').show();
      } else {
        $('.operationstatus-current-tool-div').hide();
      }

      if (showcurrent && showcurrentsequence) {
        $('.operationstatus-current-sequence-div').show();
      } else {
        $('.operationstatus-current-sequence-div').hide();
      }

      if (showcurrent && showcurrentoverride) {
        $('.operationstatus-current-override-div').show();
      } else {
        $('.operationstatus-current-override-div').hide();
      }

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

    // showcurrent parent checkbox: derives initial value from showcurrentdisplay or legacy showcurrent config
    const showcurrentRaw = pulseConfig.getString('showcurrent');
    const hasExplicitShowCurrent = showcurrentRaw === 'true' || showcurrentRaw === 'false';
    const showcurrentValue = hasExplicitShowCurrent
      ? showcurrentRaw === 'true'
      : (pulseConfig.getString('showcurrentdisplay') === 'tool'
        || pulseConfig.getString('showcurrentdisplay') === 'sequence'
        || pulseConfig.getString('showcurrentdisplay') === 'override');
    $('#showcurrent').prop('checked', showcurrentValue);
    if (hasExplicitShowCurrent && pulseConfig.getDefaultBool('showcurrent') != showcurrentValue) {
      $('#showcurrent').attr('overridden', 'true');
    }
    $('#showcurrent').change(function () {
      const showcurrent = $('#showcurrent').is(':checked');
      pulseConfig.set('showcurrent', showcurrent);
      updateCurrentDisplays();
      if (showcurrent) {
        $('.showcurrentdetails').show();
      } else {
        $('.showcurrentdetails').hide();
      }
    });
    $('#showcurrent').trigger('change');

    // Alarm: showalarmoperation (maps to 'showalarm').
    // Sub-options: showAlarmBelowIcon (bottom vs left layout), showUnknownAlarm.
    // .showalarmdetails subgroup controlled by alarm checkbox.
    // _applyTopDisplaySizing called on any alarm layout change.
    $('#showalarmoperation').prop('checked', pulseConfig.getBool('showalarm'));
    if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm'))
      $('#showalarmoperation').attr('overridden', 'true');
    $('#showalarmoperation').change(function () {
      let showalarm = $('#showalarmoperation').is(':checked');
      pulseConfig.set('showalarm', showalarm);
      if (showalarm) {
        let showAlarmBelowIcon = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
        if (showAlarmBelowIcon) {
          $('.operationstatus-alarm-bottom-div').show();
          $('.operationstatus-alarm-left-div').hide();
        } else {
          $('.operationstatus-alarm-left-div').show();
          $('.operationstatus-alarm-bottom-div').hide();
        }
      } else {
        $('.operationstatus-alarm-left-div').hide();
        $('.operationstatus-alarm-bottom-div').hide();
      }
      self._applyTopDisplaySizing();
      if ($(this).is(':checked')) {
        $('.showalarmdetails').show();
      } else {
        $('.showalarmdetails').hide();
      }
    });
    $('#showalarmoperation').trigger('change');

    // Alarm position: below icon (bottom div) vs beside icon (left div)
    $('#showAlarmBelowIcon').prop('checked', pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon'));
    if (pulseConfig.getDefaultBool('currenticoncncalarm.showAlarmBelowIcon') != pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon'))
      $('#showAlarmBelowIcon').attr('overridden', 'true');

    $('#showAlarmBelowIcon').change(function () {
      let showAlarmBelowIcon = $('#showAlarmBelowIcon').is(':checked');
      pulseConfig.set('currenticoncncalarm.showAlarmBelowIcon', showAlarmBelowIcon);
      if (showAlarmBelowIcon) {
        $('.operationstatus-alarm-bottom-div').show();
        $('.operationstatus-alarm-left-div').hide();
      } else {
        $('.operationstatus-alarm-left-div').show();
        $('.operationstatus-alarm-bottom-div').hide();
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showAlarmBelowIcon' });
    });

    // showUnknownAlarm: whether to display alarms of unknown type
    $('#showUnknownAlarm').prop('checked', pulseConfig.getBool('showUnknownAlarm'));
    if (pulseConfig.getDefaultBool('showUnknownAlarm') != pulseConfig.getBool('showUnknownAlarm'))
      $('#showUnknownAlarm').attr('overridden', 'true');

    $('#showUnknownAlarm').change(function () {
      pulseConfig.set('showUnknownAlarm', $('#showUnknownAlarm').is(':checked'));
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'showUnknownAlarm' });
    });

    // Pie (cycle progress): shows/hides .operationstatus-cycleprogress.
    // Sub-option: productionpercentinpie radios (true/actualonly/actualtarget).
    // .showpiedetails subgroup controlled by pie checkbox.
    // _applyTopDisplaySizing called on toggle.
    $('#showpie').prop('checked', pulseConfig.getBool('showpie'));
    if (pulseConfig.getDefaultBool('showpie') != pulseConfig.getBool('showpie'))
      $('#showpie').attr('overridden', 'true');
    $('#showpie').change(function () {
      let showpie = $('#showpie').is(':checked');
      pulseConfig.set('showpie', showpie);
      if (showpie) {
        $('.operationstatus-cycleprogress').show();
      } else {
        $('.operationstatus-cycleprogress').hide();
      }
      self._applyTopDisplaySizing();
      if ($(this).is(':checked')) {
        $('.showpiedetails').show();
      } else {
        $('.showpiedetails').hide();
      }
    });
    $('#showpie').trigger('change');

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

    // Stacklight: shows/hides x-stacklight; _applyTopDisplaySizing called on toggle
    $('#showstacklight').prop('checked', pulseConfig.getBool('showstacklight'));
    if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight'))
      $('#showstacklight').attr('overridden', 'true');
    $('#showstacklight').change(function () {
      let showstacklight = $('#showstacklight').is(':checked');
      pulseConfig.set('showstacklight', showstacklight);
      if (showstacklight) {
        $('x-stacklight').show();
      } else {
        $('x-stacklight').hide();
      }
      self._applyTopDisplaySizing();
    });

    // ISO file: shows/hides .operationstatus-isofile-div
    $('#showisofile').prop('checked', pulseConfig.getBool('showisofile'));
    if (pulseConfig.getDefaultBool('showisofile') != pulseConfig.getBool('showisofile'))
      $('#showisofile').attr('overridden', 'true');
    $('#showisofile').change(function () {
      let showisofile = $('#showisofile').is(':checked');
      pulseConfig.set('showisofile', showisofile);
      if (showisofile) {
        $('.operationstatus-isofile-div').show();
      } else {
        $('.operationstatus-isofile-div').hide();
      }
    });
    $('#showisofile').change();

    // Tool life: showtooloperation (maps to 'showtool').
    // Sub-options: tool label select (populated from toollifemachine.toollabelsselections config array),
    //              showtoolremaining (remaining cycles below tool).
    // .showtoolsdetails subgroup controlled by tool checkbox.
    $('#showtooloperation').prop('checked', pulseConfig.getBool('showtool'));
    if (pulseConfig.getDefaultBool('showtool') != pulseConfig.getBool('showtool'))
      $('#showtooloperation').attr('overridden', 'true');
    $('#showtooloperation').change(function () {
      let showtool = $('#showtooloperation').is(':checked');
      pulseConfig.set('showtool', showtool);
      if (showtool) {
        $('.operationstatus-tool-div').show();
      } else {
        $('.operationstatus-tool-div').hide();
      }
      if ($(this).is(':checked')) {
        $('.showtoolsdetails').show();
      } else {
        $('.showtoolsdetails').hide();
      }
    });
    $('#showtooloperation').trigger('change');

    // Tool label selector: populated from config array, dispatches toollabelname change event
    let toollabelname = pulseConfig.getString('toollifemachine.toollabelname');
    $('#showtoolselector').empty();
    let toollabelsselections = pulseConfig.getArray('toollifemachine.toollabelsselections');
    let toolLabels = (typeof ATSORA_CATALOG !== 'undefined' && ATSORA_CATALOG.general && ATSORA_CATALOG.general.toolLabels) || {};
    for (let iTool = 0; iTool < toollabelsselections.length; iTool++) {
      let label = toollabelsselections[iTool];
      let displayText = toolLabels[label.name] || label.name;
      $('#showtoolselector').append('<option id="tool-' + label.name + '" value="' + label.name + '">' + displayText + '</option>');
    }
    $('#showtoolselector').val(toollabelname);

    $('#showtoolselector').change(function () {
      let toollabelname = $('#showtoolselector').val();
      pulseConfig.set('toollabelname', String(toollabelname));
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'toollabelname' });
    });

    // Remaining cycles below tool
    $('#showtoolremaining').prop('checked', pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'));
    if (pulseConfig.getDefaultBool('showbar') != pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'))
      $('#showtoolremaining').attr('overridden', 'true');
    $('#showtoolremaining').change(function () {
      let showtoolremaining = $('#showtoolremaining').is(':checked');
      pulseConfig.set('toollifemachine.displayremainingcyclesbelowtool', showtoolremaining);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'displayremainingcyclesbelowtool' });
    });

    // Utilization bar: showbaroperation (maps to 'showbar').
    // Sub-options: day/shift range radios, barshowalarms (CSS class on .main-table-box), barshowpercent.
    // .showbardetails subgroup controlled by bar checkbox.
    $('#showbaroperation').prop('checked', pulseConfig.getBool('showbar'));
    if (pulseConfig.getDefaultBool('showbar') != pulseConfig.getBool('showbar'))
      $('#showbaroperation').attr('overridden', 'true');
    $('#showbaroperation').change(function () {
      let showbar = $('#showbaroperation').is(':checked');
      pulseConfig.set('showbar', showbar);
      if (showbar) {
        $('.operationstatus-bar').show();
      } else {
        $('.operationstatus-bar').hide();
      }
      if ($(this).is(':checked')) {
        $('.showbardetails').show();
      } else {
        $('.showbardetails').hide();
      }
    });
    $('#showbaroperation').trigger('change');

    // Bar period radios: day or shift
    const barPeriodMap = { day: 'barrangeisday', shift: 'displayshiftrange' };
    const barPeriod = pulseConfig.getBool('displayshiftrange') ? 'shift' : 'day';
    syncRadioGroup(barPeriod, barPeriodMap, 'day');
    bindRadioGroup(barPeriodMap, (value) => {
      pulseConfig.set('displayshiftrange', value === 'shift');
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'displayshiftrange' });
    });

    // barshowalarms: applied via CSS class on .main-table-box (before grid builds — avoids timing issues)
    $('#showbar-alarms').prop('checked', pulseConfig.getBool('barshowalarms'));
    if (pulseConfig.getDefaultBool('barshowalarms') != pulseConfig.getBool('barshowalarms')) {
      $('#showbar-alarms').attr('overridden', 'true');
    }
    // Apply initial state via CSS class (before grid builds — avoids timing issues with async grid population)
    $('.main-table-box').toggleClass('barshowalarms-active', pulseConfig.getBool('barshowalarms'));
    $('#showbar-alarms').change(function () {
      let barshowalarms = $('#showbar-alarms').is(':checked');
      pulseConfig.set('barshowalarms', barshowalarms);
      $('.main-table-box').toggleClass('barshowalarms-active', barshowalarms);
    });

    // barshowpercent: shows/hides .div-percent and reloads x-datetimegraduation
    $('#showbar-percent').prop('checked', pulseConfig.getBool('barshowpercent'));
    if (pulseConfig.getDefaultBool('barshowpercent') != pulseConfig.getBool('barshowpercent')) {
      $('#showbar-percent').attr('overridden', 'true');
    }
    $('#showbar-percent').change(function () {
      let barshowpercent = $('#showbar-percent').is(':checked');
      pulseConfig.set('barshowpercent', barshowpercent);
      if (barshowpercent) {
        $('.div-percent').show();
      } else {
        $('.div-percent').hide();
      }
      $('x-datetimegraduation').load();
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
    $('#showtoolselector').val(pulseConfig.getString('toollabelname'));
    $('#showtoolselector').removeAttr('overridden');
    setDefaultChecked('showtoolremaining', 'toollifemachine.displayremainingcyclesbelowtool');
    setDefaultChecked('showbaroperation', 'showbar');
    setDefaultRadioGroup(pulseConfig.getDefaultBool('displayshiftrange') ? 'shift' : 'day', {
      day: 'barrangeisday',
      shift: 'displayshiftrange'
    });
    setDefaultChecked('showbar-alarms', 'barshowalarms');
    setDefaultChecked('showbar-percent', 'barshowpercent');

    // Layout reset only applies in live mode
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
      // Rotation
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      // Skip hidden elements (historical mode)
      if (!el || $(el).is(':hidden')) return '';

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
      $('x-production').show();
      $('x-currentworkinfo').hide();
      if (showworkinfo) {
        $('x-workinfo').show();
      } else {
        $('x-workinfo').hide();
      }
    } else {
      $('x-production').hide();
      $('x-workinfo').hide();
      if (showworkinfo) {
        $('x-currentworkinfo').show();
      } else {
        $('x-currentworkinfo').hide();
      }
    }

    let showpie = pulseConfig.getBool('showpie');
    if (showpie) {
      $('.operationstatus-cycleprogress').show();
    } else {
      $('.operationstatus-cycleprogress').hide();
    }

    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      $('x-stacklight').show();
    } else {
      $('x-stacklight').hide();
    }

    // Current display: prefer showcurrentdisplay enum; fall back to individual boolean flags
    let showcurrent = pulseConfig.getBool('showcurrent');
    const currentDisplay = pulseConfig.getString('showcurrentdisplay');
    const hasCurrentDisplay = currentDisplay === 'tool' || currentDisplay === 'sequence' || currentDisplay === 'override';
    let showcurrenttool = hasCurrentDisplay ? currentDisplay === 'tool' : pulseConfig.getBool('showcurrenttool');
    if (showcurrent && showcurrenttool) {
      $('.operationstatus-current-tool-div').show();
    } else {
      $('.operationstatus-current-tool-div').hide();
    }

    let showcurrentsequence = hasCurrentDisplay ? currentDisplay === 'sequence' : pulseConfig.getBool('showcurrentsequence');
    if (showcurrent && showcurrentsequence) {
      $('.operationstatus-current-sequence-div').show();
    } else {
      $('.operationstatus-current-sequence-div').hide();
    }

    let showcurrentoverride = hasCurrentDisplay ? currentDisplay === 'override' : pulseConfig.getBool('showcurrentoverride');
    if (showcurrent && showcurrentoverride) {
      $('.operationstatus-current-override-div').show();
    } else {
      $('.operationstatus-current-override-div').hide();
    }

    // Alarm: left vs bottom layout based on showAlarmBelowIcon
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      let showAlarmBelowIcon = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
      if (showAlarmBelowIcon) {
        $('.operationstatus-alarm-bottom-div').show();
        $('.operationstatus-alarm-left-div').hide();
      } else {
        $('.operationstatus-alarm-left-div').show();
        $('.operationstatus-alarm-bottom-div').hide();
      }
    } else {
      $('.operationstatus-alarm-left-div').hide();
      $('.operationstatus-alarm-bottom-div').hide();
    }

    let showisofile = pulseConfig.getBool('showisofile');
    if (showisofile) {
      $('.operationstatus-isofile-div').show();
    } else {
      $('.operationstatus-isofile-div').hide();
    }

    let showtool = pulseConfig.getBool('showtool');
    if (showtool) {
      $('.operationstatus-tool-div').show();
    } else {
      $('.operationstatus-tool-div').hide();
    }

    this._applyTopDisplaySizing();

    let showbar = pulseConfig.getBool('showbar');
    if (showbar) {
      $('.operationstatus-bar').show();
    } else {
      $('.operationstatus-bar').hide();
    }

    let barshowpercent = pulseConfig.getBool('barshowpercent');
    if (barshowpercent) {
      $('.div-percent').show();
    } else {
      $('.div-percent').hide();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new OperationStatusPage());
});
