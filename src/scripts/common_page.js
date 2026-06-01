// Copyright (C) 2009-2025 Atsora Solutions
// SPDX-License-Identifier: Apache-2.0

var pulseUtility = require('pulseUtility');
var pulseLogin = require('pulseLogin');
var pulseConfig = require('pulseConfig');
var pulseSvg = require('pulseSvg');
var eventBus = require('eventBus');
var pulseCustomDialog = require('pulseCustomDialog');

// Global imports
require('x-message/x-message');
require('x-signalbanner/x-signalbanner');
require('x-checkcurrenttime/x-checkcurrenttime');
require('x-checkserveraccess/x-checkserveraccess');
require('x-checkpath/x-checkpath');
require('x-checkversion/x-checkversion');
require('x-checkconfigupdate/x-checkconfigupdate');
require('x-checklogin/x-checklogin');
require('x-logindisplay/x-logindisplay');
require('x-machineselection/x-machineselection');
require('x-modificationmanager/x-modificationmanager');
require('x-loginpasswordbutton/x-loginpasswordbutton');
require('x-loginchangepasswordbutton/x-loginchangepasswordbutton');
require('x-loginconnection/x-loginconnection');

// Helpers
function qs (sel) { return document.querySelector(sel); }
function qsa (sel) { return document.querySelectorAll(sel); }
function addClass (sel, cls) { let el = (typeof sel === 'string') ? qs(sel) : sel; if (el) el.classList.add(cls); }
function removeClass (sel, cls) { let el = (typeof sel === 'string') ? qs(sel) : sel; if (el) el.classList.remove(cls); }
function hasClass (sel, cls) { let el = (typeof sel === 'string') ? qs(sel) : sel; return el ? el.classList.contains(cls) : false; }

// --- Rotation engine state ---
var _rotationTimer = null;
var _allMachinesCache = [];
var _currentRotationIndex = 0;

exports.BasePage = class BasePage {
  constructor () {
    this.showMachineselection = true;
  }
}

// --- Panel functions ---
var openNavigationPanel = function (instant) {
  let icons = qsa('.menuicon');
  for (let i = 0; i < icons.length; i++) icons[i].classList.add('tooltip_disabled');
  let btn = qs('#navigationpanelbtn');
  if (btn && btn.classList.contains('disabled')) return;
  let panel = qs('#pulse-panel-navigation');
  if (panel) {
    if (instant) panel.classList.add('notransition');
    else panel.classList.remove('notransition');
  }
  let inner = qs('#pulse-inner');
  if (inner) inner.classList.remove('pulse-panel-navigation-collapsed');
  if (btn) btn.classList.add('activated');
};
var closeNavigationPanel = function (instant) {
  let icons = qsa('.menuicon');
  for (let i = 0; i < icons.length; i++) icons[i].classList.remove('tooltip_disabled');
  let panel = qs('#pulse-panel-navigation');
  if (panel) {
    if (instant) panel.classList.add('notransition');
    else panel.classList.remove('notransition');
  }
  let inner = qs('#pulse-inner');
  if (inner) inner.classList.add('pulse-panel-navigation-collapsed');
  let btn = qs('#navigationpanelbtn');
  if (btn) btn.classList.remove('activated');
};
var initParameterPanel = function () {
  let titles = qsa('.param-group-title');
  for (let i = 0; i < titles.length; i++) {
    titles[i].addEventListener('click', function () {
      let group = this.closest('.param-group');
      if (!group) return;
      let content = group.querySelector('.param-group-content');
      if (!content) return;
      // is(':visible') equivalent
      let isVisible = content.offsetParent !== null;
      if (isVisible) {
        content.style.display = 'none';
      }
      else {
        content.style.display = 'flex';
      }
      group.classList.remove('opened');
    });
  }
};
var openParameterPanel = exports.openParameterPanel = function (instant) {
  let btn = qs('#configpanelbtn');
  if (btn && btn.classList.contains('disabled')) return;
  let panel = qs('#pulse-panel-parameter');
  if (panel) {
    if (instant) panel.classList.add('notransition');
    else panel.classList.remove('notransition');
  }
  let inner = qs('#pulse-inner');
  if (inner) inner.classList.remove('pulse-panel-parameter-collapsed');
  if (btn) btn.classList.add('activated');
};
var closeParameterPanel = exports.closeParameterPanel = function (instant) {
  let panel = qs('#pulse-panel-parameter');
  if (panel) {
    if (instant) panel.classList.add('notransition');
    else panel.classList.remove('notransition');
  }
  let inner = qs('#pulse-inner');
  if (inner) inner.classList.add('pulse-panel-parameter-collapsed');
  let btn = qs('#configpanelbtn');
  if (btn) btn.classList.remove('activated');
};

