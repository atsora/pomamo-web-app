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

// --- VARIABLES POUR LE MOTEUR DE ROTATION ---
var _rotationTimer = null;
var _allMachinesCache = [];
var _currentRotationIndex = 0;

exports.BasePage = class BasePage {
  constructor() {
    this.showMachineselection = true;
  }
}

// ... (Fonctions Panel inchangées) ...
var openNavigationPanel = function(f){$('.menuicon').addClass('tooltip_disabled');if($('#navigationpanelbtn').hasClass('disabled'))return;if(f)$('#pulse-panel-navigation').addClass('notransition');else $('#pulse-panel-navigation').removeClass('notransition');$('#pulse-inner').removeClass('pulse-panel-navigation-collapsed');$('#navigationpanelbtn').addClass('activated');};
var closeNavigationPanel = function(f){$('.menuicon').removeClass('tooltip_disabled');if(f)$('#pulse-panel-navigation').addClass('notransition');else $('#pulse-panel-navigation').removeClass('notransition');$('#pulse-inner').addClass('pulse-panel-navigation-collapsed');$('#navigationpanelbtn').removeClass('activated');};
var initParameterPanel = function(){$('.param-group-title').click(function(e){let g=$(this).parents('.param-group');let c=$(g).find('.param-group-content').first();if(c.is(':visible')){c.hide();}else{c.css('display','flex');}$(g).removeClass('opened');});}
var openParameterPanel = exports.openParameterPanel = function(f){if($('#configpanelbtn').hasClass('disabled'))return;if(f)$('#pulse-panel-parameter').addClass('notransition');else $('#pulse-panel-parameter').removeClass('notransition');$('#pulse-inner').removeClass('pulse-panel-parameter-collapsed');$('#configpanelbtn').addClass('activated');};
var closeParameterPanel = exports.closeParameterPanel = function(f){if(f)$('#pulse-panel-parameter').addClass('notransition');else $('#pulse-panel-parameter').removeClass('notransition');$('#pulse-inner').addClass('pulse-panel-parameter-collapsed');$('#configpanelbtn').removeClass('activated');};

// --- INTÉGRATION VUE ---

// Lit la sélection machine courante depuis x-machineselection (Option B)
var getSelectedMachines = function () {
  var el = document.querySelector('x-machineselection');
  return el ? el.getMachinesArray() : [];
};

// Correspondance page nav → route Vue
var vuePageRoutes = {
  'vue-tasks': '/tasks',
  'vue-execution': '/execution',
};

// Affiche la zone Vue et navigue vers la route donnée
var showVuePage = function (pageName) {
  var route = vuePageRoutes[pageName] || ('/' + pageName.replace('vue-', ''));
  $('.pulse-mainarea').hide();
  $('#vue-app-container').css('display', 'flex');
  if (window.__vueSetMachines) {
    window.__vueSetMachines(getSelectedMachines());
  }
  if (window.__vueRouter) {
    window.__vueRouter.push(route);
  }
};

// Masque la zone Vue et réaffiche le contenu Pulse
var hideVuePage = function () {
  $('#vue-app-container').hide();
  $('.pulse-mainarea').show();
};

// Ouvre une page Vue dans une popup pulseCustomDialog (Option A)
var openVuePopup = function (route, title) {
  var container = document.createElement('div');
  container.style.minHeight = '400px';
  if (window.__vueMount) {
    window.__vueMount(container, route);
  }
  pulseCustomDialog.openDialog($(container), {
    title: title,
    cancelButton: 'hidden',
    okButton: 'hidden',
    bigSize: true,
    autoDelete: true,
    onClose: function () {
      if (window.__vueUnmount) window.__vueUnmount(container);
    }
  });
};

