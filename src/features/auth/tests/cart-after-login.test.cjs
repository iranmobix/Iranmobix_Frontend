/* eslint-disable @typescript-eslint/no-require-imports -- Isolated login and merge boundaries. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

function load(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function("require", "module", "exports", source)((name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "react/jsx-runtime") return require(name);
    throw new Error("Unexpected dependency: " + name);
  }, mod, mod.exports);
  return mod.exports;
}

test("the active login screen renders cart transfer instead of redirecting immediately", () => {
  const React = require("react"), { renderToStaticMarkup } = require("react-dom/server");
  const Flow = load("../components/auth-flow.tsx", {
    "./auth-logo": { default: () => null },
    "../hooks/useOtpFlow": { useOtpFlow: () => ({ step: "LOGGED_IN" }) },
    "./otp-section": { default: () => null },
    "./identity-form": { IdentityForm: () => null },
    "next/navigation": { useSearchParams: () => new URLSearchParams("returnTo=%2Fcart") },
    "@/features/cart/components/cart-merge-after-login": {
      default: ({ returnTo }) => React.createElement("div", { "data-merge-return-to": returnTo }, "transferring"),
    },
  }).default;
  const html = renderToStaticMarkup(React.createElement(Flow));
  assert.ok(html.includes('data-merge-return-to="/cart"'));
  assert.ok(html.includes("transferring"));
  assert.ok(!html.includes("Login Success"));
});

function mergeFlow() {
  const calls = [], records = [], operation = { current: null };
  let outcome = { status: "pending" }, cursor = 0, stateUpdates = 0, resolve, reject;
  const pending = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  const mutateAsync = () => { calls.push(["merge"]); return pending; };
  const router = { replace: (url) => calls.push(["navigate", url]) };
  const { useCartMergeFlow } = load("../../cart/hooks/use-cart-merge-flow.ts", {
    react: {
      useRef: () => operation,
      useState: () => [outcome, (next) => { outcome = next; stateUpdates++; }],
      useEffect: (fn, deps) => {
        const index = cursor++, previous = records[index];
        if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
          records[index] = { fn, deps, cleanup: previous?.cleanup, pending: true };
        }
      },
    },
    "next/navigation": { useRouter: () => router },
    // Reproduce the stale mutation UI: only the operation promise completes.
    "./use-cart-actions": { useMergeGuestCart: () => ({
      mutateAsync, isPending: true, isSuccess: false,
    }) },
    "../utils/cart.utils": { getCartMergeIssues: (result) => result.issues },
  });
  return {
    calls, resolve, reject,
    get stateUpdates() { return stateUpdates; },
    render(returnTo) {
      cursor = 0;
      const output = useCartMergeFlow(returnTo);
      records.forEach((record) => {
        if (!record.pending) return;
        record.cleanup?.();
        record.cleanup = record.fn();
        record.pending = false;
      });
      return output;
    },
    replayEffects() {
      records.forEach((record) => {
        record.cleanup?.();
        record.cleanup = record.fn();
      });
    },
    unmount() { records.forEach((record) => record.cleanup?.()); },
    async flush() { await pending.catch(() => {}); await Promise.resolve(); },
  };
}

test("login waits for the transfer promise before navigating, even with a stale mutation observer", async () => {
  const h = mergeFlow();
  assert.equal(h.render("/cart").isPending, true);
  h.render("/cart");
  assert.deepEqual(h.calls, [["merge"]]);
  h.resolve({ issues: [], cart: { items: [] } });
  await h.flush();
  assert.equal(h.render("/cart").isPending, false);
  assert.deepEqual(h.calls, [["merge"], ["navigate", "/cart"]]);
});

test("Strict Mode effect replay follows the existing merge and navigates after completion without a second POST", async () => {
  const h = mergeFlow();
  h.render("/cart");
  h.replayEffects();
  assert.deepEqual(h.calls, [["merge"]]);
  h.resolve({ issues: [], cart: { items: [] } });
  await h.flush();
  assert.equal(h.stateUpdates, 1);
  assert.equal(h.render("/cart").isPending, false);
  assert.deepEqual(h.calls, [["merge"], ["navigate", "/cart"]]);
});

test("a failed transfer exits loading and reports the error without navigating", async () => {
  const h = mergeFlow();
  h.render("/cart");
  h.replayEffects();
  h.reject(new Error("timeout"));
  await h.flush();
  const result = h.render("/cart");
  assert.equal(result.isPending, false);
  assert.equal(result.isError, true);
  assert.deepEqual(h.calls, [["merge"]]);
});

test("partial transfer exits loading and keeps issues visible without navigating", async () => {
  const h = mergeFlow();
  h.render();
  h.resolve({ issues: ["partial"] });
  await h.flush();
  const result = h.render();
  assert.equal(result.isPending, false);
  assert.equal(result.hasIssues, true);
  assert.deepEqual(h.calls, [["merge"]]);
});

test("completed transfer uses a local return target or the cart/home defaults", async () => {
  for (const returnTo of [undefined, "https://outside.invalid/", "//outside.invalid/", "/\\outside.invalid/"]) {
    const h = mergeFlow();
    h.render(returnTo);
    h.resolve({ issues: [] });
    await h.flush();
    h.render(returnTo);
    assert.deepEqual(h.calls.at(-1), ["navigate", "/cart"]);
  }
  const empty = mergeFlow();
  empty.render();
  empty.resolve(null);
  await empty.flush();
  empty.render();
  assert.deepEqual(empty.calls.at(-1), ["navigate", "/"]);
});

test("transfer completion after leaving the login screen does not update that unmounted screen", async () => {
  const h = mergeFlow();
  h.render("/cart");
  h.unmount();
  h.resolve({ issues: [] });
  await h.flush();
  assert.equal(h.stateUpdates, 0);
  assert.deepEqual(h.calls, [["merge"]]);
});
