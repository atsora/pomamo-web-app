// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2025 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

var pulseConfig = require('pulseConfig');
var pulsePage = require('pulsePage');
var pulseSvg = require('pulseSvg');

require('x-machinedisplay/x-machinedisplay');
require('x-reasonbutton/x-reasonbutton');
require('x-tr/x-tr');

/**
 * Plant page — SVG floor-plan view with embedded reason buttons.
 *
 * Inlines the `.svg-plant-display` background SVG and, for every
 * `.machine` element carrying an `atsora:machine-id` attribute,
 * inserts a `<foreignObject>` containing an `x-reasonbutton` bound to
 * that machine. No options, no machine selection required.
 *
 * Components: x-reasonbutton, x-machinedisplay, x-tr.
 *
 * @extends pulsePage.BasePage
 */
class PlantPage extends pulsePage.BasePage {
  constructor() {
    super();
  }

  /** No configurable options. */
  // CONFIG PANEL - Init
  initOptionValues () {
  }

  /** No configurable options. */
  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
  }

  /** No configurable options. */
  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    return '';
  }

  /**
   * No required configuration — the plant page is always renderable.
   *
   * @returns {Array<{selector: string, message: string}>} Empty list.
   */
  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

  /**
   * Inlines the floor-plan SVG and hands it to {@link PlantPage.fillSVG}
   * to inject one `x-reasonbutton` per tagged machine.
   */
  buildContent () {
    pulseSvg.inlineBackgroundSvg('.svg-plant-display', PlantPage.fillSVG);
  }

  /**
   * For every `.machine` node carrying `atsora:machine-id`, drops a
   * `<foreignObject>` containing a `x-reasonbutton` bound to that id
   * (sized and positioned to match the source rect).
   */
  static fillSVG () {
    let divToFill = $('.svg-plant-display').find('.machine');
    for (let i = 0; i < divToFill.length; i++) {
      if (divToFill[i].hasAttribute('atsora:machine-id')) {
        let machid = divToFill[i].getAttribute('atsora:machine-id'); // getAttributeNS failed

        let button = $('<x-reasonbutton></x-reasonbutton>')
          .attr('machine-id', machid)
          .addClass('svg-embedded'); // Keep it for isVisible call

        let foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');

        $(foreign).attr('width', divToFill[i].getAttribute('width'));
        $(foreign).attr('height', divToFill[i].getAttribute('height'));
        $(foreign).attr('x', divToFill[i].getAttribute('x'));
        $(foreign).attr('y', divToFill[i].getAttribute('y'));
        $(foreign).append(button);

        $(foreign).insertAfter(divToFill[i]);
      }
    }
  }

}

$(document).ready(function () {
  pulsePage.preparePage(new PlantPage());
});
