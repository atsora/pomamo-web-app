
// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouparray/x-grouparray');

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

/* For Bar display and some defaultpie */
require('x-periodmanager/x-periodmanager');
require('x-datetimegraduation/x-datetimegraduation');
require('x-shiftslotbar/x-shiftslotbar');
require('x-machinestatebar/x-machinestatebar');
require('x-observationstatebar/x-observationstatebar');
require('x-operationcyclebar/x-operationcyclebar');
require('x-operationslotbar/x-operationslotbar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-cncalarmbar/x-cncalarmbar');
require('x-redstacklightbar/x-redstacklightbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-isofileslotbar/x-isofileslotbar');
/* end Bar display  */
require('x-motionpercentage/x-motionpercentage');

require('x-tr/x-tr');

class OperationStatusPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  _isWorkInfoBig() {
    const smallElement = document.getElementById('showworkinfosmall');
    if (smallElement) {
      return !smallElement.checked;
    }
    return pulseConfig.getBool('showworkinfobig');
  }

  _applyTopDisplaySizing() {
    const isBig = this._isWorkInfoBig();
    const workInfoSize = isBig ? '1.6em' : '1.2em';

    document.querySelectorAll('x-currentworkinfo, x-workinfo').forEach((element) => {
      element.style.fontSize = workInfoSize;
    });

    document.querySelectorAll('x-production').forEach((element) => {
      element.style.fontSize = isBig ? '2em' : '';
    });
  }

  // CONFIG PANEL - Init
  initOptionValues() {
    var self = this; // To call _applyTopDisplaySizing inside onchange

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

    // showworkinfo = Show Operation
    $('#showworkinfo').prop('checked', pulseConfig.getBool('showworkinfo'));
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      $('#showworkinfo').attr('overridden', 'true');
    }
    $('#showworkinfo').change(function () {
      pulseConfig.set('showworkinfo', $('#showworkinfo').is(':checked'));

      let showworkinfo = pulseConfig.getBool('showworkinfo');

      let showproduction = pulseConfig.getBool('showproduction');
      if (showproduction) {
        //$('x-production').show();
        $('x-currentworkinfo').hide();

        if (showworkinfo) {
          $('x-workinfo').show();
        }
        else {
          $('x-workinfo').hide();
        }
      }
      else {
        //$('x-production').hide();
        $('x-workinfo').hide();

        if (showworkinfo) {
          $('x-currentworkinfo').show();
        }
        else {
          $('x-currentworkinfo').hide();
        }
      }
      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showworkinfodetails').show();
      }
      else {
        $('.showworkinfodetails').hide();
      }
    });
    $('#showworkinfo').trigger('change'); // To open/close subgroup

    // operation size
    const workInfoSizeMap = { small: 'showworkinfosmall', big: 'showworkinfobig' };
    const workInfoSize = pulseConfig.getBool('showworkinfobig') ? 'big' : 'small';
    syncRadioGroup(workInfoSize, workInfoSizeMap, 'small');
    bindRadioGroup(workInfoSizeMap, (value) => {
      pulseConfig.set('showworkinfobig', value === 'big' ? 'true' : 'false');
      self._applyTopDisplaySizing();
    });
    self._applyTopDisplaySizing();

    //showcurrentmachinestatuslogo
    $('#showcurrentmachinestatuslogo').prop('checked', pulseConfig.getBool('showcurrentmachinestatuslogo'));
    if (pulseConfig.getDefaultBool('showcurrentmachinestatuslogo') != pulseConfig.getBool('showcurrentmachinestatuslogo'))
      $('#showcurrentmachinestatuslogo').attr('overridden', 'true');
    $('#showcurrentmachinestatuslogo').change(function () {
      pulseConfig.set('showcurrentmachinestatuslogo', $('#showcurrentmachinestatuslogo').is(':checked'));
      if ($('#showcurrentmachinestatuslogo').is(':checked')) {
        $('x-reasonbutton').show();
      }
      else {
        $('x-reasonbutton').hide();
      }
    });
    $('#showcurrentmachinestatuslogo').change(); // To show / Hide x-reasonbutton

    //showcurrentmachinestatusletter
    $('#showcurrentmachinestatusletter').prop('checked', pulseConfig.getBool('showcurrentmachinestatusletter'));
    if (pulseConfig.getDefaultBool('showcurrentmachinestatusletter') != pulseConfig.getBool('showcurrentmachinestatusletter'))
      $('#showcurrentmachinestatusletter').attr('overridden', 'true');
    $('#showcurrentmachinestatusletter').change(function () {
      pulseConfig.set('showcurrentmachinestatusletter', $('#showcurrentmachinestatusletter').is(':checked'));
      if ($('#showcurrentmachinestatusletter').is(':checked')) {
        $('x-lastmachinestatus').show();
      }
      else {
        $('x-lastmachinestatus').hide();
      }
    });
    $('#showcurrentmachinestatusletter').change(); // To show / Hide x-lastmachinestatus

    //showproductionoperation = Show Part Count
    $('#showproductionoperation').prop('checked', pulseConfig.getBool('showproduction'));
    if (pulseConfig.getDefaultBool('showproduction') != pulseConfig.getBool('showproduction'))
      $('#showproductionoperation').attr('overridden', 'true');
    $('#showproductionoperation').change(function () {
      pulseConfig.set('showproduction', $('#showproductionoperation').is(':checked'));
      if ($('#showproductionoperation').is(':checked')) {
        pulseConfig.set('hidesecondproductiondisplay', 'true'); // To hide small display in pie
      }
      else {
        pulseConfig.set('hidesecondproductiondisplay', 'false'); // To restore small display in pie
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'hidesecondproductiondisplay' });

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      let showproduction = pulseConfig.getBool('showproduction');
      if (showproduction) {
        $('x-production').show();
        $('x-currentworkinfo').hide();

        if (showworkinfo) {
          $('x-workinfo').show();
        }
        else {
          $('x-workinfo').hide();
        }
      }
      else {
        $('x-production').hide();
        $('x-workinfo').hide();

        if (showworkinfo) {
          $('x-currentworkinfo').show();
        }
        else {
          $('x-currentworkinfo').hide();
        }
      }

      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showproductionoperationdetails').show();
      }
      else {
        $('.showproductionoperationdetails').hide();
      }
    });
    $('#showproductionoperation').trigger('change'); // To open/close subgroup

    // % or 1/2 or actual only
    //if (pulseConfig.getDefaultString('productionpercent') != pulseConfig.getString('productionpercent'))
    //  $('#productionpercent').attr('overridden', 'true');
    let productionpercent = pulseConfig.getString('productionpercent');
    const productionPercentMap = {
      true: 'productionpercent',
      actualonly: 'productionactualonly',
      actualtarget: 'productionactualtarget'
    };
    syncRadioGroup(productionpercent, productionPercentMap, 'actualtarget');
    bindRadioGroup(productionPercentMap, (value) => {
      pulseConfig.set('productionpercent', value);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'productionpercent' });
    });

    $('#thresholdtargetproduction').val(pulseConfig.getInt('thresholdtargetproduction'));
    var changetarget = function () {
      // verify thresholds
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);

      }
    };
    $('#thresholdtargetproduction').bind('input', changetarget);
    $('#thresholdtargetproduction').change(changetarget);

    $('#thresholdredproduction').val(pulseConfig.getInt('thresholdredproduction'));
    var changeRed = function () {
      // verify thresholds
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
      }
    };
    $('#thresholdredproduction').bind('input', changeRed);
    $('#thresholdredproduction').change(changeRed);

    const updateCurrentDisplays = () => {
      const showcurrent = $('#showcurrent').is(':checked');
      const showcurrenttool = $('#showcurrenttool').is(':checked');
      const showcurrentsequence = $('#showcurrentsequence').is(':checked');
      const showcurrentoverride = $('#showcurrentoverride').is(':checked');

      if (showcurrent && showcurrenttool) {
        $('.operationstatus-current-tool-div').show();
      }
      else {
        $('.operationstatus-current-tool-div').hide();
      }

      if (showcurrent && showcurrentsequence) {
        $('.operationstatus-current-sequence-div').show();
      }
      else {
        $('.operationstatus-current-sequence-div').hide();
      }

      if (showcurrent && showcurrentoverride) {
        $('.operationstatus-current-override-div').show();
      }
      else {
        $('.operationstatus-current-override-div').hide();
      }

      self._applyTopDisplaySizing();
    };

    const syncCurrentSelection = (value) => {
      pulseConfig.set('showcurrentdisplay', value);
      pulseConfig.set('showcurrenttool', value === 'tool');
      pulseConfig.set('showcurrentsequence', value === 'sequence');
      pulseConfig.set('showcurrentoverride', value === 'override');
      updateCurrentDisplays();
    };

    // Current tool / sequence / override
    const currentSelectionMap = {
      tool: 'showcurrenttool',
      sequence: 'showcurrentsequence',
      override: 'showcurrentoverride'
    };
    syncRadioGroup(pulseConfig.getString('showcurrentdisplay'), currentSelectionMap, 'tool');
    bindRadioGroup(currentSelectionMap, (value) => {
      syncCurrentSelection(value);
    });

    const showcurrentRaw = pulseConfig.getString('showcurrent');
    const hasExplicitShowCurrent = showcurrentRaw === 'true' || showcurrentRaw === 'false';
    const showcurrentValue = hasExplicitShowCurrent
      ? showcurrentRaw === 'true'
      : (pulseConfig.getString('showcurrentdisplay') === 'tool'
        || pulseConfig.getString('showcurrentdisplay') === 'sequence'
        || pulseConfig.getString('showcurrentdisplay') === 'override');
    $('#showcurrent').prop('checked', showcurrentValue);
    if (hasExplicitShowCurrent
      && pulseConfig.getDefaultBool('showcurrent') != showcurrentValue) {
      $('#showcurrent').attr('overridden', 'true');
    }
    $('#showcurrent').change(function () {
      const showcurrent = $('#showcurrent').is(':checked');
      pulseConfig.set('showcurrent', showcurrent);
      updateCurrentDisplays();

      // Visibility of subgroups
      if (showcurrent) {
        $('.showcurrentdetails').show();
      }
      else {
        $('.showcurrentdetails').hide();
      }
    });
    $('#showcurrent').trigger('change'); // To open/close subgroup

    // Alarm = triangle on the left
    $('#showalarmoperation').prop('checked', pulseConfig.getBool('showalarm'));
    if (pulseConfig.getDefaultBool('showalarm') != pulseConfig.getBool('showalarm'))
      $('#showalarmoperation').attr('overridden', 'true');
    $('#showalarmoperation').change(function () {
      let showalarm = $('#showalarmoperation').is(':checked');
      // Store
      pulseConfig.set('showalarm', showalarm);
      // Display
      pulseConfig.getBool('showalarm');
      if (showalarm) {
        let showAlarmBelowIcon = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
        if (showAlarmBelowIcon) {
          $('.operationstatus-alarm-bottom-div').show();
          $('.operationstatus-alarm-left-div').hide();
        }
        else {
          $('.operationstatus-alarm-left-div').show();
          $('.operationstatus-alarm-bottom-div').hide();
        }
      }
      else {
        $('.operationstatus-alarm-left-div').hide();
        $('.operationstatus-alarm-bottom-div').hide();
      }
      // Other displays
      self._applyTopDisplaySizing();
      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showalarmdetails').show();
      }
      else {
        $('.showalarmdetails').hide();
      }
    });
    $('#showalarmoperation').trigger('change'); // To open/close subgroup

    // Text below alarm
    $('#showAlarmBelowIcon').prop('checked', pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon'));
    if (pulseConfig.getDefaultBool('currenticoncncalarm.showAlarmBelowIcon') != pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon'))
      $('#showAlarmBelowIcon').attr('overridden', 'true');

    $('#showAlarmBelowIcon').change(function () {
      let showAlarmBelowIcon = $('#showAlarmBelowIcon').is(':checked');
      pulseConfig.set('currenticoncncalarm.showAlarmBelowIcon', showAlarmBelowIcon);

      if (showAlarmBelowIcon) {
        $('.operationstatus-alarm-bottom-div').show();
        $('.operationstatus-alarm-left-div').hide();
      }
      else {
        $('.operationstatus-alarm-left-div').show();
        $('.operationstatus-alarm-bottom-div').hide();
      }

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'showAlarmBelowIcon' });
    });

    // Unknown alarms
    $('#showUnknownAlarm').prop('checked', pulseConfig.getBool('showUnknownAlarm'));
    if (pulseConfig.getDefaultBool('showUnknownAlarm') != pulseConfig.getBool('showUnknownAlarm'))
      $('#showUnknownAlarm').attr('overridden', 'true');

    $('#showUnknownAlarm').change(function () {
      pulseConfig.set('showUnknownAlarm',
        $('#showUnknownAlarm').is(':checked'));

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'showUnknownAlarm' });
    });

    // Pie
    $('#showpie').prop('checked', pulseConfig.getBool('showpie'));
    if (pulseConfig.getDefaultBool('showpie') != pulseConfig.getBool('showpie'))
      $('#showpie').attr('overridden', 'true');
    $('#showpie').change(function () {
      let showpie = $('#showpie').is(':checked');
      // Store
      pulseConfig.set('showpie', showpie);
      // Display
      if (showpie) {
        $('.operationstatus-cycleprogress').show();
      }
      else {
        $('.operationstatus-cycleprogress').hide();
      }
      // Other displays
      self._applyTopDisplaySizing();
      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showpiedetails').show();
      }
      else {
        $('.showpiedetails').hide();
      }
    });
    $('#showpie').trigger('change'); // To open/close subgroup

    // Inside pie
    const productionPercentInPieMap = {
      true: 'productionpercentinpie',
      actualonly: 'productionactualonlyinpie',
      actualtarget: 'productionactualtargetinpie'
    };
    syncRadioGroup(pulseConfig.getString('productionpercentinpie'), productionPercentInPieMap, 'actualtarget');
    bindRadioGroup(productionPercentInPieMap, (value) => {
      pulseConfig.set('productionpercentinpie', value);
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'productionpercentinpie' });
    });

    // Stacklight
    $('#showstacklight').prop('checked', pulseConfig.getBool('showstacklight'));
    if (pulseConfig.getDefaultBool('showstacklight') != pulseConfig.getBool('showstacklight'))
      $('#showstacklight').attr('overridden', 'true');
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
      // Other displays
      self._applyTopDisplaySizing();
    });

    // Isofile
    $('#showisofile').prop('checked', pulseConfig.getBool('showisofile'));
    if (pulseConfig.getDefaultBool('showisofile') != pulseConfig.getBool('showisofile'))
      $('#showisofile').attr('overridden', 'true');
    $('#showisofile').change(function () {
      let showisofile = $('#showisofile').is(':checked');
      // Store
      pulseConfig.set('showisofile', showisofile);
      // Display
      if (showisofile) {
        $('.operationstatus-isofile-div').show();
      }
      else {
        $('.operationstatus-isofile-div').hide();
      }
    });
    $('#showisofile').change(); // To show / Hide x-currentisofile

    // TOOL
    $('#showtooloperation').prop('checked', pulseConfig.getBool('showtool'));
    if (pulseConfig.getDefaultBool('showtool') != pulseConfig.getBool('showtool'))
      $('#showtooloperation').attr('overridden', 'true');
    $('#showtooloperation').change(function () {
      let showtool = $('#showtooloperation').is(':checked');
      // Store
      pulseConfig.set('showtool', showtool);
      // Display
      if (showtool) {
        $('.operationstatus-tool-div').show();
      }
      else {
        $('.operationstatus-tool-div').hide();
      }

      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showtoolsdetails').show();
      }
      else {
        $('.showtoolsdetails').hide();
      }
    });
    $('#showtooloperation').trigger('change'); // To open/close subgroup

    // TOOLS detail
    let toollabelname = pulseConfig.getString('toollifemachine.toollabelname');
    $('#showtoolselector').empty();
    let toollabelsselections = pulseConfig.getArray('toollifemachine.toollabelsselections');
    for (let iTool = 0; iTool < toollabelsselections.length; iTool++) {
      let label = toollabelsselections[iTool];
      $('#showtoolselector').append('<option id="tool-' + label.name + '" value="' + label.name + '">' + label.display + '</option>');
    }
    // Set selection
    $('#showtoolselector').val(toollabelname);

    $('#showtoolselector').change(function () {
      let toollabelname = $('#showtoolselector').val();
      // Store
      pulseConfig.set('toollabelname', String(toollabelname));
      // Display = dispatch message
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'toollabelname' });
    });

    // TOOLS remaining
    $('#showtoolremaining').prop('checked',
      pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'));
    if (pulseConfig.getDefaultBool('showbar')
      != pulseConfig.getBool('toollifemachine.displayremainingcyclesbelowtool'))
      $('#showtoolremaining').attr('overridden', 'true');
    $('#showtoolremaining').change(function () {
      let showtoolremaining = $('#showtoolremaining').is(':checked');
      // Store
      pulseConfig.set('toollifemachine.displayremainingcyclesbelowtool', showtoolremaining);
      // Display / Dispatch
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayremainingcyclesbelowtool' });
    });

    // BAR (shift / alarm)
    $('#showbaroperation').prop('checked', pulseConfig.getBool('showbar'));
    if (pulseConfig.getDefaultBool('showbar') != pulseConfig.getBool('showbar'))
      $('#showbaroperation').attr('overridden', 'true');
    $('#showbaroperation').change(function () {
      let showbar = $('#showbaroperation').is(':checked');
      // Store
      pulseConfig.set('showbar', showbar);
      // Display
      if (showbar) {
        $('.operationstatus-bar').show();
      }
      else {
        $('.operationstatus-bar').hide();
      }
      // Visibility of subgroups
      if ($(this).is(':checked')) {
        $('.showbardetails').show();
      }
      else {
        $('.showbardetails').hide();
      }
    });
    $('#showbaroperation').trigger('change'); // To open/close subgroup

    // BAR : day / shift
    const barPeriodMap = { day: 'barrangeisday', shift: 'displayshiftrange' };
    const barPeriod = pulseConfig.getBool('displayshiftrange') ? 'shift' : 'day';
    syncRadioGroup(barPeriod, barPeriodMap, 'day');
    bindRadioGroup(barPeriodMap, (value) => {
      pulseConfig.set('displayshiftrange', value === 'shift');
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayshiftrange' });
    });

    // BAR : Alarm
    $('#showbar-alarms').prop('checked', pulseConfig.getBool('barshowalarms'));
    if (pulseConfig.getDefaultBool('barshowalarms') != pulseConfig.getBool('barshowalarms')) {
      $('#showbar-alarms').attr('overridden', 'true');
    }
    $('#showbar-alarms').change(function () {
      let barshowalarms = $('#showbar-alarms').is(':checked');
      // Store
      pulseConfig.set('barshowalarms', barshowalarms);
      // Display / Dispatch
      if (barshowalarms) { //TODO : link to showalarm ???
        $('x-cncalarmbar').hide(); // show(); // Removed because too slow (cf NR-2019-05)
        $('x-redstacklightbar').show();
      }
      else {
        $('x-cncalarmbar').hide();
        $('x-redstacklightbar').hide();
      }
    });

    // BAR : percent
    $('#showbar-percent').prop('checked', pulseConfig.getBool('barshowpercent'));
    if (pulseConfig.getDefaultBool('barshowpercent') != pulseConfig.getBool('barshowpercent')) {
      $('#showbar-percent').attr('overridden', 'true');
    }
    $('#showbar-percent').change(function () {
      let barshowpercent = $('#showbar-percent').is(':checked');
      // Store
      pulseConfig.set('barshowpercent', barshowpercent);
      // Display / Dispatch
      if (barshowpercent) {
        $('.div-percent').show();
      }
      else {
        $('.div-percent').hide();
      }
      $('x-datetimegraduation').load(); // DTG can not manage resize
    });

  }

  // Verify threshold values
  _verficationThresholds(targetValue, redValue) { //peut peut etre etre globalisé (utilisé plein de fois partout)
    // Find or create error message element
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      if (document.querySelector('.thresholdunitispart')) document.querySelector('.thresholdunitispart').appendChild(errorMessage); // to fix
    }

    // Check if values are valid numbers
    if (isNaN(redValue) || isNaN(targetValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdNaNError', 'Threshold values must be valid numbers');
      errorMessage.style.display = 'block';
      return false;
    }


    // values between 0 and 100
    if (redValue < 0 || targetValue <= 0) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdPositiveError', 'Threshold values must be positive');
      errorMessage.style.display = 'block';
      return false;
    }

    // In percentage mode: target > red (normal logic)
    if (Number(targetValue) <= Number(redValue)) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdError', 'Target threshold must be greater than red threshold');
      errorMessage.style.display = 'block';
      return false;
    }

    // Percentage cannot exceed 100
    if (redValue > 100 || targetValue > 100) {
      errorMessage.textContent = pulseConfig.pulseTranslate('options.thresholdMaxError', 'Percentage values cannot exceed 100');
      errorMessage.style.display = 'block';
      return false;
    }

    // store values
    pulseConfig.set('thresholdtargetproduction', parseFloat(targetValue));
    pulseConfig.set('thresholdredproduction', parseFloat(redValue));

    errorMessage.style.display = 'none';

    // Dispatch to update displays
    eventBus.EventBus.dispatchToAll('configChangeEvent',
      {
        config: 'thresholdsupdated'
      });

    return true;
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    //===============================================================================
    //fonction d'automatisation des checked et des values pour les options en dessous
    //===============================================================================
    //automatisation des checkbox
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.prop('checked', pulseConfig.getDefaultBool(configKey));
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    //automatisation des box à values
    const setDefaultValue = (id, value, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.val(value);
      if (trigger) element.change();
      if (clearOverride) element.removeAttr('overridden');
    };

    //automatisation des groupes de boutons radio (questionnaire)
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

    //=====================================================
    // dénfinition des options checked ou values par défaut
    //=====================================================

    // showworkinfo
    setDefaultChecked('showworkinfo');
    setDefaultRadioGroup(pulseConfig.getDefaultBool('showworkinfosmall') ? 'small' : 'big', {
      small: 'showworkinfosmall',
      big: 'showworkinfobig'
    });

    // showmachinestatuslogo
    setDefaultChecked('showcurrentmachinestatuslogo');

    // showmachinestatusletter
    setDefaultChecked('showcurrentmachinestatusletter');

    //thresholds
    setDefaultValue('thresholdtargetproduction', pulseConfig.getDefaultInt('thresholdtargetproduction'));
    setDefaultValue('thresholdredproduction', pulseConfig.getDefaultInt('thresholdredproduction'));

    // Production
    setDefaultChecked('showproductionoperation', 'showproduction');

    setDefaultRadioGroup(pulseConfig.getDefaultString('productionpercent'), {
      true: 'productionpercent',
      actualonly: 'productionactualonly',
      actualtarget: 'productionactualtarget'
    });


    // current tool / sequence / override
    setDefaultChecked('showcurrent');
    setDefaultRadioGroup(pulseConfig.getDefaultString('showcurrentdisplay'), {
      tool: 'showcurrenttool',
      sequence: 'showcurrentsequence',
      override: 'showcurrentoverride'
    });

    // Alarm
    setDefaultChecked('showalarmoperation', 'showalarm');
    setDefaultChecked('showAlarmBelowIcon', 'currenticoncncalarm.showAlarmBelowIcon');
    setDefaultChecked('showUnknownAlarm');

    // Pie
    setDefaultChecked('showpie');

    setDefaultRadioGroup(pulseConfig.getDefaultString('productionpercentinpie'), {
      true: 'productionpercentinpie',
      actualonly: 'productionactualonlyinpie',
      actualtarget: 'productionactualtargetinpie'
    });

    // Stacklight
    setDefaultChecked('showstacklight');

    // Isofile
    setDefaultChecked('showisofile');

    // TOOLS
    setDefaultChecked('showtooloperation', 'showtool');

    // Tool - period
    $('#showtoolselector').val(pulseConfig.getString('toollabelname'));
    $('#showtoolselector').removeAttr('overridden');

    // Tool - remaining
    setDefaultChecked('showtoolremaining', 'toollifemachine.displayremainingcyclesbelowtool');

    // BAR (shift / alarm)
    setDefaultChecked('showbaroperation', 'showbar');

    setDefaultRadioGroup(pulseConfig.getDefaultBool('displayshiftrange') ? 'shift' : 'day', {
      day: 'barrangeisday',
      shift: 'displayshiftrange'
    });

    setDefaultChecked('showbar-alarms', 'barshowalarms');
    setDefaultChecked('showbar-percent', 'barshowpercent');
  }

  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    const options = [
      { id: 'showworkinfo', type: 'checkbox' },
      { id: 'showworkinfosmall', type: 'checkbox' },
      { id: 'showcurrentmachinestatuslogo', type: 'checkbox' },
      { id: 'showcurrentmachinestatusletter', type: 'checkbox' },
      { id: 'showcurrent', type: 'checkbox' },
      { id: 'showproductionoperation', type: 'checkbox', param: 'showproduction' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const paramName = opt.param || opt.id;
      return `&${paramName}=${el.checked}`;
    }).join('');

    // Production percent - add fallback if showproductionoperation is false
    if (document.getElementById('showproductionoperation')?.checked) {
      if (document.getElementById('productionpercent')?.checked) {
        result += '&productionpercent=true';
      } else if (document.getElementById('productionactualonly')?.checked) {
        result += '&productionpercent=actualonly';
      } else {
        result += '&productionpercent=actualtarget';
      }
      // Add thresholds if they have valid values
      if (pulseUtility.isInteger(document.getElementById('thresholdtargetproduction')?.value)) {
        result += `&thresholdtargetproduction=${document.getElementById('thresholdtargetproduction')?.value}`;
      }
      if (pulseUtility.isInteger(document.getElementById('thresholdredproduction')?.value)) {
        result += `&thresholdredproduction=${document.getElementById('thresholdredproduction')?.value}`;
      }
    } else {
      result += '&productionpercent=false';
    }

    // Tools/Sequence - keep selection even if showcurrent is false
    if (document.getElementById('showcurrenttool')?.checked) {
      result += '&showcurrentdisplay=tool';
    } else if (document.getElementById('showcurrentsequence')?.checked) {
      result += '&showcurrentdisplay=sequence';
    } else if (document.getElementById('showcurrentoverride')?.checked) {
      result += '&showcurrentdisplay=override';
    }

    // Alarm
    const showalarmEl = document.getElementById('showalarmoperation');
    result += `&showalarm=${showalarmEl?.checked}`;
    if (showalarmEl?.checked) {
      result += `&showAlarmBelowIcon=${document.getElementById('showAlarmBelowIcon')?.checked}`;
      result += `&showUnknownAlarm=${document.getElementById('showUnknownAlarm')?.checked}`;
    }

    // Pie
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

    // Other displays
    result += `&showstacklight=${document.getElementById('showstacklight')?.checked}`;
    result += `&showisofile=${document.getElementById('showisofile')?.checked}`;

    // Tools
    const showtoolEl = document.getElementById('showtooloperation');
    result += `&showtool=${showtoolEl?.checked}`;
    if (showtoolEl?.checked) {
      const toolSelector = document.getElementById('showtoolselector');
      if (toolSelector?.value) {
        result += `&toollabelname=${toolSelector.value}`;
      }
      result += `&displayremainingcyclesbelowtool=${document.getElementById('showtoolremaining')?.checked}`;
    }

    // Bar
    const showbarEl = document.getElementById('showbaroperation');
    result += `&showbar=${showbarEl?.checked}`;
    if (showbarEl?.checked) {
      result += `&displayshiftrange=${document.getElementById('displayshiftrange')?.checked}`;
      result += `&barshowalarms=${document.getElementById('showbar-alarms')?.checked}`;
      result += `&barshowpercent=${document.getElementById('showbar-percent')?.checked}`;
    }

    return result;
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

  buildContent() {
    //showworkinfo
    let showworkinfo = pulseConfig.getBool('showworkinfo');

    let showproduction = pulseConfig.getBool('showproduction');
    if (showproduction) {
      $('x-production').show();
      $('x-currentworkinfo').hide();

      if (showworkinfo) {
        $('x-workinfo').show();
      }
      else {
        $('x-workinfo').hide();
      }
    }
    else {
      $('x-production').hide();
      $('x-workinfo').hide();

      if (showworkinfo) {
        $('x-currentworkinfo').show();
      }
      else {
        $('x-currentworkinfo').hide();
      }
    }

    let showpie = pulseConfig.getBool('showpie');
    if (showpie) {
      //$('x-cycleprogresspie').show();
      $('.operationstatus-cycleprogress').show();
    }
    else {
      //$('x-cycleprogresspie').hide();
      $('.operationstatus-cycleprogress').hide();
    }

    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      $('x-stacklight').show();
    }
    else {
      $('x-stacklight').hide();
    }
    let showcurrent = pulseConfig.getBool('showcurrent');
    const currentDisplay = pulseConfig.getString('showcurrentdisplay');
    const hasCurrentDisplay = currentDisplay === 'tool'
      || currentDisplay === 'sequence'
      || currentDisplay === 'override';
    let showcurrenttool = hasCurrentDisplay
      ? currentDisplay === 'tool'
      : pulseConfig.getBool('showcurrenttool');
    if (showcurrent && showcurrenttool) {
      $('.operationstatus-current-tool-div').show();
    }
    else {
      $('.operationstatus-current-tool-div').hide();
    }
    let showcurrentsequence = hasCurrentDisplay
      ? currentDisplay === 'sequence'
      : pulseConfig.getBool('showcurrentsequence');
    if (showcurrent && showcurrentsequence) {
      $('.operationstatus-current-sequence-div').show();
    }
    else {
      $('.operationstatus-current-sequence-div').hide();
    }
    let showcurrentoverride = hasCurrentDisplay
      ? currentDisplay === 'override'
      : pulseConfig.getBool('showcurrentoverride');
    if (showcurrent && showcurrentoverride) {
      $('.operationstatus-current-override-div').show();
    }
    else {
      $('.operationstatus-current-override-div').hide();
    }
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      let showAlarmBelowIcon = pulseConfig.getBool('currenticoncncalarm.showAlarmBelowIcon');
      if (showAlarmBelowIcon) {
        $('.operationstatus-alarm-bottom-div').show();
        $('.operationstatus-alarm-left-div').hide();
      }
      else {
        $('.operationstatus-alarm-left-div').show();
        $('.operationstatus-alarm-bottom-div').hide();
      }
    }
    else {
      $('.operationstatus-alarm-left-div').hide();
      $('.operationstatus-alarm-bottom-div').hide();
    }
    let showtool = pulseConfig.getBool('showtool');
    if (showtool) {
      $('.operationstatus-tool-div').show();
    }
    else {
      $('.operationstatus-tool-div').hide();
    }

    this._applyTopDisplaySizing();

    /* RANGE */

    /* BAR */
    let showbar = pulseConfig.getBool('showbar');
    if (showbar) {
      $('.operationstatus-bar').show();
    }
    else {
      $('.operationstatus-bar').hide();
    }
    let barshowalarms = pulseConfig.getBool('barshowalarms');
    if (barshowalarms) { //TODO : link to showalarm ???
      $('x-cncalarmbar').hide(); // show(); // Removed because too slow (cf NR-2019-05)
      $('x-redstacklightbar').show();
    }
    else {
      $('x-cncalarmbar').hide();
      $('x-redstacklightbar').hide();
    }
    let barshowpercent = pulseConfig.getBool('barshowpercent');
    if (barshowpercent) {
      $('.div-percent').show();
    }
    else {
      $('.div-percent').hide();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new OperationStatusPage());
});
