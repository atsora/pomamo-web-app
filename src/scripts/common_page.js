// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseUtility = require('pulseUtility');
var pulseLogin = require('pulseLogin');
var pulseConfig = require('pulseConfig');
var pulseSvg = require('pulseSvg');
var eventBus = require('eventBus');
var pulseCustomDialog = require('pulseCustomDialog');

//require('libraries/pulse.exports.light.js'); // Global import
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

exports.BasePage = class BasePage {
  constructor() {
    // General configuration - default
    this.canConfigureColumns = true;
    this.canConfigureRows = true;
    this.showMachineselection = true;
  }
}

var openNavigationPanel = function (fast) {
  $('.menuicon').addClass('tooltip_disabled');
  if ($('#navigationpanelbtn').hasClass('disabled'))
    return;
  if (fast)
    $('#pulse-panel-navigation').addClass('notransition');
  else
    $('#pulse-panel-navigation').removeClass('notransition');
  $('#pulse-inner').removeClass('pulse-panel-navigation-collapsed');
  $('#navigationpanelbtn').addClass('activated');
};

var closeNavigationPanel = function (fast) {
  $('.menuicon').removeClass('tooltip_disabled');
  if (fast)
    $('#pulse-panel-navigation').addClass('notransition');
  else
    $('#pulse-panel-navigation').removeClass('notransition');
  $('#pulse-inner').addClass('pulse-panel-navigation-collapsed');
  $('#navigationpanelbtn').removeClass('activated');
};

var initParameterPanel = function () {
  $('.param-group-title').click(function (e) {
    let group = $(this).parents('.param-group');
    let content = $(group).find('.param-group-content').first();
    if (content.is(':visible')) {
      content.hide();
    }
    else {
      content.css('display', 'flex');
    }
    $(group).removeClass('opened');
  });
}

var openParameterPanel = exports.openParameterPanel = function (fast) {
  if ($('#configpanelbtn').hasClass('disabled'))
    return;
  if (fast)
    $('#pulse-panel-parameter').addClass('notransition');
  else
    $('#pulse-panel-parameter').removeClass('notransition');
  $('#pulse-inner').removeClass('pulse-panel-parameter-collapsed');
  $('#configpanelbtn').addClass('activated');
};

var closeParameterPanel = exports.closeParameterPanel = function (fast) {
  if (fast)
    $('#pulse-panel-parameter').addClass('notransition');
  else
    $('#pulse-panel-parameter').removeClass('notransition');
  $('#pulse-inner').addClass('pulse-panel-parameter-collapsed');
  $('#configpanelbtn').removeClass('activated');
};

