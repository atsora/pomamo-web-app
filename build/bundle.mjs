// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Phase 3 build, step 2+3: the Vite multi-page HTML build. Takes the per-page entry
// HTML from build/bake.mjs (root = dist-vite-pages/), lets Vite bundle + hash each
// page's module entry and rewrite the <script> in the emitted HTML. The classic
// head deps (theme-init, pulse-shell, config_*, translations, moment, d3, styles,
// images, vue bundle) are PUBLIC assets: Vite copies publicDir verbatim and leaves
// their "/scripts/…" tags untouched. Output -> dist-vite-pure/.
//
// The public assets are staged by build/public.mjs from their real sources
// (src/scripts, pwc libraries, config repo, node_modules, dist-vite/styles) — the
// whole app build is now grunt-independent.

import { build } from 'vite'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { execSync } from 'node:child_process'
import JavaScriptObfuscator from 'javascript-obfuscator'

const stagingRoot = resolve('dist-vite-pages')
const publicDir = resolve('dist-vite-public')
const release = process.argv.includes('--release') // grunt 'release' == + obfuscation

// Stage the public (non-bundled) assets from their real sources (no grunt).
execSync('node build/public.mjs', { stdio: 'inherit' })

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
    minify: 'esbuild',
    rollupOptions: { input },
  },
})

// Release == obfuscate the bundled JS, like the old grunt 'obfuscator' task (which
// ran javascript-obfuscator over the browserified output). Same engine, default
// options. Beta leaves the esbuild-minified bundles readable-ish (not obfuscated).
if (release) {
  const assetsDir = resolve('dist-vite-pure/assets')
  const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'))
  for (const f of jsFiles) {
    const p = resolve(assetsDir, f)
    const obfuscated = JavaScriptObfuscator.obfuscate(readFileSync(p, 'utf8')).getObfuscatedCode()
    writeFileSync(p, obfuscated)
  }
  process.stdout.write(`Obfuscated ${jsFiles.length} bundles (release).\n`)
}

process.stdout.write(`\nBuilt ${htmls.length} pages -> dist-vite-pure/ (${release ? 'RELEASE — obfuscated' : 'beta — minified'})\n`)
