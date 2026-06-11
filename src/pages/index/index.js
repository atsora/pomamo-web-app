// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

//var pulseConfig = require('pulseConfig');
import * as pulsePage from 'pulsePage';
import * as pulseUtility from 'pulseUtility';
import 'x-tr/x-tr';

//require('x-loginconnection/x-loginconnection');

/**
 * Index page — bootstrap redirector.
 *
 * Has no UI of its own: on load it rewrites the URL toward `home.html`
 * (which `pulseUtility.changePageName` redirects to `login.html` when no
 * role is set), and disables the configuration panel. No options, no
 * machine selection required.
 *
 * Components: x-tr.
 *
 * @extends pulsePage.BasePage
 */
class IndexPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * No required configuration — the index page only redirects.
   *
   * @returns {Array<{selector: string, message: string}>} Empty list.
   */
  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

}

if (document.readyState !== 'loading') {
  initIndexPage();
} else {
  document.addEventListener('DOMContentLoaded', initIndexPage);
}

function initIndexPage() {
  // If the URL didn't include `index.html`, append `home.html` instead.
  if (-1 == window.location.href.indexOf('index.html')) {
    window.open(window.location.href + 'home.html', '_self');
    return;
  }

  // Redirect to `home.html` (which `changePageName` rewrites to `login.html`
  // when no role is set yet).
  let pageToDisplay = window.location.href;
  pageToDisplay = pulseUtility.changePageName(pageToDisplay, 'home');
  window.open(pageToDisplay, '_self');

  // Configuration panel disabled
  const configPanelBtn = document.getElementById('configpanelbtn');
  if (configPanelBtn) {
    configPanelBtn.classList.add('disabled');
  }
  const pulsePanelParam = document.getElementById('pulse-panel-parameter');
  if (pulsePanelParam) {
    pulsePanelParam.style.display = 'none';
  }

  pulsePage.preparePage(new IndexPage());
}
