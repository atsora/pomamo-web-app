// Copyright (C) 2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulsePage from 'pulsePage';

import 'x-tr/x-tr';

// Configuration of the reasons (atracking-webconfig, route /reasons of the Vue app),
// reached from the configuration page
class VueReasonConfigPage extends pulsePage.BasePage {
  constructor () {
    super();

    this.showMachineselection = false;
  }
}

pulsePage.preparePage(new VueReasonConfigPage());
