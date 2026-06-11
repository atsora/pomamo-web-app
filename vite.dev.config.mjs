// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Dev server for the Pulse pages — the Vite payoff: native ESM serving with HMR.
// Generate the entry HTML + public assets once, then start the server:
//   node build-html.mjs && node build-public.mjs && vite --config vite.dev.config.mjs
//
// Since the ESM migration (CommonJS -> import/export across the whole module
// graph), the dev server serves the source natively: edit a page's JS and the
// browser hot-reloads it, no rebuild. Editing the template/partials still needs a
// re-run of build-html.mjs (baked at generation time — moving the bake into a
// transformIndexHtml plugin would HMR them too, a later refinement).

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
  // No esbuild dep discovery: it doesn't go through browserify-paths' resolveId, so
  // it can't resolve the bare aliases (pulsecomponent, pulseSvg…). Sources are
  // served on demand through the plugin chain instead. The few npm deps that are
  // still CommonJS must be listed for pre-bundling (ESM deps are served as-is).
  optimizeDeps: { noDiscovery: true, include: ['markdown-it'] },
  server: {
    port: 5180,
    fs: { allow: [resolve('.')] },        // allow the ../src module entries + node_modules
  },
})
