// Copyright (C) 2025 Atsora Solutions

// - Set here the locale
//setAtsoraLocale ('fr');

/*ATSORA_CATALOG.pages.mycustompage = {
  title: 'My custom Page'
};*/

// Sync Vue locale when Pulse changes language at runtime
(function () {
  var _original = setAtsoraLocale;
  setAtsoraLocale = function (locale) {
    _original(locale);
    if (window.__setLocale) window.__setLocale(locale);
  };
})();

