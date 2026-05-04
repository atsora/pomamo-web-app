// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-periodmanager/x-periodmanager');
require('x-performancegauge/x-performancegauge');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');

require('x-groupgrid/x-groupgrid');
require('x-rotationprogress/x-rotationprogress');
require('x-tr/x-tr');

/**
 * Performance Gauge page — grid view of performance gauges per machine.
 *
 * Displays a grid (x-groupgrid) with, for each machine, a performance gauge
 * (x-performancegauge) and an optional motion indicator (x-motionpercentage or x-motiontime).
 *
 * Configurable options:
 *  - `defaultlayout` / `machinesperpage` / `rotationdelay` : rotation (default: 12 machines/page)
 *  - `showmotionpercentage` : show the motion indicator
 *  - `showmotiondisplay`    : indicator type — 'percent' (x-motionpercentage) or 'time' (x-motiontime)
 *
 * Identical option structure to performancebar.js — only the main component
 * (x-performancegauge vs x-performancebar) and the default machinesperpage (12 vs 16) differ.
 *
 * Components: x-groupgrid, x-performancegauge, x-machinedisplay,
 * x-motionpercentage, x-motiontime, x-periodmanager, x-reasonbutton,
 * x-machinemodelegends, x-reasongroups, x-rotationprogress.
 *
 * @extends pulsePage.BasePage
 */
class PerformanceGaugePage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * Initializes the options panel and binds all listeners.
   *
   * Rotation layout: `defaultlayout` checkbox grays out inputs when checked,
   * default 12 machines/page.
   *
   * Motion management (two nested levels):
   *  1. `showmotionpercentage` (checkbox): enables/disables motion display
   *     and shows/hides the `.showmotionpercentagedetails` option group.
   *  2. `showmotiondisplay` (percent/time radios): switches between x-motionpercentage
   *     and x-motiontime (mutually exclusive, via `updateMotionDisplay`).
   *
   * Local helpers:
   *  - `syncRadioGroup`      : checks the radio matching a config value
   *  - `bindRadioGroup`      : binds listeners on a radio group via a value→id map
   *  - `updateMotionDisplay` : applies show/hide based on the selected mode
   *
   * Configs read/written: `defaultlayout`, `machinesperpage`, `rotationdelay`,
   *                       `showmotionpercentage`, `showmotiondisplay`.
   */
  // CONFIG PANEL - Init
  initOptionValues() {
    const defaultLayoutChk = $('#defaultlayout');
    const rotationSettings = $('.rotation-settings');
    const machinesPerPageInput = $('#machinesperpage');

    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    let isLive = tmpContexts && tmpContexts.includes('live');

    if (!isLive) {
      defaultLayoutChk.closest('.param-row').hide();
      defaultLayoutChk.parent().hide();
      rotationSettings.hide();
      pulseConfig.set('defaultlayout', false);
      pulseConfig.set('machinesperpage', 10000);
      defaultLayoutChk.prop('checked', false);
      machinesPerPageInput.val(10000);
      // Scroll & grid sizing handled by .pulse-content:not(.appcontext-live) overrides in performancegauge.less
    } else {
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

    // Show percent
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
        $('x-motionpercentage').show();
        $('x-motiontime').hide();
      }
      else {
        $('x-motionpercentage').hide();
        $('x-motiontime').show();
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
        $('x-motionpercentage, x-motiontime').show();
        $('.showmotionpercentagedetails').show();
        updateMotionDisplay(pulseConfig.getString('showmotiondisplay') || 'percent');
      }
      else {
        $('x-motionpercentage, x-motiontime').hide();
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

  /**
   * Resets all options to their default values.
   *
   * Layout: directly forces defaultlayout=checked, machinesperpage=12, rotationdelay=10.
   * Motion: uses `setDefaultChecked` and `setDefaultRadioGroup` helpers.
   */
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

    // Layout
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(12).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');

    setDefaultChecked('showmotionpercentage');
    setDefaultRadioGroup(pulseConfig.getDefaultString('showmotiondisplay'), {
      percent: 'motiondisplaypercent',
      time: 'motiondisplaytime'
    });
  }

  /**
   * Serializes active options as URL query string parameters.
   *
   * Hidden elements (e.g. rotation options) are skipped.
   * `showmotiondisplay` is appended separately after the main options map.
   *
   * @returns {string} Query string fragment.
   */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues() {
    const options = [
      { id: 'defaultlayout', type: 'checkbox' },
      { id: 'machinesperpage', type: 'value' },
      { id: 'rotationdelay', type: 'value' },
      { id: 'showmotionpercentage', type: 'checkbox' }
    ];

    let result = options.map(opt => {
      const el = document.getElementById(opt.id);
      if (!el || $(el).is(':hidden')) return '';
      const paramName = opt.param || opt.id;
      if (opt.type === 'value') return `&${paramName}=${el.value}`;
      return `&${paramName}=${el.checked}`;
    }).join('');

    if (document.getElementById('motiondisplaypercent')?.checked) {
      result += '&showmotiondisplay=percent';
    } else if (document.getElementById('motiondisplaytime')?.checked) {
      result += '&showmotiondisplay=time';
    }

    return result;
  }

  /**
   * Checks that the minimum required configuration is present before rendering.
   * Blocks rendering if no machine or group is selected.
   *
   * @returns {Array<{selector: string, message: string}>} List of missing configs.
   */
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

  /**
   * Applies the current configuration to DOM components.
   *
   * Motion indicator logic (two-level):
   *  - If `showmotionpercentage` is false → hide both x-motionpercentage and x-motiontime.
   *  - If true → show only the one matching `showmotiondisplay` ('percent' or 'time').
   */
  buildContent() {
    let showMotionPercentage = pulseConfig.getBool('showmotionpercentage');
    let display = pulseConfig.getString('showmotiondisplay') || 'percent';
    let showPercent = (display === 'percent');

    if (showMotionPercentage) {
      if (showPercent) {
        $('x-motionpercentage').show();
        $('x-motiontime').hide();
      } else {
        $('x-motionpercentage').hide();
        $('x-motiontime').show();
      }
    } else {
      $('x-motionpercentage').hide();
      $('x-motiontime').hide();
    }
  }
}

$(document).ready(function() {
  pulsePage.preparePage(new PerformanceGaugePage());
});
