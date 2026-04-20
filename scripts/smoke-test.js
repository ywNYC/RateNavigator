#!/usr/bin/env node
// Smoke test — verifies the built dist/index.html actually instantiates
// each top-level tool component without throwing.
//
// Usage:  node scripts/smoke-test.js
//
// Runs after `npm run build`.  The test extracts the compiled bundle
// from dist/index.html, registers fake globals (React/ReactDOM/Recharts)
// in a jsdom window, compiles the JSX at runtime via @babel/standalone,
// and asserts that each of the 5 main components renders.

const fs = require("fs");
const path = require("path");

const HTML = path.join(__dirname, "..", "dist", "index.html");
let html;
try {
  html = fs.readFileSync(HTML, "utf8");
} catch (e) {
  console.error(`error: cannot read ${HTML}.  Run \`npm run build\` first.`);
  process.exit(1);
}

// Extract the JSX source from between the <script type="text/babel"> tags
const match = html.match(/<script type="text\/babel">\n([\s\S]*?)\n<\/script>/);
if (!match) {
  console.error("error: could not locate JSX source block in dist/index.html");
  process.exit(1);
}
const jsx = match[1];

// Stub a DOM so React can mount
let JSDOM;
try {
  ({ JSDOM } = require("jsdom"));
} catch (e) {
  console.error("error: jsdom not installed.  Run `npm install` first.");
  process.exit(1);
}

const dom = new JSDOM(`<!DOCTYPE html><div id="root"></div>`, {
  pretendToBeVisual: true,
  url: "http://localhost/",
});
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

const React = require("react");
const ReactDOM = require("react-dom/client");
global.React = React;
global.ReactDOM = ReactDOM;
// Recharts is referenced globally by the built file but not used in the tools
// we test below — stub it with pass-through components so imports resolve.
global.Recharts = new Proxy(
  {},
  { get: () => (props) => React.createElement("div", props, props && props.children) }
);

const babel = require("@babel/standalone");

// Silence benign React SSR warnings about lowercase SVG child elements
// (recharts renders <linearGradient>/<stop>/etc. which React thinks might
// be unknown custom components — they're valid SVG).
const origErr = console.error;
console.error = (msg, ...rest) => {
  if (typeof msg === "string" && /^Warning:/i.test(msg)) return;
  origErr.call(console, msg, ...rest);
};

// Compile + eval the JSX in-context
const compiled = babel.transform(jsx, { presets: ["react"] }).code;

// Run the code so all top-level functions become defined in this scope.
// We wrap in an IIFE that returns a map of the components we want to test.
const wrapped = `
  ${compiled}
  return {
    MortgageEstimator: typeof MortgageEstimator === "function" ? MortgageEstimator : null,
    ArmNavigator:      typeof ArmNavigator === "function" ? ArmNavigator : null,
    PointsAnalyzer:    typeof PointsAnalyzer === "function" ? PointsAnalyzer : null,
    RefiAnalyzer:      typeof RefiAnalyzer === "function" ? RefiAnalyzer : null,
    ExchangeAnalyzer:  typeof ExchangeAnalyzer === "function" ? ExchangeAnalyzer : null,
  };
`;
const factory = new Function("React", "ReactDOM", "Recharts", wrapped);
const components = factory(React, ReactDOM, global.Recharts);

let failed = 0;
for (const [name, Component] of Object.entries(components)) {
  if (!Component) {
    console.error(`${name}: MISSING (not defined in source)`);
    failed++;
    continue;
  }
  try {
    // Render to string via react-dom/server to avoid full DOM mounting cost
    const { renderToString } = require("react-dom/server");
    const out = renderToString(React.createElement(Component, { onBack: () => {}, lang: "cn" }));
    if (!out || out.length < 100) {
      console.error(`${name}: render produced suspiciously short output (${out?.length ?? 0} chars)`);
      failed++;
    } else {
      console.log(`${name}: OK`);
    }
  } catch (e) {
    console.error(`${name}: THROWS — ${e.message}`);
    failed++;
  }
}

process.exit(failed > 0 ? 1 : 0);
