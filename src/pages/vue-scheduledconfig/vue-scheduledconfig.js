// Copyright (C) 2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulsePage from 'pulsePage';

import 'x-tr/x-tr';

// Machine planning: the planning templates applied on the machines (atracking-webconfig, route /machinePlanning of the Vue app),
// reached from the configuration page
class VueScheduledConfigPage extends pulsePage.BasePage {
  // The machine planning uses the machine selection of the page
}

pulsePage.preparePage(new VueScheduledConfigPage());
