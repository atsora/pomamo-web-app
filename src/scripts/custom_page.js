// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

//var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
//var pulseSvg = require('pulseSvg');

//require('libraries/pulse.exports.light.js'); // Global import
require('x-checkconfigupdate/x-checkconfigupdate');
require('x-checklogin/x-checklogin');
require('x-checkcurrenttime/x-checkcurrenttime');
require('x-checkserveraccess/x-checkserveraccess');
require('x-checkpath/x-checkpath');
require('x-checkversion/x-checkversion');

// Local
require('x-bartimeselection/x-bartimeselection');
require('x-clock/x-clock');
require('x-cncalarmbar/x-cncalarmbar');
require('x-cncvaluebar/x-cncvaluebar');
require('x-currentcncvalue/x-currentcncvalue');
require('x-currenticoncncalarm/x-currenticoncncalarm');
require('x-currenticonnextstop/x-currenticonnextstop');
require('x-currenticonunansweredreason/x-currenticonunansweredreason');
require('x-currenticonworkinformation/x-currenticonworkinformation');
require('x-currentsequence/x-currentsequence');
require('x-currenttool/x-currenttool');
require('x-currentworkinfo/x-currentworkinfo');
require('x-cycleprogressbar/x-cycleprogressbar');
require('x-cycleprogresspie/x-cycleprogresspie');
require('x-cyclesinperiod/x-cyclesinperiod');
require('x-datetimegraduation/x-datetimegraduation');
require('x-datetimepicker/x-datetimepicker');
require('x-datetimerange/x-datetimerange');
require('x-detailedalarmsat/x-detailedalarmsat');
require('x-detailedcncvaluesat/x-detailedcncvaluesat');
require('x-detailedisofileat/x-detailedisofileat');
require('x-detailedmachinestateat/x-detailedmachinestateat');
require('x-detailedobservationstateat/x-detailedobservationstateat');
require('x-detailedpartsat/x-detailedpartsat');
require('x-detailedoperationcycleat/x-detailedoperationcycleat');
require('x-detailedreasonat/x-detailedreasonat');
require('x-detailedsequenceat/x-detailedsequenceat');
require('x-detailedshiftat/x-detailedshiftat');
require('x-detailedworkinfoat/x-detailedworkinfoat');
require('x-fieldlegends/x-fieldlegends');
require('x-freetext/x-freetext');
require('x-grouparray/x-grouparray');
require('x-highlightperiodsbar/x-highlightperiodsbar');
require('x-isofileslotbar/x-isofileslotbar');
require('x-lastmachinestatetemplate/x-lastmachinestatetemplate');
require('x-lastmachinestatus/x-lastmachinestatus');
require('x-lastserialnumber/x-lastserialnumber');
require('x-lastshift/x-lastshift');
require('x-lastworkinformation/x-lastworkinformation');
require('x-machinedisplay/x-machinedisplay');
require('x-machinemodecolorlegends/x-machinemodecolorlegends');
require('x-machinemodelegends/x-machinemodelegends');
require('x-machineselection/x-machineselection');
require('x-machinestatebar/x-machinestatebar');
require('x-machinetab/x-machinetab');
require('x-message/x-message');
require('x-modificationmanager/x-modificationmanager');
require('x-motionpercentage/x-motionpercentage');
require('x-motiontime/x-motiontime');
require('x-observationstatebar/x-observationstatebar');
require('x-operationcyclebar/x-operationcyclebar');
require('x-operationprogresspie/x-operationprogresspie');
require('x-operationslotbar/x-operationslotbar');
require('x-performancebar/x-performancebar');
require('x-performancegauge/x-performancegauge');
require('x-performancetarget/x-performancetarget');
require('x-periodmanager/x-periodmanager');
require('x-periodtoolbar/x-periodtoolbar');
require('x-production/x-production');
require('x-productionmachiningstatus/x-productionmachiningstatus');
require('x-reasonbutton/x-reasonbutton');
require('x-reasongroups/x-reasongroups');
require('x-reasonslotbar/x-reasonslotbar');
require('x-reasonslotlist/x-reasonslotlist');
require('x-reasonslotpie/x-reasonslotpie');
require('x-reasonsubdetails/x-reasonsubdetails');
require('x-redstacklightbar/x-redstacklightbar');
require('x-remotedisplay/x-remotedisplay');
require('x-runningbutton/x-runningbutton');
require('x-runninglegends/x-runninglegends');
require('x-runningslotbar/x-runningslotbar');
require('x-runningslotpie/x-runningslotpie');
require('x-savemachinestatetemplate/x-savemachinestatetemplate');
require('x-savereason/x-savereason');
require('x-saveserialnumber/x-saveserialnumber');
require('x-sequencebar/x-sequencebar');
require('x-setupmachine/x-setupmachine');
require('x-shiftslotbar/x-shiftslotbar');
require('x-stacklight/x-stacklight');
require('x-toollifemachine/x-toollifemachine');
require('x-tr/x-tr');
require('x-workinfo/x-workinfo');
require('x-workinfoslotlist/x-workinfoslotlist');

class CustomPage extends pulsePage.BasePage {
  constructor() {
    super();
  }
}

$(document).ready(function () {
  pulsePage.preparePage(new CustomPage());
});
