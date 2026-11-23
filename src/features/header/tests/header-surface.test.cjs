const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function setup(pathname = "/", initialY = 0) {
  let effect, state = false, nextFrame = 0, observer;
  const events = new Map(), frames = new Map();
  const window = {
    scrollY: initialY,
    addEventListener: (name, callback) => events.set(name, callback),
    removeEventListener: name => events.delete(name),
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  const header = { getBoundingClientRect: () => ({ height: 170 }) };
  const hero = { getBoundingClientRect: () => ({ top: 170 - window.scrollY, bottom: 1800 - window.scrollY }) };
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../components/header-surface.tsx"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("require", "module", "exports", "window", "document", "ResizeObserver", code)(
    name => name === "react" ? {
      useEffect: callback => { effect = callback; },
      useRef: () => ({ current: header }),
      useState: () => [state, value => { state = value; }],
    } : name === "next/navigation" ? { usePathname: () => pathname }
      : name.endsWith(".css") ? { default: { header: "header" } } : require(name),
    module, module.exports, window, { querySelector: () => hero },
    class { constructor(callback) { observer = this; this.callback = callback; } observe() {} disconnect() { this.disconnected = true; } },
  );
  const render = () => module.exports.HeaderSurface({ children: null });
  render();
  const cleanup = effect();
  return {
    render, cleanup, events, frames, observer,
    scroll: value => {
      window.scrollY = value;
      events.get("scroll")?.();
      const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback());
    },
  };
}

test("header text becomes white when the hero reaches the header midpoint and resets after it leaves", () => {
  const s = setup();
  for (const [position, expected] of [[0,false],[84,false],[85,true],[100,true],[170,true],[900,true],[1629,true],[1630,false],[1700,false],[900,true],[0,false]]) {
    s.scroll(position);
    assert.equal(s.render().props["data-over-hero"], expected, "scrollY=" + position);
  }
  s.cleanup();
  assert.equal(s.events.size, 0);
  assert.equal(s.frames.size, 0);
  assert.equal(s.observer.disconnected, true);
});

test("restored scroll is detected and other routes keep their normal header color", () => {
  const landing = setup("/", 900);
  assert.equal(landing.render().props["data-over-hero"], true);
  landing.cleanup();
  const product = setup("/products", 900);
  assert.equal(product.render().props["data-over-hero"], false);
  assert.equal(product.events.size, 0);
});
