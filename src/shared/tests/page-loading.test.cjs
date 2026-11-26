/* eslint-disable @typescript-eslint/no-require-imports -- Execute the loading lifecycle with an isolated animation boundary. */
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");
const React = require("react");
const {renderToStaticMarkup} = require("react-dom/server");
const animationData = require("../assets/page-loading.json");

function harness(reduced = false) {
  let failed = false, effect, motionListener, failureListener;
  const calls = [];
  const media = {
    matches: reduced,
    addEventListener: (_, listener) => { motionListener = listener; },
    removeEventListener: () => calls.push(["unsubscribe"]),
  };
  const animation = {
    play: () => calls.push(["play"]),
    goToAndStop: (...args) => calls.push(["stop", ...args]),
    destroy: () => calls.push(["destroy"]),
    addEventListener: (_, listener) => {failureListener = listener;},
  };
  const file = path.resolve(__dirname, "../components/page-loading.tsx");
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText;
  const mod = {exports:{}};
  vm.runInNewContext(source, {
    module: mod, exports: mod.exports, structuredClone,
    window: {matchMedia: () => media},
    require: name => name === "react" ? {...React,
      useRef: () => ({current:{}}),
      useState: () => [failed, next => {failed = next;}],
      useEffect: callback => {effect = callback;},
    } : name === "@/shared/assets/page-loading.json" ? animationData
      : name === "lottie-web" ? {loadAnimation: options => {calls.push(["load", options]); return animation;}}
      : require(name),
  });
  return {
    render: props => mod.exports.default(props),
    start: () => effect(),
    calls, media,
    motion: () => motionListener(),
    fail: () => failureListener(),
  };
}

test("shared page loading preserves each page message, accessible state and both responsive sizes", () => {
  const h = harness();
  const html = renderToStaticMarkup(h.render({title:"Loading orders",description:"Preparing your orders"}));
  assert.match(html, /role="status"/);
  assert.match(html, /aria-busy="true"/);
  assert.ok(html.includes("Loading orders") && html.includes("Preparing your orders"));
  assert.ok(html.includes("size-[112px]") && html.includes("sm:size-[134.4px]"));
});

test("loading respects reduced motion, clones shared animation data and destroys listeners", async () => {
  const h = harness(true);
  h.render({});
  const cleanup = h.start();
  await new Promise(setImmediate);
  const options = h.calls.find(call => call[0] === "load")[1];
  assert.equal(options.autoplay, false);
  assert.notEqual(options.animationData, animationData);
  assert.deepEqual(h.calls.find(call => call[0] === "stop"), ["stop",30,true]);
  h.media.matches = false;
  h.motion();
  assert.ok(h.calls.some(call => call[0] === "play"));
  cleanup();
  assert.ok(h.calls.some(call => call[0] === "destroy"));
  assert.ok(h.calls.some(call => call[0] === "unsubscribe"));
});

test("a late animation import never attaches after unmount", async () => {
  const h = harness();
  h.render({});
  const cleanup = h.start();
  cleanup();
  await new Promise(setImmediate);
  assert.equal(h.calls.some(call => call[0] === "load"), false);
});

test("animation failure keeps the current page message and an accessible CSS fallback", async () => {
  const h = harness();
  h.render({});
  const cleanup = h.start();
  await new Promise(setImmediate);
  h.fail();
  const html = renderToStaticMarkup(h.render({title:"Loading cart",description:"Please wait"}));
  assert.ok(html.includes("Loading cart") && html.includes("Please wait"));
  assert.ok(html.includes("motion-safe:animate-spin"));
  cleanup();
});
