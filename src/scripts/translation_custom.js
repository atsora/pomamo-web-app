// Copyright (C) 2025 Atsora Solutions

// - Set here the locale
//setAtsoraLocale ('fr');

/*ATSORA_CATALOG.pages.mycustompage = {
  title: 'My custom Page'
};*/

// Sync the Vue i18n locale when Pulse changes language at runtime.
// setAtsoraLocale (translation_component_default.js) sets document.documentElement.lang;
// the Vue bridge exposes window.__setLocale (see atsora-vue/src/pulse/bridges.ts).
(function () {
  if (typeof setAtsoraLocale !== 'function') return;
  var _original = setAtsoraLocale;
  setAtsoraLocale = function (locale) {
    _original(locale);
    if (window.__setLocale) window.__setLocale(locale);
  };
})();

