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
require('x-tr/x-tr');

class ManagementInformationTerminalPage extends pulsePage.BasePage {
  constructor() {
    super();

    this.canConfigureColumns = false;
    this.canConfigureRows = false;
    pulseConfig.set('column', '');
    pulseConfig.set('row', '');
  }

  // CONFIG PANEL - Init
  initOptionValues() {
    var self = this;
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

    $('#thresholdtargetproduction').val(pulseConfig.getInt('thresholdtargetproduction'));
    var changetarget = function () {
      // Verify thresholds
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
        // Store
        if (pulseUtility.isInteger($('#thresholdtargetproduction').val())) {
          // Display / Dispatch
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdtargetproduction' });
        }
      }
    };
    $('#thresholdtargetproduction').bind('input', changetarget);
    $('#thresholdtargetproduction').change(changetarget);

    $('#thresholdredproduction').val(pulseConfig.getInt('thresholdredproduction'));
    var changeRed = function () {
      // verify thresholds
      if (self._verficationThresholds($('#thresholdtargetproduction').val(), $('#thresholdredproduction').val())) {
        $(this).attr('overridden', true);
        // Store
        if (pulseUtility.isInteger($('#thresholdredproduction').val())) {
          // Display / Dispatch
          eventBus.EventBus.dispatchToAll('configChangeEvent',
            { 'config': 'thresholdredproduction' });
        }
      }
    };
    $('#thresholdredproduction').bind('input', changeRed);
    $('#thresholdredproduction').change(changeRed);

  }

  // Verification of thresholds
  _verficationThresholds(targetValue, redValue) {
    // Find or create error message element
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      document.querySelector('.thresholdunitispart').appendChild(errorMessage);
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

    // Store values
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

    // showworkinfo
    $('#showworkinfo').prop('checked', pulseConfig.getDefaultBool('showworkinfo'));
    $('#showworkinfo').change();
    $('#showworkinfo').removeAttr('overridden');

    // Pie
    let productionpercentinpie = pulseConfig.getDefaultString('productionpercentinpie');
    $('#productionpercentinpie').prop('checked', 'true' == productionpercentinpie);
    $('#productionactualonlyinpie').prop('checked', 'actualonly' == productionpercentinpie);
    $('#productionactualtargetinpie').prop('checked',
      ('true' != productionpercentinpie && 'actualonly' != productionpercentinpie));
    $('#productionactualtargetinpie').change();

    $('#thresholdtargetproduction').val(pulseConfig.getDefaultInt('thresholdtargetproduction'));
    $('#thresholdtargetproduction').change();
    $('#thresholdtargetproduction').removeAttr('overridden');

    $('#thresholdredproduction').val(pulseConfig.getDefaultInt('thresholdredproduction'));
    $('#thresholdredproduction').change();
    $('#thresholdredproduction').removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  // getOptionValues uses the unified options-list pattern:
  // { id, type, param?, conditional? } -> "&param=value" fragments.
  // the param element is used when id is different in the dom but could be patched if needed
  getOptionValues() {
    let optionsValues = '';

    const options = [
      { id: 'showworkinfo', type: 'checkbox' },
      { id: 'thresholdtargetproduction', type: 'value' },
      { id: 'thresholdredproduction', type: 'value' }
    ];

    // showworkinfo
    const showworkinfo = document.getElementById('showworkinfo');
    if (showworkinfo) {
      optionsValues += '&showworkinfo=' + showworkinfo.checked;
    }

    // Prod in pie - custom logic with radio buttons
    const productionpercentinpie = document.getElementById('productionpercentinpie');
    const productionactualonlyinpie = document.getElementById('productionactualonlyinpie');
    if (productionpercentinpie && productionpercentinpie.checked) {
      optionsValues += '&productionpercentinpie=true';
    } else if (productionactualonlyinpie && productionactualonlyinpie.checked) {
      optionsValues += '&productionpercentinpie=actualonly';
    } else {
      optionsValues += '&productionpercentinpie=actualtarget';
    }

    // Thresholds
    const thresholdTarget = document.getElementById('thresholdtargetproduction');
    const thresholdRed = document.getElementById('thresholdredproduction');
    if (thresholdTarget && pulseUtility.isInteger(thresholdTarget.value)) {
      optionsValues += '&thresholdtargetproduction=' + thresholdTarget.value;
    }
    if (thresholdRed && pulseUtility.isInteger(thresholdRed.value)) {
      optionsValues += '&thresholdredproduction=' + thresholdRed.value;
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
