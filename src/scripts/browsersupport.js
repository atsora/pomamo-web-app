// Copyright (C) 2009-2023 Lemoine Automation Technologies
//
// SPDX-License-Identifier: Apache-2.0

function get_browser () {
  var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: (tem[1] || '') };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR\/(\d+)/)
    if (tem != null) { return { name: 'Opera', version: tem[1] }; }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
  return {
    name: M[0],
    version: M[1]
  };
}

function changePageName(href, newPageName) {
  //let href = window.location.href; // ".../pagename.html?xxx"
  let splitUrl = href.split('?');
  if (splitUrl.length < 1) {
    return ''; // No change - enable to change page name
  }
  let posPt = splitUrl[0].lastIndexOf('.');
  let posSlash = splitUrl[0].lastIndexOf('/');
  if ((posPt != -1) && (posSlash != -1)) { // Found both
    let crtPage = (splitUrl[0].slice(posSlash + 1, posPt));
    splitUrl[0] = splitUrl[0].replace(crtPage, newPageName);

    return splitUrl[0]; // remove .join('?'); because options are not useful here
  }
  return href;
}

var browser = get_browser();

// if (navigator  &&  navigator.userAgent.match( /MSIE/i ))  
if ('IE' == browser.name) {
  //if ( browser.version < 9 ){// versions under 9 are not supported by jQuery 2.1.3
  // Do not used pulseDialog, nor jquery !!!
  var href = window.location.href;
  //var newPage =
  window.location.href = changePageName(href, 'browsererror');
  /* Code to clean page AND display message
  var html = document.createElement('html');
  html.textContent = 'Internet Explorer is not supported. Please use a modern Internet Browser (Firefox, Chrome, Edge >= 86) instead';
  //'For a better user experience, you must avoid using Internet Explorer.'; // I18N
  html.className = 'browser-error';
  while (document.lastChild) {
    document.removeChild(document.lastChild);
  }
  document.appendChild(html);
  */
}
// Prepare next task :
/*
if (('Chrome' != browser.name)
  && ('Edge' != browser.name)
  && ('IE' != browser.name)) {
  // Do not used pulseDialog, nor jquery
  var html2 = document.createElement('html');
  html2.textContent = 'Oups ! Not fully tested brower ! Display could be better using a modern Internet Browser (Firefox, Chrome, Edge >= 86) instead';
  //'For a better user experience, you must avoid using Internet Explorer.'; // I18N
  html2.className = 'browser-error';

  while (document.lastChild) {
    document.removeChild(document.lastChild);
  }

  document.appendChild(html2);
}*/
