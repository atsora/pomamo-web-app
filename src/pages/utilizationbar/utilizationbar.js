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
require('x-reasonslotbar/x-reasonslotbar');
require('x-motionpercentage/x-motionpercentage');
require('x-datetimegraduation/x-datetimegraduation');
require('x-clock/x-clock');
require('x-periodmanager/x-periodmanager');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-grouparray/x-grouparray');
require('x-tr/x-tr');


class UtilizationBarPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    // Prepare custom inputs

    // show clock
    $('#showclockutilization').prop('checked', pulseConfig.getBool('showclock'));
    if (pulseConfig.getDefaultBool('showclock') != pulseConfig.getBool('showclock'))
      $('#showclockutilization').attr('overridden', true);
    $('#showclockutilization').change(function () {
      let showclock = $('#showclockutilization').is(':checked');
      // Store
      pulseConfig.set('showclock', showclock);
      // Display
      if (showclock) {
        $('x-clock').show();
      }
      else {
        $('x-clock').hide();
      }
    });

    // Days / Hours
    let days = pulseConfig.getInt('displaydaysrange');
    let hours = pulseConfig.getInt('displayhoursrange');
    if (days > 0) {
      $('#displaydayshours').val(days);

      $('#displayisdays').prop('checked', true);
      $('#displayishours').prop('checked', false);
    }
    else {
      $('#displaydayshours').val(hours);

      $('#displayisdays').prop('checked', false);
      $('#displayishours').prop('checked', true);
    }

    var changeDaysHours = function () {
      let isDays = $('#displayisdays').is(':checked');

      let nb = ($('#displaydayshours').val());
      pulseConfig.set('displaydaysrange', isDays ? nb : 0);
      pulseConfig.set('displayhoursrange', isDays ? 0 : nb);

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'displaydaysrange' });
    };

    $('#displaydayshours').bind('input', changeDaysHours);
    $('#displayisdays').change(changeDaysHours);
    $('#displayishours').change(changeDaysHours);
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    $('#showclockutilization').prop('checked', pulseConfig.getDefaultBool('showclock'));
    $('#showclockutilization').change();
    $('#showclockutilization').removeAttr('overridden');

    // 1 day
    $('#displaydayshours').val(pulseConfig.getDefaultInt('displaydaysrange'));
    $('#displayisdays').prop('checked', true);
    $('#displayisdays').change();
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';

    if ($('#showclockutilization').is(':checked')) {
      optionsValues += '&showclock=true';
    }
    else {
      optionsValues += '&showclock=false';
    }

    if (pulseUtility.isInteger($('#displaydayshours').val())) {
      if ($('#displayisdays').is(':checked')) {
        optionsValues += '&displaydaysrange=' + $('#displaydayshours').val();
      }
      else {
        optionsValues += '&displaydaysrange=' + 0;
        optionsValues += '&displayhoursrange=' + $('#displaydayshours').val();
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
        message: pulseConfig.pulseTranslate ('error.machineRequired', 'Please select at least one machine')
      });
    }

    if (pulseConfig.getInt('displaydayshours') == 0) {
      missingConfigs.push({
        selector: 'label[for="displaydayshours"], label[for="displaydayshours"], .group-options',
        message: pulseConfig.pulseTranslate ('error.min1hour', 'Please select at least 1 hour')
      });
    }

    return missingConfigs;
  }

  buildContent () {
    let needReload = false;
    let url = window.location.href;
    if (-1 != url.search('showclock=')) {
      needReload = true;
      pulseConfig.set('showclock',
        pulseUtility.getURLParameter(url, 'showclock'));
      url = pulseUtility.removeURLParameter(url, 'showclock');
    }
    if (-1 != url.search('displaydaysrange=')) {
      needReload = true;
      pulseConfig.set('displaydaysrange',
        pulseUtility.getURLParameter(url, 'displaydaysrange', ''));
      url = pulseUtility.removeURLParameter(url, 'displaydaysrange');
    }
    if (-1 != url.search('displayhoursrange=')) {
      needReload = true;
      pulseConfig.set('displayhoursrange',
        pulseUtility.getURLParameter(url, 'displayhoursrange', ''));
      url = pulseUtility.removeURLParameter(url, 'displayhoursrange');
    }
    if (needReload) {
      window.open(url, '_self');
    }
    // End remove config

    // show clock
    let showclock = pulseConfig.getBool('showclock');
    if (showclock) {
      $('x-clock').show();
    }
    else {
      $('x-clock').hide();
    }

  }

}

$(document).ready(function () {
  pulsePage.preparePage(new UtilizationBarPage());
});
