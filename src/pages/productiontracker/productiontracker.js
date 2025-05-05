// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseUtility = require('pulseUtility');
var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var eventBus = require('eventBus');

require('x-groupsingroup/x-groupsingroup');

require('x-periodmanager/x-periodmanager');
require('x-ancestors/x-ancestors');
require('x-machinedisplay/x-machinedisplay');
require('x-productiontrackertable/x-productiontrackertable');
require('x-tr/x-tr');

class ProductionTrackerPage extends pulsePage.BasePage {
  constructor() {
    super();

    this.canConfigureColumns = false;
    this.canConfigureRows = false;
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  // CONFIG PANEL - Init
  initOptionValues () {
    // Prepare custom inputs / Visibilities

    // Highlight part count
    if (pulseConfig.getDefaultBool('thresholdunitispart') != pulseConfig.getBool('thresholdunitispart'))
      $('#thresholdunitispart').attr('overridden', 'true');
    $('#thresholdunitispart').prop('checked', pulseConfig.getBool('thresholdunitispart'));
    $('#thresholdunitispercent').prop('checked', !pulseConfig.getBool('thresholdunitispart'));

    $('#thresholdunitispart').change(function () {
      pulseConfig.set('thresholdunitispart', $('#thresholdunitispart').is(':checked'));
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'thresholdunitispart' });
    });
    $('#thresholdunitispercent').change(function () {
      pulseConfig.set('thresholdunitispart', !$('#thresholdunitispercent').is(':checked'));
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'thresholdunitispart' });
    });

    $('#thresholdorangeproduction').val(pulseConfig.getInt('thresholdorangeproduction'));
    var changeOrange = function () {
      $(this).attr('overridden', true);
      // Store
      if (pulseUtility.isInteger($('#thresholdorangeproduction').val())) {
        pulseConfig.set('thresholdorangeproduction', $('#thresholdorangeproduction').val());
        // Display / Dispatch
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'thresholdorangeproduction' });
      }
    };
    $('#thresholdorangeproduction').bind('input', changeOrange);
    $('#thresholdorangeproduction').change(changeOrange);

    $('#thresholdredproduction').val(pulseConfig.getInt('thresholdredproduction'));
    var changeRed = function () {
      $(this).attr('overridden', true);
      // Store
      if (pulseUtility.isInteger($('#thresholdredproduction').val())) {
        pulseConfig.set('thresholdredproduction', $('#thresholdredproduction').val());
        // Display / Dispatch
        eventBus.EventBus.dispatchToAll('configChangeEvent',
          { 'config': 'thresholdredproduction' });
      }
    };
    $('#thresholdredproduction').bind('input', changeRed);
    $('#thresholdredproduction').change(changeRed);

    // showreservecapacity
    $('#showreservecapacity').prop('checked', pulseConfig.getBool('showreservecapacity'));
    if (pulseConfig.getDefaultBool('showreservecapacity') != pulseConfig.getBool('showreservecapacity')) {
      $('#showreservecapacity').attr('overridden', 'true');
    }
    $('#showreservecapacity').change(function () {
      pulseConfig.set('showreservecapacity', $('#showreservecapacity').is(':checked'));

      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'showreservecapacity' });
    });

  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
    // Highlight
    $('#thresholdunitispart').prop('checked', pulseConfig.getDefaultBool('thresholdunitispart'));
    $('#thresholdunitispart').change();
    $('#thresholdunitispart').removeAttr('overridden');

    $('#thresholdunitispercent').prop('checked', !pulseConfig.getDefaultBool('thresholdunitispart'));
    $('#thresholdunitispercent').change();

    $('#thresholdorangeproduction').val(pulseConfig.getDefaultInt('thresholdorangeproduction'));
    $('#thresholdorangeproduction').change();
    $('#thresholdorangeproduction').removeAttr('overridden');

    $('#thresholdredproduction').val(pulseConfig.getDefaultInt('thresholdredproduction'));
    $('#thresholdredproduction').change();
    $('#thresholdredproduction').removeAttr('overridden');

    // showreservecapacity
    $('#showreservecapacity').prop('checked', pulseConfig.getDefaultBool('showreservecapacity'));
    $('#showreservecapacity').change();
    $('#showreservecapacity').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';

    // Highlight
    let thresholdunitispart = $('#thresholdunitispart').is(':checked');
    if (thresholdunitispart)
      optionsValues += '&thresholdunitispart=true';
    else
      optionsValues += '&thresholdunitispart=false';

    if (pulseUtility.isInteger($('#thresholdorangeproduction').val())) {
      optionsValues += '&thresholdorangeproduction=' + $('#thresholdorangeproduction').val();
    }
    if (pulseUtility.isInteger($('#thresholdredproduction').val())) {
      optionsValues += '&thresholdredproduction=' + $('#thresholdredproduction').val();
    }

    // showreservecapacity
    if ($('#showreservecapacity').is(':checked')) {
      optionsValues += '&showreservecapacity=true';
    }
    else {
      optionsValues += '&showreservecapacity=false';
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
        message: pulseConfig.pulseTranslate ('error.machineRequired','Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  buildContent () {
    // Remove config from displayed URL and store them
    let needReload = false;
    let url = window.location.href;
    if (-1 != url.search('thresholdunitispart=')) {
      needReload = true;
      pulseConfig.set('thresholdunitispart',
        pulseUtility.getURLParameter(url, 'thresholdunitispart'));
      url = pulseUtility.removeURLParameter(url, 'thresholdunitispart');
    }
    if (-1 != url.search('thresholdorangeproduction=')) {
      needReload = true;
      pulseConfig.set('thresholdorangeproduction',
        pulseUtility.getURLParameter(url, 'thresholdorangeproduction'));
      url = pulseUtility.removeURLParameter(url, 'thresholdorangeproduction');
    }
    if (-1 != url.search('thresholdorangeproduction=')) {
      needReload = true;
      pulseConfig.set('thresholdorangeproduction',
        pulseUtility.getURLParameter(url, 'thresholdorangeproduction'));
      url = pulseUtility.removeURLParameter(url, 'thresholdorangeproduction');
    }
    if (-1 != url.search('showreservecapacity=')) {
      needReload = true;
      pulseConfig.set('showreservecapacity',
        pulseUtility.getURLParameter(url, 'showreservecapacity'));
      url = pulseUtility.removeURLParameter(url, 'showreservecapacity');
    }

    if (needReload) {
      window.open(url, '_self');
    }
    // End remove config
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new ProductionTrackerPage());
});
