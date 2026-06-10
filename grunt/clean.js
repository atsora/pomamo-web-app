// Copyright (C) 2009-2023 Lemoine Automation Technologies
// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0

module.exports = {
  dist: {
    files: [{
      dot: true,
      src: ['dist-es2015','dist']
    }]
  },
  less: { // Clean tmp files
    files: [{
      dot: true,
      src: ['dist/styles/*.less','dist-es2015/styles/*.less']
    }]
  }
};
