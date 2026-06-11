// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Vite-era LESS build (compile-ONCE, replaces grunt-less-themes' compile-twice):
// each page/style .less is compiled a single time with the bridge theme.less
// prepended, producing dist-vite/styles/<name>.css full of var(--color_*). The
// runtime theme switch is a .dark class on <html> (no more style_dark/light).

import { readdirSync, statSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { execSync } from 'node:child_process'

const PWC = 'node_modules/@atsora/pomamo-web-components'
const LESSC = resolve(`${PWC}/node_modules/.bin/lessc`)
const INC = ['src/styles', PWC, `${PWC}/libraries`, `${PWC}/libraries/themes`].map(p => resolve(p)).join(':')

const pages = readdirSync('src/pages')
  .filter(d => statSync(`src/pages/${d}`).isDirectory())
  .map(d => `src/pages/${d}/${d}.less`).filter(existsSync)
const styles = ['style', 'customize', 'custom_page'].map(n => `src/styles/${n}.less`).filter(existsSync)
const entries = [...pages, ...styles]

// Regenerate the theme bridge (theme.less + theme-colors.less are GENERATED &
// gitignored) before compiling, so a fresh checkout always has them.
execSync(`node "${resolve(PWC, 'libraries/build-theme.mjs')}"`, { stdio: 'inherit' })

const out = resolve('dist-vite/styles')
rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

let ok = 0
const fails = []
for (const e of entries) {
  const name = basename(e, '.less')
  const wrapper = resolve(`_w_${name}.less`)
  // Prepend the bridge (like grunt-less-themes prepended the theme), then the page.
  writeFileSync(wrapper, `@import (once) "theme.less";\n@import (once) "${resolve(e)}";\n`)
  try {
    execSync(`${LESSC} --include-path="${INC}" "${wrapper}" "${out}/${name}.css"`, { stdio: 'pipe' })
    ok++
  }
  catch (err) {
    const msg = String(err.stderr || err.message).split('\n').find(l => /Error|undefined|not found/i.test(l)) || ''
    fails.push({ name, msg: msg.trim().slice(0, 100) })
  }
  rmSync(wrapper)
}

// The theme-colors values (one file, both :root/html.dark; no bridge needed — pure CSS vars).
execSync(`${LESSC} "${resolve(PWC, 'libraries/themes/theme-colors.less')}" "${out}/theme-colors.css"`, { stdio: 'pipe' })

process.stdout.write(`${ok}/${entries.length} .less compilés (compile-once) + theme-colors.css, ${fails.length} échec(s)\n`)
for (const f of fails.slice(0, 12)) process.stdout.write(`  ✗ ${f.name}: ${f.msg}\n`)
