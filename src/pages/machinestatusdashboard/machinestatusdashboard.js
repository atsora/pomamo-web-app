// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseConfig from 'pulseConfig';
import { DashboardBasePage, setDisplayAll, startDashboardPage } from '../machinedashboard/dashboardbase';

import 'x-machinetab/x-machinetab';
import 'x-machinetabnav/x-machinetabnav';
import 'x-machinedisplay/x-machinedisplay';
import 'x-lastmachinestatus/x-lastmachinestatus';
import 'x-unansweredreasonnumber/x-unansweredreasonnumber';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-barstack/x-barstack'; // pulls in all bar components
import 'x-toollifemachine/x-toollifemachine';
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
import 'x-performancegauge/x-performancegauge';
import 'x-motionpercentage/x-motionpercentage';
import 'x-motiontime/x-motiontime';
import 'x-periodmanager/x-periodmanager';
import 'x-currenticoncncalarm/x-currenticoncncalarm';
import 'x-lastmachinestatetemplate/x-lastmachinestatetemplate';

/**
 * Machine status dashboard page — same layout as the machine dashboard
 * (machinedashboard), focused on the status of the machine instead of the
 * produced parts: a performance gauge (x-performancegauge, utilization on the
 * period with its target) replaces the production gauge, bar and tracker graph.
 *
 * Configurable options, in addition to the ones of DashboardBasePage
 * (tools, stop classification, task list, alarms):
 *  - `showmotionpercentage` : utilization value under the gauge
 *  - `showmotiondisplay`    : that value in percent (`percent`) or in time (`time`)
 *  - `showproduction`       : part count (x-production + x-productionshiftgoal)
 *  - `showpie`              : pie (x-defaultpie)
 *
 * @extends DashboardBasePage
 */
class machinestatusdashboardPage extends DashboardBasePage {
  constructor () {
    super('machinestatusdashboard');
  }

  /**
   * Shows x-motionpercentage or x-motiontime, according to the options.
   */
  _applyMotionDisplay () {
    const show = pulseConfig.getBool('showmotionpercentage');
    const isTime = (pulseConfig.getString('showmotiondisplay') === 'time');
    setDisplayAll('x-motionpercentage', (show && !isTime) ? '' : 'none');
    setDisplayAll('x-motiontime', (show && isTime) ? '' : 'none');
    setDisplayAll('.showmotionpercentagedetails', show ? '' : 'none');
  }

  /**
   * Initializes the options panel: the shared options (DashboardBasePage), then
   * the ones of the status dashboard.
   */
  initOptionValues () {
    super.initOptionValues();

    // Utilization in percent or in time
    this.bindCheckbox('showmotionpercentage', () => this._applyMotionDisplay());
    const percentRadio = document.getElementById('motiondisplaypercent');
    const timeRadio = document.getElementById('motiondisplaytime');
    if (percentRadio && timeRadio) {
      const isTime = (pulseConfig.getString('showmotiondisplay') === 'time');
      timeRadio.checked = isTime;
      percentRadio.checked = !isTime;
      if (pulseConfig.getDefaultString('showmotiondisplay') !== pulseConfig.getString('showmotiondisplay')) {
        percentRadio.setAttribute('overridden', 'true');
        timeRadio.setAttribute('overridden', 'true');
      }
      const onChange = () => {
        pulseConfig.set('showmotiondisplay', timeRadio.checked ? 'time' : 'percent');
        this._applyMotionDisplay();
      };
      percentRadio.addEventListener('change', onChange);
      timeRadio.addEventListener('change', onChange);
    }

    // Part count
    this.bindCheckbox('showproduction',
      show => setDisplayAll('.numbers-content', show ? '' : 'none'));

    // Pie
    this.bindCheckbox('showpie',
      show => setDisplayAll('x-defaultpie', show ? '' : 'none'));
  }

  /**
   * Resets all options to their default values (panel "reset" button).
   */
  setDefaultOptionValues () {
    super.setDefaultOptionValues();

    this.setDefaultChecked('showmotionpercentage');
    this.setDefaultRadioGroup(pulseConfig.getDefaultString('showmotiondisplay') === 'time' ? 'time' : 'percent', {
      percent: 'motiondisplaypercent',
      time: 'motiondisplaytime'
    });
    this.setDefaultChecked('showproduction');
    this.setDefaultChecked('showpie');
  }

  /**
   * Options exported in the URL. The time radio is exported as `showmotiondisplay`
   * in getOptionValues (a string, not a boolean).
   */
  getOptionDescriptors () {
    return [
      ...super.getOptionDescriptors(),
      { id: 'showmotionpercentage', type: 'checkbox' },
      { id: 'showproduction', type: 'checkbox' },
      { id: 'showpie', type: 'checkbox' }
    ];
  }

  getOptionValues () {
    const timeRadio = document.getElementById('motiondisplaytime');
    const motionDisplay = timeRadio
      ? `&showmotiondisplay=${timeRadio.checked ? 'time' : 'percent'}`
      : '';
    return super.getOptionValues() + motionDisplay;
  }

  /**
   * Applies the current configuration to DOM components.
   */
  buildContent () {
    super.buildContent();

    this._applyMotionDisplay();
    setDisplayAll('.numbers-content', pulseConfig.getBool('showproduction') ? '' : 'none');
    setDisplayAll('x-defaultpie', pulseConfig.getBool('showpie') ? '' : 'none');
  }
}

startDashboardPage(() => new machinestatusdashboardPage());
