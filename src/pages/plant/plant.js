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

class PlantPage extends pulsePage.BasePage {
  constructor() {
    super();

    // General configuration
  }

  // CONFIG PANEL - Init
  initOptionValues () {
  }

  // CONFIG PANEL - Default values
  setDefaultOptionValues () {
  }

  // CONFIG PANEL - Function to read custom inputs
  getOptionValues () {
    let optionsValues = '';
    return optionsValues;
  }

  getMissingConfigs () {
    let missingConfigs = [];
    return missingConfigs;
  }

  buildContent () {
    // Add SVG to display
    pulseSvg.inlineBackgroundSvg('.svg-plant-display', PlantPage.fillSVG);
  }

  static fillSVG () {
    // Search for class machine and added parameters in SVG
    // pulse-machine-id
    let divToFill = $('.svg-plant-display').find('.machine');
    for (let i = 0; i < divToFill.length; i++) {
      if (divToFill[i].hasAttribute('atsora:machineid')) {
        let machid = divToFill[i].getAttribute('atsora:machineid'); // getAttributeNS failed

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
