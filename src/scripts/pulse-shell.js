// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// <pulse-shell> — the shared page chrome (header, navigation panel, main area,
// options panel, legend) as ONE light-DOM web component. It replaces the static
// markup that grunt 'bake' used to inline into every page from template.html.
//
// Palier 1 = light DOM on purpose: no Shadow DOM, so the global LESS theme and
// every document.querySelector lookup in common_page.js (qs('#pulse-panel-*'),
// qs('.navbar-apps'), ...) keep working unchanged. The per-page markup is passed
// as <template data-region="content|legend|options|hidden"> children and moved
// into the chrome at the matching <div data-fill="..."> placeholders.
(function () {
  'use strict';

  // The shared chrome, byte-for-byte what template.html used to contain, with
  // <div data-fill="..."> placeholders where the per-page regions get inserted.
  var SKELETON = [
    '<div class="hidden-content"><div data-fill="hidden"></div></div>',

    '<svg style="width: 0;height: 0;float: left;">',
    '  <defs>',
    '    <filter color-interpolation-filters="sRGB" id="innerShadow">',
    '      <feFlood flood-opacity="0.5" flood-color="rgb(0,0,0)" result="flood"></feFlood>',
    '      <feComposite in="flood" in2="SourceGraphic" operator="out" result="composite1"></feComposite>',
    '      <feGaussianBlur in="composite1" stdDeviation="2" result="blur"></feGaussianBlur>',
    '      <feOffset dx="0" dy="1" result="offset"></feOffset>',
    '      <feComposite in="offset" in2="SourceGraphic" operator="atop"></feComposite>',
    '    </filter>',
    '    <filter color-interpolation-filters="sRGB" id="outerShadow">',
    '      <feFlood flood-opacity="0.5" flood-color="rgb(0,0,0)" result="flood"></feFlood>',
    '      <feComposite in="flood" in2="SourceGraphic" operator="in" result="composite1"></feComposite>',
    '      <feGaussianBlur in="composite1" stdDeviation="2" result="blur"></feGaussianBlur>',
    '      <feOffset dx="0" dy="1" result="offset"></feOffset>',
    '      <feComposite in="SourceGraphic" in2="offset" operator="over"></feComposite>',
    '    </filter>',
    '  </defs>',
    '</svg>',

    '<div class="pulse-header">',
    '  <div class="pulse-header-left">',
    '    <button id="navigationpanelbtn" title="Menu" role="button"></button>',
    '    <div class="navbar-apps"></div>',
    '  </div>',
    '  <div class="pulse-header-title title"><span></span></div>',
    '  <div class="pulse-header-close-to-right group-machines">',
    '    <button id="machineselectionbtn" title="MachineSelection" role="button"></button>',
    '  </div>',
    '  <div class="pulse-header-close-to-right">',
    '    <button id="fullscreenbtn" title="FullScreen" role="button"></button>',
    '  </div>',
    '  <div class="pulse-header-close-to-right"><x-logindisplay></x-logindisplay></div>',
    '  <div class="pulse-header-right">',
    '    <button id="configpanelbtn" class="activated" title="Settings" role="button"></button>',
    '  </div>',
    '</div>',

    '<div id="pulse-inner">',
    '  <div id="pulse-navigation-and-main">',
    '    <div id="pulse-panel-navigation"><div id="navbar"><ul></ul></div></div>',

    '    <div id="vue-app-container" style="display:none;">',
    '      <div id="vue-app"></div>',
    '      <div id="vue-overlay-target"></div>',
    '    </div>',

    '    <div class="pulse-mainarea">',
    '      <div class="pulse-mainarea-full">',
    '        <div class="pulse-mainarea-inner">',
    '          <x-message></x-message>',
    '          <x-checkserveraccess></x-checkserveraccess>',
    '          <x-checkpath></x-checkpath>',
    '          <x-checkcurrenttime></x-checkcurrenttime>',
    '          <x-checkversion></x-checkversion>',
    '          <x-checkconfigupdate></x-checkconfigupdate>',
    '          <x-checklogin></x-checklogin>',
    '          <div data-fill="content"></div>',
    '        </div>',
    '      </div>',
    '      <div class="pulse-mainarea-bottom">',
    '        <div class="legend-wrapper">',
    '          <div class="legend-content">',
    '            <div class="legend-toggle" style="display:none">',
    '              <div class="legend-toggle-icon-up"></div>',
    '              <div class="legend-toggle-icon-down"></div>',
    '              <div class="legend-toggle-label"><x-tr key="content.legend" default="Legend"></x-tr></div>',
    '            </div>',
    '            <div data-fill="legend"></div>',
    '          </div>',
    '        </div>',
    '        <div id="pulse-pagination"></div>',
    '      </div>',
    '    </div>',
    '  </div>',

    '  <div id="pulse-panel-parameter">',
    '    <div id="pulse-panel-parameter-content">',
    '      <div class="param-group group-machines">',
    '        <div class="param-group-header group-machines">',
    '          <div class="param-group-title"><x-tr key="parameters.machines" default="Machines"></x-tr></div>',
    '          <button class="param-group-button" id="editmachines"><x-tr key="parameters.editButton" default="edit"></x-tr></button>',
    '        </div>',
    '        <div class="param-group-content group-machines">',
    '          <x-machineselection ordering="true"></x-machineselection>',
    '        </div>',
    '      </div>',

    '      <div data-fill="options"></div>',

    '      <div class="param-group group-pages">',
    '        <div class="param-group-header group-pages">',
    '          <div class="param-group-title group-pages"><x-tr key="parameters.page" default="Page"></x-tr></div>',
    '          <button class="param-group-button" id="resetpage"><x-tr key="parameters.resetButton" default="Reset"></x-tr></button>',
    '        </div>',
    '        <div class="param-group-content group-pages">',
    '          <div class="config-row">',
    '            <label for="gridrow"><x-tr key="parameters.rows" default="Rows"></x-tr>',
    '              <input type="number" id="gridrow" value="" step="1" min="1" autocomplete="off" />',
    '            </label>',
    '          </div>',
    '          <div class="config-column">',
    '            <label for="gridcolumn"><x-tr key="parameters.columns" default="Columns"></x-tr>',
    '              <input type="number" id="gridcolumn" value="" step="1" min="1" autocomplete="off" />',
    '            </label>',
    '          </div>',
    '          <div class="config-pagerotation">',
    '            <label for="pagerotation"><x-tr key="parameters.rotations" default="Rotation (s)"></x-tr>',
    '              <input type="number" id="pagerotation" value="" step="5" min="10" autocomplete="off" />',
    '            </label>',
    '          </div>',
    '          <div class="config-pagetitle">',
    '            <label for="pagetitle"><x-tr key="parameters.customTitle" default="Custom title"></x-tr>',
    '              <input type="text" id="pagetitle" value="" autocomplete="off" />',
    '            </label>',
    '          </div>',
    '        </div>',
    '      </div>',

    '      <div class="config-url-actions">',
    '        <button class="param-group-button" id="showurl"><x-tr key="parameters.displayUrl" default="Display URL"></x-tr></button>',
    '        <button class="param-group-button" id="copyurl"><x-tr key="parameters.copyUrl" default="Copy URL"></x-tr></button>',
    '      </div>',
    '    </div>',

    '    <div class="configuration-bottom-area-login">',
    '      <x-loginpasswordbutton showastext="true"></x-loginpasswordbutton>',
    '      <x-loginchangepasswordbutton showastext="true"></x-loginchangepasswordbutton>',
    '    </div>',

    '    <div class="configuration-bottom-area">',
    '      <div class="configuration-bottom-area-switch">',
    '        <label class="switch">',
    '          <input id="darkthemebtn" type="checkbox">',
    '          <div class="slider round"></div>',
    '        </label>',
    '        <span><x-tr key="parameters.darkTheme" default="Dark theme"></x-tr></span>',
    '      </div>',
    '      <div class="configuration-bottom-area-version">',
    '        <label class="version-label">WebAppVersion</label>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  class PulseShell extends HTMLElement {
    connectedCallback () {
      // connectedCallback fires on the start tag, before our <template> children
      // are parsed. Assemble once the subtree is available.
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this._assemble.bind(this), { once: true });
      }
      else {
        this._assemble();
      }
    }

    _assemble () {
      if (this._assembled) {
        return;
      }
      this._assembled = true;

      // Capture the per-page regions before we replace our own content.
      var regions = {};
      this.querySelectorAll(':scope > template[data-region]').forEach(function (tpl) {
        regions[tpl.getAttribute('data-region')] = tpl.content;
      });

      this.innerHTML = SKELETON;

      var self = this;
      Object.keys(regions).forEach(function (name) {
        var target = self.querySelector('[data-fill="' + name + '"]');
        if (target) {
          target.replaceWith(regions[name]);
        }
      });
    }
  }

  if (!customElements.get('pulse-shell')) {
    customElements.define('pulse-shell', PulseShell);
  }
})();
