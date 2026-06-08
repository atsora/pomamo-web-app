// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  dist: {
    options: {
    },
    files: [
      {
        expand: true,                   // Enable dynamic expansion.
        cwd: 'dist-es2015/es2015/',     // Src matches are relative to this path.
        src: ['**/*.js'],               // Actual pattern(s) to match.
        dest: 'dist/scripts/'           // Destination path prefix.
      }
    ]
  }
}
