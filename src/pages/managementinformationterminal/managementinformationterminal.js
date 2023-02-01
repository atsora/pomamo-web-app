// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseUtility = require('pulseUtility');
var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var pulseSvg = require('pulseSvg');
var eventBus = require('eventBus');
var pulseDetailsPopup = require('pulsecomponent-detailspopup');

require('x-groupsingroup/x-groupsingroup');

require('x-periodmanager/x-periodmanager');
require('x-ancestors/x-ancestors');
require('x-machinedisplay/x-machinedisplay');
require('x-workinfo/x-workinfo');
require('x-defaultpie/x-defaultpie');
require('x-freetext/x-freetext');
require('x-zoominpagebutton/x-zoominpagebutton');
require('x-showrunningdialogbutton/x-showrunningdialogbutton');

class ManagementInformationTerminalPage extends pulsePage.BasePage {
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

    // showworkinfo = Show Operation
    $('#showworkinfo').prop('checked', pulseConfig.getBool('showworkinfo'));
    if (pulseConfig.getDefaultBool('showworkinfo') != pulseConfig.getBool('showworkinfo')) {
      $('#showworkinfo').attr('overridden', 'true');
    }
    $('#showworkinfo').change(function () {
      pulseConfig.set('showworkinfo', $('#showworkinfo').is(':checked'));

      let showworkinfo = pulseConfig.getBool('showworkinfo');
      if (showworkinfo) {
        $('x-workinfo').show();
      }
      else {
        $('x-workinfo').hide();
      }
    });

    // Pie    $('#showpie').prop('checked', pulseConfig.getBool('showpie'));
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
    });

    // Inside pie
    $('#productionpercentinpie').prop('checked', 'true' == pulseConfig.getString('productionpercentinpie'));
    //if (pulseConfig.getDefaultString('productionpercentinpie') != pulseConfig.getString('productionpercentinpie'))
    //$('#productionpercentinpie').attr('overridden', 'true');
    $('#productionactualonlyinpie').prop('checked', 'actualonly' == pulseConfig.getString('productionpercentinpie'));
    $('#productionactualtargetinpie').prop('checked',
      ('true' != pulseConfig.getString('productionpercentinpie')
        && ('actualonly' != pulseConfig.getString('productionpercentinpie'))));

    $('#productionpercentinpie').change(function () {
      if ($('#productionpercentinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'true');
      }
      if ($('#productionactualonlyinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'actualonly');
      }
      if ($('#productionactualtargetinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'actualtarget');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'productionpercentinpie' });
    });

    $('#productionactualtargetinpie').change(function () {
      if ($('#productionpercentinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'true');
      }
      if ($('#productionactualonlyinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'actualonly');
      }
      if ($('#productionactualtargetinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'actualtarget');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'productionpercentinpie' });
    });

    $('#productionactualonlyinpie').change(function () {
      if ($('#productionpercentinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'true');
      }
      if ($('#productionactualonlyinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'actualonly');
      }
      if ($('#productionactualtargetinpie').is(':checked')) {
        pulseConfig.set('productionpercentinpie', 'actualtarget');
      }
      eventBus.EventBus.dispatchToAll('configChangeEvent',
        { 'config': 'productionpercentinpie' });
    });

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

  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {

    // showworkinfo
    $('#showworkinfo').prop('checked', pulseConfig.getDefaultBool('showworkinfo'));
    $('#showworkinfo').change();
    $('#showworkinfo').removeAttr('overridden');

    // Pie
    let productionpercentinpie = pulseConfig.getDefaultString('productionpercentinpie');
    $('#productionpercentinpie').prop('checked', 'true' == productionpercentinpie);
    //$('#productionpercentinpie').change(); // Done below
    //$('#productionpercentinpie').removeAttr('overridden');
    $('#productionactualonlyinpie').prop('checked', 'actualonly' == productionpercentinpie);
    //$('#productionactualonlyinpie').change(); // Done below
    $('#productionactualtargetinpie').prop('checked',
      ('true' != productionpercentinpie && 'actualonly' != productionpercentinpie));
    $('#productionactualtargetinpie').change();

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
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';

    // showworkinfo
    if ($('#showworkinfo').is(':checked')) {
      optionsValues += '&showworkinfo=true';
    }
    else {
      optionsValues += '&showworkinfo=false';
    }

    // Prod in pie
    if ($('#productionpercentinpie').is(':checked')) {
      optionsValues += '&productionpercentinpie=true';
    }
    else if ($('#productionactualonlyinpie').is(':checked')) {
      optionsValues += '&productionpercentinpie=actualonly';
    }
    else {
      optionsValues += '&productionpercentinpie=actualtarget';
    }

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
        message: 'Please select at least one machine before launching the page.'
      });
    }

    return missingConfigs;
  }

  buildContent () {
    // Remove config from displayed URL and store them
    let needReload = false;
    let url = window.location.href;
    if (-1 != url.search('showworkinfo=')) {
      needReload = true;
      pulseConfig.set('showworkinfo',
        pulseUtility.getURLParameter(url, 'showworkinfo'));
      url = pulseUtility.removeURLParameter(url, 'showworkinfo');
    }
    if (-1 != url.search('productionpercentinpie=')) {
      needReload = true;
      pulseConfig.set('productionpercentinpie',
        pulseUtility.getURLParameter(url, 'productionpercentinpie', ''));
      url = pulseUtility.removeURLParameter(url, 'productionpercentinpie');
    }
    if (-1 != url.search('toollabelname=')) {
      needReload = true;
      pulseConfig.set('toollabelname',
        pulseUtility.getURLParameter(url, 'toollabelname', ''));
      url = pulseUtility.removeURLParameter(url, 'toollabelname');
    }

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

    if (needReload) {
      window.open(url, '_self');
    }
    // End remove config

    // TITLE
    // Color buttons
    pulseSvg.inlineBackgroundSvg($('.mit-zoom-btn'));
    // Running button display (display according to config)
    if (pulseConfig.getBool('showRunningButton')) {
      $('.mit-show-running').show();
      // Color buttons
      pulseSvg.inlineBackgroundSvg($('.mit-show-running-btn'));

      // Click
      $('.mit-show-running-btn').click(
        function () {
          let groupId;
          if (this.hasAttribute('group')) {
            groupId = this.getAttribute('group');
          }
          else {
            if (this.hasAttribute('machine-id'))
              groupId = this.getAttribute('machine-id');
            else
              return; // Oups ! Should never happen
          }
          pulseDetailsPopup.openRunningDialog(groupId);
        });
    }
    else {
      $('.mit-show-running').hide();
    }

    //showworkinfo
    let showworkinfo = pulseConfig.getBool('showworkinfo');
    if (showworkinfo) {
      $('x-workinfo').show();
    }
    else {
      $('x-workinfo').hide();
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new ManagementInformationTerminalPage());
});
