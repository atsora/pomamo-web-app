// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulseUtility from 'pulseUtility';
import * as pulseLogin from 'pulseLogin';
import * as pulseConfig from 'pulseConfig';
import * as pulsePage from 'pulsePage';
import * as pulseSvg from 'pulseSvg';
import 'x-tr/x-tr';

/**
 * Login page — role / authentication entry point.
 *
 * Layout: a panel with `x-loginconnection` (shown when `useLogin` is
 * true) plus a grid of role tiles (`.login-roles`) populated from the
 * `roles` config — each tile uses `images/role-<role>.svg` (with a
 * fallback to `role-default.svg`) and stores the picked role via
 * `pulseLogin.storeRole` before navigating with
 * `pulseConfig.goToFirstPage`. When a role is already set on load, the
 * page redirects immediately. Auto-removes any `AppContext` URL
 * parameter on load (forces a reload when present).
 *
 * Components: x-loginconnection (conditional), x-tr.
 *
 * @extends pulsePage.BasePage
 */
class LoginPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /**
   * No required configuration — the login page is always renderable.
   *
   * @returns {Array<{selector: string, message: string}>} Empty list.
   */
  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

}

if (document.readyState !== 'loading') {
  initLoginPage();
} else {
  document.addEventListener('DOMContentLoaded', initLoginPage);
}

function initLoginPage() {
  // Same as buildContent = remove extra URL parameters
  let url = window.location.href;
  if (-1 != url.search('AppContext=')) {
    pulseConfig.set('AppContext', '');
    url = pulseUtility.removeURLParameter(url, 'AppContext');

    // RELOAD !
    window.open(url, '_self');
  }

  // If a role is defined, open home or firstpage
  let role = pulseLogin.getRole(); // not getAppcontext
  if ('' != role) {
    pulseConfig.goToFirstPage(role);
  }

  // Disable the navigation panel, an other page must be chosen first
  const homeBtnEl = document.getElementById('homebtn');
  if (homeBtnEl) {
    homeBtnEl.classList.add('disabled');
  }

  let useLogin = pulseConfig.getBool('useLogin', false);
  const loginConnectionElements = document.querySelectorAll('x-loginconnection');
  const allowLoginButtonElements = document.querySelectorAll('.allow-login-button');

  if (useLogin) {
    loginConnectionElements.forEach(el => el.style.display = '');
    allowLoginButtonElements.forEach(el => el.style.display = 'none');
  }
  else { // not useLogin
    loginConnectionElements.forEach(el => el.style.display = 'none');
    allowLoginButtonElements.forEach(el => el.style.display = '');

    // Add buttons
    allowLoginButtonElements.forEach(allowLoginButton => {
      let hidden = document.createElement('div');
      hidden.className = 'login-hidden';
      allowLoginButton.appendChild(hidden);

      let visible = document.createElement('div');
      visible.className = 'login-visible';
      allowLoginButton.appendChild(visible);

      pulseSvg.inlineBackgroundSvg(hidden);
      pulseSvg.inlineBackgroundSvg(visible);

      // Show / hide (default)
      hidden.style.display = '';
      visible.style.display = 'none';

      hidden.addEventListener('click', function () {
        visible.style.display = '';
        hidden.style.display = 'none';
        loginConnectionElements.forEach(el => el.style.display = '');
      });

      visible.addEventListener('click', function () {
        hidden.style.display = '';
        visible.style.display = 'none';
        loginConnectionElements.forEach(el => el.style.display = 'none');
      });
    });

    //if (!pulseConfig.currentRoleOrAppContextIsDefined()) { // NO ROLE is selected -> always here
    // Display all available roles with an icon
    let roles = pulseConfig.getArray('roles');
    let imageExists = function (url, callback) {
      let img = new Image();
      img.onload = function () { callback(true); };
      img.onerror = function () { callback(false); };
      img.src = url;
    }

    let sectionLoginRoles = document.querySelector('.login-roles');

    for (let iRole = 0; iRole < roles.length; iRole++) {
      let role = roles[iRole];
      let roleConf = (PULSE_DEFAULT_CONFIG.roles && PULSE_DEFAULT_CONFIG.roles[role.role]) || {};
      if (!roleConf.noAccess) {
        let container = document.createElement('div');
        container.className = 'select-role-div';
        container.setAttribute('role', role.role);

        let img = document.createElement('div');
        img.className = 'select-role-image';
        let imgUrl = 'images/role-' + role.role + '.svg';
        imageExists(imgUrl, function (exists) {
          if (exists) {
            img.style.backgroundImage = 'url(' + imgUrl + ')';
          }
          else {
            img.style.backgroundImage = 'url(images/role-default.svg)';
          }
          pulseSvg.inlineBackgroundSvg(img);
        });

        container.appendChild(img);
        let roleLabel = (ATSORA_CATALOG && ATSORA_CATALOG.general && ATSORA_CATALOG.general.roles)
          ? (ATSORA_CATALOG.general.roles[role.role] || role.role)
          : role.role;
        let text = document.createElement('div');
        text.textContent = roleLabel;
        container.appendChild(text);

        container.addEventListener('click', function () {
          let selectedRole = this.getAttribute('role');
          pulseLogin.storeRole(selectedRole);
          pulseConfig.goToFirstPage(selectedRole);
        });

        sectionLoginRoles.appendChild(container);
      }
    }
  }

  const configpanelbtnEl = document.getElementById('configpanelbtn');
  if (configpanelbtnEl) {
    configpanelbtnEl.classList.add('disabled');
  }
  const pulsePanelParameterEl = document.getElementById('pulse-panel-parameter');
  if (pulsePanelParameterEl) {
    pulsePanelParameterEl.style.display = 'none';
  }

  pulsePage.preparePage(new LoginPage());
}
