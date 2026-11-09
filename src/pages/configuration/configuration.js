// Copyright (C) 2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

import * as pulsePage from 'pulsePage';
import * as pulseConfig from 'pulseConfig';
import * as pulseUtility from 'pulseUtility';

import 'x-tr/x-tr';

/**
 * Configuration page: one entry in the navigation for all the configuration
 * pages (reasons, planning templates, machine planning...), listed here as links.
 *
 * The linked pages are the configurationPages config key (config_default.js,
 * can be overloaded per role), their titles and descriptions the translations
 * pages.<page>.title and pages.<page>.description. A link keeps the parameters
 * of the URL (machines, web service...), as the navigation does.
 *
 * @extends pulsePage.BasePage
 */
class ConfigurationPage extends pulsePage.BasePage {
  constructor () {
    super();

    this.showMachineselection = false;
  }

  /**
   * No required configuration — the links are always displayed.
   *
   * @returns {Array<{selector: string, message: string}>} Empty list.
   */
  getMissingConfigs () {
    return [];
  }

  /** Fill the list of the links */
  buildContent () {
    let list = document.querySelector('.configuration-links');
    if (list == null) return;
    list.innerHTML = '';
    let pages = pulseConfig.getArray('configurationPages');
    for (let i = 0; i < pages.length; i++) {
      let pageName = pages[i];
      let link = document.createElement('a');
      link.className = 'configuration-link';
      link.setAttribute('href', this._getPageUrl(pageName));
      let title = document.createElement('span');
      title.className = 'configuration-link-title';
      title.textContent = pulseConfig.pulseTranslate('pages.' + pageName + '.title', pageName);
      link.appendChild(title);
      let description = pulseConfig.pulseTranslate('pages.' + pageName + '.description', '');
      if (description != '') {
        let descriptionSpan = document.createElement('span');
        descriptionSpan.className = 'configuration-link-description';
        descriptionSpan.textContent = description;
        link.appendChild(descriptionSpan);
      }
      let item = document.createElement('li');
      item.appendChild(link);
      list.appendChild(item);
    }
  }

  /**
   * URL of a page: the current URL with another page name, without the
   * drill-down parameters (ancestor*), as a click in the navigation
   *
   * @param {string} pageName - Page to link to
   * @returns {string} URL of the page
   */
  _getPageUrl (pageName) {
    let url = new URL(pulseUtility.changePageName(window.location.href, pageName));
    [...url.searchParams.keys()].filter(k => k.startsWith('ancestor')).forEach(k => url.searchParams.delete(k));
    return url.toString();
  }
}

pulsePage.preparePage(new ConfigurationPage());