// --- Vue <-> Pulse integration ----------------------------------------------
// The Vue app (atsora-vue) is mounted once into #vue-app and driven at runtime
// through the bridge it exposes on window (see atsora-vue/src/pulse/bridges.ts):
//   window.__vueRouter            - Vue Router instance
//   window.__vueSetMachines(ids)  - push the selected machine ids to the Vue store
//   window.__vueOpenExecDialog(id?) - open the task execution dialog in the Vue app
//   window.__setLocale(locale)    - sync the Pulse language into Vue i18n

// Maps a Pulse nav page (vue-*) to its Vue router route.
var vuePageRoutes = {
  'vue-tasks': '/tasks',
  'vue-execution': '/execution'
};

// Current machine id selection, read straight from x-machineselection.
var getSelectedMachines = function () {
  let el = qs('x-machineselection');
  return (el && typeof el.getMachinesArray === 'function') ? el.getMachinesArray() : [];
};

// The Vue bundle is a deferred ES module, so the bridge may not be ready when a
// vue-* page is first prepared. Run cb as soon as window.__vueRouter exists.
var whenVueReady = function (cb) {
  if (window.__vueRouter) { cb(); return; }
  let attempts = 0;
  let timer = setInterval(function () {
    if (window.__vueRouter) { clearInterval(timer); cb(); }
    else if (++attempts > 100) clearInterval(timer); // give up after ~5s
  }, 50);
};

// Show the Vue container and navigate to the route for the given vue-* page.
var showVuePage = function (pageName) {
  let route = vuePageRoutes[pageName] || ('/' + pageName.replace('vue-', ''));
  let mainArea = qs('.pulse-mainarea');
  if (mainArea) mainArea.style.display = 'none';
  let container = qs('#vue-app-container');
  if (container) container.style.display = 'flex';
  whenVueReady(function () {
    if (window.__vueSetMachines) window.__vueSetMachines(getSelectedMachines());
    window.__vueRouter.push(route);
  });
};

var populateNavigationPanel = function () {
  let currentPage = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');
  let displayedPages = pulseConfig.getArray('displayedPages');
  let displayedApps = pulseConfig.getArray('displayedApps');
  if (displayedApps == null || displayedApps.length == 0) {
    let panel = qs('#pulse-panel-navigation'); if (panel) panel.style.display = 'none';
    let btn = qs('#navigationpanelbtn'); if (btn) btn.classList.add('disabled');
    return;
  }

  let currentAppIsAllowed = false;
  let firstTarget = null;
  let appDiv = qs('.navbar-apps');
  for (let iApp = 0; iApp < displayedApps.length; iApp++) {
    let app = displayedApps[iApp];
    let appImg = document.createElement('div');
    appImg.className = 'navbar-app-content';
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if ((app == 'PulseWebApp') || (app == 'AtrackingWebApp')) { if (tmpContexts.length == 0) appImg.classList.add('selected'); }
    else if (app == 'Live') { if (tmpContexts.length > 0) if (tmpContexts[0] == 'live') appImg.classList.add('selected'); }
    let link = document.createElement('a');
    link.className = 'navbar-app-container';
    link.setAttribute('app', app);
    link.appendChild(appImg);
    if (displayedApps.length > 1) {
      let imgUrl = 'images/app-' + app + '.svg';
      appImg.style.backgroundImage = 'url(' + imgUrl + ')';
      if (appDiv) appDiv.appendChild(link);
      pulseSvg.inlineBackgroundSvg(appImg);
    }
    let targetUrl = window.location.href;
    switch (app) {
      case 'AtrackingWebApp': case 'PulseWebApp': {
        if (null == pulseUtility.getURLParameter(window.location.href, 'AppContext')) currentAppIsAllowed = true;
        pulseUtility.addToolTip(link, 'Atsora Tracking Web app');
        targetUrl = pulseUtility.removeURLParameter(targetUrl, 'AppContext');
        targetUrl = pulseUtility.changePageName(targetUrl, 'home');
      } break;
      case 'Live': {
        if ('live' == pulseUtility.getURLParameter(window.location.href, 'AppContext')) currentAppIsAllowed = true;
        pulseUtility.addToolTip(link, 'Live');
        targetUrl = pulseUtility.changePageName(targetUrl, 'home');
        targetUrl = pulseUtility.changeURLParameter(targetUrl, 'AppContext', 'live');
      } break;
      case 'Reports': {
        pulseUtility.addToolTip(link, pulseConfig.pulseTranslate('content.reports', 'Reports'));
        targetUrl = pulseConfig.getString('reportpath', 'http://serveraddress:8080/atrackingreporting/');
        link.setAttribute('target', '_blank');
      } break;
      default: {
        pulseUtility.addToolTip(link, app);
        targetUrl = pulseUtility.changePageName(targetUrl, 'index');
        targetUrl = targetUrl.replace('PulseWebApp', app);
        targetUrl = targetUrl.replace('AtrackingWebApp', app);
        let tmpPath = pulseUtility.getURLParameterValues(window.location.href, 'path');
        if (tmpPath.length > 0) targetUrl = pulseUtility.changeURLParameter(targetUrl, 'path', tmpPath[0]);
        let tmpMainPath = pulseUtility.getURLParameterValues(window.location.href, 'mainpath');
        if (tmpMainPath.length > 0) targetUrl = pulseUtility.changeURLParameter(targetUrl, 'mainpath', tmpMainPath[0]);
      }
    }
    link.setAttribute('href', targetUrl);
    if (iApp == 0) firstTarget = targetUrl;
  }
  if (!currentAppIsAllowed) { if (window.location.href != firstTarget) { window.location.href = firstTarget; return; } }

  if (displayedPages == null || displayedPages.length == 0) {
    let panel = qs('#pulse-panel-navigation'); if (panel) panel.style.display = 'none';
    let btn = qs('#navigationpanelbtn'); if (btn) btn.classList.add('disabled');
    return;
  }
  let customPages = pulseConfig.getArray('customPages');
  let allDisplayedPages = displayedPages.concat(customPages);
  let navBtn = qs('#navigationpanelbtn'); if (navBtn) navBtn.classList.remove('disabled');

  let textOrNothing = (pulseConfig.getString('menuType') == 'textOrNothing');
  let inner = qs('#pulse-inner');
  if (!textOrNothing && inner) inner.classList.add('navigation-always-visible');

  let mapTextMenu = {};
  allDisplayedPages.unshift('home');
  let ul = qs('#navbar > ul');
  if (ul == null) return;
  for (let i = 0; i < allDisplayedPages.length; i++) {
    let pageName = allDisplayedPages[i];
    let title = pulseConfig.pulseTranslate('pages.' + pageName + '.title', pageName);
    let subtitle = pulseConfig.pulseTranslate('pages.' + pageName + '.subtitle', '');
    let li = null;
    let selection = (pageName == currentPage);
    if (textOrNothing) {
      if (subtitle == '') {
        li = document.createElement('li');
        li.setAttribute('data', pageName);
        li.innerHTML = '<span class="menutext">' + title + '</span>';
      }
      else {
        if (title in mapTextMenu) {
          li = mapTextMenu[title];
          let subUl = li.querySelector('ul');
          if (subUl) {
            let subLi = document.createElement('li');
            if (selection) subLi.className = 'selected';
            subLi.setAttribute('data', pageName);
            subLi.textContent = subtitle;
            subUl.appendChild(subLi);
          }
        }
        else {
          li = document.createElement('li');
          li.className = 'expandable';
          li.innerHTML = '<span class="menutext">' + title + '</span><ul><li ' + (selection ? ' class="selected" ' : '') + 'data="' + pageName + '">' + subtitle + '</li></ul>';
          mapTextMenu[title] = li;
        }
      }
    }
    else {
      if (subtitle != '') title += ' (' + subtitle + ')';
      li = document.createElement('li');
      li.setAttribute('data', pageName);
      li.innerHTML = '<div class="menuicon"></div><span class="menutext">' + title + '</span>';
      let menuicon = li.querySelector('.menuicon');
      if (menuicon) {
        menuicon.style.backgroundImage = 'url(images/' + pageName + '-icon.svg)';
        pulseUtility.addToolTip(menuicon, title);
      }
    }
    if (selection) li.classList.add('selected');
    ul.appendChild(li);
    pulseSvg.inlineBackgroundSvg('li[data="' + pageName + '"] .menuicon');
  }
};

