// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulsePage = require('pulsePage');
var pulseConfig = require('pulseConfig');

require('x-tr/x-tr');

/**
 * Home page — landing view, mostly static welcome content.
 *
 * No options panel, no machine selection required (`getMissingConfigs`
 * returns an empty list so the missing-config dialog stays closed).
 * The `#homebtn` navigation entry is disabled at startup since the user
 * is already on it.
 *
 * Components: x-tr.
 *
 * @extends pulsePage.BasePage
 */
class HomePage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * No required configuration — the home page is always renderable.
   *
   * @returns {Array<{selector: string, message: string}>} Empty list.
   */
  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

}

if (document.readyState !== 'loading') {
  const homeBtnEl = document.getElementById('homebtn');
  if (homeBtnEl) {
    homeBtnEl.classList.add('disabled');
  }
  pulsePage.preparePage(new HomePage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    const homeBtnEl = document.getElementById('homebtn');
    if (homeBtnEl) {
      homeBtnEl.classList.add('disabled');
    }
    pulsePage.preparePage(new HomePage());
  });
}
