// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-grouparray/x-grouparray');
require('x-machinetab/x-machinetab');
require('x-machinedisplay/x-machinedisplay');
require('x-lastserialnumber/x-lastserialnumber');
require('x-lastworkinformation/x-lastworkinformation');
require('x-lastmachinestatetemplate/x-lastmachinestatetemplate');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-unansweredreasonnumber/x-unansweredreasonnumber');
require('x-reasonbutton/x-reasonbutton');
require('x-periodmanager/x-periodmanager');
require('x-datetimegraduation/x-datetimegraduation');
require('x-barstack/x-barstack');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');

require('x-savemachinestatetemplate/x-savemachinestatetemplate');
require('x-sequencebar/x-sequencebar'); // to remove 6.0
require('x-cycleprogressbar/x-cycleprogressbar');
require('x-performancebar/x-performancebar');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-toollifemachine/x-toollifemachine');

require('x-cyclesinperiod/x-cyclesinperiod');

require('x-reasongroups/x-reasongroups');
require('x-fieldlegends/x-fieldlegends');
require('x-machinemodelegends/x-machinemodelegends');

// Pies
require('x-partproductionstatuspie/x-partproductionstatuspie');
require('x-performancegauge/x-performancegauge');

require('x-tr/x-tr');

class MachinesPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
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

    return missingConfigs;
  }

  buildContent () {
    // find components to display
    let componentsToDisplay = pulseConfig.getArray('componentsToDisplay', []);
    let componentsString = componentsToDisplay.join(',');
    console.log('Components to display: ' + componentsString);

    $('.machine-component').hide(); // Hide all - Not possible in css :(
    $('.tile-title x-reasonbutton').hide();
    $('.title-lastmachinestatus').hide();

    for (let i = 0; i < componentsToDisplay.length; i++) {
      $(componentsToDisplay[i]).parents('.machine-component').show();

      if (componentsToDisplay[i] == 'coloredbar') {
        $('.div-bar-and-percent').parents('.machine-component').show();
      }
      if (componentsToDisplay[i] == 'coloredbarwithpercent') {
        $('.div-bar-and-percent').parents('.machine-component').show();
        $('.right-percent').show();
      }
      if (componentsToDisplay[i] == 'x-reasonbutton') {
        $('.tile-title x-reasonbutton').show();
      }
      if (componentsToDisplay[i] == 'title-lastmachinestatus') {
        $('.title-lastmachinestatus').show();
      }
    }
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new MachinesPage());
});