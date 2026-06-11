// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Theme bootstrap + page CSS loading. Loaded as a BLOCKING script in <head> (no
// async/defer) so it runs before the first paint => no flash of the wrong theme.
//
// Colors are CSS custom properties: theme-colors.css holds both themes' values
// (:root = light, html.dark = dark) and is loaded once; the page CSS is compiled
// ONCE (theme-independent, full of var(--color_*)). Switching theme is just
// toggling the `dark` class on <html> — no more style_dark/ + style_light/ reload.
(function () {
  'use strict';

  // Toggle the dark class synchronously (before paint) from the stored preference.
  var theme = 'dark';
  try {
    var stored = JSON.parse(localStorage.getItem('PULSE.PulseWebApp.theme'));
    if (stored) {
      theme = stored;
    }
  }
  catch (e) {
    // localStorage unavailable -> keep the default theme
  }
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Cache-bust version: this tag is baked with `?v=`, which grunt rewrites to the
  // app version; read it back from our own src and propagate it to the CSS links.
  var version = '';
  try {
    version = new URL(document.currentScript.src).search;
  }
  catch (e) {
    // no currentScript (async?) -> no cache-bust suffix
  }

  // Page name = the HTML file name (running.html -> running). No bake placeholder.
  var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '') || 'index';

  var head = document.head;
  function loadCss(href) {
    var link = document.createElement('link');
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    head.appendChild(link);
  }
  loadCss('./styles/theme-colors.css' + version); // CSS variables for both themes (loaded once)
  loadCss('./styles/' + page + '.css' + version); // the page (one CSS, theme-independent)
  loadCss('./styles/customize.css' + version);    // customers' specializations
})();
