#!/usr/bin/env node
// Fails if any shipped doc text contains private data or a leftover self-host link.
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { findPrivateData } from "./lib/docs-transform.mjs"

async function walk(dir) {
  const out = []
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

const errors = []
for (const root of ["content/docs", "public/docs"]) {
  for (const file of await walk(root)) {
    const text = await readFile(file, "utf8")
    for (const hit of findPrivateData(text)) errors.push(`${file}: ${hit.name} "${hit.match}"`)
    if (/\/docs\/self-host\b|\/docs\/cockpit\b/.test(text)) errors.push(`${file}: stale docs link`)
  }
}
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("docs check ok")
