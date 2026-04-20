#!/usr/bin/env node
// Lightweight JSX syntax check for src/rate-navigator.jsx.
// Strips ESM imports + default-export, compiles via @babel/standalone,
// and fails with a readable diagnostic if Babel throws.
//
// Usage:  node scripts/check.js
//
// Requires:  npm install (see devDependencies)

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src", "rate-navigator.jsx");
let code;
try {
  code = fs.readFileSync(SRC, "utf8");
} catch (e) {
  console.error(`error: cannot read ${SRC}: ${e.message}`);
  process.exit(1);
}

// Mirror the transformation the builder does: strip imports + default export keyword
const stripped = code
  .replace(/^import[\s\S]*?from\s+["']recharts["'];?\s*/m, "")
  .replace(/^import[\s\S]*?from\s+["']react["'];?\s*/m, "")
  .replace(/^export default /m, "");

let babel;
try {
  babel = require("@babel/standalone");
} catch (e) {
  console.error("error: @babel/standalone not installed.  Run `npm install` first.");
  process.exit(1);
}

try {
  babel.transform(stripped, {
    presets: ["react"],
    filename: "rate-navigator.jsx",
  });
  const lineCount = code.split("\n").length;
  console.log(`OK — ${lineCount} lines`);
} catch (err) {
  console.error(`SYNTAX ERROR: ${err.message}`);
  process.exit(1);
}
