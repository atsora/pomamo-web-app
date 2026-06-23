// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Build the Vite app (replaces the grunt pipeline). Two steps:
//   1. build/bake.mjs    -> per-page entry HTML (template + partials)
//   2. build/bundle.mjs  -> stage public (public -> styles) + Vite multi-page
//                           build (bundle + hash + minify) into dist-vite-pure/
//
//   node build/app.mjs            beta — minified, NOT obfuscated
//   node build/app.mjs --release  release — obfuscated (javascript-obfuscator, the
//                                  same engine the old grunt 'release' task used)
//
// Obfuscation happens ONLY with --release (a release is produced only via this flag,
// build-pulse.sh --release, or release.sh — never the plain build). Run from pomamo-web-app/.

import { execSync } from 'node:child_process'

const release = process.argv.includes('--release')

execSync('node build/bake.mjs', { stdio: 'inherit' })
execSync(`node build/bundle.mjs${release ? ' --release' : ''}`, { stdio: 'inherit' })