var setNavigationLinks = function () {
  let expandableSpans = qsa('#navbar > ul > li.expandable > span');
  for (let i = 0; i < expandableSpans.length; i++) {
    expandableSpans[i].addEventListener('click', function () {
      let parentLi = this.parentElement;
      let subUl = parentLi ? parentLi.querySelector('ul') : null;
      let previousState = subUl ? (subUl.offsetParent !== null) : false;
      let allSubUls = qsa('#navbar > ul > li > ul');
      for (let j = 0; j < allSubUls.length; j++) allSubUls[j].style.display = 'none';
      let allSpans = qsa('#navbar > ul > li > span');
      for (let j = 0; j < allSpans.length; j++) allSpans[j].style.alignContent = 'center';
      if (!previousState && subUl) {
        // `style.display = ''` clears inline only — CSS `.expandable > ul`
        // sets `display: none`, so we must force `block` to override it
        // (jQuery `.show()` did this implicitly).
        subUl.style.display = 'block';
        for (let j = 0; j < allSpans.length; j++) allSpans[j].style.alignContent = 'start';
      }
    });
  }
  let fullURL = window.location.pathname;
  let navLis = qsa('#navbar li');
  for (let i = 0; i < navLis.length; i++) {
    let liEl = navLis[i];
    let dataAttr = liEl.getAttribute('data');
    if (dataAttr && fullURL.indexOf('/' + dataAttr + '.html') !== -1) {
      liEl.classList.add('selected');
      let grandParent = liEl.parentElement ? liEl.parentElement.parentElement : null;
      if (grandParent && grandParent.classList.contains('expandable')) {
        grandParent.classList.add('selected');
        let gpUl = grandParent.querySelector('ul');
        if (gpUl) gpUl.style.display = 'block';
      }
    }
    liEl.addEventListener('click', function () {
      let attribute = this.getAttribute('data');
      if (attribute != null && attribute != '' && fullURL.indexOf('/' + attribute + '.html') == -1) {
        let newfullURL = pulseUtility.changePageName(window.location.href, attribute);
        // strip ancestor params: drill-down context is page-scoped, a sidebar click is a fresh navigation
        let u = new URL(newfullURL);
        [...u.searchParams.keys()].filter(k => k.startsWith('ancestor')).forEach(k => u.searchParams.delete(k));
        window.location.href = u.toString();
      }
    });
  }
};

