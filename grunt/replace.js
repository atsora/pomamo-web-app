module.exports = {
  html: {
    options: {
      patterns: [
        {
          match: /\.js\?v=/g,
          replacement: '.js?v=<%= pomamoversion %>'
        },
        {
          match: /\.css\?v=/g,
          replacement: '.css?v=<%= pomamoversion %>'
        },
        {
          match: /WebAppVersion/g,
          replacement: '<%= pkg.version %>' // Web App Version
        }
      ]
    },
    files: [
      {
        expand: true,
        src: ['dist-es2015/*.html'],
        dest: 'dist-es2015/',
        flatten: true
      }
    ]
  },
  babel: {
    options: {
      patterns: [
        {
          match: /es2015/g,
          replacement: 'babel'
        },
        {
          match: /<!--babel:/g,
          replacement: ''
        },
        {
          match: /babel:-->/g,
          replacement: ''
        }/*,
        {
          match: /<!--babel-polyfill:/g,
          replacement: ''
        },
        {
          match: /babel-polyfill:-->/g,
          replacement: ''
        }*/
      ]
    },
    files: [
      {
        expand: true,                      // Enable dynamic expansion.
        cwd: 'dist-es2015/',               // Src matches are relative to this path.
        src: ['*.html'],                   // Actual pattern(s) to match.
        dest: 'dist/',                     // Destination path prefix.
      }
    ]
  },
  htmltodist:{ // Intead of babel or obfuscator
    options: {
      patterns: [
        {
          match: /es2015/g,
          replacement: 'scripts'
        }
      ]
    },
    files: [
      {
        expand: true,                      // Enable dynamic expansion.
        cwd: 'dist-es2015/',               // Src matches are relative to this path.
        src: ['*.html'],                   // Actual pattern(s) to match.
        dest: 'dist/',                     // Destination path prefix.
      }
    ]
  },
  obfuscator: {
    options: {
      patterns: [
        {
          match: /es2015/g,
          replacement: 'scripts'
        }
        /*,
        {
          match: /<!--babel-polyfill:/g,
          replacement: ''
        },
        {
          match: /babel-polyfill:-->/g,
          replacement: ''
        }*/
      ]
    },
    files: [
      {
        expand: true,                      // Enable dynamic expansion.
        cwd: 'dist-es2015/',               // Src matches are relative to this path.
        src: ['*.html'],                   // Actual pattern(s) to match.
        dest: 'dist/',                     // Destination path prefix.
      }
    ]
  }
}
