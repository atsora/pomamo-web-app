// Copyright (C) 2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulsePage from 'pulsePage';

import 'x-tr/x-tr';

// Planning templates (atracking-webconfig, route /planning of the Vue app),
// reached from the configuration page
class VueScheduledConfigTemplatePage extends pulsePage.BasePage {
  constructor () {
    super();

    this.showMachineselection = false;
  }
}

pulsePage.preparePage(new VueScheduledConfigTemplatePage());
