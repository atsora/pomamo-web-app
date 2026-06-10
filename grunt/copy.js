// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

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
        src: ['pulse.exports.light.js', 'translation_component_*.js', 'config_component_*.js'],
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
  vuedist: {
    // Copy the built Vue app into the Pulse bundle. The source lives in the local
    // input dir external/vue-dist/, populated by the root orchestrator (rebuild.sh)
    // from atsora-vue/dist/. This grunt build never reaches into a sibling repo —
    // the .sh is the only thing that knows the submodules sit side by side.
    files: [
      {
        expand: true,
        cwd: 'external/vue-dist/',
        src: ['**/*'],
        dest: 'dist-es2015/vue-dist/'
      }
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
  configOverride: {
    // Override `config_default.js` with the deployed one. The source lives in the
    // local input dir external/config_default.js, staged by the root orchestrator
    // (rebuild.sh) from pomamo-web-app-config/ — no sibling-repo path here.
    // Used in the `default` build target only — release/beta keep the generic
    // `src/scripts/config_default.js`.
    files: [
      { 'dist-es2015/scripts/config_default.js': 'external/config_default.js' }
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
    // Ships an EMPTY config_install.js — release/installer scenarios only.
    // Not used by the `default`/`dev` (local) builds, which use configLocal below.
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
  configLocal: {
    // Local dev build: install the real config_install.js (from config/) directly,
    // so the `default`/`dev` aliases produce a ready-to-run bundle without any
    // post-build restore step. (There is no src/scripts/config_install.js, so this
    // is the single source of config_install.js for local builds.)
    files: [
      { 'dist-es2015/scripts/config_install.js': 'config/config_install.js' }
    ]
  },
  jslib: {
    files: [
      { 'dist-es2015/lib/moment/moment.js': 'node_modules/@bower_components/momentjs/min/moment-with-locales.min.js' },
      { 'dist-es2015/lib/d3/d3.min.js': 'node_modules/d3/dist/d3.min.js' },
      // TODO: jQuery is being phased out (jQuery → vanilla migration in progress).
      // Kept in the bundle until the last `$()` usage in pomamo-web-components is removed.
      { 'dist-es2015/lib/jquery/jquery.js': 'node_modules/@bower_components/jquery/dist/jquery.js' }
    ]
  },
  release: {
    files: [
      {
        expand: true,
        cwd: 'dist-es2015/',
        src: ['images/**', 'lib/**', 'scripts/**', 'styles/**', 'vue-dist/**'],
        dest: 'dist/'
      }
    ]
  },
  beta: {
    files: [
      {
        expand: true,
        cwd: 'dist-es2015/',
        src: ['images/**', 'lib/**', 'scripts/**', 'styles/**', 'vue-dist/**'],
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
