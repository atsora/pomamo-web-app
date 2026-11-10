// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import * as eventBus from 'eventBus';
import { DashboardBasePage, setEach, setDisplayAll, startDashboardPage } from './dashboardbase';

import 'x-machinetab/x-machinetab';
import 'x-machinetabnav/x-machinetabnav';
import 'x-machinedisplay/x-machinedisplay';
import 'x-lastmachinestatus/x-lastmachinestatus';
import 'x-unansweredreasonnumber/x-unansweredreasonnumber';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-barstack/x-barstack'; // pulls in all bar components
import 'x-toollifemachine/x-toollifemachine';
import 'x-productiontrackergraph/x-productiontrackergraph';
import 'x-taskslist/x-taskslist';
import 'x-reasongroups/x-reasongroups';
import 'x-fieldlegends/x-fieldlegends';
import 'x-machinemodelegends/x-machinemodelegends';
import 'x-productionshiftgoal/x-productionshiftgoal';
import 'x-workinfo/x-workinfo';
import 'x-production/x-production';
import 'x-tr/x-tr';
import 'x-openstopclassificationlistener/x-openstopclassificationlistener';
import 'x-defaultpie/x-defaultpie';
import 'x-motionpercentage/x-motionpercentage';
/* require('x-scrapstatus/x-scrapstatus'); */
import 'x-periodmanager/x-periodmanager';
import 'x-productionbar/x-productionbar';
import 'x-productiongauge/x-productiongauge';
import 'x-currenticoncncalarm/x-currenticoncncalarm';
import 'x-lastmachinestatetemplate/x-lastmachinestatetemplate';

/**
 * Machine Dashboard page — detailed per-machine dashboard, focused on the production.
 *
 * Displays a horizontal grid of machines (x-machinetab) with, for each machine,
 * a rich set of configurable components: status bars (x-barstack),
 * production tracking graph (x-productiontrackergraph), production gauge or pie chart
 * (x-productiongauge / x-defaultpie), production bar (x-productionbar),
 * changed tools (x-toollifemachine), stop classification (x-openstopclassificationlistener).
 *
 * Configurable options, in addition to the ones of DashboardBasePage
 * (tools, stop classification, task list, alarms):
 *  - `showproductiontrackergraph`    : production tracking graph
 *  - `showproductionbar`             : production bar + border
 *  - `showpercent`                   : display mode % or ratio (x-productionbar, x-productiongauge)
 *  - `showproductiondisplay`         : show production gauge/pie
 *  - `showproductiongauge`           : gauge (true) or pie chart (false)
 *  - `thresholdtargetproduction` / `thresholdredproduction` : color thresholds
 *
 * @extends DashboardBasePage
 */
class machinedashboardPage extends DashboardBasePage {
  constructor () {
    super('machinedashboard');
  }

