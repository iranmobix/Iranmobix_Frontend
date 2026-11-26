/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS TypeScript test loader. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, "../utils/product-display-price.ts"), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
vm.runInNewContext(code, { module: mod, exports: mod.exports });
const convert = mod.exports.getDisplaySourcePrice;
const rates = { cny_toman: 8000, usd_toman: 80000, aed_toman: 20000 };
test("CNY card display converts to USD using the shared Toman cross rate", () => {
  assert.equal(convert(100, "CNY", "USD", rates).amount, 10);
  assert.equal(convert(100, "CNY", "USD", rates).currency, "USD");
  assert.equal(convert(0, "CNY", "USD", rates).amount, 0);
});
test("returning to yuan preserves the original price without rounding or mutation", () => {
  const amount = 47.45;
  convert(amount, "CNY", "USD", rates);
  assert.equal(convert(amount, "CNY", "source", rates).amount, amount);
  assert.equal(rates.cny_toman, 8000);
});
test("missing or zero rates never produce a fabricated dollar price or division by zero", () => {
  for (const value of [undefined, {...rates, usd_toman: 0}, {...rates, cny_toman: 0}, {...rates, usd_toman: Infinity}])
    assert.equal(convert(100, "CNY", "USD", value).amount, null);
  assert.equal(convert(null, "CNY", "USD", rates).amount, null);
});
test("non-CNY source prices are not converted as yuan", () => {
  assert.equal(convert(12, "USD", "USD", rates).amount, 12);
  assert.equal(convert(12, "AED", "USD", rates).currency, "AED");
});

test("CNY converts to AED and rejects unavailable dirham rates", () => {
  assert.equal(convert(100, "CNY", "AED", rates).amount, 40);
  assert.equal(convert(100, "CNY", "AED", rates).currency, "AED");
  assert.equal(convert(0, "CNY", "AED", rates).amount, 0);
  assert.equal(convert(100, "CNY", "AED", {...rates, aed_toman: 0}).amount, null);
  assert.equal(convert(100, "CNY", "AED").amount, null);
});

test("Toman uses the live CNY rate rather than the stored backend Toman estimate", () => {
  const toman = mod.exports.getDisplayTomanPrice;
  assert.equal(toman(100, "CNY", rates, 1), 800000);
  assert.equal(toman(100, "CNY", {...rates, cny_toman: 9000}, 1), 900000);
  assert.equal(convert(100, "CNY", "source", {...rates, cny_toman: 9000}).amount, 100);
  assert.equal(toman(0, "CNY", rates, 1), 0);
});
test("Toman avoids stale fallback prices when CNY rates are unavailable", () => {
  const toman = mod.exports.getDisplayTomanPrice;
  assert.equal(toman(100, "CNY", undefined, 99), null);
  assert.equal(toman(100, "CNY", {...rates, cny_toman: 0}, 99), null);
  assert.equal(toman(null, "CNY", rates, 99), null);
  assert.equal(toman(10, "IRR", undefined, 500), 500);
});
