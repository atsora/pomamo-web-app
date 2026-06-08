// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

'use strict';

module.exports = function (grunt) {

  // measures the time each task takes
  require('time-grunt')(grunt);
  
  // load grunt config
  require('load-grunt-config')(grunt, {
    config: {
      pomamoversion: grunt.option('pomamoversion'),
      pkg: grunt.file.readJSON('package.json')
    }
  });
  
};
