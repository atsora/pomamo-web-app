// WARNING ! 'dist-es2015/styles' directory MUST exist before starting lessTheme (copy:css do it)
module.exports = {
  build : {
    options : {
      themes: ['dark', 'light'],
      themeDir: 'node_modules/@atsora/pomamo-web-components/libraries/themes',
      output: 'dist-es2015/styles',
      relativeUrls : false,
      paths : ['src/styles/', 'node_modules/@atsora/pomamo-web-components/', 'node_modules/@atsora/pomamo-web-components/libraries/', 'dist-es2015/styles/'],
      themeImport: 'dist-es2015/styles/theme.less' // tmp file created and used here 
    },
    files: [
      {
        expand: true,                      // Enable dynamic expansion.
        cwd: 'src/pages/',                 // Src matches are relative to this path.
        src: ['**/*.less'],                // Actual pattern(s) to match.
        dest: 'style_{{themeName}}',       // Destination path prefix.
        ext: '.css',                       // Dest filepaths will have this extension.
        extDot: 'last',
        flatten: true
      },
      {
        expand: true,                      // Enable dynamic expansion.
        cwd: 'src/styles/',                // Src matches are relative to this path.
        src: ['custom_page.less'],         // Actual pattern(s) to match.
        dest: 'style_{{themeName}}',       // Destination path prefix.
        ext: '.css',                       // Dest filepaths will have this extension.
        extDot: 'last',
        flatten: true
      },
      {
        expand: true,                      // Enable dynamic expansion.
        cwd: 'src/styles/',                // Src matches are relative to this path.
        src: ['customize.less'],           // Actual pattern(s) to match.
        dest: 'style_{{themeName}}',       // Destination path prefix.
        ext: '.css',                       // Dest filepaths will have this extension.
        extDot: 'last',
        flatten: true
      }
    ]
  }
};
