// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Phase 1 driver: build every Pulse page's JS as a self-contained iife bundle
// with Vite (one build per entry, like grunt-browserify did), into dist-vite/.

import { readdirSync, rmSync, statSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'vite'

const pagesDir = resolve('src/pages')

// Page entries: src/pages/<page>/<page>.js
const pages = readdirSync(pagesDir)
  .filter(name => statSync(resolve(pagesDir, name)).isDirectory())
  .map(name => ({ name, file: resolve(pagesDir, name, `${name}.js`) }))
  .filter(e => existsSync(e.file))

// Extra script entries browserify also bundled.
const scripts = ['common', 'custom_page', 'custom_page_with_machines']
  .map(name => ({ name, file: resolve('src/scripts', `${name}.js`) }))
  .filter(e => existsSync(e.file))

const entries = [...pages, ...scripts]

// Clean once (vite.config has emptyOutDir:false so per-page builds append).
rmSync(resolve('dist-vite'), { recursive: true, force: true })

let ok = 0
const failures = []
for (const entry of entries) {
  try {
    await build({
      configFile: resolve('vite.config.mjs'),
      logLevel: 'error',
      build: {
        rollupOptions: {
          input: { [entry.name]: entry.file },
          output: {
            format: 'iife',
            entryFileNames: 'es2015/[name].js',
            inlineDynamicImports: true,
          },
        },
      },
    })
    ok++
    process.stdout.write(`✓ ${entry.name}\n`)
  }
  catch (err) {
    failures.push({ name: entry.name, message: String(err.message).split('\n')[0] })
    process.stdout.write(`✗ ${entry.name}\n`)
  }
}

process.stdout.write(`\n${ok}/${entries.length} OK, ${failures.length} échec(s)\n`)
for (const f of failures)
  process.stdout.write(`  ✗ ${f.name}: ${f.message}\n`)
