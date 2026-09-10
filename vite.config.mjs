// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Vite config for the Pulse app build (replaces grunt-browserify): resolves the
// libraries (browserify-paths aliases) and handles CommonJS so each page's JS gets
// bundled + hashed. The per-page entries/output are driven by build/bundle.mjs.

import { isAbsolute, resolve } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import { defineConfig } from 'vite'

const pwc = resolve('node_modules/@atsora/pomamo-web-components')

// Replicate grunt-browserify's `paths` resolution AND its name aliases in a
// single resolveId plugin.
//
// Why both here (and NOT in Vite's resolve.alias): @rollup/plugin-commonjs only
// transforms CommonJS modules whose ids come through the normal plugin resolveId
// chain. Modules resolved via Vite's resolve.alias are left UNtransformed, so
// their raw require()/exports survive into the bundle -> "require is not defined"
// at runtime (and it cascades: e.g. pulse.customdialog.js stays raw, leaking its
// require('x-alertdialog/...') too). Resolving the libraries here, exactly like
// the x-* components, makes commonjs transform them all.
const NAME_ALIASES = {
  pulseUtility: resolve(pwc, 'libraries/pulse.utility.js'),
  pulseConfig: resolve(pwc, 'libraries/pulse.config.js'),
  pulseLogin: resolve(pwc, 'libraries/pulse.login.js'),
  pulseService: resolve(pwc, 'libraries/pulse.service.js'),
  pulseRange: resolve(pwc, 'libraries/pulse.range.js'),
  pulseSvg: resolve(pwc, 'libraries/pulse.svg.js'),
  pulseCustomDialog: resolve(pwc, 'libraries/pulse.customdialog.js'),
  eventBus: resolve(pwc, 'libraries/EventBus.js'),
  pulsePage: resolve('src/scripts/common_page.js'),
}

export function browserifyPaths () {
  // A bare specifier that is a file in one of these dirs resolves to it.
  // Handles vue_bridge (src/scripts), x-foo/x-foo (package root), pulse.* libs, etc.
  const dirs = [resolve('src/scripts'), resolve(pwc, 'libraries'), pwc]
  return {
    name: 'browserify-paths',
    resolveId (source) {
      if (Object.prototype.hasOwnProperty.call(NAME_ALIASES, source)) {
        return NAME_ALIASES[source]
      }
      if (source.startsWith('.') || source.startsWith('\0') || isAbsolute(source)) {
        return null
      }
      for (const dir of dirs) {
        for (const candidate of [resolve(dir, source), resolve(dir, `${source}.js`)]) {
          if (existsSync(candidate) && statSync(candidate).isFile()) {
            return candidate
          }
        }
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [browserifyPaths()],
  // Relative base, like atsora-vue, so each page resolves its chunks from
  // wherever the app happens to be served. Vite defaults to '/', which emitted
  // absolute "/assets/…" tags: served from a subdirectory (the installer
  // deploys under IIS as /AtrackingWebApp/) every module 404s, and the browser
  // reports it as a blocked text/html MIME type rather than a missing file.
  base: './',
  build: {
    outDir: 'dist-vite',
    emptyOutDir: false, // build/bundle.mjs manages dist-vite-pure/ itself
    minify: false,
    // Everything (pages + libraries + x-* components) is CommonJS.
    commonjsOptions: {
      include: [/node_modules/, /src/],
      transformMixedEsModules: true,
    },
  },
})
