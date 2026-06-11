// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

//var pulseConfig = require('pulseConfig');
import * as pulsePage from 'pulsePage';
//var pulseSvg = require('pulseSvg');

//require('libraries/pulse.exports.light.js'); // Global import
import 'x-checkconfigupdate/x-checkconfigupdate';
import 'x-checklogin/x-checklogin';
import 'x-checkcurrenttime/x-checkcurrenttime';
import 'x-checkserveraccess/x-checkserveraccess';
import 'x-checkpath/x-checkpath';
import 'x-checkversion/x-checkversion';

// Local
import 'x-bartimeselection/x-bartimeselection';
import 'x-clock/x-clock';
import 'x-cncalarmbar/x-cncalarmbar';
import 'x-cncvaluebar/x-cncvaluebar';
import 'x-currentcncvalue/x-currentcncvalue';
import 'x-currenticoncncalarm/x-currenticoncncalarm';
import 'x-currenticonnextstop/x-currenticonnextstop';
import 'x-currenticonunansweredreason/x-currenticonunansweredreason';
import 'x-currenticonworkinformation/x-currenticonworkinformation';
import 'x-currentsequence/x-currentsequence';
import 'x-currenttool/x-currenttool';
import 'x-currentworkinfo/x-currentworkinfo';
import 'x-cycleprogressbar/x-cycleprogressbar';
import 'x-cycleprogresspie/x-cycleprogresspie';
import 'x-cyclesinperiod/x-cyclesinperiod';
import 'x-datetimegraduation/x-datetimegraduation';
import 'x-datetimepicker/x-datetimepicker';
import 'x-datetimerange/x-datetimerange';
import 'x-detailedalarmsat/x-detailedalarmsat';
import 'x-detailedcncvaluesat/x-detailedcncvaluesat';
import 'x-detailedisofileat/x-detailedisofileat';
import 'x-detailedmachinestateat/x-detailedmachinestateat';
import 'x-detailedobservationstateat/x-detailedobservationstateat';
import 'x-detailedpartsat/x-detailedpartsat';
import 'x-detailedoperationcycleat/x-detailedoperationcycleat';
import 'x-detailedreasonat/x-detailedreasonat';
import 'x-detailedsequenceat/x-detailedsequenceat';
import 'x-detailedshiftat/x-detailedshiftat';
import 'x-detailedworkinfoat/x-detailedworkinfoat';
import 'x-fieldlegends/x-fieldlegends';
import 'x-freetext/x-freetext';
import 'x-highlightperiodsbar/x-highlightperiodsbar';
import 'x-isofileslotbar/x-isofileslotbar';
import 'x-lastmachinestatetemplate/x-lastmachinestatetemplate';
import 'x-lastmachinestatus/x-lastmachinestatus';
import 'x-lastserialnumber/x-lastserialnumber';
import 'x-lastshift/x-lastshift';
import 'x-lastworkinformation/x-lastworkinformation';
import 'x-lastworkinformationbar/x-lastworkinformationbar';
import 'x-machinedisplay/x-machinedisplay';
import 'x-machinemodecolorlegends/x-machinemodecolorlegends';
import 'x-machinemodelegends/x-machinemodelegends';
import 'x-machineselection/x-machineselection';
import 'x-machinestatebar/x-machinestatebar';
import 'x-machinetab/x-machinetab';
import 'x-message/x-message';
import 'x-modificationmanager/x-modificationmanager';
import 'x-motionpercentage/x-motionpercentage';
import 'x-motiontime/x-motiontime';
import 'x-observationstatebar/x-observationstatebar';
import 'x-operationcyclebar/x-operationcyclebar';
import 'x-operationprogresspie/x-operationprogresspie';
import 'x-operationslotbar/x-operationslotbar';
import 'x-performancebar/x-performancebar';
import 'x-performancegauge/x-performancegauge';
import 'x-performancetarget/x-performancetarget';
import 'x-periodmanager/x-periodmanager';
import 'x-periodtoolbar/x-periodtoolbar';
import 'x-production/x-production';
import 'x-productionmachiningstatus/x-productionmachiningstatus';
import 'x-reasonbutton/x-reasonbutton';
import 'x-reasongroups/x-reasongroups';
import 'x-reasonslotbar/x-reasonslotbar';
import 'x-reasonslotlist/x-reasonslotlist';
import 'x-reasonslotpie/x-reasonslotpie';
import 'x-reasonsubdetails/x-reasonsubdetails';
import 'x-redstacklightbar/x-redstacklightbar';
import 'x-remotedisplay/x-remotedisplay';
import 'x-runningbutton/x-runningbutton';
import 'x-runninglegends/x-runninglegends';
import 'x-runningslotbar/x-runningslotbar';
import 'x-runningslotpie/x-runningslotpie';
import 'x-savemachinestatetemplate/x-savemachinestatetemplate';
import 'x-savereason/x-savereason';
import 'x-saveserialnumber/x-saveserialnumber';
import 'x-setupmachine/x-setupmachine';
import 'x-shiftslotbar/x-shiftslotbar';
import 'x-stacklight/x-stacklight';
import 'x-toollifemachine/x-toollifemachine';
import 'x-tr/x-tr';
import 'x-workinfo/x-workinfo';
import 'x-workinfoslotlist/x-workinfoslotlist';

class CustomPage extends pulsePage.BasePage {
  constructor() {
    super();
  }
}

function _onReady (fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}
_onReady(function () {
  pulsePage.preparePage(new CustomPage());
});
