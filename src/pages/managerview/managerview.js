// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-grouparray/x-grouparray');

require('x-machinedisplay/x-machinedisplay');
require('x-datetimegraduation/x-datetimegraduation');
require('x-lastworkinformation/x-lastworkinformation');
require('x-currentcncvalue/x-currentcncvalue');
require('x-machinestatebar/x-machinestatebar');
require('x-observationstatebar/x-observationstatebar');
require('x-operationcyclebar/x-operationcyclebar');
require('x-operationslotbar/x-operationslotbar');
require('x-reasonslotbar/x-reasonslotbar');
require('x-redstacklightbar/x-redstacklightbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-isofileslotbar/x-isofileslotbar');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-periodmanager/x-periodmanager');
require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-reasonbutton/x-reasonbutton');
require('x-tr/x-tr');

class ManagerViewPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
    this.canConfigureColumns = false;
    pulseConfig.set('column', '');
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    // Shift
    $('#displayshiftrangemanagerview').prop('checked', pulseConfig.getBool('displayshiftrange'));
    if (pulseConfig.getDefaultBool('displayshiftrange') != pulseConfig.getBool('displayshiftrange'))
      $('#displayshiftrangemanagerview').attr('overridden', 'true');
    $('#displayshiftrangemanagerview').change(function () {
      let displayShift = $('#displayshiftrangemanagerview').is(':checked');
      // Store
      pulseConfig.set('displayshiftrange', displayShift);
      // Dispatch
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displayshiftrange' });
      // Show / Hide linked config
      if (displayShift) {
        $('#timeframemanagerview').hide();
      }
      else {
        $('#timeframemanagerview').show();
      }
    });
    $('#displayshiftrangemanagerview').change();

    // Days / Hours
    $('#displaydaysrange').val(pulseConfig.getInt('displaydaysrange'));
    if (pulseConfig.getDefaultInt('displaydaysrange') != pulseConfig.getInt('displaydaysrange')) {
      $('#displaydaysrange').attr('overridden', 'true');
    }
    var changeDays = function () {
      $('#displaydaysrange').attr('overridden', true);
      let displaydaysrange = $('#displaydaysrange').val();
      // Display
      let displayhoursrange = $('#displayhoursrange').val();
      if (displaydaysrange == '0'
        && displayhoursrange == '0') {
        $('#displaydaysrange').addClass('missing-config');
        $('#displayhoursrange').addClass('missing-config');
      }
      else {
        // Store both in case of 0 value and previous missing config
        pulseConfig.set('displaydaysrange', displaydaysrange);
        pulseConfig.set('displayhoursrange', displayhoursrange);
        // Display
        $('#displaydaysrange').removeClass('missing-config');
        $('#displayhoursrange').removeClass('missing-config');

        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displaydaysrange' });
      }
    };
    $('#displaydaysrange').bind('input', changeDays);
    $('#displaydaysrange').change(changeDays);

    // Hours
    $('#displayhoursrange').val(pulseConfig.getInt('displayhoursrange'));
    if (pulseConfig.getDefaultInt('displayhoursrange') != pulseConfig.getInt('displayhoursrange')) {
      $('#displayhoursrange').attr('overridden', 'true');
    }
    $('#displayhoursrange').change(function () {
      $(this).attr('overridden', true);
    });
    var changeHours = function () {
      $('#displayhoursrange').attr('overridden', true);
      let displayhoursrange = $('#displayhoursrange').val();
      // Display
      let displaydaysrange = $('#displaydaysrange').val();
      if (displaydaysrange == '0'
        && displayhoursrange == '0') {
        $('#displaydaysrange').addClass('missing-config');
        $('#displayhoursrange').addClass('missing-config');
      }
      else {
        // Store both in case of 0 value and previous missing config
        pulseConfig.set('displaydaysrange', displaydaysrange);
        pulseConfig.set('displayhoursrange', displayhoursrange);
        // Display
        $('#displaydaysrange').removeClass('missing-config');
        $('#displayhoursrange').removeClass('missing-config');

        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'displayhoursrange' });
      }
    };
    $('#displayhoursrange').bind('input', changeHours);
    $('#displayhoursrange').change(changeHours);
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    $('#displayhoursrange').val(0); //pulseConfig.getDefaultInt('displayhoursrange'));
    $('#displaydaysrange').val(1);  //pulseConfig.getDefaultInt('displaydaysrange'));
    $('#displayshiftrangemanagerview').prop('checked',
      pulseConfig.getDefaultBool('displayshiftrange'));

    $('#displayhoursrange').change();
    $('#displayhoursrange').removeAttr('overridden');

    $('#displaydaysrange').change();
    $('#displaydaysrange').removeAttr('overridden');

    $('#displayshiftrangemanagerview').change();
    $('#displayshiftrangemanagerview').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';

    if ($('#displayshiftrangemanagerview').is(':checked')) {
      optionsValues += '&displayshiftrange=true';
    }
    else {
      optionsValues += '&displayshiftrange=false';
      if (pulseUtility.isInteger($('#displaydaysrange').val())) {
        if ($('#displaydaysrange').is('[overridden]')) {
          optionsValues += '&displaydaysrange=' + $('#displaydaysrange').val();
        }
      }
      if (pulseUtility.isInteger($('#displayhoursrange').val())) {
        if ($('#displayhoursrange').is('[overridden]')) {
          optionsValues += '&displayhoursrange=' + $('#displayhoursrange').val();
        }
      }
    }

    return optionsValues;
  }

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

  buildContent () {
    let needReload = false;
    let url = window.location.href;
    if (-1 != url.search('displayshiftrange=')) {
      needReload = true;
      pulseConfig.set('displayshiftrange',
        pulseUtility.getURLParameter(url, 'displayshiftrange'));
      url = pulseUtility.removeURLParameter(url, 'displayshiftrange');
    }
    if (-1 != url.search('displayhoursrange=')) {
      needReload = true;
      pulseConfig.set('displayhoursrange',
        pulseUtility.getURLParameter(url, 'displayhoursrange', ''));
      url = pulseUtility.removeURLParameter(url, 'displayhoursrange');
    }
    if (-1 != url.search('displaydaysrange=')) {
      needReload = true;
      pulseConfig.set('displaydaysrange',
        pulseUtility.getURLParameter(url, 'displaydaysrange', ''));
      url = pulseUtility.removeURLParameter(url, 'displaydaysrange');
    }
    if (needReload) {
      window.open(url, '_self');
    }
    // End remove config

    //pulseConfig.set('column', 1); // Always ! -> Not here, in x-grouparray

    let displayJob = pulseConfig.getBool('currentdisplay.displayjob', false);
    if (displayJob)  // == LastWorkinformation
      $('x-lastworkinformation').show();
    else
      $('x-lastworkinformation').hide();


    // show Bars
    let showBar = pulseConfig.getBool('showcoloredbar.shift', false);
    if (showBar)
      $('x-shiftslotbar').show();
    else
      $('x-shiftslotbar').hide();


    showBar = pulseConfig.getBool('showcoloredbar.machinestate', false);
    if (showBar)
      $('x-machinestatebar').show();
    else
      $('x-machinestatebar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.observationstate', false);
    if (showBar)
      $('x-observationstatebar').show();
    else
      $('x-observationstatebar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.cycle', false);
    if (showBar)
      $('x-operationcyclebar').show();
    else
      $('x-operationcyclebar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.operation', false);
    if (showBar)
      $('x-operationslotbar').show();
    else
      $('x-operationslotbar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.isofile', false);
    if (showBar)
      $('x-isofileslotbar').show();
    else
      $('x-isofileslotbar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.cncalarm', false);
    if (showBar)
      $('x-cncalarmbar').show();
    else
      $('x-cncalarmbar').hide();

    showBar = pulseConfig.getBool('showcoloredbar.redstacklight', false);
    if (showBar)
      $('x-redstacklightbar').show();
    else
      $('x-redstacklightbar').hide();

    // show reason bar == always -> idem for SHOW x-reasongroups
    showBar = pulseConfig.getBool('showcoloredbar.cncvalue', false);
    if (showBar) {
      $('x-cncvaluebar').show();
      $('x-fieldlegends').show();
    }
    else {
      $('x-cncvaluebar').hide();
      $('x-fieldlegends').hide();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new ManagerViewPage());
});