var populateNavigationPanel = function () {
  let currentPage = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');
  let displayedPages = pulseConfig.getArray('displayedPages');
  let displayedApps = pulseConfig.getArray('displayedApps');

  // 1- Apps
  if (displayedApps == null || displayedApps.length == 0) {
    $('#pulse-panel-navigation').hide();
    $('#navigationpanelbtn').addClass('disabled');

    return; // Nothing to display
  }

  let currentAppIsAllowed = false;
  // Display apps icon to allow switch
  let firstTarget = null;
  let appDiv = $('.navbar-apps');
  for (let iApp = 0; iApp < displayedApps.length; iApp++) {
    let app = displayedApps[iApp];

    // Show icon :
    let appImg = $('<div></div>').addClass('navbar-app-content');

    // if current app -> selected
    //let tmpContexts = new Array();
    let tmpContexts = pulseUtility.getURLParameterValues(window.location.href, 'AppContext');
    if ((app == 'PulseWebApp') || (app == 'AtrackingWebApp')) {
      if (tmpContexts.length == 0)
        appImg.addClass('selected');
    }
    else if (app == 'Live') {
      if (tmpContexts.length > 0)
        if (tmpContexts[0] == 'live')
          appImg.addClass('selected');
    }

    let link = $('<a></a>').addClass('navbar-app-container').attr('app', app)
      .append(appImg);

    if (displayedApps.length > 1) { // Nothing displayed if only ONE is allowed
      // Set image, if imageExists
      let imgUrl = 'images/app-' + app + '.svg';

      appImg.css('backgroundImage', 'url(' + imgUrl + ')');

      appImg.src = imgUrl;


      appDiv.append(link);

      pulseSvg.inlineBackgroundSvg(appImg);
    }

    // Tooltip, link...
    let targetUrl = window.location.href;
    switch (app) {
      case 'AtrackingWebApp':
      case 'PulseWebApp': {
        if (null == pulseUtility.getURLParameter(window.location.href, 'AppContext')) {
          currentAppIsAllowed = true;
        }
        pulseUtility.addToolTip(link, 'Atsora Tracking Web app');

        // Remove AppContext
        targetUrl = pulseUtility.removeURLParameter(targetUrl, 'AppContext');
        targetUrl = pulseUtility.changePageName(targetUrl, 'home'); // or firstpage

      } break;
      case 'Live': {   // AppContext= live in URL
        if ('live' == pulseUtility.getURLParameter(window.location.href, 'AppContext')) {
          currentAppIsAllowed = true;
        }
        pulseUtility.addToolTip(link, 'Live');

        // Add AppContext + go to firstpage
        targetUrl = pulseUtility.changePageName(targetUrl, 'home'); // or firstpage
        targetUrl = pulseUtility.changeURLParameter(targetUrl, 'AppContext', 'live');

      } break;
      case 'Reports': {// use reportpath = 'http://serveraddress:8080/pulsereporting/
        pulseUtility.addToolTip(link, pulseConfig.pulseTranslate('content.reports', 'Reports'));

        targetUrl = pulseConfig.getString('reportpath', 'http://serveraddress:8080/atrackingreporting/'); // Default

        link.attr('target', '_blank'); // To open in a new tab
      } break;

      default: {
        pulseUtility.addToolTip(link, app); // translate ? I18N -> common

        targetUrl = pulseUtility.changePageName(targetUrl, 'index'); // or firstpage
        //changeApplication :
        targetUrl = targetUrl.replace('PulseWebApp', app);
        targetUrl = targetUrl.replace('AtrackingWebApp', app);

        // Add 'path' if exists in url :
        let tmpPath = pulseUtility.getURLParameterValues(window.location.href, 'path');
        if (tmpPath.length > 0) {
          targetUrl = pulseUtility.changeURLParameter(targetUrl, 'path', tmpPath[0]);
        }
        let tmpMainPath = pulseUtility.getURLParameterValues(window.location.href, 'mainpath');
        if (tmpMainPath.length > 0) {
          targetUrl = pulseUtility.changeURLParameter(targetUrl, 'mainpath', tmpMainPath[0]);
        }
      }
    }

    link.attr('href', targetUrl);

    if (iApp == 0)
      firstTarget = targetUrl;

  } // end for

  if (!currentAppIsAllowed) {
    // Go to first allowed app
    //let app = displayedApps[0];
    if (window.location.href != firstTarget) { // Hope always
      window.location.href = firstTarget;
      return;
    }
  }

  // 2- PAGES : Atsora Tracking web app or live pages
  if (displayedPages == null || displayedPages.length == 0) {
    $('#pulse-panel-navigation').hide();
    $('#navigationpanelbtn').addClass('disabled');

    return; // Nothing to display
  }
  let customPages = pulseConfig.getArray('customPages');
  let allDisplayedPages = displayedPages.concat(customPages);

  $('#navigationpanelbtn').removeClass('disabled');

  // Menu type
  let textOrNothing = (pulseConfig.getString('menuType') == 'textOrNothing');
  if (!textOrNothing) {
    $('#pulse-inner').addClass('navigation-always-visible');
  }

  // Pages
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
      if (subtitle == '') {
        li = $('<li data="' + pageName + '"><span class="menutext">' + title + '</span></li>');
      }
      else {
        if (title in mapTextMenu) {
          li = mapTextMenu[title];
          li.find('ul').append(
            $('<li ' + (selection ? ' class="selected" ' : '') + 'data="' + pageName + '">' + subtitle + '</li>')
          );
        }
        else {
          li = $('<li class="expandable"><span class="menutext">' + title + '</span><ul><li ' + (selection ? ' class="selected" ' : '') + 'data="' + pageName + '">' + subtitle + '</li></ul></li>');
          mapTextMenu[title] = li;
        }
      }
    }
    else {
      if (subtitle != '')
        title += ' (' + subtitle + ')';
      li = $('<li data="' + pageName + '"><div class="menuicon"></div><span class="menutext">' + title + '</span></li>');
      li.find('.menuicon').css('background-image', 'url(images/' + pageName + '-icon.svg)');
      pulseUtility.addToolTip(li.find('.menuicon'), title);
    }

    // Current selection
    if (selection) {
      li.addClass('selected');
    }
    ul.append(li);

    // Possibly load the icon
    pulseSvg.inlineBackgroundSvg('li[data="' + pageName + '"] .menuicon');
  }
};

