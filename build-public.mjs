// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Phase 3/4 build: stage the PUBLIC (non-bundled) assets for the Vite HTML build
// from their REAL sources — no grunt dependency. Mirrors grunt copy.js + jslib:
//   scripts  <- src/scripts/*.js + pwc/libraries/{config,translation}*.js
//               + config/config_install.js + the deployed config_default.js
//   lib      <- @bower_components/momentjs, node_modules/d3, @bower_components/jquery
//   styles   <- dist-vite/styles (the compile-once CSS from build-styles.mjs)
//   images   <- pwc/images + src/images + src/pages/**/*.svg
//   vue-dist <- external/vue-dist (if staged)
// Output -> dist-vite-public/ (gitignored), used as Vite publicDir.

import { readdirSync, copyFileSync, mkdirSync, rmSync, existsSync, cpSync, statSync } from 'node:fs'
import { resolve, dirname, basename, join } from 'node:path'
import { execSync } from 'node:child_process'

const pwc = resolve('node_modules/@atsora/pomamo-web-components')
const out = resolve('dist-vite-public')

function copyTo (src, dst) {
  if (!existsSync(src)) return false
  mkdirSync(dirname(dst), { recursive: true })
  copyFileSync(src, dst)
  return true
}
function walk (dir, fn) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, fn)
    else fn(p)
  }
}

rmSync(out, { recursive: true, force: true })

// --- scripts ---
const scripts = resolve(out, 'scripts')
mkdirSync(scripts, { recursive: true })
// 1. src/scripts/*.js, minus the ones that are bundled (not loaded as classic scripts).
const SKIP = new Set(['common.js', 'common_page.js'])
for (const f of readdirSync('src/scripts').filter(f => f.endsWith('.js') && !SKIP.has(f))) {
  copyFileSync(resolve('src/scripts', f), resolve(scripts, f))
}
// 2. pwc libraries: config_component_*.js / translation_component_*.js.
for (const f of readdirSync(resolve(pwc, 'libraries')).filter(f => /^(config|translation).*\.js$/.test(f))) {
  copyFileSync(resolve(pwc, 'libraries', f), resolve(scripts, f))
}
// 3. config_install.js (local install config).
copyTo('config/config_install.js', resolve(scripts, 'config_install.js'))
// 4. deployed config_default.js overrides the generic src one (external/ staged, else the config submodule).
const deployed = existsSync('external/config_default.js') ? 'external/config_default.js'
  : '../pomamo-web-app-config/config_default.js'
copyTo(deployed, resolve(scripts, 'config_default.js'))

// --- lib (moment / d3 / jquery) ---
const LIB = {
  'lib/moment/moment.js': 'node_modules/@bower_components/momentjs/min/moment-with-locales.min.js',
  'lib/d3/d3.min.js': 'node_modules/d3/dist/d3.min.js',
  'lib/jquery/jquery.js': 'node_modules/@bower_components/jquery/dist/jquery.js',
}
for (const [dst, src] of Object.entries(LIB)) copyTo(src, resolve(out, dst))

// --- styles (compile-once CSS) ---
execSync('node build-styles.mjs', { stdio: 'inherit' })
cpSync(resolve('dist-vite/styles'), resolve(out, 'styles'), { recursive: true })

// --- images ---
const images = resolve(out, 'images')
mkdirSync(images, { recursive: true })
walk(resolve(pwc, 'images'), p => { if (/\.(svg|png|jpg|ico)$/i.test(p)) copyFileSync(p, resolve(images, basename(p))) })
if (existsSync('src/images')) cpSync('src/images', images, { recursive: true })
walk('src/pages', p => { if (p.endsWith('.svg')) copyFileSync(p, resolve(images, basename(p))) })

// --- vue bundle (optional) ---
if (existsSync('external/vue-dist')) cpSync('external/vue-dist', resolve(out, 'vue-dist'), { recursive: true })

const count = (d) => existsSync(d) ? readdirSync(d).length : 0
process.stdout.write(`public staged -> dist-vite-public/ (scripts:${count(scripts)} lib:${count(resolve(out, 'lib'))} styles:${count(resolve(out, 'styles'))} images:${count(images)})\n`)
