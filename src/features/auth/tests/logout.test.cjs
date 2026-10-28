/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the hook with isolated framework boundaries. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

function setup({ refresh = "refresh-token", request = async () => {} } = {}) {
  const calls = [];
  const modules = {
    react: { useRef: (current) => ({ current }), useState: () => [false, (value) => calls.push(["pending", value])] },
    "next/navigation": { useRouter: () => ({ replace: (url) => calls.push(["navigate", url]) }) },
    "@tanstack/react-query": { useQueryClient: () => ({ clear: () => calls.push(["clear-cache"]) }) },
    "../api/auth.api": { authApi: { logout: async (token) => { calls.push(["request", token]); await request(); } } },
    "../utils/token-storage": { tokenStorage: { getRefreshToken: () => refresh, clearTokens: () => calls.push(["clear-tokens"]) } },
  };
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../hooks/use-logout.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", source)((name) => {
    assert.ok(name in modules, `Unexpected dependency: ${name}`);
    return modules[name];
  }, loaded, loaded.exports);
  return { calls, ...loaded.exports.useLogout() };
}

test("logout revokes refresh before clearing tokens, cache and navigating to login", async () => {
  const h = setup();
  await h.logout();
  assert.deepEqual(h.calls, [["pending", true], ["request", "refresh-token"], ["clear-tokens"], ["clear-cache"], ["navigate", "/login"]]);
});

test("logout still ends the local session when the backend is unavailable", async () => {
  const h = setup({ request: async () => { throw new Error("503"); } });
  await h.logout();
  assert.deepEqual(h.calls.slice(-3), [["clear-tokens"], ["clear-cache"], ["navigate", "/login"]]);
});

test("logout without refresh skips the request and clears the local session", async () => {
  const h = setup({ refresh: null });
  await h.logout();
  assert.equal(h.calls.some(([type]) => type === "request"), false);
  assert.deepEqual(h.calls.slice(-3), [["clear-tokens"], ["clear-cache"], ["navigate", "/login"]]);
});

test("repeated clicks cannot submit duplicate logout requests", async () => {
  let release;
  const h = setup({ request: () => new Promise((resolve) => { release = resolve; }) });
  const first = h.logout();
  await h.logout();
  assert.equal(h.calls.filter(([type]) => type === "request").length, 1);
  assert.equal(h.calls.some(([type]) => type === "clear-tokens"), false);
  release();
  await first;
  assert.equal(h.calls.filter(([type]) => type === "clear-tokens").length, 1);
});