var setNavigationLinks = function () {
  // Open or hide sub menu
  $('#navbar > ul > li.expandable > span').click(function () {
    let previousState = $(this).parent().find('ul').is(':visible');
    $('#navbar > ul > li > ul').hide();
    $('#navbar > ul > li > span').css('align-content', 'center');
    if (!previousState) {
      $(this).parent().find('ul').show();
      $('#navbar > ul > li > span').css('align-content', 'start');
    }
  });

  let fullURL = window.location.pathname;
  $('#navbar li').each(function () {
    // Highlight the right navigation link, depending on the url
    if (fullURL.indexOf('/' + $(this).attr('data') + '.html') !== -1) {
      $(this).addClass('selected');

      // Open and select the parent li if possible
      let grandParent = $(this).parent().parent();
      if (grandParent.hasClass('expandable')) {
        grandParent.addClass('selected');
        grandParent.find('ul').css('display', 'block');
      }
    }

    // Function called on click on left menu
    $(this).click(function () {
      let attribute = $(this).attr('data');
      if (attribute != null && attribute != '' && fullURL.indexOf('/' + attribute + '.html') == -1) {
        let newfullURL = pulseUtility.changePageName(window.location.href, attribute);
        window.location.href = newfullURL;
      }
    });
  });
};

var animatePanels = function () {
  // Click to show / hide the navigation panel
  $('#navigationpanelbtn').click(function (e) {
    if ($('#pulse-inner').hasClass('pulse-panel-navigation-collapsed')) {
      // is closed -> open
      openNavigationPanel(false);
      if ($(window).width() <= 685)
        closeParameterPanel(false);
    }
    else { // is opened -> close
      closeNavigationPanel(false);
    }
  });

  // Click to show / hide the parameter panel
  $('#configpanelbtn').click(function (e) {
    if ($('#pulse-inner').hasClass('pulse-panel-parameter-collapsed')) {
      openParameterPanel();
      if ($(window).width() <= 685)
        closeNavigationPanel(false);
    }
    else {
      closeParameterPanel(false);
    }
  });
}