var populateNavigationPanel = function () {
  let currentPage = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');
  let displayedPages = pulseConfig.getArray('displayedPages');
  let displayedApps = pulseConfig.getArray('displayedApps');
  if (displayedApps == null || displayedApps.length == 0) { $('#pulse-panel-navigation').hide(); $('#navigationpanelbtn').addClass('disabled'); return; }

  let currentAppIsAllowed = false;
  let firstTarget = null;
  let appDiv = $('.navbar-apps');
  for (let iApp = 0; iApp < displayedApps.length; iApp++) {
    let app = displayedApps[iApp];
    let appImg = $('<div></div>').addClass('navbar-app-content');
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if ((app == 'PulseWebApp') || (app == 'AtrackingWebApp')) { if (tmpContexts.length == 0) appImg.addClass('selected'); }
    else if (app == 'Live') { if (tmpContexts.length > 0) if (tmpContexts[0] == 'live') appImg.addClass('selected'); }
    let link = $('<a></a>').addClass('navbar-app-container').attr('app', app).append(appImg);
    if (displayedApps.length > 1) {
      let imgUrl = 'images/app-' + app + '.svg';
      appImg.css('backgroundImage', 'url(' + imgUrl + ')');
      appDiv.append(link);
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
        link.attr('target', '_blank');
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
    link.attr('href', targetUrl);
    if (iApp == 0) firstTarget = targetUrl;
  }
  if (!currentAppIsAllowed) { if (window.location.href != firstTarget) { window.location.href = firstTarget; return; } }

  if (displayedPages == null || displayedPages.length == 0) { $('#pulse-panel-navigation').hide(); $('#navigationpanelbtn').addClass('disabled'); return; }
  let customPages = pulseConfig.getArray('customPages');
  let allDisplayedPages = displayedPages.concat(customPages);
  $('#navigationpanelbtn').removeClass('disabled');

  let textOrNothing = (pulseConfig.getString('menuType') == 'textOrNothing');
  if (!textOrNothing) $('#pulse-inner').addClass('navigation-always-visible');

  let mapTextMenu = {};
  allDisplayedPages.unshift('home');
  let ul = $('#navbar > ul');
  for (let i = 0; i < allDisplayedPages.length; i++) {
    let pageName = allDisplayedPages[i];
    let title = pulseConfig.pulseTranslate('pages.' + pageName + '.title', pageName);
    let subtitle = pulseConfig.pulseTranslate('pages.' + pageName + '.subtitle', '');
    let li = null;
    let selection = (pageName == currentPage);
    if (textOrNothing) {
      if (subtitle == '') li = $('<li data="' + pageName + '"><span class="menutext">' + title + '</span></li>');
      else {
        if (title in mapTextMenu) { li = mapTextMenu[title]; li.find('ul').append($('<li ' + (selection ? ' class="selected" ' : '') + 'data="' + pageName + '">' + subtitle + '</li>')); }
        else { li = $('<li class="expandable"><span class="menutext">' + title + '</span><ul><li ' + (selection ? ' class="selected" ' : '') + 'data="' + pageName + '">' + subtitle + '</li></ul></li>'); mapTextMenu[title] = li; }
      }
    }
    else {
      if (subtitle != '') title += ' (' + subtitle + ')';
      li = $('<li data="' + pageName + '"><div class="menuicon"></div><span class="menutext">' + title + '</span></li>');
      li.find('.menuicon').css('background-image', 'url(images/' + pageName + '-icon.svg)');
      pulseUtility.addToolTip(li.find('.menuicon'), title);
    }
    if (selection) li.addClass('selected');
    ul.append(li);
    pulseSvg.inlineBackgroundSvg('li[data="' + pageName + '"] .menuicon');
  }
};

var setNavigationLinks = function () {
  $('#navbar > ul > li.expandable > span').click(function () {
    let previousState = $(this).parent().find('ul').is(':visible');
    $('#navbar > ul > li > ul').hide();
    $('#navbar > ul > li > span').css('align-content', 'center');
    if (!previousState) { $(this).parent().find('ul').show(); $('#navbar > ul > li > span').css('align-content', 'start'); }
  });
  let fullURL = window.location.pathname;
  $('#navbar li').each(function () {
    if (fullURL.indexOf('/' + $(this).attr('data') + '.html') !== -1) {
      $(this).addClass('selected');
      let grandParent = $(this).parent().parent();
      if (grandParent.hasClass('expandable')) { grandParent.addClass('selected'); grandParent.find('ul').css('display', 'block'); }
    }
    $(this).click(function () {
      let attribute = $(this).attr('data');
      if (attribute == null || attribute == '') return;

      // Page Vue : navigue vers vue-tasks.html (comme une page Pulse normale)
      // preparePage détecte le pagename au chargement et appelle showVuePage automatiquement
      if (attribute.startsWith('vue-')) {
        if (fullURL.indexOf('/' + attribute + '.html') == -1) {
          let newfullURL = pulseUtility.changePageName(window.location.href, attribute);
          window.location.href = newfullURL;
        }
        return;
      }

      // Page Pulse → comportement existant
      if (fullURL.indexOf('/' + attribute + '.html') == -1) {
        hideVuePage();
        let newfullURL = pulseUtility.changePageName(window.location.href, attribute);
        window.location.href = newfullURL;
      }
    });
  });

  // Écoute les changements de sélection machine pour mettre à jour Vue en temps réel (Option C)
  eventBus.EventBus.addGlobalEventListener(module, 'configChangeEvent', function (event) {
    if (!event || !event.target) return;
    var config = event.target.config;
    if (config === 'machine' || config === 'group') {
      if (window.__vueSetMachines && $('#vue-app-container').is(':visible')) {
        window.__vueSetMachines(getSelectedMachines());
      }
    }
  });
};

var animatePanels = function () {
  $('#navigationpanelbtn').click(function (e) {
    if ($('#pulse-inner').hasClass('pulse-panel-navigation-collapsed')) { openNavigationPanel(false); if ($(window).width() <= 685) closeParameterPanel(false); }
    else { closeNavigationPanel(false); }
  });
  $('#configpanelbtn').click(function (e) {
    if ($('#pulse-inner').hasClass('pulse-panel-parameter-collapsed')) { openParameterPanel(); if ($(window).width() <= 685) closeNavigationPanel(false); }
    else { closeParameterPanel(false); }
  });
}

// --- MOTEUR DE ROTATION JS ---
var startRotationEngine = function () {
  console.log('[DEBUG] startRotationEngine: Checking configuration.');

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

  // On s'assure que le cache est propre (trim)
  if (_allMachinesCache.length > 0) {
    _allMachinesCache = _allMachinesCache.map(s => s.trim()).filter(s => s !== '');
  }

  if (_allMachinesCache.length == 0) {
    console.log('[DEBUG] startRotationEngine: No machines to display.');
    return;
  }

  // Cas 1 : Tout tient sur une seule page -> Pas de rotation
  if (_allMachinesCache.length <= perPage) {
    console.log('[DEBUG] startRotationEngine: No rotation needed. Showing all.');

    // 1. On affiche toutes les machines
    eventBus.EventBus.dispatchToAll('updateVisibleMachines', { machines: _allMachinesCache });

    // 2. [CORRECTION] On dit explicitement à la barre de progression de se cacher (Total=1, Delay=0)
    eventBus.EventBus.dispatchToAll('rotationPageUpdate', {
      page: 1,
      total: 1,
      delay: 0
    });

    return;
  }

  // Cas 2 : Rotation nécessaire
  console.log('[DEBUG] startRotationEngine: Starting rotation loop.');
  showNextPageLoop(perPage);
};

var showNextPageLoop = function(perPage) {
  let totalPages = Math.ceil(_allMachinesCache.length / perPage);

  // Calcul des indices
  let start = _currentRotationIndex * perPage;
  let end = start + perPage;

  // Extraction des IDs
  let machinesForPage = _allMachinesCache.slice(start, end);
  let currentPageNum = _currentRotationIndex + 1;

  console.log('[DEBUG] showNextPageLoop: Page ' + currentPageNum + '/' + totalPages + '. Sending: ' + machinesForPage.join(','));

  // Affiche la grille
  eventBus.EventBus.dispatchToAll('updateVisibleMachines', { machines: machinesForPage });

  let delay = pulseConfig.getInt('rotationdelay', 10) * 1000;
  if (delay < 3000) delay = 3000;

  // Met à jour la barre de progression
  eventBus.EventBus.dispatchToAll('rotationPageUpdate', {
    page: currentPageNum,
    total: totalPages,
    delay: delay
  });

  // Préparation index suivant
  _currentRotationIndex++;
  if (_currentRotationIndex >= totalPages) _currentRotationIndex = 0;

  _rotationTimer = setTimeout(() => showNextPageLoop(perPage), delay);
};


var populateConfigPanel = function (currentPageMethods) {

  // --- RECEPTION INITIALE DU GROUPE (Via AJAX) ---
  var onGroupReloaded = function (event) {
    let currentGroup = pulseConfig.getString('group');
    if (currentGroup && currentGroup !== '') {
      let machinesStr = null;
      if (event.target && event.target.newMachinesList) machinesStr = event.target.newMachinesList;
      else if (event.newMachinesList) machinesStr = event.newMachinesList;

      if (machinesStr && machinesStr !== '') {
        console.log('[DEBUG] Rotation: Group loaded. Resetting config.');

        // On nettoie les données reçues
        _allMachinesCache = machinesStr.split(',').map(s => s.trim());
        _currentRotationIndex = 0;

        pulseConfig.set('group', '', true);
        pulseConfig.set('machine', _allMachinesCache.join(','), true);

        eventBus.EventBus.dispatchToAll('configChangeEvent', { config: 'machine' });
      }
    }
  };
  eventBus.EventBus.addGlobalEventListener(this, 'groupIsReloaded', onGroupReloaded);

  // --- DEMARRAGE UNE FOIS LE DOM PRET ---
  var onGridRendered = function (event) {
    console.log('[DEBUG] Rotation: DOM Ready. Syncing cache and starting.');

    // SAFETY SYNC : On relit toujours la config actuelle
    let currentConfig = pulseConfig.getString('machine');
    if (currentConfig) {
       _allMachinesCache = currentConfig.split(',').map(s => s.trim());
    }

    startRotationEngine();
  };
  eventBus.EventBus.addGlobalEventListener(this, 'groupGridRendered', onGridRendered);


  // Machine Selection
  $('#editmachines').click(function () { $('x-machineselection').get(0).changeMachineSelection(); }.bind($('x-machineselection').get(0)));
  $('#machineselectionbtn').click(function () { $('x-machineselection').get(0).changeMachineSelection(); }.bind($('x-machineselection').get(0)));
  if (currentPageMethods.showMachineselection === false) $('.group-machines').hide();

  // Nettoyage UI
  $('.group-pages').hide();
  $('.config-row').remove(); $('.config-column').remove(); $('.config-pagerotation').remove();
  $('.config-pagetitle').remove();

  // LEGEND - show/hide option in config panel
  $('#showlegend').change(function () {
    $(this).attr('overridden', true);
    pulseConfig.set('showlegend', $('#showlegend').is(':checked'));
    showLegend();
    $('.legend-content').resize();
  });
  let legendIsEmpty = ($('.legend-content')[0].childElementCount <= 1); // Always 1 child even if empty
  if (pulseConfig.getString('showlegend') == 'dynamic' || legendIsEmpty) {
    $('.config-showlegend').remove();
  } else {
    $('#showlegend').prop('checked', pulseConfig.getBool('showlegend'));
    if (pulseConfig.getDefaultString('showlegend') != pulseConfig.getString('showlegend')) {
      $('#showlegend').attr('overridden', 'true');
    }
  }

  // --- LAYOUT --- Init inputs from saved config
  (function initLayoutInputs() {
    let isDefault = pulseConfig.getBool('defaultlayout', true);
    $('#defaultlayout').prop('checked', isDefault);
    if (pulseConfig.getDefaultBool('defaultlayout', true) !== isDefault)
      $('#defaultlayout').attr('overridden', 'true');

    let perPage = pulseConfig.getInt('machinesperpage', 12);
    $('#machinesperpage').val(perPage);
    if (pulseConfig.getDefaultInt('machinesperpage', 12) !== perPage)
      $('#machinesperpage').attr('overridden', 'true');

    let delay = pulseConfig.getInt('rotationdelay', 10);
    $('#rotationdelay').val(delay);
    if (pulseConfig.getDefaultInt('rotationdelay', 10) !== delay)
      $('#rotationdelay').attr('overridden', 'true');
  })();

  $('#resetlayout').click(function (e) {
    $('#defaultlayout').prop('checked', true).change().removeAttr('overridden');
    $('#machinesperpage').val(12).removeAttr('overridden');
    $('#rotationdelay').val(10).removeAttr('overridden');
    pulseConfig.set('defaultlayout', true);
    pulseConfig.set('machinesperpage', 12);
    pulseConfig.set('rotationdelay', 10);
    _currentRotationIndex = 0;

    startRotationEngine();
  });

  var changeDefaultLayout = function () {
    $(this).attr('overridden', true);
    let isDefault = $('#defaultlayout').is(':checked');
    pulseConfig.set('defaultlayout', isDefault);
    if (isDefault) { $('.rotation-settings').hide(); pulseConfig.set('machinesperpage', 12); }
    else { $('.rotation-settings').show(); $('#machinesperpage').prop('disabled', false); $('#rotationdelay').prop('disabled', false); }
    eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'layout' });

    _currentRotationIndex = 0;
    startRotationEngine();
  };
  $('#defaultlayout').on('change', changeDefaultLayout);
  if ($('#defaultlayout').is(':checked')) $('.rotation-settings').hide(); else $('.rotation-settings').show();

  var changeMachinesPerPage = function () {
    $(this).attr('overridden', true);
    let val = parseInt($(this).val());
    if (!isNaN(val)) {
      pulseConfig.set('machinesperpage', val);
      eventBus.EventBus.dispatchToAll('configChangeEvent', { 'config': 'layout' });
      _currentRotationIndex = 0;
      startRotationEngine();
    }
  };
  $('#machinesperpage').on('input change', changeMachinesPerPage);

  var changeRotationDelay = function () {
    $(this).attr('overridden', true);
    let val = parseInt($(this).val());
    if (!isNaN(val)) {
      pulseConfig.set('rotationdelay', val);
    }
  };
  $('#rotationdelay').on('input change', changeRotationDelay);

  if (typeof currentPageMethods.initOptionValues === 'function') currentPageMethods.initOptionValues();
  $('#resetoptions').click(function (e) { if (typeof currentPageMethods.setDefaultOptionValues === 'function') currentPageMethods.setDefaultOptionValues(); });

  var getPageFullURL = function () {
    let url = window.location.href.split('?')[0]; let nextSeparator = '?';
    let machineIds = pulseConfig.getArray('machine', []);
    let groupIds = pulseConfig.getArray('group', []);
    if (machineIds != 'undefined' && machineIds != null && machineIds != '' && machineIds != '-1') {
      for (let i = 0; i < machineIds.length; i++) { url += nextSeparator + 'machine=' + machineIds[i]; nextSeparator = '&'; }
    } else { url += nextSeparator + 'machine='; nextSeparator = '&'; }
    for (let i = 1; i <= 20; i++) { let val = pulseConfig.getString('ancestor' + i); if (val && val !== '') url += '&ancestor' + i + '=' + val; else break; }
    if (pulseConfig.getBool('enableGroups', false)) {
      if (groupIds != 'undefined' && groupIds != null && groupIds != '' && groupIds != '-1') { for (let i = 0; i < groupIds.length; i++) url += '&group=' + groupIds[i]; }
      else url += '&group=';
    }
    let isDefault = pulseConfig.getBool('defaultlayout', true);
    if (!isDefault) { url += '&machinesperpage=' + pulseConfig.getInt('machinesperpage', 12); url += '&rotationdelay=' + pulseConfig.getInt('rotationdelay', 10); }
    url += '&defaultlayout=' + isDefault;
    if (typeof currentPageMethods.getOptionValues === 'function') url += currentPageMethods.getOptionValues();
    return url;
  }
  $('#showurl').click(function () { let url = getPageFullURL(); pulseCustomDialog.openDialog(url, { type: 'Information', title: pulseConfig.pulseTranslate('content.bookmark', 'URL to bookmark') }); });
  $('#copyurl').click(function () {
    let url_to_copy = getPageFullURL();
    if (!navigator.clipboard) {
      const tmp = document.createElement('textarea'); tmp.value = url_to_copy; document.body.appendChild(tmp); tmp.select();
      if (document.execCommand('copy')) { $('#copyurl').addClass('urlcopied').html(pulseConfig.pulseTranslate('content.success', 'Success')); setTimeout(function () { $('#copyurl').removeClass('urlcopied').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL')); }, 3000); }
      else { $('#copyurl').addClass('urlcopyfailed').html(pulseConfig.pulseTranslate('content.failure', 'Failure')); setTimeout(function () { $('#copyurl').removeClass('urlcopyfailed').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL')); }, 3000); }
      document.body.removeChild(tmp);
    } else {
      navigator.clipboard.writeText(url_to_copy).then(
        function () { $('#copyurl').addClass('urlcopied').html(pulseConfig.pulseTranslate('content.success', 'Success')); setTimeout(function () { $('#copyurl').removeClass('urlcopied').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL')); }, 3000); })
        .catch(function () { $('#copyurl').addClass('urlcopyfailed').html(pulseConfig.pulseTranslate('content.failure', 'Failure')); setTimeout(function () { $('#copyurl').removeClass('urlcopyfailed').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL')); }, 3000); });
    }
  });
};

var themeManager = {
  _version: '',
  load: function (name) {
    let oldTheme = pulseConfig.getString('theme', 'dark'); pulseConfig.setGlobal('theme', name);
    let pageName = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');
    if (this._version == null || this._version == '') { this._version = $('link[rel=stylesheet][href*="style_' + oldTheme + '/' + pageName + '.css"]').attr('href').split('=')[1]; }
    $('head').append('<link rel="stylesheet" type="text/css" href="./styles/style_' + name + '/' + pageName + '.css?v=' + this._version + '">');
    if (oldTheme != name) { $('link[rel=stylesheet][href*="./styles/style_' + oldTheme + '/' + pageName + '.css"]').remove(); }
    // Sync Vue/PrimeVue/Tailwind dark mode
    if (name === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  },
  current: function () { return pulseConfig.getString('theme', 'dark'); }
};

var enterFullScreen = function () { const elem = document.documentElement; if (elem.requestFullscreen) { elem.requestFullscreen(); } else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); } else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); } }
var exitFullScreen = function () { if (document.exitFullscreen) { document.exitFullscreen(); } else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); } else if (document.msExitFullscreen) { document.msExitFullscreen(); } }
var isFullScreen = function () { return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement); }

var showLegend = function () {
  var manualClickOnToggleLegend = false; // To allow hide legend before manual click

  var updateLegendVisibility = function () {
    // Heights of the legend
    let legendHeight = $('.legend-content')[0].clientHeight;

    // Live mode: expand to 90% if grid has more than 1 row (> 2 children with 2-col grid)
    if (pulseConfig.getString('showlegend') == 'true') {
      let childCount = $('.legend-content').children(':not(.legend-toggle)').length;
      if (childCount > 1) {
        $('.legend-content').css('width', '95%');
      } else {
        $('.legend-content').css('width', ''); // retour au 60% CSS
      }
    }

    // Visibility of the button "Legend"
    if (legendHeight > 2 && pulseConfig.getString('showlegend') == 'dynamic')
      $('.legend-toggle').show();
    else {
      $('.legend-toggle').hide();
    }
    if (pulseConfig.getString('showlegend') == 'false') {
      return;
    }

    // if visible && at beginning && dynamic => auto-hide
    if (!$('.legend-wrapper').hasClass('legendHidden')
      && (!manualClickOnToggleLegend)
      && (pulseConfig.getString('showlegend') == 'dynamic')) {
      // Auto-hide by default in dynamic mode
      $('.legend-wrapper').addClass('legendHidden');
    }

    if ($('.legend-wrapper').hasClass('legendHidden')) {
      let currentTranslationY = parseInt($('.legend-wrapper').css('transform').split(',')[5]);
      if (currentTranslationY > 0)
        $('.legend-wrapper').addClass('legendHiddenNoAnimation');
      $('.legend-wrapper').css({ 'transform': 'translateY(' + legendHeight + 'px)' });
    }
    else {
      if (manualClickOnToggleLegend) {
        $('.legend-wrapper').removeClass('legendHiddenNoAnimation');
        $('.legend-wrapper').css({ 'transform': 'translateY(0)' });
      }
    }
  };

  // ResizeObserver: recalcule dès que le contenu de la légende change de taille
  // (remplace le $.resize() jQuery qui n'observe pas nativement les éléments non-window)
  new ResizeObserver(() => updateLegendVisibility()).observe($('.legend-content')[0]);

  if (pulseConfig.getString('showlegend') == 'dynamic') {
    $('.legend-toggle').click(function () {
      manualClickOnToggleLegend = true;
      $('.legend-wrapper').toggleClass('legendHidden');
      updateLegendVisibility();
    });
    $('.legend-content').css({ 'border-top-left-radius': '0' });
  }
  else if (pulseConfig.getString('showlegend') == 'false') {
    $('.legend-wrapper').hide();
  }
  else if (pulseConfig.getString('showlegend') == 'true') {
    $('.legend-wrapper').show();
  }

  updateLegendVisibility(); // Call immediately
};

exports.preparePage = function (currentPageMethods) {
  pulseConfig.setGlobal('machine', ''); pulseConfig.setGlobal('group', '');
  pulseConfig.set('machine', ''); pulseConfig.set('group', ''); // clear page-specific keys left by onGroupReloaded
  for (let i = 1; i <= 20; i++) { pulseConfig.set('ancestor' + i, ''); }
  const url = new URL(window.location.href); const params = new URLSearchParams(url.search);
  params.forEach((value, key) => { if (key.startsWith('ancestor')) pulseConfig.set(key, value); });

  const groupValues = params.getAll('group');
  if (groupValues.length > 0) pulseConfig.set('group', groupValues.filter(v => v !== "").join(','), true);

  const machineValues = params.getAll('machine');
  if (machineValues.length > 0) {
    const valMachine = machineValues.filter(v => v !== "").join(',');
    pulseConfig.set('machine', valMachine, true);
    // [CORRECTION IMPORTANTE] On nettoie les IDs ici aussi
    _allMachinesCache = valMachine.split(',').map(s => s.trim());
  } else {
    let cfgMachines = pulseConfig.getArray('machine');
    if (cfgMachines && cfgMachines.length > 0) _allMachinesCache = cfgMachines;
  }

  ['showlegend', 'thresholdtargetproduction', 'thresholdredproduction', 'machinesperpage', 'rotationdelay', 'defaultlayout'].forEach(conf => { if (params.has(conf)) pulseConfig.set(conf, params.get(conf)); });

  const newParams = new URLSearchParams();
  if (params.has('AppContext')) newParams.set('AppContext', params.get('AppContext'));
  params.forEach((value, key) => { if (key.startsWith('ancestor')) newParams.set(key, value); });
  let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  if (newParams.toString()) newUrl += '?' + newParams.toString();
  window.history.replaceState({ path: newUrl }, '', newUrl);

  $.ajaxSetup({ cache: false });
  if (params.get('AppContext') == 'live') $('.pulse-content').addClass('appcontext-live');

  populateNavigationPanel();
  setNavigationLinks();
  initParameterPanel();
  animatePanels();

  $('#fullscreenbtn').click(function () { if (isFullScreen()) exitFullScreen(); else enterFullScreen(); });
  $('#darkthemebtn').prop('checked', themeManager.current() == 'dark');
  $('#darkthemebtn').click(function () { themeManager.load(themeManager.current() == 'light' ? 'dark' : 'light'); });

  let pageNameFromUrl = pulseUtility.getCurrentPageName();
  let title1 = pulseConfig.pulseTranslate('general.title', 'Atsora Tracking');
  let title2 = pulseConfig.pulseTranslate('pages.' + pageNameFromUrl + '.title', '');
  $('head').find('title').html(title2 + (title2 != '' ? ' - ' : '') + title1);
  $('.pulse-header-title span').html((title2 != '' ? title2 : title1).toUpperCase());

  // Auto-show Vue container when a vue-* page is loaded directly (e.g. vue-tasks.html)
  if (pageNameFromUrl.startsWith('vue-')) {
    showVuePage(pageNameFromUrl);
  }

  let configOk = true;
  if (typeof currentPageMethods.getMissingConfigs === 'function') { configOk = (currentPageMethods.getMissingConfigs().length == 0); }
  if (configOk) closeParameterPanel(true); else openParameterPanel(true);
  if ('home' == pageNameFromUrl) openNavigationPanel(true); else closeNavigationPanel(true);

  if (typeof currentPageMethods.buildContent === 'function') currentPageMethods.buildContent();
  if (pulseConfig.getBool('canUseRowsToSetHeight')) $('.pulse-mainarea-inner').addClass('gridFullHeight');
  else $('.pulse-mainarea-inner').removeClass('gridFullHeight');

  showLegend();

  populateConfigPanel(currentPageMethods);
  pulseSvg.inlineBackgroundSvg('#navigationpanelbtn'); pulseSvg.inlineBackgroundSvg('#configpanelbtn'); pulseSvg.inlineBackgroundSvg('#fullscreenbtn'); pulseSvg.inlineBackgroundSvg('#machineselectionbtn');
  pulseSvg.inlineBackgroundSvg('.legend-toggle-icon-up'); pulseSvg.inlineBackgroundSvg('.legend-toggle-icon-down');
  $('x-ancestors').each(function () { if (this.initialize) this.initialize(); });

  startRotationEngine();
};
