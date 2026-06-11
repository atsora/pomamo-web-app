// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Phase 3 build, step 2+3: the Vite multi-page HTML build. Takes the per-page entry
// HTML from build-html.mjs (root = dist-vite-pages/), lets Vite bundle + hash each
// page's module entry and rewrite the <script> in the emitted HTML. The classic
// head deps (theme-init, pulse-shell, config_*, translations, moment, d3, styles,
// images, vue bundle) are PUBLIC assets: Vite copies publicDir verbatim and leaves
// their "/scripts/…" tags untouched. Output -> dist-vite-pure/.
//
// NOTE (PoC): the public assets are staged from the grunt build (dist-es2015) for
// now — owning that staging cleanly is the later "assets" phase.

import { build } from 'vite'
import { readdirSync, existsSync, rmSync, mkdirSync, cpSync } from 'node:fs'
import { resolve, basename } from 'node:path'

const stagingRoot = resolve('dist-vite-pages')
const publicDir = resolve('dist-vite-public')
const grunt = resolve('dist-es2015')

// Stage the public (non-bundled) assets from the grunt output.
rmSync(publicDir, { recursive: true, force: true })
mkdirSync(publicDir, { recursive: true })
for (const sub of ['scripts', 'lib', 'styles', 'images', 'vue-dist']) {
  if (existsSync(resolve(grunt, sub))) {
    cpSync(resolve(grunt, sub), resolve(publicDir, sub), { recursive: true })
  }
}

const htmls = readdirSync(stagingRoot).filter(f => f.endsWith('.html'))
const input = Object.fromEntries(htmls.map(f => [basename(f, '.html'), resolve(stagingRoot, f)]))

await build({
  configFile: resolve('vite.config.mjs'), // reuse browserify-paths aliases + commonjs
  root: stagingRoot,
  publicDir,
  logLevel: 'warn',
  build: {
    outDir: resolve('dist-vite-pure'),
    emptyOutDir: true,
    minify: false,
    rollupOptions: { input },
  },
})

process.stdout.write(`\nBuilt ${htmls.length} pages -> dist-vite-pure/\n`)
