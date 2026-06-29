// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Dev server for the Pulse pages — the Vite payoff: native ESM serving with HMR.
// Generate the entry HTML + public assets once, then start the server:
//   node build/bake.mjs && node build/public.mjs && vite --config vite.dev.config.mjs
//
// Since the ESM migration (CommonJS -> import/export across the whole module
// graph), the dev server serves the source natively: edit a page's JS and the
// browser hot-reloads it. And (cssHmr below) edit a page/component .less and the
// styles hot-swap live. Editing the template/partials still needs a re-run of
// build/bake.mjs (baked at generation time).

import { resolve, basename } from 'node:path'
import { existsSync, realpathSync } from 'node:fs'
import { defineConfig } from 'vite'
import { browserifyPaths } from './vite.config.mjs'

const pwc = resolve('node_modules/@atsora/pomamo-web-components')
const pwcReal = realpathSync(pwc) // symlink -> sibling repo; fs.allow + CSS url() assets need the real path

// CSS HMR (dev only): pull each page's .less INTO the Vite module graph so editing a
// page/component .less hot-swaps the styles, no reload. Normally theme-init.js loads
// the page CSS at runtime via loadCss('/styles/<page>.css'); here we (a) inject an
// import of the page .less (Vite compiles+watches it, with the bridge prepended), and
// (b) serve that static /styles/<page>.css EMPTY so the two don't double up.
// theme-colors.css / customize.css keep loading statically (page-independent).
function cssHmr () {
  return {
    name: 'pulse-css-hmr',
    transformIndexHtml: {
      order: 'pre',
      handler (html, ctx) {
        const page = basename(ctx.filename || ctx.path || '', '.html')
        if (!existsSync(resolve('src/pages', page, `${page}.less`))) return html
        return html.replace('</head>', `  <script type="module">import '/src/pages/${page}/${page}.less'</script>\n</head>`)
      },
    },
    configureServer (server) {
      server.middlewares.use((req, res, next) => {
        const m = /^\/styles\/([a-z0-9_-]+)\.css(\?.*)?$/i.exec(req.url || '')
        if (m && existsSync(resolve('src/pages', m[1], `${m[1]}.less`))) {
          res.setHeader('Content-Type', 'text/css')
          res.end('/* page CSS provided by Vite (HMR) */')
          return
        }
        next()
      })
    },
  }
}

// Dev only: with DEV_ALL_PAGES the nav lists pages that ship no <page>-icon.svg, so it
// requests a missing icon -> 404 noise. Serve an empty (invisible) SVG instead: the page
// keeps its icon-less nav entry, no console error. Prod is unaffected — the real nav
// (config_default) only lists pages that have an icon. Real icons still serve normally
// (we only step in when the file is absent).
function navIconFallback () {
  const empty = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>'
  return {
    name: 'pulse-nav-icon-fallback',
    configureServer (server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0]
        if (/^\/images\/[\w-]+-icon\.svg$/i.test(path) && !existsSync(resolve('dist-vite-public', path.slice(1)))) {
          res.setHeader('Content-Type', 'image/svg+xml')
          res.end(empty)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  root: resolve('dist-vite-pages'),       // the generated entry HTML (build/bake.mjs)
  publicDir: resolve('dist-vite-public'), // staged head deps / styles / images (build/public.mjs)
  plugins: [browserifyPaths(), cssHmr(), navIconFallback()],
  appType: 'mpa',
  // The entry HTML references the page JS as ../src/... (file-relative, for the
  // rollup build). In dev that URL-resolves to /src/... against the root — alias it.
  resolve: { alias: { '/src': resolve('src') } },
  css: {
    preprocessorOptions: {
      less: {
        // resolve the bridge (theme.less) + component/style @imports, like build/styles' INC
        paths: [resolve('src/styles'), pwc, resolve(pwc, 'libraries'), resolve(pwc, 'libraries/themes')],
        additionalData: '@import (once) "theme.less";\n', // prepend the bridge (build/styles' wrapper)
        modifyVars: { imagedir: '../images' },            // ../../images (served, clamped) -> ../images (Vite resolves relative to source)
      },
    },
  },
  // No esbuild dep discovery: it doesn't go through browserify-paths' resolveId, so
  // it can't resolve the bare aliases (pulsecomponent, pulseSvg…). Sources are served
  // on demand through the plugin chain. The few CommonJS npm deps are pre-bundled.
  optimizeDeps: { noDiscovery: true, include: ['markdown-it'] },
  server: {
    port: 5180,
    fs: { allow: [resolve('.'), pwcReal] }, // app dir + the symlinked pwc (component .less + images)
  },
})
