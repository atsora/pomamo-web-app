// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

var pulseUtility = require('pulseUtility');
var pulseLogin = require('pulseLogin');
var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var pulseSvg = require('pulseSvg');

//require('x-loginconnection/x-loginconnection');

class LoginPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

  // This method is run only if missing config (cf getMissingConfigs)
  /*buildContent () {
  }*/

}

$(document).ready(function () {
  // if login.html does not exists -> load it ????
  /*if (-1 == window.location.href.indexOf('login.html')) {
    window.open(window.location.href + 'login.html', '_self');
  }*/

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
  $('#homebtn').addClass('disabled');

  let useLogin = pulseConfig.getBool('useLogin', false);
  if (useLogin) {
    $('x-loginconnection').show();
    $('.allow-login-button').hide();
  }
  else { // not useLogin
    $('x-loginconnection').hide();
    $('.allow-login-button').show();

    // Add buttons
    let hidden = $('<div></div>').addClass('login-hidden');
    $('.allow-login-button').append(hidden);

    let visible = $('<div></div>').addClass('login-visible');
    $('.allow-login-button').append(visible);

    pulseSvg.inlineBackgroundSvg(hidden);
    pulseSvg.inlineBackgroundSvg(visible);

    // Show / hide (default)
    $(hidden).show();
    $(visible).hide();

    $(hidden).click(function () {
      $(visible).show();
      $(hidden).hide();
      $('x-loginconnection').show();
    });

    $(visible).click(function () {
      $(hidden).show();
      $(visible).hide();
      $('x-loginconnection').hide();
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

    let sectionLoginRoles = $('.login-roles');

    // Browse all roles
    for (let iRole = 0; iRole < roles.length; iRole++) {
      let role = roles[iRole];
      if (pulseUtility.isNotDefined(role.noAccess) && role.display != null) {
        let role = roles[iRole];
        let container = $('<div></div>').addClass('select-role-div').attr('role', role.role);
        let img = $('<div></div>').addClass('select-role-image');
        let imgUrl = 'images/role-' + role.role + '.svg';
        imageExists(imgUrl, function (exists) {
          if (exists) {
            img.css('backgroundImage', 'url(' + imgUrl + ')');
          }
          else {
            img.css('backgroundImage', 'url(images/role-default.svg)');
          }
          pulseSvg.inlineBackgroundSvg(img);
        });

        container.append(img);
        let text = $('<div>' + role.display + '</div>');
        container.append(text);

        container.click(function () {
          // Set the role
          pulseLogin.storeRole($(this).attr('role'));

          // Load the page HOME - with path or any additional parameters
          window.location.href = pulseUtility.changePageName(window.location.href, 'home');
        });

        sectionLoginRoles.append(container);
      }
    }
  }
  // Configuration panel disabled
  $('#configpanelbtn').addClass('disabled');
  $('#pulse-panel-parameter').hide();

  // Prepare the page globally
  pulsePage.preparePage(new LoginPage());
});
