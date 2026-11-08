// Copyright (C) 2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Language chosen by the user in the options panel (#localeselect, common_page.js).
// Loaded as a blocking script right after translation_custom.js: the installation
// language (translation_locale.js) and the customer one (translation_custom.js) are
// set at this point, and the user's choice, stored in localStorage, overrides them
// before any component or page script reads the catalogs.
(function () {
  'use strict';

  var installation = document.documentElement.getAttribute('lang') || 'default';
  window.ATSORA_INSTALLATION_LOCALE = installation;
  window.ATSORA_USER_LOCALE = '';

  var chosen = '';
  try {
    // Same key as pulseConfig.setGlobal('locale', ...)
    chosen = JSON.parse(localStorage.getItem('PULSE.PulseWebApp.locale')) || '';
  }
  catch (e) {
    // localStorage unavailable -> installation language
  }
  if (!chosen
    || (typeof ATSORA_LOCALE_CATALOG === 'undefined') || !ATSORA_LOCALE_CATALOG[chosen]
    || (typeof ATSORA_LOCALE_COMPONENT_CATALOG === 'undefined') || !ATSORA_LOCALE_COMPONENT_CATALOG[chosen]
    || (typeof setAtsoraLocale !== 'function')) {
    return; // no choice, or a language this version does not know any more
  }
  window.ATSORA_USER_LOCALE = chosen;
  if (chosen !== installation) {
    setAtsoraLocale(chosen);
  }
})();