var animatePanels = function () {
  let navBtn = qs('#navigationpanelbtn');
  if (navBtn) navBtn.addEventListener('click', function () {
    let inner = qs('#pulse-inner');
    if (inner && inner.classList.contains('pulse-panel-navigation-collapsed')) {
      openNavigationPanel(false);
      if (window.innerWidth <= 685) closeParameterPanel(false);
    }
    else {
      closeNavigationPanel(false);
    }
  });
  let cfgBtn = qs('#configpanelbtn');
  if (cfgBtn) cfgBtn.addEventListener('click', function () {
    let inner = qs('#pulse-inner');
    if (inner && inner.classList.contains('pulse-panel-parameter-collapsed')) {
      openParameterPanel();
      if (window.innerWidth <= 685) closeNavigationPanel(false);
    }
    else {
      closeParameterPanel(false);
    }
  });
}

// --- ROTATION ENGINE ---
var startRotationEngine = function () {
  if (_rotationTimer) {
    clearTimeout(_rotationTimer);
    _rotationTimer = null;
  }

  // In non-live mode: show all machines without rotation
  let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
  let isLive = tmpContexts && tmpContexts.includes('live');
  if (!isLive) {
    if (_allMachinesCache.length > 0) {
      eventBus.EventBus.dispatchToAll('updateVisibleMachines', { machines: _allMachinesCache });
    }
    return;
  }

  let isDefault = pulseConfig.getBool('defaultlayout', true);
  let perPage = isDefault ? 100 : pulseConfig.getInt('machinesperpage', 12);
  if (perPage < 1) perPage = 12;

  // Ensure the cache is clean (trim)
  if (_allMachinesCache.length > 0) {
    _allMachinesCache = _allMachinesCache.map(s => s.trim()).filter(s => s !== '');
  }

  if (_allMachinesCache.length == 0) {
    return;
  }

  // Case 1: Everything fits on a single page -> No rotation
  if (_allMachinesCache.length <= perPage) {
    eventBus.EventBus.dispatchToAll('updateVisibleMachines', { machines: _allMachinesCache });
    // Explicitly tell the progress bar to hide (Total=1, Delay=0)
    eventBus.EventBus.dispatchToAll('rotationPageUpdate', {
      page: 1,
      total: 1,
      delay: 0
    });
    return;
  }

  // Case 2: Rotation needed
  showNextPageLoop(perPage);
};

var showNextPageLoop = function (perPage) {
  let totalPages = Math.ceil(_allMachinesCache.length / perPage);

  let start = _currentRotationIndex * perPage;
  let end = start + perPage;

  let machinesForPage = _allMachinesCache.slice(start, end);
  let currentPageNum = _currentRotationIndex + 1;

  eventBus.EventBus.dispatchToAll('updateVisibleMachines', { machines: machinesForPage });

  let delay = pulseConfig.getInt('rotationdelay', 10) * 1000;
  if (delay < 3000) delay = 3000;

  eventBus.EventBus.dispatchToAll('rotationPageUpdate', {
    page: currentPageNum,
    total: totalPages,
    delay: delay
  });

  _currentRotationIndex++;
  if (_currentRotationIndex >= totalPages) _currentRotationIndex = 0;

  _rotationTimer = setTimeout(() => showNextPageLoop(perPage), delay);
};


