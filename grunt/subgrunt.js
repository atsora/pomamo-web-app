module.exports = {
  options: {
    npmPath: 'yarn'
  },
  dev: {
    'node_modules/@lemoineat/pomamo-web-components': 'jsofocamlbuild:dev'
  },
  release: {
    'node_modules/@lemoineat/pomamo-web-components': 'jsofocamlbuild:release'
  },
  exportsdev: {
    options: {
      npmInstall: false
    },
    projects: {
      'node_modules/@lemoineat/pomamo-web-components': ['clean:exports', 'browserify:exportsjs', 'lessThemes:exports', 'copy:exportsimage']
    }
  },
  exportsrelease: {
    options: {
      npmInstall: false
    },
    projects: {
      'node_modules/@lemoineat/pomamo-web-components': ['clean:exports', 'browserify:exportsjs', 'lessThemes:exports', 'obfuscator:exports', 'copy:exportsimage']
    }
  }
}
