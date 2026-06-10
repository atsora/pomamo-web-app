// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  options: {
    npmPath: 'yarn'
  },
  dev: {
    'node_modules/@atsora/pomamo-web-components': 'jsofocamlbuild:dev'
  },
  release: {
    'node_modules/@atsora/pomamo-web-components': 'jsofocamlbuild:release'
  },
  exportsdev: {
    options: {
      npmInstall: false
    },
    projects: {
      'node_modules/@atsora/pomamo-web-components': ['clean:exports', 'browserify:exportsjs', 'lessThemes:exports', 'copy:exportsimage']
    }
  },
  exportsrelease: {
    options: {
      npmInstall: false
    },
    projects: {
      'node_modules/@atsora/pomamo-web-components': ['clean:exports', 'browserify:exportsjs', 'lessThemes:exports', 'obfuscator:exports', 'copy:exportsimage']
    }
  }
}