var populateConfigPanel = function (currentPageMethods) {

  // Machine Selection
  let machineSelection = qs('x-machineselection');
  let editBtn = qs('#editmachines');
  if (editBtn) editBtn.addEventListener('click', function () { if (machineSelection) machineSelection.changeMachineSelection(); });
  let msBtn = qs('#machineselectionbtn');
  if (msBtn) msBtn.addEventListener('click', function () { if (machineSelection) machineSelection.changeMachineSelection(); });
  if (currentPageMethods.showMachineselection === false) {
    let gm = qs('.group-machines'); if (gm) gm.style.display = 'none';
  }

  // UI cleanup
  let gp = qs('.group-pages'); if (gp) gp.style.display = 'none';
  qsa('.config-row').forEach(el => el.remove());
  qsa('.config-column').forEach(el => el.remove());
  qsa('.config-pagerotation').forEach(el => el.remove());
  qsa('.config-pagetitle').forEach(el => el.remove());

  // LEGEND - show/hide option in config panel
  let showlegendInput = qs('#showlegend');
  if (showlegendInput) {
    showlegendInput.addEventListener('change', function () {
      this.setAttribute('overridden', 'true');
      pulseConfig.set('showlegend', this.checked);
      showLegend();
      // Trigger a recomputation of the legend (replaces $.resize())
      let evt = new Event('resize');
      window.dispatchEvent(evt);
    });
  }
  let legendContent = qs('.legend-content');
  let legendIsEmpty = legendContent ? (legendContent.childElementCount <= 1) : true; // Always 1 child even if empty
  if (pulseConfig.getString('showlegend') == 'dynamic' || legendIsEmpty) {
    let csl = qs('.config-showlegend'); if (csl) csl.remove();
  }
  else {
    if (showlegendInput) {
      showlegendInput.checked = pulseConfig.getBool('showlegend');
      if (pulseConfig.getDefaultString('showlegend') != pulseConfig.getString('showlegend')) {
        showlegendInput.setAttribute('overridden', 'true');
      }
    }
  }

  // --- LAYOUT --- Init inputs from saved config
  (function initLayoutInputs () {
    let isDefault = pulseConfig.getBool('defaultlayout', true);
    let dl = qs('#defaultlayout');
    if (dl) {
      dl.checked = isDefault;
      if (pulseConfig.getDefaultBool('defaultlayout', true) !== isDefault) dl.setAttribute('overridden', 'true');
    }

    let perPage = pulseConfig.getInt('machinesperpage', 12);
    let mpp = qs('#machinesperpage');
    if (mpp) {
      mpp.value = perPage;
      if (pulseConfig.getDefaultInt('machinesperpage', 12) !== perPage) mpp.setAttribute('overridden', 'true');
    }

    let delay = pulseConfig.getInt('rotationdelay', 10);
    let rd = qs('#rotationdelay');
    if (rd) {
      rd.value = delay;
      if (pulseConfig.getDefaultInt('rotationdelay', 10) !== delay) rd.setAttribute('overridden', 'true');
    }
  })();

  let resetLayoutBtn = qs('#resetlayout');
  if (resetLayoutBtn) resetLayoutBtn.addEventListener('click', function () {
    let dl = qs('#defaultlayout');
    if (dl) {
      dl.checked = true;
      dl.dispatchEvent(new Event('change'));
      dl.removeAttribute('overridden');
    }
    let mpp = qs('#machinesperpage');
    if (mpp) { mpp.value = 12; mpp.removeAttribute('overridden'); }
    let rd = qs('#rotationdelay');
    if (rd) { rd.value = 10; rd.removeAttribute('overridden'); }
    pulseConfig.set('defaultlayout', true);
    pulseConfig.set('machinesperpage', 12);
    pulseConfig.set('rotationdelay', 10);
    let defaultShowLegend = pulseConfig.getDefaultString('showlegend');
    if (defaultShowLegend && defaultShowLegend !== 'dynamic') {
      let sl = qs('#showlegend');
      if (sl) {
        sl.checked = pulseConfig.getDefaultBool('showlegend');
        sl.removeAttribute('overridden');
      }
      pulseConfig.set('showlegend', pulseConfig.getDefaultBool('showlegend'));
      showLegend();
    }
    _currentRotationIndex = 0;
    startRotationEngine();
  });

  var changeDefaultLayout = function () {
    this.setAttribute('overridden', 'true');
    let isDefault = this.checked;
    pulseConfig.set('defaultlayout', isDefault);
    let rs = qs('.rotation-settings');
    if (isDefault) {
      if (rs) rs.style.display = 'none';
      pulseConfig.set('machinesperpage', 12);
    }
    else {
      if (rs) rs.style.display = '';
      let mpp = qs('#machinesperpage'); if (mpp) mpp.disabled = false;
      let rd = qs('#rotationdelay'); if (rd) rd.disabled = false;
    }
    eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'layout' });
    _currentRotationIndex = 0;
    startRotationEngine();
  };
  let dlInput = qs('#defaultlayout');
  if (dlInput) {
    dlInput.addEventListener('change', changeDefaultLayout);
    let rs = qs('.rotation-settings');
    if (rs) rs.style.display = dlInput.checked ? 'none' : '';
  }

  var changeMachinesPerPage = function () {
    this.setAttribute('overridden', 'true');
    let val = parseInt(this.value);
    if (!isNaN(val)) {
      pulseConfig.set('machinesperpage', val);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'layout' });
      _currentRotationIndex = 0;
      startRotationEngine();
    }
  };
  let mppInput = qs('#machinesperpage');
  if (mppInput) {
    mppInput.addEventListener('input', changeMachinesPerPage);
    mppInput.addEventListener('change', changeMachinesPerPage);
  }

  var changeRotationDelay = function () {
    this.setAttribute('overridden', 'true');
    let val = parseInt(this.value);
    if (!isNaN(val)) {
      pulseConfig.set('rotationdelay', val);
    }
  };
  let rdInput = qs('#rotationdelay');
  if (rdInput) {
    rdInput.addEventListener('input', changeRotationDelay);
    rdInput.addEventListener('change', changeRotationDelay);
  }

  if (typeof currentPageMethods.initOptionValues === 'function') currentPageMethods.initOptionValues();
  let resetOptionsBtn = qs('#resetoptions');
  if (resetOptionsBtn) resetOptionsBtn.addEventListener('click', function () {
    if (typeof currentPageMethods.setDefaultOptionValues === 'function') currentPageMethods.setDefaultOptionValues();
  });

  var getPageFullURL = function () {
    let url = window.location.href.split('?')[0]; let nextSeparator = '?';
    let appContext = pulseUtility.getURLParameter(window.location.href, 'AppContext');
    if (appContext) { url += nextSeparator + 'AppContext=' + appContext; nextSeparator = '&'; }
    let machineIds = pulseConfig.getArray('machine', []);
    let groupIds = pulseConfig.getArray('group', []);
    if (machineIds != 'undefined' && machineIds != null && machineIds != '' && machineIds != '-1') {
      for (let i = 0; i < machineIds.length; i++) { url += nextSeparator + 'machine=' + machineIds[i]; nextSeparator = '&'; }
    }
    else { url += nextSeparator + 'machine='; nextSeparator = '&'; }
    for (let i = 1; i <= 20; i++) { let val = pulseConfig.getString('ancestor' + i); if (val && val !== '') url += '&ancestor' + i + '=' + val; else break; }
    if (pulseConfig.getBool('enableGroups', false)) {
      if (groupIds != 'undefined' && groupIds != null && groupIds != '' && groupIds != '-1') { for (let i = 0; i < groupIds.length; i++) url += '&group=' + groupIds[i]; }
      else url += '&group=';
    }
    let isDefault = pulseConfig.getBool('defaultlayout', true);
    if (!isDefault) { url += '&machinesperpage=' + pulseConfig.getInt('machinesperpage', 12); url += '&rotationdelay=' + pulseConfig.getInt('rotationdelay', 10); }
    url += '&defaultlayout=' + isDefault;
    let showLegendEl = document.getElementById('showlegend');
    // hidden = offsetParent === null
    if (showLegendEl && showLegendEl.offsetParent !== null) url += '&showlegend=' + showLegendEl.checked;
    if (typeof currentPageMethods.getOptionValues === 'function') url += currentPageMethods.getOptionValues();
    return url;
  }
  let showUrlBtn = qs('#showurl');
  if (showUrlBtn) showUrlBtn.addEventListener('click', function () {
    let url = getPageFullURL();
    pulseCustomDialog.openDialog(url, { type: 'Information', title: pulseConfig.pulseTranslate('content.bookmark', 'URL to bookmark') });
  });
  let copyUrlBtn = qs('#copyurl');
  if (copyUrlBtn) copyUrlBtn.addEventListener('click', function () {
    let url_to_copy = getPageFullURL();
    let copySuccess = function () {
      copyUrlBtn.classList.add('urlcopied');
      copyUrlBtn.innerHTML = pulseConfig.pulseTranslate('content.success', 'Success');
      setTimeout(function () {
        copyUrlBtn.classList.remove('urlcopied');
        copyUrlBtn.innerHTML = pulseConfig.pulseTranslate('content.copyurl', 'Copy URL');
      }, 3000);
    };
    let copyFailure = function () {
      copyUrlBtn.classList.add('urlcopyfailed');
      copyUrlBtn.innerHTML = pulseConfig.pulseTranslate('content.failure', 'Failure');
      setTimeout(function () {
        copyUrlBtn.classList.remove('urlcopyfailed');
        copyUrlBtn.innerHTML = pulseConfig.pulseTranslate('content.copyurl', 'Copy URL');
      }, 3000);
    };
    if (!navigator.clipboard) {
      const tmp = document.createElement('textarea');
      tmp.value = url_to_copy;
      document.body.appendChild(tmp);
      tmp.select();
      if (document.execCommand('copy')) copySuccess(); else copyFailure();
      document.body.removeChild(tmp);
    }
    else {
      navigator.clipboard.writeText(url_to_copy).then(copySuccess).catch(copyFailure);
    }
  });
};

