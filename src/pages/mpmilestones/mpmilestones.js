// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-milestonesmanager/x-milestonesmanager');
require('x-machinedisplay/x-machinedisplay');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

class MilestonesPage extends pulsePage.BasePage {
  constructor() {
    super();
    this.showMachineselection = true;
  }

  // CONFIG PANEL - Init
  initOptionValues() {
    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    defaultLayoutChk.prop('checked', pulseConfig.getBool('defaultlayout', true));
    if (pulseConfig.getDefaultBool('defaultlayout') !== pulseConfig.getBool('defaultlayout', true))
      defaultLayoutChk.attr('overridden', true);

    defaultLayoutChk.change(() => {
      let isDefault = defaultLayoutChk.is(':checked');
      pulseConfig.set('defaultlayout', isDefault);
      if (isDefault) {
        rotationSettings.css('opacity', '0.5').find('input').prop('disabled', true);
        machinesPerPageInput.val(12).change();
      } else {
        rotationSettings.css('opacity', '1').find('input').prop('disabled', false);
      }
    }).trigger('change');

    machinesPerPageInput.val(pulseConfig.getInt('machinesperpage', 12));
    $('#rotationdelay').val(pulseConfig.getInt('rotationdelay', 10));
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(12).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' }
    ];

    return options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      const paramName = opt.param || opt.id;
      return `&${paramName}=${el.type === 'checkbox' ? el.checked : el.value}`;
    }).join('');
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

  // This method is run only if missing config (cf getMissingConfigs)
  buildContent () {
    // Remove config from displayed URL and store them
  }

}

$(document).ready(function () {
  // Prepare the page globally
  pulsePage.preparePage(new MilestonesPage());
});