var populateConfigPanel = function (currentPageMethods) {
  // Connect the "edit" button to the machine selection
  $('#editmachines').click(
    function () {
      $('x-machineselection').get(0).changeMachineSelection();
    }.bind($('x-machineselection').get(0))
  );

  $('#machineselectionbtn').click(
    function () {
      $('x-machineselection').get(0).changeMachineSelection();
    }.bind($('x-machineselection').get(0))
  );

  // Visibility of the "machine" section
  if (currentPageMethods.showMachineselection === false)
    $('.group-machines').hide();

  //// "PAGE" SECTION

  // Prepare inputs
  // common changes : row, column, rotation, title, showlegend...
  var changeRow = function () {
    $(this).attr('overridden', true);
    // Store
    if (pulseUtility.isInteger($('#gridrow').val())) {
      if ($('#gridrow').is('[overridden]')) {
        pulseConfig.set('row', $('#gridrow').val());
      }
      else {
        pulseConfig.set('row', '');
      }
    }
    // Display / Dispatch
    eventBus.EventBus.dispatchToAll('configChangeEvent',
      { 'config': 'row' });

  };
  $('#gridrow').bind('input', changeRow);
  $('#gridrow').change(changeRow);

  var changeColumn = function () {
    $(this).attr('overridden', true);
    // Store
    if (pulseUtility.isInteger($('#gridcolumn').val())) {
      if ($('#gridcolumn').is('[overridden]')) {
        pulseConfig.set('column', $('#gridcolumn').val());
      }
      else {
        pulseConfig.set('column', '');
      }
    }
    // Display / Dispatch
    eventBus.EventBus.dispatchToAll('configChangeEvent',
      { 'config': 'column' });
  };
  $('#gridcolumn').bind('input', changeColumn);
  $('#gridcolumn').change(changeColumn);

  $('#pagerotation').change(function () {
    $(this).attr('overridden', true);
    // Store
    if (pulseUtility.isInteger($('#pagerotation').val())) {
      if ($('#pagerotation').is('[overridden]')) {
        pulseConfig.set('rotation', $('#pagerotation').val());
      }
      else {
        pulseConfig.set('rotation', '');
      }
    }
    // Display / Dispatch
    eventBus.EventBus.dispatchToAll('configChangeEvent',
      { 'config': 'rotation' });

  });

  var changeTitle = function () {
    $(this).attr('overridden', true);
    // Store
    pulseConfig.set('title', encodeURIComponent($('#pagetitle').val()));
    // Display / Dispatch
    //_setPageTitle();
    let pageName = pulseConfig.getPageName();
    let title1 = pulseConfig.pulseTranslate('general.title', 'Atsora Tracking');
    let title2 = pulseConfig.pulseTranslate('pages.' + pageName + '.title', '');
    /*if (pageName == 'index') {
      // Replace by the name of the role, if specified
      let roleDisplay = getCurrentUserDisplay();
      if (roleDisplay != '')
        title2 = 'Home';
      else
        title2 = '';
    }
    else {*/
    if (pageName != 'login') {
      let override = pulseConfig.getString('title');
      if (override != null && override != '')
        title2 = decodeURIComponent(override);
    }
    $('head').find('title').html(title2 + (title2 != '' ? ' - ' : '') + title1);
    $('.pulse-header-title span').html((title2 != '' ? title2 : title1).toUpperCase());
  };
  $('#pagetitle').bind('input', changeTitle);
  $('#pagetitle').change(changeTitle);

  $('#showlegend').change(function () {
    $(this).attr('overridden', true);
    let boolIsChecked = $('#showlegend').is(':checked');
    // Store
    pulseConfig.set('showlegend', boolIsChecked);
    // Display / Dispatch
    showLegend();
    // Force resize
    $('.legend-content').resize();
  });

  // Force resize
  $('.legend-content').resize();

  // Set default GLOBAL values
  var setDefaultPage = function () {
    $('#gridrow').val(pulseConfig.getDefaultInt('row'));
    $('#gridrow').change();
    $('#gridrow').removeAttr('overridden');

    $('#gridcolumn').val(pulseConfig.getDefaultInt('column'));
    $('#gridcolumn').change();
    $('#gridcolumn').removeAttr('overridden');

    $('#pagerotation').val(pulseConfig.getDefaultInt('rotation'));
    $('#pagerotation').change();
    $('#pagerotation').removeAttr('overridden');

    $('#pagetitle').val('');
    $('#pagetitle').change();
    $('#pagetitle').removeAttr('overridden');

    if (pulseConfig.getDefaultString('showlegend') != 'dynamic')
      $('#showlegend').prop('checked', pulseConfig.getDefaultBool('showlegend'));
    $('#showlegend').change();
    $('#showlegend').removeAttr('overridden');
  };

  // Restore GLOBAL Default on click
  $('#resetpage').click(function (e) {
    setDefaultPage();
  });

  let showRow = true;
  let showColumn = true;
  let showRotation = true;
  // Restore GLOBAL values if needed - NOT default
  if (false == pulseConfig.getBool('enableGroups')) {
    $('.config-row').remove();
    $('.config-column').remove();
    $('.config-pagerotation').remove();

    showRow = false;
    showColumn = false;
    showRotation = false;
  }
  else {
    if (currentPageMethods.canConfigureColumns !== false) {
      $('#gridcolumn').val(pulseConfig.getInt('column'));
      if (pulseConfig.getDefaultInt('column') != pulseConfig.getInt('column')) {
        $('#gridcolumn').attr('overridden', 'true');
      }
    }
    else {
      $('.config-column').remove();
      showColumn = false;
    }

    if (pulseConfig.getBool('allowpagerotation') != true) {
      $('.config-row').remove();
      $('.config-pagerotation').remove();
      showRow = false;
      showRotation = false;
    }
    else {
      if (currentPageMethods.canConfigureRows !== false) {
        $('#gridrow').val(pulseConfig.getInt('row'));
        if (pulseConfig.getDefaultInt('row') != pulseConfig.getInt('row')) {
          $('#gridrow').attr('overridden', 'true');
        }
      }
      else {
        $('.config-row').remove();
        showRow = false;
      }

      // Rotation allowed
      $('#pagerotation').val(pulseConfig.getInt('rotation'));
      if (pulseConfig.getDefaultInt('rotation') != pulseConfig.getInt('rotation')) {
        $('#pagerotation').attr('overridden', 'true');
      }
    }
  }

  if (!pulseConfig.getBool('customTitle'))
    $('.config-pagetitle').remove();
  else {
    $('#pagetitle').val(decodeURIComponent(pulseConfig.getString('title')));
    if (pulseConfig.getString('title') != '') {
      $('#pagetitle').attr('overridden', 'true');
    }
  }

  // LEGEND show/Hide option
  let legendIsEmpty = ($('.legend-content')[0].childElementCount <= 1); // Always 1 child even if empty
  if (pulseConfig.getString('showlegend') == 'dynamic' || legendIsEmpty)
    $('.config-showlegend').remove();
  else {
    $('#showlegend').prop('checked', pulseConfig.getBool('showlegend')); // 'true' and 'false' can be parsed as a bool
    if (pulseConfig.getDefaultString('showlegend') != pulseConfig.getString('showlegend')) {
      $('#showlegend').attr('overridden', 'true');
    }
  }

  // Visibility of the "page" section (if empty)
  // No custom title & No access to show legend
  if ((!pulseConfig.getBool('customTitle'))
    && ((pulseConfig.getString('showlegend') == 'dynamic') || legendIsEmpty)) {
    // AND No row / column / rotation
    if (!showRow && !showColumn && !showRotation)
      $('.group-pages').hide();
  }

  // Init + set LOCAL values
  if (typeof currentPageMethods.initOptionValues === 'function')
    currentPageMethods.initOptionValues();

  // Restore LOCAL Default on click
  $('#resetoptions').click(function (e) {
    if (typeof currentPageMethods.setDefaultOptionValues === 'function')
      currentPageMethods.setDefaultOptionValues();
  });

  // Get FULL URL of the page
  var getPageFullURL = function () {
    let url = window.location.href.split('?')[0]; // Start from base URL to avoid duplicates
    let nextSeparator = '?';

    // Prepare the url with the role (for a complete url that can be stored as favorite)
    //url += 'role=' + pulseLogin.getRole();

    //if ($('x-machineselection').length == 1) {
    // Get the machines + groups
    let machineIds = pulseConfig.getArray('machine', []);
    let groupIds = pulseConfig.getArray('group', []);

    // MACHINES
    if (machineIds != 'undefined' && machineIds != null
      && machineIds != '' && machineIds != '-1') {
      //machineIds = machineIds.split(',');
      // Store LIST of machines in local storage
      //pulseConfig.set('machine', machineIds, true);
      // Create URL
      for (let i = 0; i < machineIds.length; i++) {
        url += nextSeparator + 'machine=' + machineIds[i];
        nextSeparator = '&';
      }
    }
    else {
      url += nextSeparator + 'machine=';
      nextSeparator = '&';
    }

    // GROUPS (when enabled)
    if (pulseConfig.getBool('enableGroups', false)) {
      // If not, we don't update the group list (it can be recalled in another page)
      if (groupIds != 'undefined' && groupIds != null
        && groupIds != '' && groupIds != '-1') {

        //groupIds = groupIds.split(',');
        // Store LIST of groups in local storage
        //pulseConfig.set('group', groupIds, true);
        // Create URL
        for (let i = 0; i < groupIds.length; i++)
          url += '&group=' + groupIds[i];
      }
      else { // Force NO group is defined
        url += '&group=';
      }
    }

    // Number of columns
    if ($('#gridcolumn').length == 1) {
      if (pulseUtility.isInteger($('#gridcolumn').val())) {
        url += '&column=' + $('#gridcolumn').val();
      }
    }

    // Number of rows
    if ($('#gridrow').length == 1) {
      if (pulseUtility.isInteger($('#gridrow').val())) {
        url += '&row=' + $('#gridrow').val();
      }
    }

    // Rotation frequency
    if ($('#pagerotation').length == 1) {
      if (pulseUtility.isInteger($('#pagerotation').val())) {
        url += '&rotation=' + $('#pagerotation').val();
      }
    }

    // Custom title
    if ($('#pagetitle').length == 1) {
      if ($('#pagetitle').val() != null) {
        if ($('#pagetitle').val() != '') {
          if ($('#pagetitle').is('[overridden]')) {
            url += '&title=' + encodeURIComponent($('#pagetitle').val());
          }
        }
      }
    }

    // Legend visibility
    if ($('#showlegend').length == 1) {
      url += '&showlegend=' + $('#showlegend').is(':checked');
    }

    // Extra values
    if (typeof currentPageMethods.getOptionValues === 'function')
      url += currentPageMethods.getOptionValues();

    return url;
  }

  //// BUTTON "showurl"
  $('#showurl').click(function () {
    let url = getPageFullURL();

    //let title = document.title; -> I'd like to bookmark it. But not possible for the moment

    // Display the built url = 'prompt' = generic
    pulseCustomDialog.openInfo(url, pulseConfig.pulseTranslate('content.bookmark', 'URL to bookmark'));
  });

  //// BUTTON "copyurl"
  $('#copyurl').click(function () {
    let url_to_copy = getPageFullURL();

    if (!navigator.clipboard) {
      // use old commandExec() way
      // deprecated soon but, the other way is probably not implemented everywhere yet -2022
      const tmp = document.createElement('textarea');
      tmp.value = url_to_copy;
      document.body.appendChild(tmp);
      tmp.select();
      if (document.execCommand('copy')) {
        $('#copyurl').addClass('urlcopied');
        $('#copyurl').html(pulseConfig.pulseTranslate('content.success', 'Success'));

        setTimeout(function () {
          $('#copyurl').removeClass('urlcopied');
          $('#copyurl').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL'));
        }, 3000);

      } else {
        $('#copyurl').addClass('urlcopyfailed');
        $('#copyurl').html(pulseConfig.pulseTranslate('content.failure', 'Failure'));

        setTimeout(function () {
          $('#copyurl').removeClass('urlcopyfailed');
          $('#copyurl').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL'));
        }, 3000);
      }
      document.body.removeChild(tmp);
    } else {
      navigator.clipboard.writeText(url_to_copy).then(
        function () {
          $('#copyurl').addClass('urlcopied');
          $('#copyurl').html(pulseConfig.pulseTranslate('content.success', 'Success'));

          setTimeout(function () {
            $('#copyurl').removeClass('urlcopied');
            $('#copyurl').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL'));
          }, 3000);
        })
        .catch(
          function () {
            $('#copyurl').addClass('urlcopyfailed');
            $('#copyurl').html(pulseConfig.pulseTranslate('content.failure', 'Failure'));

            setTimeout(function () {
              $('#copyurl').removeClass('urlcopyfailed');
              $('#copyurl').html(pulseConfig.pulseTranslate('content.copyurl', 'Copy URL'));
            }, 3000);
          });
    }
  });

};