var themeManager = {
  _version: '',
  load: function (name) {
    let oldTheme = pulseConfig.getString('theme', 'dark');
    pulseConfig.setGlobal('theme', name);
    let pageName = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');
    if (this._version == null || this._version == '') {
      let oldLink = document.querySelector('link[rel=stylesheet][href*="style_' + oldTheme + '/' + pageName + '.css"]');
      if (oldLink) {
        let oldHref = oldLink.getAttribute('href');
        if (oldHref) this._version = oldHref.split('=')[1];
      }
    }
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = './styles/style_' + name + '/' + pageName + '.css?v=' + this._version;
    document.head.appendChild(link);
    if (oldTheme != name) {
      let stale = document.querySelectorAll('link[rel=stylesheet][href*="./styles/style_' + oldTheme + '/' + pageName + '.css"]');
      for (let i = 0; i < stale.length; i++) stale[i].remove();
    }
    // Sync Vue/PrimeVue/Tailwind dark mode (PrimeVue darkModeSelector = '.dark' on <html>).
    document.documentElement.classList.toggle('dark', name === 'dark');
  },
  current: function () { return pulseConfig.getString('theme', 'dark'); }
};

var enterFullScreen = function () { const elem = document.documentElement; if (elem.requestFullscreen) { elem.requestFullscreen(); } else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); } else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); } }
var exitFullScreen = function () { if (document.exitFullscreen) { document.exitFullscreen(); } else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); } else if (document.msExitFullscreen) { document.msExitFullscreen(); } }
var isFullScreen = function () { return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement); }

