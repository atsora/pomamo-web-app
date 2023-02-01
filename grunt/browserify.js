module.exports = {
  dist: {
    options: {
      alias: [
        'pulse.utility.js:pulseUtility',
        'pulse.config.js:pulseConfig',
        'pulse.login.js:pulseLogin',
        'pulse.service.js:pulseService',
        'pulse.range.js:pulseRange',
        'pulse.svg.js:pulseSvg',
        'pulse.customdialog.js:pulseCustomDialog',
        'EventBus.js:eventBus',
        'common_page.js:pulsePage'
      ],
      browserifyOptions: {
        paths: ['./', 'src/scripts/', 'node_modules/@lemoineat/pomamo-web-components/libraries/', 'node_modules/@lemoineat/pomamo-web-components/'],
        debug: true /* for source map */
      }
    },
    files: [
      {
        expand: true,                       // Enable dynamic expansion.
        cwd: 'src/pages/',                  // Src matches are relative to this path.
        src: ['*/*.js'],
        dest: 'dist-es2015/es2015/',        // Destination path prefix.
        flatten: true
      },
      {
        expand: true,                       // Enable dynamic expansion.
        cwd: 'src/scripts/',                // Src matches are relative to this path.
        src: ['common.js'],
        dest: 'dist-es2015/es2015/'        // Destination path prefix.
      },
      {
        expand: true,                       // Enable dynamic expansion.
        cwd: 'src/scripts/',                // Src matches are relative to this path.
        src: ['custom_page.js'],
        dest: 'dist-es2015/es2015/'        // Destination path prefix.
      },
      {
        expand: true,                       // Enable dynamic expansion.
        cwd: 'src/scripts/',                // Src matches are relative to this path.
        src: ['custom_page_with_machines.js'],
        dest: 'dist-es2015/es2015/'        // Destination path prefix.
      }
    ]
  }
};
