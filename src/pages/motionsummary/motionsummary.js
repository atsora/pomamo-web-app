// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
//var pulseUtility = require('pulseUtility');
var pulsePage = require('pulsePage');

require('x-reasonbutton/x-reasonbutton');
require('x-machinedisplay/x-machinedisplay');
require('x-machinemodelegends/x-machinemodelegends');
require('x-reasongroups/x-reasongroups');
require('x-grouparray/x-grouparray');


class MotionSummaryPage extends pulsePage.BasePage {
  constructor() {
    super();
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
    //let machinesArray = pulseConfig.getArray('machine');
    //let machinesString = machinesArray.join();
    // PREPARE CONTENT : done in html
    /*let main_div = $('<div></div>').addClass('motionsummary-main');
    let tag_group = pulseUtility.createjQueryElementWithAttribute('x-grouparray',
      {
        'templateid': 'boxtoclone'
        //'group': machinesString // 'D1', 
        // 'machine'
        //'column': pulseConfig.getInt('column', 3)
        //, 'row': pulseConfig.getInt('row', 2)
        // templateid : boxtoclone -> 
      });
    main_div.append(tag_group);
    $('.pulse-mainarea-inner').append(main_div);*/
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new MotionSummaryPage());
});