  /**
   * Initializes the options panel and binds all UI listeners: the shared options
   * (DashboardBasePage), then the production ones.
   */
  initOptionValues () {
    super.initOptionValues();

    // --- PRODUCTION TRACKER GRAPH ---
    this.bindCheckbox('showproductiontrackergraph',
      show => setDisplayAll('x-productiontrackergraph', show ? '' : 'none'));

    // --- PRODUCTION BAR ---
    this.bindCheckbox('showproductionbar', show => {
      setDisplayAll('x-productionbar', show ? '' : 'none');
      setDisplayAll('.performancebar-bar-border', show ? '' : 'none');
    });

    // --- PERCENT VS RATIO ---
    const productionBarPercent = document.getElementById('productionbarpercent');
    const productionBarRatio = document.getElementById('productionbarratio');
    if (productionBarPercent && productionBarRatio) {
      if (pulseConfig.getBool('showpercent')) {
        productionBarPercent.checked = true;
      } else {
        productionBarRatio.checked = true;
      }
      if (pulseConfig.getDefaultBool('showpercent') !== pulseConfig.getBool('showpercent')) {
        productionBarPercent.setAttribute('overridden', 'true');
        productionBarRatio.setAttribute('overridden', 'true');
      }
      const onPercentRatioChange = function () {
        let isPercent = productionBarPercent.checked;
        pulseConfig.set('showpercent', isPercent);
        let mode = isPercent ? 'percent' : 'ratio';
        // Applies to existing elements; buildContent() will handle future clones
        setEach('x-productionbar', el => el.setAttribute('display-mode', mode));
        setEach('x-productiongauge', el => el.setAttribute('display-mode', mode));
      };
      productionBarPercent.addEventListener('change', onPercentRatioChange);
      productionBarRatio.addEventListener('change', onPercentRatioChange);
    }

    // --- SHOW PRODUCTION DISPLAY (main toggle) ---
    this.bindCheckbox('showproductiondisplay', show => {
      if (show) {
        setDisplayAll('.showproductiondisplaydetails', '');
        let isGauge = pulseConfig.getBool('showproductiongauge');
        setDisplayAll('x-productiongauge', isGauge ? '' : 'none');
        setDisplayAll('x-defaultpie', isGauge ? 'none' : '');
      } else {
        setDisplayAll('.showproductiondisplaydetails', 'none');
        setDisplayAll('x-productiongauge', 'none');
        setDisplayAll('x-defaultpie', 'none');
      }
    });

    // --- GAUGE VS PIE ---
    const productionGaugeRadio = document.getElementById('productiongauge');
    const productionPieRadio = document.getElementById('productionpie');
    if (productionGaugeRadio && productionPieRadio) {
      if (pulseConfig.getBool('showproductiongauge')) {
        productionGaugeRadio.checked = true;
      } else {
        productionPieRadio.checked = true;
      }
      if (pulseConfig.getDefaultBool('showproductiongauge') !== pulseConfig.getBool('showproductiongauge')) {
        productionGaugeRadio.setAttribute('overridden', 'true');
        productionPieRadio.setAttribute('overridden', 'true');
      }
      const onGaugePieChange = function () {
        let isGauge = productionGaugeRadio.checked;
        pulseConfig.set('showproductiongauge', isGauge);
        let productionDisplayCB = document.getElementById('showproductiondisplay');
        if (productionDisplayCB && productionDisplayCB.checked) {
          setDisplayAll('x-productiongauge', isGauge ? '' : 'none');
          setDisplayAll('x-defaultpie', isGauge ? 'none' : '');
        }
      };
      productionGaugeRadio.addEventListener('change', onGaugePieChange);
      productionPieRadio.addEventListener('change', onGaugePieChange);
    }

    // --- THRESHOLDS ---
    const thresholdTarget = document.getElementById('thresholdtargetproductionbar');
    const thresholdRedInput = document.getElementById('thresholdredproductionbar');
    if (thresholdTarget) {
      thresholdTarget.value = pulseConfig.getFloat('thresholdtargetproduction', 80);
      if (pulseConfig.getDefaultFloat('thresholdtargetproduction', 80) !== pulseConfig.getFloat('thresholdtargetproduction', 80)) {
        thresholdTarget.setAttribute('overridden', 'true');
      }
      thresholdTarget.addEventListener('change',
        () => this._verficationThresholds(thresholdTarget.value, thresholdRedInput ? thresholdRedInput.value : '', true));
    }
    if (thresholdRedInput) {
      thresholdRedInput.value = pulseConfig.getFloat('thresholdredproduction', 60);
      if (pulseConfig.getDefaultFloat('thresholdredproduction', 60) !== pulseConfig.getFloat('thresholdredproduction', 60)) {
        thresholdRedInput.setAttribute('overridden', 'true');
      }
      thresholdRedInput.addEventListener('change',
        () => this._verficationThresholds(thresholdTarget ? thresholdTarget.value : '', thresholdRedInput.value, true));
    }
  }

