// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');

require('x-validatetoken/x-validatetoken');

/**
 * Validate page — token-validation gate after an OAuth-style redirect.
 *
 * Hosts a single `x-validatetoken` that reads the `code` URL parameter
 * and POSTs it to `User/ValidateAuthenticationCode`. Hides the machine
 * selection. When no `code` is present in `pulseConfig`, `buildContent`
 * navigates back to the login page via `pulseConfig.goToPageLogin()`.
 *
 * Components: x-validatetoken.
 *
 * @extends pulsePage.BasePage
 */
class ValidatePage extends pulsePage.BasePage {
  constructor() {
    super();

    this.showMachineselection = false;
  }

  /** No configurable options. */
  // CONFIG PANEL - Init
  initOptionValues () {
  }

  /** No configurable options. */
  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
  }

  /** No configurable options. */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    return '';
  }

  /**
   * No required configuration — the validate page is always renderable.
   *
   * @returns {Array<{selector: string, message: string}>} Empty list.
   */
  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

  /**
   * Bounces back to the login page when no `code` parameter is set;
   * otherwise lets `x-validatetoken` submit the value.
   */
  buildContent () {
    if ('' == pulseConfig.getString('code')) {
      pulseConfig.goToPageLogin();
    }
  }
}

if (document.readyState !== 'loading') {
  pulsePage.preparePage(new ValidatePage());
} else {
  document.addEventListener('DOMContentLoaded', function () {
    pulsePage.preparePage(new ValidatePage());
  });
}
