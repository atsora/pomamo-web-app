module.exports = {
  dev: {
    options: {
      presets: ['@babel/preset-env'],
      plugins: ['@babel/transform-new-target' // Juste pour les new.target
      ],
      comments: true,
      compact: false,
      minified: false,
      sourceMap: true
    },
    files: [
      {
        expand: true,                       // Enable dynamic expansion.
        cwd: 'dist-es2015/es2015/',         // Src matches are relative to this path.
        src: ['**/*.js'],                   // Actual pattern(s) to match.
        dest: 'dist/babel/'                 // Destination path prefix.
      }
    ]
  }
}
