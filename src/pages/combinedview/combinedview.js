// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-runningbutton/x-runningbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-performancetarget/x-performancetarget');
require('x-currenticoncncalarm/x-currenticoncncalarm');
require('x-stacklight/x-stacklight');
require('x-runningslotpie/x-runningslotpie');
require('x-motionpercentage/x-motionpercentage');
require('x-datetimegraduation/x-datetimegraduation');
require('x-runningslotbar/x-runningslotbar');
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-runninglegends/x-runninglegends');
require('x-grouparray/x-grouparray');
require('x-tr/x-tr');

class CombinedViewPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  // CONFIG PANEL - Init
  initOptionValues() {
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
        $('x-performancetarget').show();
      }
      else {
        $('x-performancetarget').hide();
      }
    });

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
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    $('#showtarget').prop('checked', pulseConfig.getDefaultBool('showtarget'));
    $('#showtarget').change();
    $('#showtarget').removeAttr('overridden');

    $('#showalarm').prop('checked', pulseConfig.getDefaultBool('showalarm'));
    $('#showalarm').change();
    $('#showalarm').removeAttr('overridden');

    $('#showstacklight').prop('checked', pulseConfig.getDefaultBool('showstacklight'));
    $('#showstacklight').change();
    $('#showstacklight').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    let optionsValues = '';
    if ($('#showtarget').is(':checked')) {
      optionsValues += '&showtarget=true';
    }
    else {
      optionsValues += '&showtarget=false';
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
        message: pulseConfig.pulseTranslate('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  buildContent() {
    let showtarget = pulseConfig.getBool('showtarget');
    if (showtarget) {
      $('x-performancetarget').show();
    }
    else {
      $('x-performancetarget').hide();
    }
    let showstacklight = pulseConfig.getBool('showstacklight');
    if (showstacklight) {
      $('x-stacklight').show();
    }
    else {
      $('x-stacklight').hide();
    }
    let showalarm = pulseConfig.getBool('showalarm');
    if (showalarm) {
      $('x-currenticoncncalarm').show();
    }
    else {
      $('x-currenticoncncalarm').hide();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new CombinedViewPage());
});
