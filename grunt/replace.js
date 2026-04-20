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
          replacement: '<%= pomamoversion %>' // <%= pkg.version =%> may work, but be more consistent using the same method as above
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
  sourcemaps: {
    options: {
      patterns: [
        {
          match: /\/\/# sourceMappingURL=.*$/gm,
          replacement: ''
        }
      ]
    },
    files: [
      { src: 'dist-es2015/lib/jquery/jquery.js', dest: 'dist-es2015/lib/jquery/jquery.js' },
      { src: 'dist-es2015/lib/moment/moment.js', dest: 'dist-es2015/lib/moment/moment.js' }
    ]
  },
  obfuscator: {
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
  }
}
