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