var themeManager = {
  _version: '',

  load: function (name) {
    let oldTheme = pulseConfig.getString('theme', 'dark'); // first of ALL

    // Save the new value -- before ALL to happen even when an error occurs
    pulseConfig.setGlobal('theme', name);

    // Page name, for a style specific to the page
    let pageName = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');

    // Find the version of the js and css if not already read
    if (this._version == null || this._version == '') {
      this._version = $('link[rel=stylesheet][href*="style_' + oldTheme + '/' + pageName + '.css"]').attr('href').split('=')[1];
    }

    // Load the new theme
    $('head').append('<link rel="stylesheet" type="text/css" href="./styles/style_' + name + '/' + pageName + '.css?v=' + this._version + '">');

    // Unload the previous theme
    //let oldTheme = pulseConfig.getString('theme'); -- done earlier
    if (oldTheme != name) {
      $('link[rel=stylesheet][href*="./styles/style_' + oldTheme + '/' + pageName + '.css"]').remove();
    }
  },
  current: function () {
    return pulseConfig.getString('theme', 'dark');
  }
};

var showLegend = function () {
  var manualClickOnToggleLegend = false; // To allow hide legend before manual click
  var lastCalculatedHeight = 0; // Track last calculated height to detect changes

  var updatePaddingFromLegend = function () {
    // Heights of the legend and of the logo
    let legendHeight = $('.legend-content')[0].clientHeight;
    let logoHeight = 20; // See style.less

    //let legendIsEmpty = ($('.legend-content')[0].childElementCount <= 1);

    // Visibility of the button "Legend"
    if (legendHeight > 2 && pulseConfig.getString('showlegend') == 'dynamic')
      $('.legend-toggle').show();
    else {
      $('.legend-toggle').hide();
    }
    if (pulseConfig.getString('showlegend') == 'false') {
      // $('.pulse-mainarea-inner').css('padding-bottom', logoHeight + 'px'); done outside
      return;
    }

    // Check if the legend is over the data
    let visibleLegendHeight = ($('.legend-wrapper').hasClass('legendHidden')
      ? logoHeight : legendHeight);
    let inner = $('.pulse-mainarea-inner')[0];
    let innerHeight = $('.pulse-mainarea-inner')[0].clientHeight
      - parseInt($(inner).css('padding-top')) - parseInt($(inner).css('padding-bottom'));
    let availableHeight = $('.pulse-mainarea-full')[0].clientHeight
      - visibleLegendHeight - $('.legend-toggle')[0].clientHeight;
    let isAbove = innerHeight > availableHeight;

    // if visible && at beginning && dynamic && over main (ex: manager display) => hide
    if (!$('.legend-wrapper').hasClass('legendHidden')
      && (!manualClickOnToggleLegend)
      && (pulseConfig.getString('showlegend') == 'dynamic')) {

      // In that case, hide it
      if (isAbove) {
        $('.legend-wrapper').addClass('legendHidden');
      }
    }

    if ($('.legend-wrapper').hasClass('legendHidden')) {
      // Padding at the end of the page => logo height
      $('.pulse-mainarea-inner').css('padding-bottom', logoHeight + 'px');

      // Update the translation of the legend so that it remains hidden
      let currentTranslationY = parseInt($('.legend-wrapper').css('transform').split(',')[5]);
      if (currentTranslationY > 0)
        $('.legend-wrapper').addClass('legendHiddenNoAnimation'); // Remove blinking if the legend is hidden while being populated
      $('.legend-wrapper').css({
        'transform': 'translateY(' + legendHeight + 'px)'
      });
    }
    else {
      if (isAbove || manualClickOnToggleLegend) {
        // Padding at the end of the page => maximum between legend height (+ margin) and logo height
        let bottomPadding = legendHeight + $('.legend-toggle')[0].clientHeight;
        if (bottomPadding < logoHeight)
          bottomPadding = logoHeight;
        $('.pulse-mainarea-inner').css('padding-bottom', bottomPadding + 'px');

        // No translation for the legend
        $('.legend-wrapper').removeClass('legendHiddenNoAnimation');
        $('.legend-wrapper').css({
          'transform': 'translateY(0)'
        });
      }
      else {
        // Legend is visible and not overlapping - apply padding for legend height
        let bottomPadding = legendHeight + $('.legend-toggle')[0].clientHeight;
        if (bottomPadding < logoHeight)
          bottomPadding = logoHeight;
        $('.pulse-mainarea-inner').css('padding-bottom', bottomPadding + 'px');
      }
    }
    lastCalculatedHeight = legendHeight;
  };

  $('.legend-content').resize(function () {
    updatePaddingFromLegend();
  });

  // Monitor legend height changes continuously for dynamic content
  let legendMonitorInterval = setInterval(function () {
    if ($('.legend-wrapper').length === 0 || $('.legend-content').length === 0) {
      clearInterval(legendMonitorInterval);
      return;
    }

    let currentHeight = $('.legend-content')[0].clientHeight;
    if (currentHeight !== lastCalculatedHeight) {
      updatePaddingFromLegend();
    }
  }, 500); // Check every 500ms for changes

  if (pulseConfig.getString('showlegend') == 'dynamic') {
    $('.legend-toggle').click(function () {
      manualClickOnToggleLegend = true;
      $('.legend-wrapper').toggleClass('legendHidden');
      $('.legend-content').resize();
    });
    $('.legend-content').css({
      'border-top-left-radius': '0'
    });
  }
  else if (pulseConfig.getString('showlegend') == 'false') {
    $('.legend-wrapper').hide();
    let logoHeight = 20; // See style.less
    $('.pulse-mainarea-inner').css('padding-bottom', logoHeight + 'px');
  }
  else if (pulseConfig.getString('showlegend') == 'true') {
    $('.legend-wrapper').show();
  }

  updatePaddingFromLegend(); // Call it now ! .. AFTER show/hide
  // later do not work... why? -- tmp Hack : called inside each legend - DO NOT rename legend-content
};

