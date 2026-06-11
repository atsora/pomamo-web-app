// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Dev server for the Pulse pages — the Vite payoff: HMR on the page JS + LESS.
// Generate the entry HTML + public assets once, then start the server:
//   node build-html.mjs && node build-public.mjs && vite --config vite.dev.config.mjs
//
// STATUS: serving + HMR client + public assets + the page-JS path all work. The
// remaining gap is CommonJS source: Vite dev is ESM-first and does NOT run
// @rollup/plugin-commonjs (which the BUILD uses), so a `require()` in a CJS page
// entry leaks at runtime ("require is not defined"). Fixing dev fully needs a CJS
// dev transform (e.g. @originjs/vite-plugin-commonjs) — a focused follow-up. The
// production build (build-vite.mjs) is unaffected and runs clean.
//
// Editing the template/partials needs a re-run of build-html.mjs (baked at
// generation time — moving the bake into a transformIndexHtml plugin would HMR
// them too, a later refinement).

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { browserifyPaths } from './vite.config.mjs'

export default defineConfig({
  root: resolve('dist-vite-pages'),       // the generated entry HTML (build-html.mjs)
  publicDir: resolve('dist-vite-public'), // staged head deps / styles / images (build-public.mjs)
  plugins: [browserifyPaths()],
  appType: 'mpa',
  // The entry HTML references the page JS as ../src/... (file-relative, for the
  // rollup build). In dev that URL-resolves to /src/... against the root (which is
  // dist-vite-pages, with no src) — alias it back to the real source tree.
  resolve: { alias: { '/src': resolve('src') } },
  // Skip esbuild dep pre-bundling: it doesn't use browserify-paths' resolveId, so it
  // can't resolve the bare aliases (pulsecomponent, pulseSvg…). Without discovery,
  // modules are served on demand through the plugin chain instead.
  optimizeDeps: { noDiscovery: true, include: [] },
  server: {
    port: 5180,
    fs: { allow: [resolve('.')] },        // allow the ../src module entries + node_modules
  },
})
