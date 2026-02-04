// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
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
require('x-cncvaluebar/x-cncvaluebar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-grouparray/x-grouparray');
require('x-tr/x-tr');

class MachineStatusPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  // CONFIG PANEL - Init
  initOptionValues() {
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

    // Shift / Day
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

    // Percent / Time
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
        // Reset show target
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
        // Reset show target
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

    // Target
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

    // Current Tool/ Sequences
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
        // Hide Sequence
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
        // Hide Tool
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

    // Week visibility
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

    // Week range
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

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    // showworkinfo
    $('#showworkinfo').prop('checked', pulseConfig.getDefaultBool('showworkinfo'));
    $('#showworkinfo').change();
    $('#showworkinfo').removeAttr('overridden');

    // Shift / Day
    $('#displayshiftrange').prop('checked',
      pulseConfig.getDefaultBool('displayshiftrange'));
    $('#displayshiftrange').change();
    $('#displayshiftrange').removeAttr('overridden');

    $('#pierangeisday').prop('checked',
      !pulseConfig.getDefaultBool('displayshiftrange'));
    $('#pierangeisday').change();
    $('#pierangeisday').removeAttr('overridden');

    // Percent / Time
    $('#displaymotiontime').prop('checked',
      pulseConfig.getDefaultBool('displaymotiontime'));
    $('#displaymotiontime').change();
    $('#displaymotiontime').removeAttr('overridden');

    $('#displaymotionpercent').prop('checked',
      !pulseConfig.getDefaultBool('displaymotiontime'));
    $('#displaymotionpercent').change();
    $('#displaymotionpercent').removeAttr('overridden');

    // Target
    $('#showtarget').prop('checked', pulseConfig.getDefaultBool('showtarget'));
    $('#showtarget').change();
    $('#showtarget').removeAttr('overridden');

    // Tools / Sequence
    $('#showcurrent').prop('checked',
      (pulseConfig.getDefaultBool('showcurrenttool') ||
        pulseConfig.getDefaultBool('showcurrentsequence')));
    // Call change to open/close subgroups
    $('#showcurrent').change();

    $('#showcurrenttool').prop('checked',
      pulseConfig.getDefaultBool('showcurrenttool'));
    $('#showcurrenttool').change();
    $('#showcurrenttool').removeAttr('overridden');

    $('#showcurrentsequence').prop('checked',
      pulseConfig.getDefaultBool('showcurrentsequence'));
    $('#showcurrentsequence').change();
    $('#showcurrentsequence').removeAttr('overridden');

    // Alarm
    $('#showalarm').prop('checked', pulseConfig.getDefaultBool('showalarm'));
    $('#showalarm').change();
    $('#showalarm').removeAttr('overridden');

    $('#showstacklight').prop('checked', pulseConfig.getDefaultBool('showstacklight'));
    $('#showstacklight').change();
    $('#showstacklight').removeAttr('overridden');

    $('#showweeklybar').prop('checked', pulseConfig.getDefaultBool('showweeklybar'));
    $('#showweeklybar').change();
    $('#showweeklybar').removeAttr('overridden');

    $('#showcurrentweek').prop('checked',
      pulseConfig.getDefaultBool('weeklyshowcurrentweek'));
    $('#showcurrentweek').change();
    //$('#showcurrentweek').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    let optionsValues = '';

    // showworkinfo
    if ($('#showworkinfo').is(':checked')) {
      optionsValues += '&showworkinfo=true';
    }
    else {
      optionsValues += '&showworkinfo=false';
    }

    //
    if ($('#displayshiftrange').is(':checked')) {
      optionsValues += '&displayshiftrange=true';
    }
    else {
      optionsValues += '&displayshiftrange=false';
    }

    if ($('#displaymotiontime').is(':checked')) {
      optionsValues += '&displaymotiontime=true';
    }
    else {
      optionsValues += '&displaymotiontime=false';
    }

    if ($('#showtarget').is(':checked')) {
      optionsValues += '&showtarget=true';
    }
    else {
      optionsValues += '&showtarget=false';
    }

    if (!$('#showcurrent').is(':checked')) {
      optionsValues += '&showcurrenttool=false';
      optionsValues += '&showcurrentsequence=false';
    }
    else {
      //pulseConfig.set('showcurrenttool', $('#showcurrenttool').is(':checked'));
      if ($('#showcurrenttool').is(':checked')) {
        optionsValues += '&showcurrenttool=true';
      }
      else {
        optionsValues += '&showcurrenttool=false';
      }
      if ($('#showcurrentsequence').is(':checked')) {
        optionsValues += '&showcurrentsequence=true';
      }
      else {
        optionsValues += '&showcurrentsequence=false';
      }
    }

    if ($('#showalarm').is(':checked')) {
      optionsValues += '&showalarm=true';
    }
    else {
      optionsValues += '&showalarm=false';
    }

    if ($('#showstacklight').is(':checked')) {
      optionsValues += '&showstacklight=true';
    }
    else {
      optionsValues += '&showstacklight=false';
    }

    if ($('#showweeklybar').is(':checked')) {
      optionsValues += '&showweeklybar=true';
      // details
      if ($('#showcurrentweek').is(':checked')) {
        optionsValues += '&weeklyshowcurrentweek=true';
      }
      else {
        optionsValues += '&weeklyshowcurrentweek=false';
      }
    }
    else {
      optionsValues += '&showweeklybar=false';
    }

    return optionsValues;
  }

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

  buildContent() {
    // Show/hide according to config
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
      // Reset show target
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

    let showcncbar = pulseConfig.getBool('displayCNCValueBar');
    if (showcncbar) {
      $('x-cncvaluebar').show();
    }
    else {
      $('x-cncvaluebar').hide();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new MachineStatusPage());
});