// Enter fullscreen mode for the whole document
var enterFullScreen = function () {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  }
}

// Exit fullscreen mode if the document is currently in fullscreen
var exitFullScreen = function () {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { // Safari
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE11
    document.msExitFullscreen();
  }
}

// Check if the document is currently displayed in fullscreen mode
var isFullScreen = function () {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Prepare the main page with an object describing how to fill it
 *
 * General configuration:
 *  - showMachineselection: boolean that can be set to false to hide the machine selection
 *  - canConfigureColumns: boolean that can be set to false to hide the column number spinbox
 *
 * Page options:
 *  - getOptionValues: optional function that concats the page options in a string to be integrated in the url
 *  - initOptionValues: optional function that initializes the page options based on the current settings of the user
 *  - setDefaultOptionValues: optional function that reset the page options based on the default values
 *
 * Workflow:
 *  - getMissingConfigs: optional function that check if the configuration is complete
 *      it returns an array of elements such has:
 *      {
 *        selector: 'x-machineselection, #editmachines',
 *        message: 'Please select at least one machine before launching the page.'
 *      }
 *      if yes, the legend and the content will be built
 *      if no, the selectors will have the additional class "missing-config"
 *  - buildContent: optional function that build the content, if getMissingConfigs returns empty
 */
exports.preparePage = function (currentPageMethods) {

  pulseConfig.setGlobal('machine', '');  // Remove
  pulseConfig.setGlobal('group', '');   // Remove
  pulseConfig.set('machine', '');       // Remove page-specific value
  pulseConfig.set('group', '');        // Remove page-specific value
  // Remove config from displayed URL and store them
  let needReload = false;
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const pageName = pulseConfig.getPageName();
  const preserveAncestorParams = (pageName === 'productiontracker');
  const groupValues = params.getAll('group');
  const machineValues = params.getAll('machine');

  params.forEach((value, key) => {
    if (key === 'AppContext') {
      return;
    }

    if (key === 'group' || key === 'machine') {
      url.searchParams.delete(key);
      needReload = true;
      return;
    }

    if (key.startsWith('ancestor')) {
      pulseConfig.set(key, value);
      if (!preserveAncestorParams) {
        url.searchParams.delete(key);
        needReload = true;
      }
      return;
    }

    pulseConfig.set(key, value);
    url.searchParams.delete(key);
    needReload = true;
  });

  if (groupValues.length > 0) {
    pulseConfig.set('group', groupValues.join(','), true);
  } else {
    // No group selection -> clear ancestor system
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('ancestor')) {
        url.searchParams.delete(key);
        pulseConfig.set(key, '');
        needReload = true;
      }
    }
  }
  if (machineValues.length > 0) {
    pulseConfig.set('machine', machineValues.join(','), true);
  }

  if (needReload) {
    window.open(url.toString(), '_self');
  }

  $.ajaxSetup({
    cache: false
  }); /*remove cache for IE and Edge */

  // Add appcontext-live class if AppContext is 'live'
  if ('live' == pulseUtility.getURLParameter(window.location.href, 'AppContext')) {
    $('.pulse-content').addClass('appcontext-live');
  }

  // Create common elements - MUST BE DONE FIRST !!! Before ALL other xTag
  //initializeCheckers();- DONE in html

  // Prepare the navigation menu
  populateNavigationPanel();
  setNavigationLinks();
  initParameterPanel();

  // Open / close panels when click on them
  animatePanels();


  // Handle fullscreen button click, toggle fullscreen mode
  $('#fullscreenbtn').click(function (e) {
    if (isFullScreen()) {
      exitFullScreen();
    } else {
      enterFullScreen();
    }
  });


  // Display elements
  let pageNameFromUrl = window.location.href.replace(/(.*\/)([^\\]*)(\.html.*)/, '$2');

  // Theme switcher (to be adapted if more than 2 themes are available) and initialization
  $('#darkthemebtn').prop('checked', themeManager.current() == 'dark');
  $('#darkthemebtn').click(function () {
    themeManager.load(themeManager.current() == 'light' ? 'dark' : 'light'); // Idea: create a toggle function?
  });

  // == _setPageTitle
  let title1 = pulseConfig.pulseTranslate('general.title', 'Atsora Tracking');
  let title2 = pulseConfig.pulseTranslate('pages.' + pageNameFromUrl + '.title', '');

  if (pageNameFromUrl != 'login') {
    let override = pulseConfig.getString('title');
    if (override != null && override != '')
      title2 = decodeURIComponent(override);
  }
  $('head').find('title').html(title2 + (title2 != '' ? ' - ' : '') + title1);
  $('.pulse-header-title span').html((title2 != '' ? title2 : title1).toUpperCase());

  // Check the configuration
  let configOk = true;
  if (typeof currentPageMethods.getMissingConfigs === 'function') {
    let missingConfigs = currentPageMethods.getMissingConfigs();
    configOk = (missingConfigs.length == 0);


  }
  if (configOk) {
    closeParameterPanel(true);
  }
  else {
    openParameterPanel(true);
  }
  if ('home' == pageNameFromUrl) {
    openNavigationPanel(true);
  }
  else {
    closeNavigationPanel(true);
  }

  // Show legend
  let legendIsEmpty = ($('.legend-content')[0].childElementCount <= 1);
  if (!legendIsEmpty)
    showLegend();

  // Build PAGE content
  if (typeof currentPageMethods.buildContent === 'function')
    currentPageMethods.buildContent();

  // Grid
  if (pulseConfig.getBool('canUseRowsToSetHeight'))
    $('.pulse-mainarea-inner').addClass('gridFullHeight');
  else
    $('.pulse-mainarea-inner').removeClass('gridFullHeight');

  // Populate the configuration panel
  populateConfigPanel(currentPageMethods);

  // Inline svg. The latest possible
  pulseSvg.inlineBackgroundSvg('#navigationpanelbtn');
  pulseSvg.inlineBackgroundSvg('#configpanelbtn');
  pulseSvg.inlineBackgroundSvg('#fullscreenbtn');
  pulseSvg.inlineBackgroundSvg('#machineselectionbtn');
  pulseSvg.inlineBackgroundSvg('#help-icon');
  pulseSvg.inlineBackgroundSvg('.legend-toggle-icon-up');
  pulseSvg.inlineBackgroundSvg('.legend-toggle-icon-down');
};
