// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Phase 1 of the Grunt -> Vite migration: bundle the Pulse pages' JS with Vite
// (replacing grunt-browserify), in PARALLEL to the existing Grunt build so
// nothing breaks. The per-page entries/output are driven by build-pages.mjs
// (one self-contained iife bundle per page, like browserify). Output -> dist-vite/.

import { isAbsolute, resolve } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import { defineConfig } from 'vite'

const pwc = resolve('node_modules/@atsora/pomamo-web-components')

// Replicate grunt-browserify's `paths` resolution: a bare specifier that is a
// file in one of these dirs resolves to it. Handles vue_bridge (src/scripts),
// x-foo/x-foo (package root), pulse.* libraries, etc.
function browserifyPaths() {
  const dirs = [resolve('src/scripts'), resolve(pwc, 'libraries'), pwc]
  return {
    name: 'browserify-paths',
    resolveId(source) {
      if (source.startsWith('.') || source.startsWith('\0') || isAbsolute(source))
        return null
      for (const dir of dirs) {
        for (const candidate of [resolve(dir, source), resolve(dir, `${source}.js`)]) {
          if (existsSync(candidate) && statSync(candidate).isFile())
            return candidate
        }
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [browserifyPaths()],
  // grunt-browserify's name aliases (the name differs from the file name).
  resolve: {
    alias: {
      pulseUtility: resolve(pwc, 'libraries/pulse.utility.js'),
      pulseConfig: resolve(pwc, 'libraries/pulse.config.js'),
      pulseLogin: resolve(pwc, 'libraries/pulse.login.js'),
      pulseService: resolve(pwc, 'libraries/pulse.service.js'),
      pulseRange: resolve(pwc, 'libraries/pulse.range.js'),
      pulseSvg: resolve(pwc, 'libraries/pulse.svg.js'),
      pulseCustomDialog: resolve(pwc, 'libraries/pulse.customdialog.js'),
      eventBus: resolve(pwc, 'libraries/EventBus.js'),
      pulsePage: resolve('src/scripts/common_page.js'),
    },
  },
  build: {
    outDir: 'dist-vite',
    emptyOutDir: false, // build-pages.mjs clears it once, then appends per page
    minify: false,
    // Everything (pages + libraries + x-* components) is CommonJS.
    commonjsOptions: {
      include: [/node_modules/, /src/],
      transformMixedEsModules: true,
    },
  },
})
