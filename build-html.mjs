// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Phase 3 build: replace grunt 'bake' (+ replace:html). Generate the real per-page
// entry HTML (template + per-page partials + pagename), with the page JS turned
// into a Vite MODULE entry. Vite then bundles+hashes the JS and rewrites the
// <script> in the HTML (so the manual ?v= cache-bust goes away). Output ->
// dist-vite-pages/ (staging, gitignored), consumed by the Vite multi-page build.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const pagesDir = resolve('src/pages')
const out = resolve('dist-vite-pages')

// login / validate use the standalone login template (no <pulse-shell>).
const LOGIN_TEMPLATE = new Set(['login', 'validate'])

const pages = readdirSync(pagesDir)
  .filter(n => statSync(resolve(pagesDir, n)).isDirectory())
  .filter(n => existsSync(resolve(pagesDir, n, `${n}.js`)))

function bake (page) {
  const tpl = LOGIN_TEMPLATE.has(page) ? 'template_login.html' : 'template.html'
  let html = readFileSync(resolve(pagesDir, tpl), 'utf8')

  // 1. {{pagename}} -> page name (resolves the bake paths + the JS src).
  html = html.replaceAll('{{pagename}}', page)

  // 2. partial includes: <!--(bake <relpath>)--> -> file content (relative to src/pages).
  html = html.replace(/<!--\(bake\s+(.+?)\)-->/g, (_, rel) => {
    const f = resolve(pagesDir, rel.trim())
    return existsSync(f) ? readFileSync(f, 'utf8') : ''
  })

  // 3. page JS -> Vite module entry (was <script async ... src="./es2015/<page>.js?v=">).
  //    Path is relative to the staging dir (the Vite build root); the bundle is
  //    then hashed and the tag rewritten by Vite.
  html = html.replace(
    new RegExp(`<script\\s+async[^>]*src="\\./es2015/${page}\\.js\\?v="[^>]*></script>`),
    `<script type="module" src="../src/pages/${page}/${page}.js"></script>`)

  // 4. drop the manual ?v= cache-bust (Vite hashes the bundle; public assets are
  //    served verbatim and don't need it).
  html = html.replaceAll('?v=', '')

  // 5. the classic head scripts/links (theme-init, pulse-shell, config_*, lib, …)
  //    are NOT bundled — they are public assets. Reference them with a ROOT-ABSOLUTE
  //    path ("/scripts/…") so Vite leaves them untouched (a relative "./scripts/…"
  //    makes Vite try to bundle a non-module script and fail).
  html = html.replace(/\b(src|href)="\.\//g, '$1="/')

  // 6. the Vue loader is an inline script that lazy-loads the EXTERNAL vue bundle.
  //    Make it classic (so Vite doesn't bundle it as an entry) and mark its dynamic
  //    import @vite-ignore so Vite leaves it as a runtime import to the public
  //    /vue-dist bundle (otherwise Vite tries to resolve/open it at build time).
  html = html.replace('<script type="module">', '<script>')
  html = html.replace(/import\(\s*['"]\.?\/vue-dist\/static\/index\.js['"]\s*\)/,
    "import(/* @vite-ignore */ '/vue-dist/static/index.js')")

  return html
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })

let n = 0
for (const page of pages) {
  writeFileSync(resolve(out, `${page}.html`), bake(page))
  n++
}
process.stdout.write(`${n} entry HTML generated -> dist-vite-pages/\n`)