  /**
   * Validates and applies the production bar/gauge color thresholds.
   *
   * Same logic as oeeview._verficationThresholds — see that file for details.
   * Difference: the error container falls back to `.showproductionbardetails`
   * (instead of `.showproductiongaugedetails` in oeeview).
   *
   * On success, dispatches `configChangeEvent { config: 'thresholdsupdated' }`
   * to notify x-productionbar and x-productiongauge components.
   *
   * @param {number|string} targetValue - Target threshold (green → orange), in %.
   * @param {number|string} redValue    - Critical threshold (orange → red), in %.
   * @returns {boolean} true if valid and applied, false otherwise.
   */
  _verficationThresholds (targetValue, redValue) {
    // Find or create error message element
    let errorMessage = document.getElementById('thresholdErrorMessage');
    if (!errorMessage) {
      errorMessage = document.createElement('div');
      errorMessage.id = 'thresholdErrorMessage';
      errorMessage.style.color = 'red';
      errorMessage.style.fontSize = '0.9em';
      errorMessage.style.marginTop = '5px';
      const errorContainer = document.querySelector('.thresholdunitispart')
        || document.querySelector('.showproductionbardetails');
      if (errorContainer) {
        errorContainer.appendChild(errorMessage);
      }
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

    // store values
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

  /**
   * Resets all options to their default values (panel "reset" button).
   */
  setDefaultOptionValues () {
    super.setDefaultOptionValues();

    this.setDefaultChecked('showproductiontrackergraph');

    // Production bar
    this.setDefaultChecked('showproductionbar');
    this.setDefaultRadioGroup(pulseConfig.getDefaultBool('showpercent') ? 'percent' : 'ratio', {
      percent: 'productionbarpercent',
      ratio: 'productionbarratio'
    });

    // Production display
    this.setDefaultChecked('showproductiondisplay');
    this.setDefaultRadioGroup(pulseConfig.getDefaultBool('showproductiongauge') ? 'gauge' : 'pie', {
      gauge: 'productiongauge',
      pie: 'productionpie'
    });

    this.setDefaultValue('thresholdtargetproductionbar', pulseConfig.getDefaultFloat('thresholdtargetproduction'));
    this.setDefaultValue('thresholdredproductionbar', pulseConfig.getDefaultFloat('thresholdredproduction'));
  }

  /**
   * Options exported in the URL. Radios (productionbarpercent, productiongauge) are
   * exported via their semantic `param` (showpercent, showproductiongauge).
   */
  getOptionDescriptors () {
    return [
      ...super.getOptionDescriptors(),
      { id: 'showproductiontrackergraph', type: 'checkbox' },
      { id: 'showproductionbar', type: 'checkbox' },
      { id: 'productionbarpercent', type: 'radio', param: 'showpercent' },
      { id: 'showproductiondisplay', type: 'checkbox' },
      { id: 'productiongauge', type: 'radio', param: 'showproductiongauge' },
      { id: 'thresholdtargetproductionbar', type: 'value', param: 'thresholdtargetproduction' },
      { id: 'thresholdredproductionbar', type: 'value', param: 'thresholdredproduction' }
    ];
  }

  /**
   * Applies the current configuration to DOM components.
   *
   * Components driven, in addition to the shared ones:
   *  - `showproductiondisplay` + `showproductiongauge` → x-productiongauge / x-defaultpie
   *  - `showproductiontrackergraph`                    → x-productiontrackergraph
   *  - `showproductionbar`                             → x-productionbar + `.performancebar-bar-border`
   *  - `showpercent`                                   → `display-mode` attribute on x-productionbar + x-productiongauge
   */
  buildContent () {
    super.buildContent();

    let showproductiondisplay = pulseConfig.getBool('showproductiondisplay');
    let showproductiongauge = pulseConfig.getBool('showproductiongauge');
    if (showproductiondisplay) {
      setDisplayAll('x-productiongauge', showproductiongauge ? '' : 'none');
      setDisplayAll('x-defaultpie', showproductiongauge ? 'none' : '');
    } else {
      setDisplayAll('x-productiongauge', 'none');
      setDisplayAll('x-defaultpie', 'none');
    }

    setDisplayAll('x-productiontrackergraph', pulseConfig.getBool('showproductiontrackergraph') ? '' : 'none');

    let showproductionbar = pulseConfig.getBool('showproductionbar');
    setDisplayAll('x-productionbar', showproductionbar ? '' : 'none');
    setDisplayAll('.performancebar-bar-border', showproductionbar ? '' : 'none');

    // Apply display mode (percent/ratio) to freshly created clones
    let displayMode = pulseConfig.getBool('showpercent') ? 'percent' : 'ratio';
    setEach('x-productionbar', el => el.setAttribute('display-mode', displayMode));
    setEach('x-productiongauge', el => el.setAttribute('display-mode', displayMode));
  }
}

startDashboardPage(() => new machinedashboardPage());
