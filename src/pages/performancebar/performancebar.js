// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-periodmanager/x-periodmanager');
require('x-performancebar/x-performancebar');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');

require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-grouparray/x-grouparray');
require('x-tr/x-tr');

class PerformanceBarPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  // CONFIG PANEL - Init
  initOptionValues() {
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

    const updateMotionDisplay = (display) => {
      const showPercent = display === 'percent';
      if (showPercent) {
        $('.performancebar-percent-position x-motionpercentage').show();
        $('.performancebar-percent-position x-motiontime').hide();
      }
      else {
        $('.performancebar-percent-position x-motionpercentage').hide();
        $('.performancebar-percent-position x-motiontime').show();
      }
    };

    $('#showmotionpercentage').prop('checked', pulseConfig.getBool('showmotionpercentage'));
    if (pulseConfig.getDefaultBool('showmotionpercentage') != pulseConfig.getBool('showmotionpercentage')) {
      $('#showmotionpercentage').attr('overridden', 'true');
    }
    $('#showmotionpercentage').change(function () {
      const showMotionPercentage = $('#showmotionpercentage').is(':checked');
      pulseConfig.set('showmotionpercentage', showMotionPercentage);
      if (showMotionPercentage) {
        $('.performancebar-percent-position').show();
        $('.showmotionpercentagedetails').show();
      }
      else {
        $('.performancebar-percent-position').hide();
        $('.showmotionpercentagedetails').hide();
      }
    });

    const motionDisplayMap = {
      percent: 'motiondisplaypercent',
      time: 'motiondisplaytime'
    };
    syncRadioGroup(pulseConfig.getString('showmotiondisplay'), motionDisplayMap, 'percent');
    bindRadioGroup(motionDisplayMap, (value) => {
      pulseConfig.set('showmotiondisplay', value);
      updateMotionDisplay(value);
    });

    updateMotionDisplay(pulseConfig.getString('showmotiondisplay') || 'percent');
    $('#showmotionpercentage').trigger('change');
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues() {
    const setDefaultChecked = (id, configKey = id, { trigger = true, clearOverride = true } = {}) => {
      const element = $('#' + id);
      element.prop('checked', pulseConfig.getDefaultBool(configKey));
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

    setDefaultChecked('showmotionpercentage');
    setDefaultRadioGroup(pulseConfig.getDefaultString('showmotiondisplay'), {
      percent: 'motiondisplaypercent',
      time: 'motiondisplaytime'
    });
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const options = [
      { id: 'showmotionpercentage', type: 'checkbox' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el) return '';
      return `&${opt.id}=${el.checked}`;
    }).join('');

    if (document.getElementById('motiondisplaypercent')?.checked) {
      result += '&showmotiondisplay=percent';
    } else if (document.getElementById('motiondisplaytime')?.checked) {
      result += '&showmotiondisplay=time';
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
        message: pulseConfig.pulseTranslate ('error.machineRequired', 'Please select at least one machine')
      });
    }

    return missingConfigs;
  }

  buildContent() {
  }
}

$(document).ready(function() {
  pulsePage.preparePage(new PerformanceBarPage());
});
