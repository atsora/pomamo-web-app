module.exports = {
  exportsdev: {
    files: [
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/about/exports/scripts/',
        src: ['pulse.exports*.js'],
        dest: 'dist-es2015/scripts/'
      },
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/about/exports/',
        src: ['*/pulse.exports*.css'],
        dest: 'dist-es2015/styles/'
      }
    ]
  },
  exportsrelease: {
    files: [
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/about/exports/obfusc/',
        src: ['pulse.exports*.js'],
        dest: 'dist-es2015/scripts/'
      },
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/about/exports/',
        src: ['*/pulse.exports*.css'],
        dest: 'dist-es2015/styles/'
      }
    ]
  },
  exportstoreport: {
    files: [
      {
        expand: true,
        cwd: 'dist-es2015/scripts/',
        src: ['pulse.exports.light.js', 'translation_pulsecomponent_default.js', 'config_pulsecomponent_default.js'],
        dest: '../ReportWebApp/pulse.reporting/src/main/webapp/js'
      },
      {
        expand: true,
        cwd: 'dist-es2015/styles/',
        src: ['*/pulse.exports.light.css'],
        dest: '../ReportWebApp/pulse.reporting/src/main/webapp/css'
      },
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/about/exports/images/',
        src: ['*.*'],
        dest: '../ReportWebApp/pulse.reporting/src/main/webapp/images'
      }
    ]
  },
  img: {
    files: [
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/images/',
        src: ['*.svg','*.png','*.jpg','*.ico'],
        dest: 'dist-es2015/images/'
      },
      {
        expand: true,
        cwd: 'src/images/',
        src: ['**/*.*'],
        dest: 'dist-es2015/images/'
      },
      {
        expand: true,
        cwd: 'src/pages/',
        src: ['**/*.svg'],
        dest: 'dist-es2015/images/',
        flatten: true
      },
      {
        expand: true,
        cwd: 'src/pages/',
        src: ['**/*.png'],
        dest: 'dist-es2015/images/preview',
        flatten: true
      }
    ]
  },
  webconfig: {
    files: [
      { 'dist-es2015/web.config': 'web.config' },
      { 'dist-es2015/.htaccess': '.htaccess' }
    ]
  },
  css: {
    files: [
      { // customize.less -> tmp file needed to generate customize.css
        expand: true,
        cwd: 'src/styles/',
        src: ['customize.less'],
        dest: 'dist-es2015/styles/'
      },
      {
        expand: true,
        cwd: 'src/pages/',
        src: ['**/*.css'],
        dest: 'dist-es2015/styles/',
        flatten: true
      }
    ]
  },
  js: {
    files: [
      {
        expand: true,
        cwd: 'src/scripts/',
        src: ['*.js', '!common.js', '!common_page.js'],
        dest: 'dist-es2015/scripts/'
      },
      {
        expand: true,
        cwd: 'src/scripts/',
        src: ['*.js'],
        dest: 'dist-es2015/es2015/',
        filter: 'isFile'
      },
      {
        expand: true,
        cwd: 'node_modules/@atsora/pomamo-web-components/libraries/',
        src: ['translation*.js', 'config*.js'],
        dest: 'dist-es2015/scripts/'
      }
    ]
  },
  custompages: { /* we could copy all directory... */
    files: [
      {
        expand: true,
        cwd: 'dist-es2015/es2015/',
        src: ['custom_pag*.js'],
        dest: 'dist-es2015/scripts/'
      }
    ]
  },
  fixedpages: {
    files: [
      {
        expand: true,
        cwd: 'src/pages/',
        src: ['*/browsererror.html'],
        dest: 'dist-es2015/',
        flatten: true
      }
    ]
  },
  configEmpty: {
    files: [
      {
        expand: true,
        cwd: 'config/',
        src: ['config_install_empty.js'],
        dest: 'dist-es2015/scripts/',
        rename: function (dest, src) {
          return 'dist-es2015/scripts/config_install.js';
        }
      }
    ]
  },
  jslib: {
    files: [
      { 'dist-es2015/lib/jquery/jquery.js': 'node_modules/@bower_components/jquery/dist/jquery.min.js' },
      { 'dist-es2015/lib/moment/moment.js': 'node_modules/@bower_components/momentjs/min/moment-with-locales.min.js' },
      { 'dist-es2015/lib/d3/d3.min.js': 'node_modules/d3/dist/d3.min.js' }
    ]
  },
  release: {
    files: [
      {
        expand: true,
        cwd: 'dist-es2015/',
        src: ['images/**', 'lib/**', 'scripts/**', 'styles/**'],
        dest: 'dist/'
      }
    ]
  },
  beta: {
    files: [
      {
        expand: true,
        cwd: 'dist-es2015/',
        src: ['images/**', 'lib/**', 'scripts/**', 'styles/**'],
        dest: 'dist/'
      },
      {
        expand: true,
        cwd: 'dist-es2015/es2015/',
        src: ['*.js'],
        dest: 'dist/scripts/'
      }
    ]
  },
  linux: {
    files: [
      {
        expand: true,
        cwd: 'config/',
        src: ['config_install_*.js'],
        dest: 'dist/scripts/template/',
      }
    ]
  }
};