var showLegend = function () {
  var manualClickOnToggleLegend = false; // To allow hide legend before manual click

  var updateLegendVisibility = function () {
    let legendContent = qs('.legend-content');
    if (legendContent == null) return;
    let legendHeight = legendContent.clientHeight;
    let legendEntryCount = 0;
    for (let i = 0; i < legendContent.children.length; i++) {
      if (!legendContent.children[i].classList.contains('legend-toggle')) legendEntryCount++;
    }
    let legendHasEntries = legendEntryCount > 0;
    let legendWrapper = qs('.legend-wrapper');
    let legendToggle = qs('.legend-toggle');

    // Live mode: expand to 95% if grid has more than 1 row
    if (pulseConfig.getString('showlegend') == 'true') {
      if (legendEntryCount > 1) {
        legendContent.style.width = '95%';
      }
      else {
        legendContent.style.width = ''; // back to default 60% CSS
      }
    }

    // Visibility of the "Legend" button
    if (legendToggle) {
      if (legendHasEntries && legendHeight > 2 && pulseConfig.getString('showlegend') == 'dynamic') {
        legendToggle.style.display = '';
      }
      else {
        legendToggle.style.display = 'none';
      }
    }
    let mainInner = qs('.pulse-mainarea-inner');
    if (pulseConfig.getString('showlegend') == 'false' || !legendHasEntries) {
      if (mainInner) mainInner.style.paddingBottom = '';
      return;
    }

    // if visible && at beginning && dynamic => auto-hide
    if (legendWrapper && !legendWrapper.classList.contains('legendHidden')
      && (!manualClickOnToggleLegend)
      && (pulseConfig.getString('showlegend') == 'dynamic')) {
      legendWrapper.classList.add('legendHidden');
    }

    if (legendWrapper && legendWrapper.classList.contains('legendHidden')) {
      let transformStr = window.getComputedStyle(legendWrapper).transform;
      let currentTranslationY = 0;
      if (transformStr && transformStr !== 'none') {
        let parts = transformStr.split(',');
        if (parts.length >= 6) currentTranslationY = parseInt(parts[5]);
      }
      if (currentTranslationY > 0) legendWrapper.classList.add('legendHiddenNoAnimation');
      legendWrapper.style.transform = 'translateY(' + legendHeight + 'px)';
    }
    else if (legendWrapper) {
      if (manualClickOnToggleLegend) {
        legendWrapper.classList.remove('legendHiddenNoAnimation');
        legendWrapper.style.transform = 'translateY(0)';
      }
    }

    // Push only in live view (showlegend === 'true') — other views keep the overlay
    if (mainInner) {
      if (pulseConfig.getString('showlegend') === 'true' && legendHeight > 2) {
        mainInner.style.paddingBottom = (legendHeight + 2) + 'px';
      }
      else {
        mainInner.style.paddingBottom = '';
      }
    }
  };

  let legendContentEl = qs('.legend-content');
  if (legendContentEl) {
    new ResizeObserver(() => updateLegendVisibility()).observe(legendContentEl);
  }

  let legendToggleEl = qs('.legend-toggle');
  let legendWrapperEl = qs('.legend-wrapper');
  if (pulseConfig.getString('showlegend') == 'dynamic') {
    if (legendToggleEl) {
      legendToggleEl.addEventListener('click', function () {
        manualClickOnToggleLegend = true;
        if (legendWrapperEl) legendWrapperEl.classList.toggle('legendHidden');
        updateLegendVisibility();
      });
    }
    if (legendContentEl) legendContentEl.style.borderTopLeftRadius = '0';
  }
  else if (pulseConfig.getString('showlegend') == 'false') {
    if (legendWrapperEl) legendWrapperEl.style.display = 'none';
  }
  else if (pulseConfig.getString('showlegend') == 'true') {
    if (legendWrapperEl) legendWrapperEl.style.display = '';
  }

  updateLegendVisibility(); // Call immediately
};

