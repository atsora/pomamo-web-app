// Copyright (C) 2023-2026 Atsora Solutions
//
// SPDX-License-Identifier: Apache-2.0
//
// Single entry point for the Vite app build (replaces the grunt pipeline):
//   1. build-html.mjs       -> per-page entry HTML (bake: template + partials)
//   2. build-vite-html.mjs  -> stage public (build-public -> build-styles) + Vite
//                              multi-page build (bundle + hash + minify) into dist-vite-pure/
// Run from pomamo-web-app/.

import { execSync } from 'node:child_process'

execSync('node build-html.mjs', { stdio: 'inherit' })
execSync('node build-vite-html.mjs', { stdio: 'inherit' })