exports.preparePage = function (currentPageMethods) {
  pulseConfig.setGlobal('machine', ''); pulseConfig.setGlobal('group', '');
  pulseConfig.set('machine', ''); pulseConfig.set('group', ''); // clear stale page-specific keys
  for (let i = 1; i <= 20; i++) { pulseConfig.set('ancestor' + i, ''); }
  const url = new URL(window.location.href); const params = new URLSearchParams(url.search);
  params.forEach((value, key) => { if (key.startsWith('ancestor')) pulseConfig.set(key, value); });

  const groupValues = params.getAll('group');
  if (groupValues.length > 0) pulseConfig.set('group', groupValues.filter(v => v !== "").join(','), true);

  const machineValues = params.getAll('machine');
  if (machineValues.length > 0) {
    const valMachine = machineValues.filter(v => v !== "").join(',');
    pulseConfig.set('machine', valMachine, true);
    _allMachinesCache = valMachine.split(',').map(s => s.trim());
  }
  else {
    let cfgMachines = pulseConfig.getArray('machine');
    if (cfgMachines && cfgMachines.length > 0) _allMachinesCache = cfgMachines;
  }

  ['showlegend', 'thresholdtargetproduction', 'thresholdredproduction', 'machinesperpage', 'rotationdelay', 'defaultlayout'].forEach(conf => { if (params.has(conf)) pulseConfig.set(conf, params.get(conf)); });

  // Single-source-of-truth listener: machineListChanged fired by x-machineselection.
  // Registered BEFORE buildContent so component dispatches are not lost.
  var onMachineListChanged = function (event) {
    let ids = (event.target && event.target.ids) || event.ids || [];
    _allMachinesCache = ids.map(s => String(s).trim()).filter(s => s !== '');
    _currentRotationIndex = 0;
    startRotationEngine();
    // Forward the selection to the Vue app while its container is visible.
    let vueContainer = qs('#vue-app-container');
    if (window.__vueSetMachines && vueContainer && vueContainer.offsetParent !== null) {
      window.__vueSetMachines(_allMachinesCache);
    }
  };
  eventBus.EventBus.addGlobalEventListener(this, 'machineListChanged', onMachineListChanged);

  const newParams = new URLSearchParams();
  if (params.has('AppContext')) newParams.set('AppContext', params.get('AppContext'));
  params.forEach((value, key) => { if (key.startsWith('ancestor')) newParams.set(key, value); });
  let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  if (newParams.toString()) newUrl += '?' + newParams.toString();
  window.history.replaceState({ path: newUrl }, '', newUrl);

  // jQuery's $.ajaxSetup({cache:false}) was here; pulseService handles cache itself now.

  if (params.get('AppContext') == 'live') {
    let pc = qs('.pulse-content'); if (pc) pc.classList.add('appcontext-live');
  }

  populateNavigationPanel();
  setNavigationLinks();
  initParameterPanel();
  animatePanels();

  let fsBtn = qs('#fullscreenbtn');
  if (fsBtn) fsBtn.addEventListener('click', function () { if (isFullScreen()) exitFullScreen(); else enterFullScreen(); });
  let darkBtn = qs('#darkthemebtn');
  if (darkBtn) {
    darkBtn.checked = (themeManager.current() == 'dark');
    darkBtn.addEventListener('click', function () { themeManager.load(themeManager.current() == 'light' ? 'dark' : 'light'); });
  }

  let pageNameFromUrl = pulseUtility.getCurrentPageName();
  // A vue-* page loaded directly (e.g. vue-tasks.html): reveal the Vue container
  // and route to it once the Vue bridge is ready.
  if (pageNameFromUrl.startsWith('vue-')) showVuePage(pageNameFromUrl);
  let title1 = pulseConfig.pulseTranslate('general.title', 'Atsora Tracking');
  let title2 = pulseConfig.pulseTranslate('pages.' + pageNameFromUrl + '.title', '');
  let titleEl = document.head.querySelector('title');
  if (titleEl) titleEl.innerHTML = title2 + (title2 != '' ? ' - ' : '') + title1;
  let headerTitle = qs('.pulse-header-title span');
  if (headerTitle) headerTitle.innerHTML = (title2 != '' ? title2 : title1).toUpperCase();

  let configOk = true;
  if (typeof currentPageMethods.getMissingConfigs === 'function') { configOk = (currentPageMethods.getMissingConfigs().length == 0); }
  if (configOk) closeParameterPanel(true); else openParameterPanel(true);
  if ('home' == pageNameFromUrl) openNavigationPanel(true); else closeNavigationPanel(true);

  if (typeof currentPageMethods.buildContent === 'function') currentPageMethods.buildContent();

  showLegend();

  populateConfigPanel(currentPageMethods);
  pulseSvg.inlineBackgroundSvg('#navigationpanelbtn');
  pulseSvg.inlineBackgroundSvg('#configpanelbtn');
  pulseSvg.inlineBackgroundSvg('#fullscreenbtn');
  pulseSvg.inlineBackgroundSvg('#machineselectionbtn');
  pulseSvg.inlineBackgroundSvg('.legend-toggle-icon-up');
  pulseSvg.inlineBackgroundSvg('.legend-toggle-icon-down');
  let ancestors = qsa('x-ancestors');
  for (let i = 0; i < ancestors.length; i++) { if (ancestors[i].initialize) ancestors[i].initialize(); }

  startRotationEngine();
};
