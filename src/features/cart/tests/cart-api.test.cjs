/* eslint-disable @typescript-eslint/no-require-imports -- Tests transpile feature modules in memory. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test, afterEach } = require("node:test");
const ts = require("typescript");

afterEach(() => {
  delete global.window;
});
function harness(overrides = {}) {
  const sessionValues = overrides.sessionValues ?? new Map();
  const values = overrides.values ?? new Map(),
    requests = [],
    cache = new Map();
  global.window = {
    dispatchEvent: () => true,
    sessionStorage: {
      getItem: (key) => sessionValues.get(key) ?? null,
      setItem: (key, value) => sessionValues.set(key, value),
      removeItem: (key) => sessionValues.delete(key),
    },
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
  };
  const session = {
    token: "guest-test-token",
    header: "X-Guest-Cart-Token",
    expires_in: 3600,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
  };
  const transport = {
    httpPatch: async (url, body, config) => {
      requests.push({ method: "PATCH", url, body, config });
      if (overrides.patch) return overrides.patch(url, body, config);
    },
    httpDelete: async (url, config) => {
      requests.push({ method: "DELETE", url, config });
      if (overrides.delete) return overrides.delete(url, config);
    },
    httpGet: async (url, config) => {
      requests.push({ method: "GET", url, config });
      return overrides.get ? overrides.get(url, config) : fixture;
    },
    httpPost: async (url, body, config) => {
      requests.push({ method: "POST", url, body, config });
      if (overrides.post) return overrides.post(url, body, config);
      if (url === "/api/cart/session/") return session;
      if (url === "/api/cart/merge/")
        return {
          transferred_items: 2,
          combined_items: 0,
          issues: [],
          cart: { ...fixture, issues: [] },
        };
      return undefined;
    },
  };
  function load(filename) {
    const full = path.resolve(__dirname, "..", filename);
    const resolved = [full, full + ".ts", full + ".tsx"].find((candidate) =>
      fs.existsSync(candidate),
    );
    if (!resolved) throw Error("Unresolved " + filename);
    if (resolved.endsWith(".svg"))
      return { src: "/test.svg", width: 18, height: 18 };
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const loadedModule = { exports: {} };
    cache.set(resolved, loadedModule);
    const source = ts.transpileModule(fs.readFileSync(resolved, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (name) => {
      if (overrides.modules && name in overrides.modules)
        return overrides.modules[name];
      if (name === "axios" && overrides.refresh)
        return new Proxy(require("axios"), {
          get(target, property) {
            if (property === "post")
              return async (url, body, config) => {
                requests.push({ method: "POST", url, body, config });
                return { data: await overrides.refresh(url, body, config) };
              };
            return Reflect.get(target, property);
          },
        });
      if (name === "@/shared/api") return transport;
      if (name.startsWith("@/"))
        return load(path.resolve(__dirname, "../../..", name.slice(2)));
      if (overrides.render && name === "next/image")
        return ({ src, alt }) =>
          require("react").createElement("img", {
            src: typeof src === "string" ? src : src.src,
            alt,
          });
      if (name.startsWith("."))
        return load(path.resolve(path.dirname(resolved), name));
      return require(name);
    };
    new Function("require", "module", "exports", source)(
      localRequire,
      loadedModule,
      loadedModule.exports,
    );
    return loadedModule.exports;
  }
  const fixture = load("mock/cart-api.mock").cartApiMock;
  return {
    load,
    fixture,
    session,
    values,
    requests,
    sessionValues,
    storage: load("utils/cart-session.storage").cartSessionStorage,
  };
}

test("response validation maps known nested fields and preserves exact amounts and unspecified values", () => {
  const h = harness(),
    { cartResponseSchema } = h.load("schemas/cart.schema");
  const raw = {
    ...h.fixture,
    subtotal: "9007199254740993.01",
    items: [
      {
        ...h.fixture.items[0],
        product: {
          ...h.fixture.items[0].product,
          seller: { opaque: { value: 42 } },
        },
        pricing: {
          ...h.fixture.items[0].pricing,
          final_total_price: "9007199254740993.01",
        },
      },
    ],
  };
  const mapped = h
    .load("mappers/cart.mapper")
    .mapCart(cartResponseSchema.parse(raw));
  assert.equal(mapped.subtotal, "9007199254740993.01");
  assert.equal(mapped.finalTotal, h.fixture.final_total);
  assert.deepEqual(mapped.items[0].product.seller, { opaque: { value: 42 } });
  assert.equal(mapped.items[0].pricing.finalTotalPrice, "9007199254740993.01");
  assert.equal(mapped.items[0].id, String(h.fixture.items[0].id));
  assert.equal(mapped.checkoutReady, h.fixture.checkout_ready);
  assert.throws(() =>
    cartResponseSchema.parse({ ...raw, final_total: "string" }),
  );
  assert.throws(() =>
    cartResponseSchema.parse({ ...raw, items: [raw.items[0], raw.items[0]] }),
  );
});
test("money strings are displayed without rounding or invented conversion", () => {
  const { formatCartMoney } = harness().load("utils/cart.utils");
  assert.equal(
    formatCartMoney("9007199254740993.01", "IRR"),
    "9,007,199,254,740,993.01 IRR",
  );
  assert.equal(formatCartMoney(null, "CNY"), "—");
});
test("parallel first additions share one session and reuse it", async () => {
  const h = harness(),
    { cartService } = h.load("services/cart.service");
  await Promise.all([
    cartService.addItem({ slug: "one", payload: { quantity: 2, color: "1" } }),
    cartService.addItem({ slug: "two", payload: { quantity: 3 } }),
  ]);
  assert.equal(
    h.requests.filter((r) => r.url === "/api/cart/session/").length,
    1,
  );
  assert.equal(
    h.requests.filter((r) => r.url.startsWith("/api/add-to-cart/")).length,
    2,
  );
  const added = h.requests.find((r) => r.url === "/api/add-to-cart/one");
  assert.equal(added.config.headers["X-Guest-Cart-Token"], h.session.token);
  assert.equal(added.config.withCredentials, true);
  assert.deepEqual(added.body, { quantity: 2, color: "1" });
  assert.equal("number" in added.body, false);
  assert.equal(h.values.size, 1);
  await cartService.getCart();
  assert.equal(
    h.requests.at(-1).config.headers["X-Guest-Cart-Token"],
    h.session.token,
  );
});
test("API receives encoded slug, string option IDs and optional attributes unchanged", async () => {
  const h = harness(),
    { cartService } = h.load("services/cart.service");
  const payload = {
    quantity: 2,
    number: 4,
    color: "12",
    guarantee: "7",
    selected_attributes: [
      { category_attribute: 1, category_value: 2, value: "red" },
    ],
    sku_attributes: { Size: "M" },
  };
  await cartService.addItem({ slug: "camera/a b", payload });
  assert.equal(h.requests.at(-1).url, "/api/add-to-cart/camera%2Fa%20b");
  assert.deepEqual(h.requests.at(-1).body, payload);
});
test("invalid quantity fails before any network mutation", async () => {
  const h = harness(),
    { cartService } = h.load("services/cart.service");
  for (const quantity of [
    0,
    -1,
    1.5,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    await assert.rejects(
      cartService.addItem({ slug: "camera", payload: { quantity } }),
    );
  assert.equal(h.requests.length, 0);
});
test("failed session creation stops addition and a later manual attempt can create a session", async () => {
  let failing = true;
  const h = harness({
    post: async (url) => {
      if (failing) throw Error("offline");
      if (url === "/api/cart/session/") return h.session;
    },
  });
  const { cartService } = h.load("services/cart.service");
  await assert.rejects(
    cartService.addItem({ slug: "camera", payload: { quantity: 1 } }),
  );
  assert.equal(h.requests.length, 1);
  failing = false;
  await cartService.addItem({ slug: "camera", payload: { quantity: 1 } });
  assert.equal(h.requests.length, 3);
});
test("ambiguous add failure is not retried or replaced with mock success", async () => {
  const h = harness({
    post: async (url) => {
      if (url === "/api/cart/session/") return h.session;
      throw Error("timeout");
    },
  });
  await assert.rejects(
    h
      .load("services/cart.service")
      .cartService.addItem({ slug: "camera", payload: { quantity: 1 } }),
  );
  assert.equal(h.requests.length, 2);
  assert.ok(h.storage.read());
});
test("expired session is renewed; invalid header cannot be used", async () => {
  const h = harness();
  h.values.set(
    "iranmobix.guest-cart.v1",
    JSON.stringify({
      token: "old",
      header: "X-Guest-Cart-Token",
      expiresAt: Date.now() - 1000,
    }),
  );
  assert.equal(h.storage.read(), null);
  await h.load("services/cart-session.service").ensureGuestCartSession();
  assert.equal(h.storage.read().token, h.session.token);
  const other = harness({
    post: async () => ({ ...h.session, header: "Authorization" }),
  });
  await assert.rejects(
    other.load("services/cart-session.service").ensureGuestCartSession(),
  );
  assert.equal(other.storage.read(), null);
});
test("storage handles SSR, malformed data, tab removal and blocked localStorage", async () => {
  const h = harness();
  delete global.window;
  assert.equal(h.storage.read(), null);
  global.window = {
    localStorage: {
      getItem: () => {
        throw Error("blocked");
      },
      setItem: () => {
        throw Error("blocked");
      },
      removeItem: () => {
        throw Error("blocked");
      },
    },
  };
  await h.load("services/cart-session.service").ensureGuestCartSession();
  assert.equal(h.storage.read().token, h.session.token);
  h.storage.clear();
  assert.equal(h.storage.read(), null);
  const normal = harness();
  await normal.load("services/cart-session.service").ensureGuestCartSession();
  normal.values.set("iranmobix.guest-cart.v1", "not JSON");
  assert.equal(normal.storage.read(), null);
  await normal.load("services/cart-session.service").ensureGuestCartSession();
  normal.values.clear();
  assert.equal(normal.storage.read(), null);
});
test("merge sends guest header with credentials and stores authoritative cart result", async () => {
  const h = harness();
  h.values.set("access_token", "test-access");
  await h.load("services/cart-session.service").ensureGuestCartSession();
  const { cartService } = h.load("services/cart.service");
  const [one, two] = await Promise.all([
    cartService.mergeGuestCart(),
    cartService.mergeGuestCart(),
  ]);
  assert.equal(one, two);
  assert.equal(one.cart.finalTotal, h.fixture.final_total);
  assert.equal(one.transferredItems, 2);
  assert.equal(
    h.requests.filter((r) => r.url === "/api/cart/merge/").length,
    1,
  );
  const merge = h.requests.find((r) => r.url === "/api/cart/merge/");
  assert.equal(merge.body, undefined);
  assert.equal(merge.config.withCredentials, true);
  assert.equal(merge.config.headers["X-Guest-Cart-Token"], h.session.token);
  assert.equal(h.storage.read(), null);
  await cartService.getCart();
  assert.equal(h.requests.at(-1).config.headers, undefined);
});
test("merge without a guest session is a no-op", async () => {
  const h = harness();
  assert.equal(
    await h.load("services/cart.service").cartService.mergeGuestCart(),
    null,
  );
  assert.equal(h.requests.length, 0);
});
test("failed and partial merges retain guest token; newer sessions are not deleted", async () => {
  for (const mode of ["failure", "partial", "new-session"]) {
    const h = harness({
      post: async (url) => {
        if (url === "/api/cart/session/") return h.session;
        if (mode === "failure") throw Error("unauthorized");
        if (mode === "new-session")
          h.storage.write({
            token: "newer",
            header: "X-Guest-Cart-Token",
            expiresAt: Date.now() + 3600000,
          });
        return {
          transferred_items: 0,
          combined_items: 0,
          issues: mode === "partial" ? ["unavailable"] : [],
          cart: { ...h.fixture, issues: [] },
        };
      },
    });
    await h.load("services/cart-session.service").ensureGuestCartSession();
    const promise = h
      .load("services/cart.service")
      .cartService.mergeGuestCart();
    if (mode === "failure") await assert.rejects(promise);
    else await promise;
    assert.equal(
      h.storage.read().token,
      mode === "new-session" ? "newer" : h.session.token,
    );
  }
});

test("explicit mock reads use the domain pipeline without HTTP or a guest session", async () => {
  const h = harness({
    get: () => {
      throw Error("API unavailable");
    },
  });
  const { cartService } = h.load("services/cart.service");
  const sample = await cartService.getCart({ source: "mock" });
  assert.equal(sample.finalTotal, h.fixture.final_total);
  assert.equal(sample.items[0].id, String(h.fixture.items[0].id));
  assert.equal(h.requests.length, 0);
  assert.equal(h.values.size, 0);
  sample.items[0].product.title = "local change";
  sample.issues.push("local change");
  const again = await cartService.getCart({ source: "mock" });
  assert.equal(again.items[0].product.title, h.fixture.items[0].product.title);
  assert.equal(again.issues.includes("local change"), false);
});

test("customer cart with empty metadata and missing priced_at still renders its actual product", async () => {
  let raw;
  const h = harness({render:true,get:()=>raw});
  h.values.set("access_token","test-access");
  raw = structuredClone(h.fixture);
  raw.currency = "CNY";
  raw.subtotal = raw.discount_total = raw.final_total = "0";
  raw.items = raw.items.slice(0,1);
  const row = raw.items[0];
  row.product.source.url = null;
  row.product.official_url = null;
  row.product.image = null;
  row.product.guarantee = {available:true,type:null,label:null};
  row.selected_options.color = {id:22,name:"مشکی",value:"#000000"};
  row.selected_options.guarantee = {id:22,name:"گارانتی تست"};
  row.selected_options.attributes = [];
  row.pricing.unit_discount_amount_irr = null;
  row.pricing.final_unit_price = row.pricing.final_total_price = "0";
  row.pricing.final_unit_price_irr = row.pricing.final_total_price_irr = "1350000";
  row.pricing.base_price_irr = "1200000";
  row.pricing.unit_price_irr = "1350000";
  row.pricing.total_discount_amount_irr = "0";
  delete row.pricing.priced_at;
  const cart = await h.load("services/cart.service").cartService.getCart();
  const item = cart.items[0];
  assert.equal(cart.items.length,1);
  assert.equal(cart.finalTotal,"0");
  assert.equal(item.pricing.finalTotalPrice,"0");
  assert.equal(item.pricing.finalTotalPriceIrr,"1350000");
  assert.equal(item.pricing.unitDiscountAmountIrr,null);
  assert.equal(item.pricing.pricedAt,"");
  assert.equal(item.selectedColor.name,"مشکی");
  assert.equal(item.selectedColor.value,"#000000");
  assert.ok(item.dataIssues.some(issue=>issue.path==="product.source.url"&&issue.status==="empty"));
  assert.ok(item.dataIssues.some(issue=>issue.path==="product.official_url"&&issue.status==="empty"));
  assert.ok(item.dataIssues.some(issue=>issue.path==="pricing.unit_discount_amount_irr"&&issue.status==="empty"));
  assert.ok(item.dataIssues.some(issue=>issue.path==="pricing.priced_at"&&issue.status==="missing"));
  const React = require("react"), {renderToStaticMarkup} = require("react-dom/server");
  const html = renderToStaticMarkup(React.createElement(h.load("components/cart-item").default,{item}));
  assert.ok(html.includes(item.product.title));
  assert.ok(html.includes("گارانتی تست"));
  assert.ok(html.includes("مشکی"));
  assert.ok(html.includes("از بک نمی‌آید"));
  assert.equal(html.includes("pricing.priced_at"),false);
  assert.equal(html.includes("product.source.url"),false);
  const mapper = h.load("mappers/cart-submit-order.mapper");
  assert.equal(mapper.getCartSubmissionIssue(cart,"ground_china_iran"),null,JSON.stringify(item.dataIssues));
  const payload = mapper.mapCartToSubmitOrderPayload(cart,"test-key","ground_china_iran");
  assert.equal(payload.items[0].color,"مشکی");
  assert.equal(payload.items[0].guarantee,"گارانتی تست");
  await h.load("services/cart-order.service").cartOrderService.submit(cart,"api","ground_china_iran");
  const request = h.requests.find(request=>request.url==="/api/cart/submit-order");
  assert.equal(request.body.items[0].color,"مشکی");
  assert.equal(request.body.items[0].guarantee,"گارانتی تست");
  assert.equal(request.body.items[0].price.final_total_price_irr,"1350000");
});

test("missing, null and malformed cart amounts render distinct diagnostics and never become zero", () => {
  const h = harness();
  const map = h.load("mappers/cart-display.mapper").mapCartForDisplay;
  for (const [status,value] of [["missing",undefined],["empty",null],["empty"," "],["invalid","bad"]]) {
    const raw = structuredClone(h.fixture);
    if (status==="missing") delete raw.final_total; else raw.final_total=value;
    const cart = map(raw);
    assert.equal(cart.finalTotal,"");
    assert.ok(cart.dataIssues.some(issue=>issue.path==="final_total"&&issue.status===status));
    assert.ok(h.load("mappers/cart-submit-order.mapper").getCartSubmissionIssue(cart,"ground_china_iran"));
  }
});

test("incomplete rows and invalid nested fields keep rendering without fabricated stock or quantities", () => {
  const h = harness({render:true});
  const cart = h.load("mappers/cart-display.mapper").mapCartForDisplay({items:[{}]});
  assert.equal(cart.items.length,1);
  assert.equal(Number.isNaN(cart.items[0].quantity),true);
  assert.equal(cart.items[0].pricing.finalTotalPrice,"");
  assert.ok(cart.items[0].displayId);
  const React = require("react"), {renderToStaticMarkup} = require("react-dom/server");
  const html = renderToStaticMarkup(React.createElement(h.load("components/cart-item").default,{item:cart.items[0]}));
  assert.ok(html.includes("از بک نمی‌آید"));
  assert.equal(html.includes("NaN"),false);
  assert.equal(html.includes("این کالا در حال حاضر قابل خرید نیست"),false);
  const summary = renderToStaticMarkup(React.createElement(h.load("components/cart-summary").default,{
    totals:{quantity:cart.totalQuantity,originalSubtotal:cart.subtotal,discount:cart.discountTotal,total:cart.finalTotal,shipping:null},currency:cart.currency,dataIssues:cart.dataIssues,
  }));
  assert.ok(summary.includes("از بک نمی‌آید"));
  assert.equal(summary.includes("final_total"),false);
  assert.equal(summary.includes("NaN"),false);
});

test("duplicate backend row IDs retain separate display identities and remain invalid for editing", () => {
  const h = harness();
  const raw = structuredClone(h.fixture);
  raw.items=[raw.items[0],structuredClone(raw.items[0])];
  const cart = h.load("mappers/cart-display.mapper").mapCartForDisplay(raw);
  assert.equal(cart.items.length,2);
  assert.notEqual(cart.items[0].displayId,cart.items[1].displayId);
  assert.ok(cart.items.every(item=>item.dataIssues.some(issue=>issue.path==="id")));
});

test("a malformed row and a missing items collection retain their own field diagnostics", () => {
  const h = harness();
  const map = h.load("mappers/cart-display.mapper").mapCartForDisplay;
  const cart = map({items:[null]});
  assert.equal(cart.items.length,1);
  assert.ok(cart.items[0].dataIssues.some(issue=>issue.path===""&&issue.status==="empty"));
  const fieldNote = h.load("utils/cart-data-issues").getCartFieldNote;
  assert.ok(fieldNote(cart.items[0].dataIssues,"product.title"));
  const missing = map({});
  assert.ok(fieldNote(missing.dataIssues,"items"));
  assert.ok(h.load("mappers/cart-submit-order.mapper").getCartSubmissionIssue(missing,"ground_china_iran"));
});

test("incomplete mock responses render diagnostics without inventing a valid total", async () => {
  const h = harness();
  h.fixture.final_total = "invalid amount";
  const { cartService } = h.load("services/cart.service");
  const cart = await cartService.getCart({ source: "mock" });
  assert.equal(cart.finalTotal, "");
  assert.ok(cart.dataIssues.some((issue) => issue.path === "final_total" && issue.status === "invalid"));
  assert.equal(h.requests.length, 0);
});

test("network failures remain errors while incomplete responses retain explicit diagnostics", async () => {
  const failure = Error("network unavailable");
  const h = harness({
    get: () => {
      throw failure;
    },
  });
  const { cartService } = h.load("services/cart.service");
  await assert.rejects(cartService.getCart(), (error) => error === failure);
  assert.equal(h.requests.length, 2);
  const malformed = harness({ get: () => ({ items: [] }) });
  const incomplete = await malformed.load("services/cart.service").cartService.getCart();
  assert.equal(incomplete.items.length, 0);
  assert.equal(incomplete.finalTotal, "");
  assert.ok(incomplete.dataIssues.some((issue) => issue.path === "final_total" && issue.status === "missing"));
  assert.equal(malformed.requests.length, 2);
});

test("authenticated cart reads forward cancellation without creating guest sessions", async () => {
  const h = harness();
  h.values.set("access_token", "test-access");
  const controller = new AbortController();
  await h
    .load("services/cart.service")
    .cartService.getCart({ signal: controller.signal });
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].method, "GET");
  assert.equal(h.requests[0].config.signal, controller.signal);
  assert.equal(h.values.size, 1);
});

test("sample data cannot replace the current cart cache or be invalidated by a live cart update", async () => {
  const { QueryClient } = require("@tanstack/react-query");
  const h = harness({ get: () => ({ ...h.fixture, final_total: "99.01" }) });
  const { cartService } = h.load("services/cart.service");
  const { CART_QUERY_KEY, CART_MOCK_QUERY_KEY } = h.load(
    "constants/cart-query-keys",
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  try {
    await client.fetchQuery({
      queryKey: CART_QUERY_KEY,
      queryFn: () => cartService.getCart(),
    });
    await client.fetchQuery({
      queryKey: CART_MOCK_QUERY_KEY,
      queryFn: () => cartService.getCart({ source: "mock" }),
    });
    assert.equal(client.getQueryData(CART_QUERY_KEY).finalTotal, "99.01");
    assert.equal(
      client.getQueryData(CART_MOCK_QUERY_KEY).finalTotal,
      h.fixture.final_total,
    );
    await client.invalidateQueries({
      queryKey: CART_QUERY_KEY,
      refetchType: "none",
    });
    assert.equal(client.getQueryState(CART_QUERY_KEY).isInvalidated, true);
    assert.equal(
      client.getQueryState(CART_MOCK_QUERY_KEY).isInvalidated,
      false,
    );
    assert.equal(h.requests.length, 2); // guest session + live GET; mock makes no request
  } finally {
    client.clear();
  }
});

test("product SKU payload uses selected color and backend defaults for hidden attributes", async () => {
  const h = harness();
  const { resolveProductSkuSelection } = h.load(
    "../product/utils/product-sku-selection",
  );
  const attributes = [
    { name: "color", values: [{ value: "Black" }, { value: "White" }] },
    { name: "model number", values: [{ value: "HDV-206KM" }] },
    {
      name: "image resolution (video)",
      values: [{ value: "4 K" }, { value: "6k" }],
    },
  ];
  const initial = resolveProductSkuSelection(attributes, {});
  assert.equal(initial.isComplete, true);
  assert.deepEqual(initial.attributes, {
    color: "Black",
    "model number": "HDV-206KM",
    "image resolution (video)": "4 K",
  });
  const selected = resolveProductSkuSelection(attributes, {
    color: "White",
    "image resolution (video)": "6k",
    removed: "ignore",
  });
  assert.equal(selected.isComplete, true);
  const payload = { quantity: 1, sku_attributes: selected.attributes };
  await h
    .load("services/cart.service")
    .cartService.addItem({ slug: "camera", payload });
  const request = h.requests.find(
    (request) => request.url === "/api/add-to-cart/camera",
  );
  assert.deepEqual(request.body, {
    quantity: 1,
    sku_attributes: {
      color: "White",
      "model number": "HDV-206KM",
      "image resolution (video)": "4 K",
    },
  });
});

test("stale selections use valid defaults but missing backend definitions still block purchase", () => {
  const { resolveProductSkuSelection } = harness().load(
    "../product/utils/product-sku-selection",
  );
  const attributes = [
    { name: "Size", values: [{ value: "M" }, { value: "XL" }] },
  ];
  const stale = resolveProductSkuSelection(attributes, {
    Size: "old",
    Color: "red",
  });
  assert.equal(stale.isComplete, true);
  assert.deepEqual(stale.attributes, { Size: "M" });
  assert.equal(
    resolveProductSkuSelection([{ name: "Size", values: [] }], {}).isComplete,
    false,
  );
  assert.equal(
    resolveProductSkuSelection([{ name: "", values: [{ value: "M" }] }], {})
      .isComplete,
    false,
  );
  assert.equal(
    resolveProductSkuSelection([...attributes, ...attributes], { Size: "M" })
      .isComplete,
    false,
  );
});

test("products without SKU attributes remain valid; duplicate and blank options do not create fake choices", () => {
  const { resolveProductSkuSelection, getProductSkuValues } = harness().load(
    "../product/utils/product-sku-selection",
  );
  assert.deepEqual(resolveProductSkuSelection([], { old: "value" }), {
    attributes: {},
    isComplete: true,
  });
  const attribute = {
    name: "Color",
    values: [
      { value: "" },
      { value: " " },
      { value: "Black" },
      { value: "Black" },
    ],
  };
  assert.deepEqual(getProductSkuValues(attribute), ["Black"]);
  assert.deepEqual(resolveProductSkuSelection([attribute], {}), {
    attributes: { Color: "Black" },
    isComplete: true,
  });
});

test("SKU color placement and translated label never rename the payload key", () => {
  const { isProductColorAttribute, resolveProductSkuSelection } =
    harness().load("../product/utils/product-sku-selection");
  for (const name of ["color", "Color", "Colour", "رنگ"]) {
    const attribute = { name, values: [{ value: "Black" }] };
    assert.equal(isProductColorAttribute(attribute), true);
    assert.deepEqual(resolveProductSkuSelection([attribute], {}).attributes, {
      [name]: "Black",
    });
  }
  assert.equal(
    isProductColorAttribute({ name: "model number", values: [] }),
    false,
  );
});

test("real cart response keeps selected variants separate and uses the cart currency", () => {
  const h = harness();
  const cart = h
    .load("mappers/cart.mapper")
    .mapCart(h.load("schemas/cart.schema").cartResponseSchema.parse(h.fixture));
  assert.equal(cart.items.length, 5);
  assert.equal(cart.owner.type, "guest");
  assert.equal(cart.owner.userId, null);
  const black = cart.items.find((item) => item.id === "27");
  const white = cart.items.find((item) => item.id === "28");
  assert.equal(black.catalogId, white.catalogId);
  assert.equal(black.product.slug, white.product.slug);
  assert.equal(black.selectedColor.name, "Black");
  assert.equal(white.selectedColor.name, "White");
  assert.equal(cart.items[0].product.price.currency, "CNY");
  assert.equal(cart.items[0].currency, "IRR");
  assert.equal(cart.items[0].pricing.finalTotalPrice, "3236400");
  assert.equal(cart.items[0].product.image, h.fixture.items[0].product.image);
  assert.equal(cart.items[1].selectedColor, null);
});

test("cart row totals remain authoritative for multiple quantities", () => {
  const h = harness(),
    raw = structuredClone(h.fixture);
  raw.items[0].quantity = 3;
  raw.items[0].pricing.final_unit_price = "100.25";
  raw.items[0].pricing.final_total_price = "250.01";
  raw.items[0].pricing.total_discount_amount = "50.74";
  const mapped = h
    .load("mappers/cart.mapper")
    .mapCart(h.load("schemas/cart.schema").cartResponseSchema.parse(raw));
  assert.equal(mapped.items[0].quantity, 3);
  assert.equal(mapped.items[0].pricing.finalUnitPrice, "100.25");
  assert.equal(mapped.items[0].pricing.finalTotalPrice, "250.01");
  assert.equal(mapped.items[0].pricing.totalDiscountAmount, "50.74");
});

test("nested cart validation rejects missing product/price and accepts null image/availability", () => {
  const h = harness(),
    { cartResponseSchema } = h.load("schemas/cart.schema");
  for (const field of ["product", "pricing", "selected_options"]) {
    const raw = structuredClone(h.fixture);
    raw.items[0][field] = {};
    assert.throws(() => cartResponseSchema.parse(raw));
  }
  const raw = structuredClone(h.fixture);
  raw.items[0].product.image = null;
  raw.items[0].availability.available_quantity = null;
  const cart = h
    .load("mappers/cart.mapper")
    .mapCart(cartResponseSchema.parse(raw));
  assert.equal(cart.items[0].product.image, "");
  assert.equal(cart.items[0].availability.availableQuantity, null);
});

test("live row renders actual values, field diagnostics and disabled controls", () => {
  const h = harness({ render: true });
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const CartItem = h.load("components/cart-item").default;
  const cart = h
    .load("mappers/cart.mapper")
    .mapCart(h.load("schemas/cart.schema").cartResponseSchema.parse(h.fixture));
  for (const item of cart.items) {
    const html = renderToStaticMarkup(React.createElement(CartItem, { item }));
    assert.ok(html.includes(item.product.title));
    assert.ok(html.includes(item.product.image));
    assert.ok(html.includes(encodeURIComponent(item.product.slug)));
    assert.ok(
      html.includes(
        h
          .load("utils/cart.utils")
          .formatCartMoney(item.pricing.finalTotalPrice, "IRR"),
      ),
    );
    if (item.selectedColor) assert.ok(html.includes(item.selectedColor.name));
    assert.ok(!html.includes("جزئیات محصول از بک مشخص نشده"));
    assert.ok(!html.includes("نام کالا: —"));
    assert.ok(html.includes("فروشنده:"));
    assert.ok(html.includes("از بک نمی‌آید"));
    assert.ok(!html.includes("گارانتی:"));
    assert.ok(html.includes("افزایش تعداد"));
    assert.ok(html.includes("ویرایش در حالت نمایش نمونه فعال نیست"));
    assert.equal((html.match(/<button[^>]* disabled=""/g) || []).length, 3);
    assert.ok(html.includes("readOnly"));
  }
  const noImage = {
    ...cart.items[0],
    product: { ...cart.items[0].product, image: "" },
  };
  assert.ok(
    renderToStaticMarkup(
      React.createElement(CartItem, { item: noImage }),
    ).includes("از بک نمی‌آید"),
  );
});

test("cart field notes distinguish missing values, unknown structures and explicit no-guarantee", () => {
  const h = harness();
  const { getCartItemDataNotes } = h.load("utils/cart-presentation.utils");
  const item = h.load("mappers/cart.mapper").mapCart(h.fixture).items[0];
  assert.equal(getCartItemDataNotes(item).color, "Black");
  assert.equal(getCartItemDataNotes(item).guaranteeNote, "ندارد (طبق پاسخ بک)");
  const missing = structuredClone(item);
  missing.product.title = " ";
  missing.product.shortTitle = "";
  missing.selectedColor = null;
  assert.equal(getCartItemDataNotes(missing).title, null);
  assert.match(getCartItemDataNotes(missing).colorNote, /ارسال نشده/);
  missing.selectedOptions.color = { unknown: true };
  missing.selectedOptions.guarantee = { unknown: true };
  missing.product.seller = { unknown: true };
  assert.match(getCartItemDataNotes(missing).colorNote, /ساختار/);
  assert.match(getCartItemDataNotes(missing).guaranteeNote, /ساختار/);
  assert.match(getCartItemDataNotes(missing).sellerNote, /ساختار/);
  missing.selectedOptions.guarantee = null;
  missing.product.guarantee = {
    available: true,
    label: "Catalog warranty",
    type: null,
  };
  assert.match(getCartItemDataNotes(missing).guaranteeNote, /انتخاب‌شده/);
});

test("discount UI never combines catalog currency with cart row currency", () => {
  const h = harness({ render: true });
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const item = h.load("mappers/cart.mapper").mapCart(h.fixture).items[0];
  item.pricing.totalDiscountAmount = "1000";
  item.product.price.hasDiscount = true;
  item.product.price.originalAmount = "100";
  item.product.price.discountPercentage = 10;
  const html = renderToStaticMarkup(
    React.createElement(h.load("components/cart-item").default, { item }),
  );
  assert.ok(html.includes("1,000 IRR"));
  assert.ok(!html.includes("درصد تخفیف و قیمت کل قبل از تخفیف"));
  assert.ok(!html.includes("<del"));
  assert.ok(!html.includes("CNY"));
});

test("summary keeps zero savings visible and explains unavailable checkout", () => {
  const h = harness({ render: true });
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const html = renderToStaticMarkup(
    React.createElement(h.load("components/cart-summary").default, {
      totals: {
        quantity: 5,
        originalSubtotal: "200",
        discount: "0",
        shipping: null,
        total: "200",
      },
      currency: "IRR",
      disabled: true,
      unavailableReason: "API ثبت اولیهٔ سفارش هنوز مشخص نشده",
    }),
  );
  assert.ok(html.includes("سود شما از خرید"));
  assert.ok(html.includes("0 IRR"));
  assert.ok(html.includes("ثبت اولیه"));
  assert.ok(html.includes("API ثبت اولیهٔ سفارش هنوز مشخص نشده"));
  assert.ok(!html.includes("هزینه حمل"));
});

test("quantity PATCH and DELETE use row id, existing guest identity and exact request body", async () => {
  const h = harness();
  await h.load("services/cart-session.service").ensureGuestCartSession();
  h.requests.length = 0;
  const { cartService } = h.load("services/cart.service");
  await cartService.updateItem({ itemId: "27", payload: { quantity: 99 } });
  await cartService.removeItem({ itemId: "28" });
  assert.deepEqual(
    h.requests.map((r) => [r.method, r.url, r.body]),
    [
      ["PATCH", "/api/cart/27", { quantity: 99 }],
      ["DELETE", "/api/cart/28", undefined],
    ],
  );
  for (const r of h.requests) {
    assert.equal(r.config.headers["X-Guest-Cart-Token"], h.session.token);
    assert.equal(r.config.withCredentials, true);
  }
});

test("cart edits without guest storage use credentials and do not create another cart session", async () => {
  const h = harness(),
    { cartService } = h.load("services/cart.service");
  await cartService.updateItem({ itemId: "25", payload: { quantity: 2 } });
  await cartService.removeItem({ itemId: "25" });
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].config.headers, undefined);
  assert.equal(h.requests[1].config.withCredentials, true);
});

test("invalid cart edits fail before transport and failed mutations are not replayed", async () => {
  const h = harness(),
    { cartService } = h.load("services/cart.service");
  for (const quantity of [
    0,
    -1,
    1.2,
    NaN,
    Infinity,
    Number.MAX_SAFE_INTEGER + 1,
  ])
    await assert.rejects(
      cartService.updateItem({ itemId: "25", payload: { quantity } }),
    );
  for (const itemId of ["", " ", "../25", "alibaba:462", "0", "-1"]) {
    await assert.rejects(
      cartService.updateItem({ itemId, payload: { quantity: 1 } }),
    );
    await assert.rejects(cartService.removeItem({ itemId }));
  }
  assert.equal(h.requests.length, 0);
  const failing = harness({
    patch: () => {
      throw Error("timeout");
    },
    delete: () => {
      throw Error("timeout");
    },
  });
  const service = failing.load("services/cart.service").cartService;
  await assert.rejects(
    service.updateItem({ itemId: "25", payload: { quantity: 2 } }),
  );
  await assert.rejects(service.removeItem({ itemId: "25" }));
  assert.equal(failing.requests.length, 2);
});

test("real row edit controls are enabled with callbacks and disabled while pending", () => {
  const h = harness({ render: true }),
    React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const item = h.load("mappers/cart.mapper").mapCart(h.fixture).items[0];
  const CartItem = h.load("components/cart-item").default;
  const props = { item, onQuantityChange: () => {}, onRemove: () => {} };
  const html = renderToStaticMarkup(React.createElement(CartItem, props));
  assert.ok(!html.includes("readOnly"));
  assert.ok(!html.includes("ویرایش در حالت نمایش نمونه"));
  assert.equal((html.match(/<button[^>]* disabled=""/g) || []).length, 1); // only minus at quantity one
  const pending = renderToStaticMarkup(
    React.createElement(CartItem, { ...props, disabled: true }),
  );
  assert.equal((pending.match(/<button[^>]* disabled=""/g) || []).length, 3);
});

test("session mapper preserves identity and uses the earlier backend expiry without reading the clock", () => {
  const h = harness(),
    { mapGuestCartSession } = h.load("mappers/cart.mapper");
  const startedAt = Date.parse("2026-09-28T00:00:00Z");
  const response = {
    ...h.session,
    expires_in: 60,
    expires_at: "2026-09-28T00:02:00Z",
  };
  assert.equal(
    mapGuestCartSession(response, startedAt).expiresAt,
    startedAt + 60000,
  );
  response.expires_at = "2026-09-28T00:00:30Z";
  const mapped = mapGuestCartSession(response, startedAt);
  assert.equal(mapped.expiresAt, startedAt + 30000);
  assert.equal(mapped.token, response.token);
  assert.equal(mapped.header, response.header);
});

test("checkout address schema trims valid input and rejects empty, whitespace and oversized fields", () => {
  const { checkoutAddressSchema } = harness().load("schemas/checkout.schema");
  assert.deepEqual(
    checkoutAddressSchema.parse({ label: " خانه ", description: " تهران " }),
    { label: "خانه", description: "تهران" },
  );
  for (const input of [
    { label: " ", description: "تهران" },
    { label: "خانه", description: " " },
    { label: "x".repeat(41), description: "تهران" },
    { label: "خانه", description: "x".repeat(301) },
  ])
    assert.equal(checkoutAddressSchema.safeParse(input).success, false);
});

test("checkout formatter remains pure and rejects invalid monetary values", () => {
  const { formatCheckoutMoney } = harness().load("utils/cart.utils");
  assert.equal(formatCheckoutMoney(12500), "۱٬۲۵۰ تومان");
  for (const value of [-1, NaN, Infinity, 1.5])
    assert.throws(() => formatCheckoutMoney(value));
});

function latestCart(h) {
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "fixtures/cart-cny-response.json"),
      "utf8",
    ),
  );
  return h
    .load("mappers/cart.mapper")
    .mapCart(h.load("schemas/cart.schema").cartResponseSchema.parse(raw));
}

test("submit snapshot preserves exact rial amounts instead of relabelling CNY prices", () => {
  const h = harness(),
    cart = latestCart(h);
  const payload = h
    .load("mappers/cart-submit-order.mapper")
    .mapCartToSubmitOrderPayload(cart, "test-id", "ground_china_iran");
  assert.equal(cart.items[0].pricing.unitPrice, "89.701");
  assert.deepEqual(payload.items[0], {
    slug: cart.items[0].product.slug,
    quantity: 1,
    color: null,
    guarantee: null,
    price: {
      unit_price_irr: "3236400",
      total_discount_amount_irr: "0",
      final_total_price_irr: "3236400",
    },
  });
  assert.equal(payload.items[4].price.final_total_price_irr, "119004930");
  assert.equal(payload.items[4].quantity, 3);
  assert.equal(cart.currency, "CNY");
});

test("invalid or incomplete cart snapshots block submission without transport", async () => {
  const h = harness();
  h.values.set("access_token", "test-access");
  const service = h.load("services/cart-order.service").cartOrderService;
  const cart = latestCart(h);
  await assert.rejects(service.submit(cart, "mock", "ground_china_iran"));
  for (const invalid of [
    { ...cart, checkoutReady: false },
    { ...cart, items: [] },
    { ...cart, issues: ["blocked"] },
    {
      ...cart,
      items: [
        {
          ...cart.items[0],
          pricing: { ...cart.items[0].pricing, unitPriceIrr: null },
        },
      ],
    },
    {
      ...cart,
      items: [
        {
          ...cart.items[0],
          selectedOptions: {
            ...cart.items[0].selectedOptions,
            guarantee: { id: 1 },
          },
        },
      ],
    },
    { ...cart, items: [{ ...cart.items[0], quantity: 0 }] },
  ])
    await assert.rejects(service.submit(invalid, "api", "ground_china_iran"));
  h.values.delete("access_token");
  await assert.rejects(service.submit(cart, "api", "ground_china_iran"));
  assert.equal(h.requests.length, 0);
});

test("submit retries retain the same idempotency key, send guest identity and accept empty success responses", async () => {
  let failing = true;
  const h = harness({
    post: async () => {
      if (failing) throw Error("timeout");
    },
  });
  h.values.set("access_token", "test-access");
  h.storage.write({
    token: "test-guest",
    header: "X-Guest-Cart-Token",
    expiresAt: Date.now() + 60000,
  });
  const service = h.load("services/cart-order.service").cartOrderService,
    cart = latestCart(h);
  await assert.rejects(service.submit(cart, "api", "ground_china_iran"));
  failing = false;
  await service.submit(cart, "api", "ground_china_iran");
  assert.equal(h.requests.length, 2);
  assert.equal(
    h.requests[0].body.idempotency_key,
    h.requests[1].body.idempotency_key,
  );
  assert.equal(h.requests[1].url, "/api/cart/submit-order");
  assert.equal(
    h.requests[1].config.headers["X-Guest-Cart-Token"],
    "test-guest",
  );
  assert.equal(h.requests[1].config.withCredentials, true);
  await service.submit(cart, "api", "ground_china_iran");
  assert.equal(h.requests.length, 2); // known accepted snapshot cannot be submitted again
  assert.ok(!JSON.stringify([...h.sessionValues]).includes("test-access"));
  assert.ok(!JSON.stringify([...h.sessionValues]).includes("test-guest"));
});

test("same snapshot keeps its key across reload while changed snapshots get distinct keys", async () => {
  const first = harness({
    post: async () => {
      throw Error("timeout");
    },
  });
  first.values.set("access_token", "test-access");
  await assert.rejects(
    first
      .load("services/cart-order.service")
      .cartOrderService.submit(latestCart(first), "api", "ground_china_iran"),
  );
  const key = first.requests[0].body.idempotency_key;
  const second = harness({
    sessionValues: first.sessionValues,
    values: first.values,
  });
  second.values.set("access_token", "test-access");
  const service = second.load("services/cart-order.service").cartOrderService;
  const cart = latestCart(second);
  await service.submit(cart, "api", "ground_china_iran");
  assert.equal(second.requests[0].body.idempotency_key, key);
  const changed = structuredClone(cart);
  changed.items[0].quantity = 2;
  await service.submit(changed, "api", "ground_china_iran");
  assert.notEqual(second.requests[1].body.idempotency_key, key);
});

test("parallel submissions share a pending request and explicit error envelopes are not accepted", async () => {
  let release, entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const h = harness({
    post: async () => {
      entered();
      await blocked;
    },
  });
  h.values.set("access_token", "test-access");
  const service = h.load("services/cart-order.service").cartOrderService,
    cart = latestCart(h);
  const a = service.submit(cart, "api", "ground_china_iran");
  await started;
  const b = service.submit(cart, "api", "ground_china_iran");
  release();
  await Promise.all([a, b]);
  assert.equal(h.requests.length, 1);
  const rejected = harness({
    post: async () => ({ error: { message: "failed" } }),
  });
  rejected.values.set("access_token", "test-access");
  const failure = rejected.load("services/cart-order.service").cartOrderService;
  await assert.rejects(
    failure.submit(latestCart(rejected), "api", "ground_china_iran"),
  );
  await assert.rejects(
    failure.submit(latestCart(rejected), "api", "ground_china_iran"),
  );
  assert.equal(
    rejected.requests[0].body.idempotency_key,
    rejected.requests[1].body.idempotency_key,
  );
});

test("shared HTTP installs bearer interception once and reads current token for each request", async () => {
  const h = harness();
  const client = h.load("../../shared/api/client").default;
  const { setupInterceptors } = h.load("../../shared/api/interceptors");
  const seen = [];
  const adapter = async (config) => {
    seen.push(config);
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  h.values.set("access_token", "first-test-token");
  setupInterceptors(client);
  setupInterceptors(client);
  await client.get("/test", { adapter });
  h.values.set("access_token", "second-test-token");
  await client.get("/test", { adapter });
  h.values.delete("access_token");
  await client.get("/test", { adapter });
  assert.equal(seen[0].headers.Authorization, "Bearer first-test-token");
  assert.equal(seen[1].headers.Authorization, "Bearer second-test-token");
  assert.equal(seen[2].headers.Authorization, undefined);
});

test("submit preserves independent color including null without replacing SKU display color", () => {
  const h = harness(),
    cart = latestCart(h);
  const map = h.load(
    "mappers/cart-submit-order.mapper",
  ).mapCartToSubmitOrderPayload;
  assert.equal(cart.items[0].selectedColor.name, "Black");
  assert.equal(
    map(cart, "color-test", "ground_china_iran").items[0].color,
    null,
  );
  cart.items[0].selectedOptions.color = "1";
  assert.equal(
    map(cart, "color-test", "ground_china_iran").items[0].color,
    "1",
  );
  cart.items[0].selectedOptions.color = { id: 1 };
  assert.throws(() => map(cart, "color-test", "ground_china_iran"));
  cart.items[0].selectedOptions.color = { id: 22, name: "مشکی", value: "#000000" };
  cart.items[0].selectedOptions.guarantee = { id: 22, name: "گارانتی تست" };
  const item = map(cart, "color-test", "ground_china_iran").items[0];
  assert.equal(item.color,"مشکی");
  assert.equal(item.guarantee,"گارانتی تست");
});

test("cart progress renders every stage with exactly one active step and the ship asset", () => {
  const h = harness({ render: true });
  const React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const Steps = h.load("components/cart-steps").default;
  for (const currentStep of ["account", "cart", "review", "payment"]) {
    const html = renderToStaticMarkup(
      React.createElement(Steps, { currentStep }),
    );
    assert.equal((html.match(/aria-current="step"/g) || []).length, 1);
    assert.equal((html.match(/<li /g) || []).length, 4);
    assert.ok(html.includes("/test.svg"));
    assert.ok(html.includes("انتخاب آدرس و پرداخت"));
  }
});

function rejectHttp(config, status = 401, data = {}) {
  const { AxiosError } = require("axios");
  throw new AxiosError("HTTP failure", "ERR_BAD_RESPONSE", config, null, {
    status,
    data,
    statusText: "Error",
    headers: {},
    config,
  });
}
function refreshHarness(refresh) {
  const h = harness({ refresh });
  h.values.set("access_token", "expired-access");
  h.values.set("refresh_token", "valid-refresh");
  h.client = h.load("../../shared/api/client").default;
  return h;
}
function okResponse(config) {
  return { data: {}, status: 200, statusText: "OK", headers: {}, config };
}

test("concurrent 401s share refresh, rotate tokens and preserve submit payload and guest header", async () => {
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const h = refreshHarness(async (url, body, config) => {
    assert.equal(url, "/api/auth/token/refresh/");
    assert.deepEqual(body, { refresh: "valid-refresh" });
    assert.equal(config.headers.Authorization, undefined);
    await blocked;
    return { access: "new-access", refresh: "new-refresh" };
  });
  const seen = [];
  let oldRequests = 0;
  const adapter = async (config) => {
    seen.push(config);
    if (config.headers.Authorization === "Bearer expired-access") {
      if (++oldRequests === 2) release();
      return rejectHttp(config);
    }
    return okResponse(config);
  };
  const body = { idempotency_key: "same-order-key", items: [] };
  await Promise.all([
    h.client.post("/api/cart/submit-order", body, {
      adapter,
      headers: { "X-Guest-Cart-Token": "guest" },
    }),
    h.client.get("/api/cart/", { adapter }),
  ]);
  assert.equal(h.requests.length, 1);
  assert.equal(h.values.get("access_token"), "new-access");
  assert.equal(h.values.get("refresh_token"), "new-refresh");
  assert.equal(seen.length, 4);
  const retried = seen.find(
    (c) =>
      c.method === "post" && c.headers.Authorization === "Bearer new-access",
  );
  assert.deepEqual(JSON.parse(retried.data), body);
  assert.equal(retried.headers["X-Guest-Cart-Token"], "guest");
});

test("a late 401 reuses the renewed token without a second refresh", async () => {
  const h = refreshHarness(async () => ({ access: "new-access" }));
  let release, entered;
  const ready = new Promise((resolve) => {
    entered = resolve;
  });
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const adapter = async (config) => {
    if (config.headers.Authorization === "Bearer expired-access") {
      if (config.url === "/late") {
        entered();
        await blocked;
      }
      return rejectHttp(config);
    }
    return okResponse(config);
  };
  const late = h.client.get("/late", { adapter });
  await ready;
  await h.client.get("/first", { adapter });
  release();
  await late;
  assert.equal(h.requests.length, 1);
  assert.equal(h.values.get("refresh_token"), "valid-refresh");
});

test("refresh rejection clears only auth tokens; network, server and malformed responses preserve them", async () => {
  for (const scenario of ["rejected", "network", "server", "malformed"]) {
    const h = refreshHarness(async () => {
      if (scenario === "rejected") return rejectHttp({}, 401);
      if (scenario === "network") throw Error("offline");
      if (scenario === "server") return rejectHttp({}, 500);
      return { access: "" };
    });
    h.values.set("guest-cart-marker", "keep");
    await assert.rejects(
      h.client.get("/api/cart/", {
        adapter: async (config) => rejectHttp(config),
      }),
    );
    assert.equal(h.requests.length, 1);
    assert.equal(h.values.get("guest-cart-marker"), "keep");
    assert.equal(
      h.values.get("access_token"),
      scenario === "rejected" ? undefined : "expired-access",
    );
    assert.equal(
      h.values.get("refresh_token"),
      scenario === "rejected" ? undefined : "valid-refresh",
    );
  }
});

test("retry is capped and guest, OTP, forbidden and server failures never refresh", async () => {
  const h = refreshHarness(async () => ({ access: "new-access" }));
  let attempts = 0;
  await assert.rejects(
    h.client.get("/api/cart/", {
      adapter: async (config) => {
        attempts++;
        return rejectHttp(config);
      },
    }),
  );
  assert.equal(attempts, 2);
  assert.equal(h.requests.length, 1);
  assert.equal(h.values.has("access_token"), false);
  for (const status of [401, 403, 500]) {
    await assert.rejects(
      h.client.get("/api/cart/", {
        adapter: async (config) => rejectHttp(config, status),
      }),
    );
  }
  h.values.set("access_token", "expired-access");
  h.values.set("refresh_token", "valid-refresh");
  await assert.rejects(
    h.client.post(
      "/api/auth/verify-otp/",
      {},
      {
        adapter: async (config) => {
          assert.equal(config.headers.Authorization, undefined);
          return rejectHttp(config);
        },
      },
    ),
  );
  assert.equal(h.requests.length, 1);
});

test("logout or a different login during refresh cannot restore or replay the old session", async () => {
  for (const login of [false, true]) {
    let release, entered;
    const started = new Promise((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise((resolve) => {
      release = resolve;
    });
    const h = refreshHarness(async () => {
      entered();
      await blocked;
      return { access: "old-account-renewed" };
    });
    let calls = 0;
    const request = h.client.get("/api/cart/", {
      adapter: async (config) => {
        calls++;
        return rejectHttp(config);
      },
    });
    const rejected = assert.rejects(request);
    await started;
    h.values.delete("access_token");
    h.values.delete("refresh_token");
    if (login) {
      h.values.set("access_token", "different-account");
      h.values.set("refresh_token", "different-refresh");
    }
    release();
    await rejected;
    assert.equal(calls, 1);
    assert.equal(
      h.values.get("access_token"),
      login ? "different-account" : undefined,
    );
  }
});

test("cancelling a waiting request prevents its replay without cancelling shared refresh", async () => {
  let release, entered;
  const started = new Promise((resolve) => {
    entered = resolve;
  });
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const h = refreshHarness(async () => {
    entered();
    await blocked;
    return { access: "new-access" };
  });
  const controller = new AbortController();
  let calls = 0;
  const request = h.client.get("/api/cart/", {
    signal: controller.signal,
    adapter: async (config) => {
      calls++;
      return rejectHttp(config);
    },
  });
  const rejected = assert.rejects(request, (error) =>
    require("axios").isCancel(error),
  );
  await started;
  controller.abort();
  release();
  await rejected;
  assert.equal(calls, 1);
  assert.equal(h.values.get("access_token"), "new-access");
});

test("guest-owner submission retains idempotency through access and refresh rotation", async () => {
  const h = harness({
    post: async () => {
      throw Error("timeout");
    },
  });
  const storage = h.load("../auth/utils/token-storage").tokenStorage;
  storage.setAccessToken("first-access");
  storage.setRefreshToken("first-refresh");
  const cart = latestCart(h);
  cart.owner.userId = null;
  const service = h.load("services/cart-order.service").cartOrderService;
  await assert.rejects(service.submit(cart, "api", "ground_china_iran"));
  const key = h.requests[0].body.idempotency_key;
  storage.setRefreshToken("rotated-refresh");
  storage.setAccessToken("rotated-access", { preserveSession: true });
  await assert.rejects(service.submit(cart, "api", "ground_china_iran"));
  assert.equal(h.requests[1].body.idempotency_key, key);
  storage.clearTokens();
  storage.setAccessToken("other-login");
  await assert.rejects(service.submit(cart, "api", "ground_china_iran"));
  assert.notEqual(h.requests[2].body.idempotency_key, key);
});

test("first guest cart reads share session creation and reuse its header", async () => {
  const h = harness();
  const service = h.load("services/cart.service").cartService;
  await Promise.all([service.getCart(), service.getCart()]);
  assert.equal(h.requests.filter((r) => r.method === "POST").length, 1);
  assert.equal(h.requests[0].url, "/api/cart/session/");
  for (const request of h.requests.filter((r) => r.method === "GET")) {
    assert.equal(request.config.headers["X-Guest-Cart-Token"], h.session.token);
  }
  await service.getCart();
  assert.equal(h.requests.length, 4);
  assert.equal(
    h.requests[3].config.headers["X-Guest-Cart-Token"],
    h.session.token,
  );
});

test("guest read stops on session failure and never replaces an existing rejected session", async () => {
  const failure = harness({
    post: async () => {
      throw Error("session unavailable");
    },
  });
  await assert.rejects(
    failure.load("services/cart.service").cartService.getCart(),
  );
  assert.equal(failure.requests.length, 1);
  assert.equal(failure.requests[0].method, "POST");
  const existing = harness({
    get: async () => {
      throw Error("unauthorized");
    },
  });
  existing.storage.write({
    token: "existing-guest",
    header: "X-Guest-Cart-Token",
    expiresAt: Date.now() + 60000,
  });
  await assert.rejects(
    existing.load("services/cart.service").cartService.getCart(),
  );
  assert.equal(existing.requests.length, 1);
  assert.equal(existing.requests[0].method, "GET");
  assert.equal(existing.storage.read().token, "existing-guest");
});

function paymentFixture() {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "fixtures/checkout-payment-response.json"),
      "utf8",
    ),
  );
}
test("approved checkout validates the real response and preserves authoritative money and disabled methods", () => {
  const h = harness();
  const dto = h
    .load("schemas/checkout-payment.schema")
    .checkoutPaymentSchema.parse(paymentFixture());
  const payment = h
    .load("mappers/checkout-payment.mapper")
    .mapCheckoutPayment(dto);
  assert.equal(payment.total, "5367800.000");
  assert.equal(payment.currency, "IRR");
  assert.equal(payment.canContinue, true);
  assert.ok(payment.pricingIssue);
  assert.deepEqual(payment.addresses, []);
  assert.equal(payment.options.find((o) => o.code === "wallet").enabled, false);
  assert.equal(payment.options.find((o) => o.code === "hawala").enabled, false);
  assert.equal(
    payment.options.find((o) => o.code === "offline").method,
    "bank-transfer",
  );
  assert.equal(
    payment.options.find((o) => o.code === "offline").bankAccount.iban,
    dto.payment_options.available_payment_methods[1].offline_payment_info
      .sheba_number,
  );
  assert.equal(
    payment.options.find((o) => o.code === "online").gateways.length,
    5,
  );
  const pending = structuredClone(dto);
  pending.order.expert_pricing_status = "pending_review";
  assert.equal(
    h.load("mappers/checkout-payment.mapper").mapCheckoutPayment(pending)
      .canContinue,
    false,
  );
  dto.order.workflow.is_terminal = true;
  assert.equal(
    h.load("mappers/checkout-payment.mapper").mapCheckoutPayment(dto)
      .canContinue,
    false,
  );
});
test("checkout GET encodes tracking code, forwards cancellation and rejects mismatched orders", async () => {
  const raw = paymentFixture();
  const h = harness({ get: () => raw });
  const controller = new AbortController();
  const payment = await h
    .load("services/checkout-payment.service")
    .checkoutPaymentService.get(raw.order.tracking_code, controller.signal);
  assert.equal(payment.orderId, 30);
  assert.equal(
    h.requests[0].url,
    "/api/customer/checkout/payment/iranmobix-720029/",
  );
  assert.equal(h.requests[0].config.signal, controller.signal);
  assert.equal(h.requests[0].config.withCredentials, true);
  assert.equal(h.requests.length, 1);
  await assert.rejects(
    h
      .load("services/checkout-payment.service")
      .checkoutPaymentService.get("different-order"),
  );
  const invalid = paymentFixture();
  delete invalid.pricing.final_amount;
  assert.equal(
    h
      .load("schemas/checkout-payment.schema")
      .checkoutPaymentSchema.safeParse(invalid).success,
    false,
  );
});
test("checkout respects backend method availability, displays wallet balance and labels payment actions", () => {
  const h = harness({ render: true }),
    React = require("react"),
    { renderToStaticMarkup } = require("react-dom/server");
  const data = h
    .load("mappers/checkout-payment.mapper")
    .mapCheckoutPayment(paymentFixture());
  const Methods = h.load(
    "components/checkout/checkout-payment-methods",
  ).default;
  const html = renderToStaticMarkup(
    React.createElement(Methods, {
      value: null,
      serverOptions: data.options,
      onChange: () => {},
      onBankDetails: () => {},
    }),
  );
  const radios = html.match(/<input[^>]*type="radio"[^>]*>/g) || [];
  assert.equal(radios.length, 4);
  assert.equal(
    radios.filter((radio) => radio.includes("disabled")).length,
    data.options.filter((option) => !option.enabled || !option.method).length,
  );
  assert.ok(
    html.includes(data.options.find((o) => o.method === "wallet").balanceToman),
  );
  assert.ok(html.includes("نمایش شماره کارت و شبا"));
  const Summary = h.load(
    "components/checkout/checkout-payment-summary",
  ).default;
  const summary = renderToStaticMarkup(
    React.createElement(Summary, { data, method: "bank-transfer" }),
  );
  assert.ok(summary.includes("5,367,800.000 ریال"));
  assert.ok(summary.includes("بارگذاری رسید پرداخت"));
  for (const [method, label] of [
    ["online", "پرداخت"],
    ["wallet", "پرداخت"],
    ["foreign-transfer", "پرداخت حواله ارزی"],
  ]) {
    const markup = renderToStaticMarkup(
      React.createElement(Summary, { data, method }),
    );
    assert.ok(markup.includes(">" + label + "</button>"));
  }
  assert.ok(summary.includes("disabled"));
  assert.ok(summary.includes("جمع ردیف‌های هزینه"));
});
test("submit response exposes its tracking code and reuses it after an idempotent local replay", async () => {
  const response = {
    order_id: 30,
    tracking_code: "test-order",
    initial_amount_irr: "3367800",
    expert_pricing_status: "pending_review",
    assigned_sales_expert: { id: 41, name: "کارشناس نمونه" },
    idempotent_replay: false,
    next_action: {
      type: "wait_for_sales_expert_approval",
      message: "ثبت شد",
      tracking_code: "test-order",
      public_tracking_endpoint: "/api/order-tracking/test-order/",
    },
  };
  const h = harness({ post: async () => response });
  h.values.set("access_token", "test-access");
  const service = h.load("services/cart-order.service").cartOrderService;
  assert.equal(
    await service.submit(latestCart(h), "api", "ground_china_iran"),
    "test-order",
  );
  assert.equal(
    await service.submit(latestCart(h), "api", "ground_china_iran"),
    "test-order",
  );
  assert.equal(h.requests.length, 1);
  const restored = harness({
    values: h.values,
    sessionValues: h.sessionValues,
  });
  assert.equal(
    await restored
      .load("services/cart-order.service")
      .cartOrderService.submit(
        latestCart(restored),
        "api",
        "ground_china_iran",
      ),
    "test-order",
  );
  assert.equal(restored.requests.length, 0);
});

test("create address validates input and sends the exact supplied backend keys", async () => {
  const h = harness();
  const service = h.load("services/customer-address.service");
  const input = {
    title: " خانه ",
    addressTitle: "خانه",
    provinceId: 1,
    cityId: 2,
    postalCode: "۱۲۳۴۵۶۷۸۹۰",
    address: "نشانی نمونه",
    no: "12",
    unit: "",
    fullName: "گیرنده نمونه",
    mobile: "۰۹۱۲۳۴۵۶۷۸۹",
  };
  await service.createCustomerAddress(input);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, "/api/customer/addresses/");
  assert.equal(h.requests[0].config.withCredentials, true);
  assert.deepEqual(h.requests[0].body, {
    title: "خانه",
    address_title: "خانه",
    province: 1,
    city: 2,
    postal_code: "1234567890",
    address: "نشانی نمونه",
    no: "12",
    unit: "",
    "fullname ": "گیرنده نمونه",
    mobile: "09123456789",
  });
  await assert.rejects(
    service.createCustomerAddress({ ...input, provinceId: 0 }),
  );
  assert.equal(h.requests.length, 1);
  const failing = harness({
    post: () => {
      throw Error("network unavailable");
    },
  });
  await assert.rejects(
    failing
      .load("services/customer-address.service")
      .createCustomerAddress(input),
  );
  assert.equal(failing.requests.length, 1);
});

test("compact payment response renders exact amounts without inventing approval or currency", async () => {
  const raw = {
    wallet: {
      balance_toman: "0.000",
      shortage_toman: "321312.000",
      status: "insufficient",
    },
    proforma_invoice: { pdf_url: null, pdf_status: "missing" },
    pricing: {
      items_total: "13111.000",
      item_count: 1,
      shipping_packaging_amount: "3200000.000",
      domestic_shipping_amount: "0.000",
      discounted_price: "0.000",
      final_amount: "3213111.000",
    },
  };
  const h = harness({ get: () => raw });
  const result = await h
    .load("services/checkout-payment.service")
    .checkoutPaymentService.get("test-order");
  assert.equal(result.trackingCode, "test-order");
  assert.equal(result.status, null);
  assert.equal(result.canContinue, false);
  assert.equal(result.currency, null);
  assert.equal(result.total, "3213111.000");
  assert.equal(result.wallet.shortageToman, "321312.000");
  assert.equal(result.proforma.available, false);
  assert.equal(
    result.rows.find((r) => r.key === "discounted_price").amount,
    "0.000",
  );
  const invalid = structuredClone(raw);
  delete invalid.pricing.final_amount;
  assert.equal(
    h
      .load("schemas/checkout-payment.schema")
      .checkoutPaymentSchema.safeParse(invalid).success,
    false,
  );
});
test("addresses use their dedicated GET and validate list and paginated response envelopes", async () => {
  const fields = {
    province: 1,
    province_name: "استان نمونه",
    city: 2,
    city_name: "شهر نمونه",
    postal_code: "1234567890",
    no: "12",
    unit: "",
    fullname: "گیرنده نمونه",
    mobile: "09123456789",
    status: 0,
  };
  for (const raw of [
    [
      {
        ...fields,
        id: 1,
        title: "",
        display_title: "",
        display_address: "",
        address_title: "خانه",
        address: "نشانی نمونه",
      },
    ],
    {
      results: [
        {
          ...fields,
          id: 1,
          title: "عنوان قدیمی",
          address_title: "عنوان قدیمی",
          address: "متن قدیمی",
          display_title: "خانه",
          display_address: "نشانی نمونه",
        },
      ],
      next: null,
    },
  ]) {
    const h = harness({ get: () => raw });
    const controller = new AbortController();
    const result = await h
      .load("services/customer-address.service")
      .getCustomerAddresses(controller.signal);
    assert.equal(h.requests[0].url, "/api/customer/addresses/");
    assert.equal(h.requests[0].config.signal, controller.signal);
    assert.equal(result.items[0].label, "خانه");
    assert.equal(result.items[0].description, "نشانی نمونه");
    assert.equal(result.hasMore, false);
  }
  const bad = harness({ get: () => ({ detail: "not a list" }) });
  await assert.rejects(
    bad.load("services/customer-address.service").getCustomerAddresses(),
  );
});

test("address GET schema preserves documented fields and rejects malformed location IDs", () => {
  const schema = harness().load(
    "schemas/customer-address.schema",
  ).customerAddressListSchema;
  const address = {
    id: 0,
    title: "string",
    address_title: "string",
    display_title: "string",
    province: 0,
    province_name: "string",
    city: 0,
    city_name: "string",
    postal_code: "string",
    address: "string",
    display_address: "string",
    no: "string",
    unit: "string",
    fullname: "string",
    mobile: "string",
    status: 0,
  };
  assert.deepEqual(schema.parse([address]), [address]);
  assert.deepEqual(schema.parse([]), []);
  assert.equal(
    schema.safeParse([{ ...address, province: "bad" }]).success,
    false,
  );
});

test("province list uses authenticated transport, preserves IDs and names and validates the response", async () => {
  const h = harness({
    get: () => [
      { id: 23, name: "تهران", status: 1 },
      { id: 19, name: "اصفهان", status: 1 },
    ],
  });
  const controller = new AbortController();
  const provinces = await h
    .load("services/customer-address.service")
    .getCustomerProvinces(controller.signal);
  assert.deepEqual(provinces, [
    { id: 23, name: "تهران" },
    { id: 19, name: "اصفهان" },
  ]);
  assert.equal(h.requests[0].url, "/api/customer/provinces/");
  assert.equal(h.requests[0].config.withCredentials, true);
  assert.equal(h.requests[0].config.signal, controller.signal);
  const invalid = harness({
    get: () => [{ id: "bad", name: "تهران", status: 1 }],
  });
  await assert.rejects(
    invalid.load("services/customer-address.service").getCustomerProvinces(),
  );
});

test("cities use GET province name query and reject a response from another province", async () => {
  const h = harness({
    get: () => [
      {
        id: 128,
        name: "تهران",
        province: 23,
        province_name: "تهران",
        status: 1,
      },
    ],
  });
  const controller = new AbortController();
  const result = await h
    .load("services/customer-address.service")
    .getCustomerCities({ id: 23, name: "تهران" }, controller.signal);
  assert.deepEqual(result, [{ id: 128, name: "تهران" }]);
  assert.equal(h.requests[0].method, "GET");
  assert.equal(h.requests[0].url, "/api/customer/cities/");
  assert.deepEqual(h.requests[0].config.params, { province: "تهران" });
  assert.equal(h.requests[0].body, undefined);
  assert.equal(h.requests[0].config.signal, controller.signal);
  await assert.rejects(
    h
      .load("services/customer-address.service")
      .getCustomerCities({ id: 19, name: "اصفهان" }),
  );
  const before = h.requests.length;
  await assert.rejects(
    h
      .load("services/customer-address.service")
      .getCustomerCities({ id: 0, name: "" }),
  );
  assert.equal(h.requests.length, before);
});

test("addresses with a null recipient still map to visible address cards", async () => {
  const raw = [
    {
      id: 16,
      title: "خانه",
      address_title: "خانه",
      display_title: "خانه",
      province: 19,
      province_name: "اصفهان",
      city: 1105,
      city_name: "ابوزیدآباد",
      postal_code: "1234567890",
      address: "خیابان اول کوچه دوم",
      display_address: "اصفهان، ابوزیدآباد، خیابان اول کوچه دوم، پلاک 1",
      no: "1",
      unit: "",
      fullname: null,
      mobile: "09123456789",
      status: 0,
    },
  ];
  const h = harness({ get: () => raw });
  const result = await h
    .load("services/customer-address.service")
    .getCustomerAddresses();
  assert.deepEqual(result, {
    items: [{
      id: "16", label: "خانه", description: raw[0].display_address,
      provinceId: 19, province: "اصفهان", cityId: 1105, city: "ابوزیدآباد",
      street: raw[0].address, no: "1", unit: "", postalCode: "1234567890",
      receiverName: "", receiverMobile: "09123456789",
    }],
    hasMore: false,
  });
  const schema = h.load(
    "schemas/customer-address.schema",
  ).customerAddressResponseSchema;
  assert.equal(schema.parse(raw[0]).fullname, null);
  assert.equal(schema.safeParse({ ...raw[0], fullname: 123 }).success, false);
});

test("shipping method is required, validated and included in submission identity", async () => {
  const h = harness();
  h.values.set("access_token", "test-access");
  const cart = latestCart(h);
  const service = h.load("services/cart-order.service").cartOrderService;
  await assert.rejects(service.submit(cart, "api", undefined));
  await assert.rejects(service.submit(cart, "api", "invalid"));
  for (const obsolete of ["air", "ground", "commercial_air", "sea"])
    await assert.rejects(service.submit(cart, "api", obsolete));
  assert.equal(h.requests.length, 0);
  for (const shipping of [
    "ground_china_iran",
    "air_express",
    "commercial_air_iran",
    "sea_china_iran",
    "commercial_air_dubai",
    "sea_china_dubai",
  ]) {
    await service.submit(cart, "api", shipping);
    await service.submit(cart, "api", shipping);
  }
  assert.equal(h.requests.length, 6);
  assert.deepEqual(
    h.requests.map((r) => r.body.shipping_method),
    [
      "ground_china_iran",
      "air_express",
      "commercial_air_iran",
      "sea_china_iran",
      "commercial_air_dubai",
      "sea_china_dubai",
    ],
  );
  assert.equal(new Set(h.requests.map((r) => r.body.idempotency_key)).size, 6);
});
test("shipping selector renders all six methods and locks controls while busy", () => {
  const h = harness({ render: true });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Component = h.load("components/cart-shipping-methods").default;
  const html = renderToStaticMarkup(
    React.createElement(Component, {
      value: "ground_china_iran",
      onChange: () => {},
      disabled: true,
    }),
  );
  assert.equal((html.match(/type="radio"/g) || []).length, 6);
  assert.ok(html.includes('value="ground_china_iran"'));
  assert.ok(html.includes('<fieldset disabled=""'));
  assert.equal((html.match(/checked=""/g) || []).length, 1);
});

test("shipping selector allows an explicit choice without preselecting a method", () => {
  const h = harness({render:true});
  const React = require("react");
  const {renderToStaticMarkup} = require("react-dom/server");
  const Component = h.load("components/cart-shipping-methods").default;
  const html = renderToStaticMarkup(React.createElement(Component,{
    value:null,onChange:()=>{},disabled:false,
  }));
  assert.equal((html.match(/type="radio"/g)||[]).length,6);
  assert.equal(html.includes('checked=""'),false);
  assert.equal(html.includes('<fieldset disabled=""'),false);
});

test("approved compact payment maps window, exact large balances and every bank destination", () => {
  const h = harness();
  const raw = {
    wallet: {
      balance: "999999999999999999990",
      shortage: "0",
      currency: "IRR",
      balance_toman: "99999999999999999999",
      shortage_toman: "0",
      status: "sufficient",
    },
    proforma_invoice: { pdf_url: null, pdf_status: "missing" },
    pricing: {
      currency: "IRR",
      items_total: "4728027",
      item_count: 1,
      shipping_packaging_amount: "2000000",
      domestic_shipping_amount: "0",
      discounted_price: "4528027",
      final_amount: "6728027",
    },
    payment_window: {
      status: "approved",
      can_continue_payment: true,
      expires_at: "2026-10-07T13:04:09.696483+00:00",
      remaining_seconds: 604790,
      message: "approved",
    },
    payment_methods: [
      { code: "offline", title: "bank", enabled: true, reason: null },
    ],
    offline_payment_destinations: [0, 1].map((index) => ({
      index,
      amount: String((index + 2) * 1000000),
      bank_name: "bank-" + index,
      card_number: "123456789012345" + index,
      sheba_number: "IR21123456789101234567891" + index,
      account_owner: "owner-" + index,
      currency: "IRR",
    })),
  };
  const schema = h.load(
    "schemas/checkout-payment.schema",
  ).checkoutPaymentSchema;
  const map = h.load("mappers/checkout-payment.mapper").mapCheckoutPayment;
  const result = map(schema.parse(raw), "test-order");
  assert.equal(result.status, "approved");
  assert.equal(result.canContinue, true);
  assert.equal(result.expiresAt, raw.payment_window.expires_at);
  assert.equal(result.currency, "IRR");
  assert.equal(result.pricingIssue, null);
  assert.equal(result.wallet.balance, raw.wallet.balance);
  assert.equal(result.wallet.balanceToman, raw.wallet.balance_toman);
  assert.equal(result.bankAccounts.length, 2);
  for (const [i, card] of result.bankAccounts.entries()) {
    assert.equal(
      card.cardNumber,
      raw.offline_payment_destinations[i].card_number,
    );
    assert.equal(card.iban, raw.offline_payment_destinations[i].sheba_number);
    assert.equal(card.amount, raw.offline_payment_destinations[i].amount);
  }
  assert.equal(result.options[0].method, "bank-transfer");
  assert.equal(
    map(
      schema.parse({
        ...raw,
        payment_window: { ...raw.payment_window, can_continue_payment: false },
      }),
    ).canContinue,
    false,
  );
  assert.equal(
    map(
      schema.parse({
        ...raw,
        payment_window: { ...raw.payment_window, status: "pending_review" },
      }),
    ).canContinue,
    false,
  );
  assert.deepEqual(
    map(schema.parse({ ...raw, offline_payment_destinations: [] }))
      .bankAccounts,
    [],
  );
  assert.equal(
    schema.safeParse({
      ...raw,
      offline_payment_destinations: [
        { ...raw.offline_payment_destinations[0], amount: 2000000 },
      ],
    }).success,
    false,
  );
});

test("payment methods render only returned choices and reject stale disabled selections", () => {
  const h = harness({ render: true });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Methods = h.load(
    "components/checkout/checkout-payment-methods",
  ).default;
  const options = ["online", "wallet"].map((method) => ({
    code: method,
    method,
    title: "server-" + method,
    enabled: true,
    reason: null,
    balanceToman: "10",
    description: null,
    bankAccount: null,
    gateways: [],
  }));
  const render = (serverOptions, value = "bank-transfer") =>
    renderToStaticMarkup(
      React.createElement(Methods, {
        serverOptions,
        value,
        onChange: () => {},
        onBankDetails: () => {},
      }),
    );
  const html = render(options);
  assert.equal((html.match(/type="radio"/g) || []).length, 2);
  assert.ok(html.includes("server-online"));
  assert.ok(html.includes("server-wallet"));
  assert.ok(!html.includes("نمایش شماره کارت و شبا"));
  assert.ok(!html.includes('checked=""'));
  const disabled = render(
    [{ ...options[1], enabled: false, reason: "wallet blocked" }],
    "wallet",
  );
  assert.ok(disabled.includes("wallet blocked"));
  assert.ok(!disabled.includes('checked=""'));
  assert.ok(
    (disabled.match(/<input[^>]*>/g) || []).every((input) =>
      input.includes("disabled"),
    ),
  );
  const empty = render([]);
  assert.ok(!empty.includes('type="radio"'));
  const unknown = render([{ ...options[0], code: "unknown", method: null }]);
  assert.ok(
    (unknown.match(/<input[^>]*>/g) || []).every((input) =>
      input.includes("disabled"),
    ),
  );
});

test("cart cards omit absent color and guarantee rows and display available values", () => {
  const h = harness({ render: true });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const CartItem = h.load("components/cart-item").default;
  const item = latestCart(h).items[0];
  const render = (item) =>
    renderToStaticMarkup(React.createElement(CartItem, { item }));
  const absent = {
    ...item,
    selectedColor: null,
    product: {
      ...item.product,
      guarantee: { available: false, type: null, label: null },
    },
  };
  const empty = render(absent);
  assert.ok(!empty.includes("رنگ:"));
  assert.ok(!empty.includes("گارانتی:"));
  const present = render({
    ...absent,
    selectedColor: { name: "Black", value: null },
    product: {
      ...absent.product,
      guarantee: { available: true, type: "iranmobix", label: "Warranty" },
    },
  });
  assert.ok(present.includes("Black"));
  assert.ok(present.includes("Warranty"));
  assert.ok(present.includes("رنگ:"));
  assert.ok(present.includes("گارانتی:"));
});

test("coupon preview sends the exact code as a query parameter and removal omits it", async () => {
  const h = harness({ get: () => ({}) });
  const api = h.load("api/checkout-payment.api").checkoutPaymentApi;
  await api.get("test-order", undefined, "SAVE10");
  await api.get("test-order", undefined, "");
  assert.equal(h.requests[0].url, "/api/customer/checkout/payment/test-order/");
  assert.equal(h.requests[0].config.params.coupon_code, "SAVE10");
  assert.equal(h.requests[1].config.params, undefined);
});
test("checkout submission requires explicit contract acceptance and preserves the preview coupon", async () => {
  const h = harness({
    post: () => ({
      payment_type: "wallet",
      idempotent_replay: false,
      next_action: { type: "confirmed", message: "ok" },
    }),
  });
  const submit = h.load("services/checkout-submit.service").submitCheckout;
  const payload = {
    tracking_code: "test-order",
    address_id: 12,
    payment_type: "wallet",
    contract_accepted: true,
    final_amount: "100000.00",
    coupon_code: "SAVE10",
  };
  await assert.rejects(submit({ ...payload, contract_accepted: false }));
  await assert.rejects(submit({ ...payload, address_id: 0 }));
  await assert.rejects(submit({ ...payload, payment_type: "unsupported" }));
  assert.equal(h.requests.length, 0);
  const result = await submit(payload);
  assert.equal(result.next_action.message, "ok");
  assert.equal(h.requests[0].url, "/api/customer/checkout/payment/test-order/");
  assert.equal(h.requests[0].body.contract_accepted, true);
  assert.equal(h.requests[0].body.coupon_code, "SAVE10");
  assert.equal(h.requests[0].body.final_amount, "100000.00");
});
test("payment action stays disabled without acceptance and an action handler", () => {
  const h = harness({ render: true });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Summary = h.load(
    "components/checkout/checkout-payment-summary",
  ).default;
  const data = h
    .load("mappers/checkout-payment.mapper")
    .mapCheckoutPayment(paymentFixture());
  const render = (props) =>
    renderToStaticMarkup(
      React.createElement(Summary, { data, method: "wallet", ...props }),
    );
  const button = (html) =>
    (html.match(/<button[^>]*>.*?پرداخت<\/button>/s) || [])[0] || "";
  assert.ok(
    button(render({ canPay: false, onPay: () => {} })).includes('disabled=""'),
  );
  assert.ok(button(render({ canPay: true })).includes('disabled=""'));
  assert.ok(
    !button(render({ canPay: true, onPay: () => {} })).includes('disabled=""'),
  );
});

test("contract response preserves nullable template IDs and protected PDF location", () => {
  const h = harness();
  const schema = h.load(
    "schemas/checkout-payment.schema",
  ).checkoutPaymentSchema;
  const map = h.load("mappers/checkout-payment.mapper").mapCheckoutPayment;
  const raw = {
    wallet: { balance_toman: "100", shortage_toman: "0", status: "sufficient" },
    proforma_invoice: { pdf_url: null, pdf_status: "missing" },
    pricing: {
      currency: "IRR",
      items_total: "1000",
      item_count: 1,
      shipping_packaging_amount: "0",
      domestic_shipping_amount: "0",
      discounted_price: "900",
      final_amount: "900",
    },
    contract: {
      required: true,
      accepted: false,
      template_id: null,
      title: "Contract",
      pdf_url: "/api/customer/orders/30/pre-contract/",
    },
  };
  const result = map(schema.parse(raw), "test-order");
  assert.equal(result.contract.required, true);
  assert.equal(result.contract.accepted, false);
  assert.equal(result.contract.templateId, null);
  assert.equal(result.contract.pdfUrl, raw.contract.pdf_url);
  assert.equal(
    schema.safeParse({
      ...raw,
      contract: { ...raw.contract, required: "true" },
    }).success,
    false,
  );
});

test("coupon pricing keeps the checkout phase, contract, addresses and payment options", () => {
  const h = harness();
  const { mapCheckoutPayment, applyCheckoutCouponPreview } = h.load(
    "mappers/checkout-payment.mapper",
  );
  const current = mapCheckoutPayment(paymentFixture());
  const preview = {
    ...current,
    total: "800",
    rows: [{ key: "total", label: "Total", amount: "800" }],
    wallet: { balanceToman: "100", shortageToman: "0", status: "sufficient" },
    status: "pending_review",
    contract: null,
    options: [],
    addresses: [],
    selectedAddressId: null,
  };
  const updated = applyCheckoutCouponPreview(current, preview);
  assert.equal(updated.total, "800");
  assert.equal(updated.wallet.status, "sufficient");
  assert.strictEqual(updated.rows, preview.rows);
  assert.equal(updated.status, current.status);
  assert.strictEqual(updated.contract, current.contract);
  assert.strictEqual(updated.options, current.options);
  assert.strictEqual(updated.addresses, current.addresses);
  assert.equal(updated.selectedAddressId, current.selectedAddressId);
  assert.equal(current.total, mapCheckoutPayment(paymentFixture()).total);
});

test("invalid coupon displays its field error beside the input and keeps the applied code", () => {
  const h = harness({ render: true });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Coupon = h.load("components/checkout/checkout-coupon").default;
  const error = new (require("axios").AxiosError)(
    "Invalid coupon",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 400,
      data: {
        error: {
          message: "Validation error",
          fields: { coupon_code: ["کد تخفیف معتبر نیست."] },
        },
      },
    },
  );
  const html = renderToStaticMarkup(
    React.createElement(Coupon, {
      applied: "SAVE10",
      disabled: false,
      onApply: () => {},
      error,
    }),
  );
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes("کد تخفیف معتبر نیست."));
  assert.ok(html.includes("SAVE10"));
  assert.ok(html.includes('aria-invalid="true"'));
  assert.ok(html.includes("اعمال"));
});

test("coupon requests keep the main checkout query successful on validation failure and reuse only the successful code", async () => {
  const rq = require("@tanstack/react-query");
  const client = new rq.QueryClient();
  const key = ["cart", "payment", "test-order", "test-session"];
  let observer, completed, paymentQuery;
  const raw = {
    wallet: { balance_toman: "100", shortage_toman: "0", status: "sufficient" },
    proforma_invoice: { pdf_url: null, pdf_status: "missing" },
    pricing: {
      currency: "IRR",
      items_total: "1000",
      item_count: 1,
      shipping_packaging_amount: "0",
      domestic_shipping_amount: "0",
      discounted_price: "900",
      final_amount: "900",
    },
  };
  const h = harness({
    get: (_url, config) => {
      if (config.params?.coupon_code === "INVALID")
        throw new (require("axios").AxiosError)(
          "Invalid code",
          undefined,
          undefined,
          undefined,
          { status: 400, data: { detail: "Invalid code" } },
        );
      return raw;
    },
    modules: {
      react: {
        useEffect: () => {},
        useRef: () => ({ current: false }),
        useState: () => [Date.now(), () => {}],
      },
      "@/features/auth/hooks/use-access-token": {
        useAccessToken: () => "test-token",
      },
      "@/features/auth/utils/token-storage": {
        tokenStorage: { getSessionId: () => "test-session" },
      },
      "@tanstack/react-query": {
        ...rq,
        useQueryClient: () => client,
        useQuery: (options) => {
          if (options.queryKey[1] !== "payment") return {};
          paymentQuery = options;
          return {
            data: client.getQueryData(options.queryKey),
            isFetching: false,
            isError: false,
            isPlaceholderData: false,
          };
        },
        useMutation: (options) => {
          observer = new rq.MutationObserver(client, options);
          return {
            ...observer.getCurrentResult(),
            mutate: (variables) => {
              completed = observer.mutate(variables);
              completed.catch(() => {});
            },
          };
        },
      },
    },
  });
  const initial = {
    ...h
      .load("mappers/checkout-payment.mapper")
      .mapCheckoutPayment(paymentFixture()),
    appliedCouponCode: "",
  };
  client.setQueryData(key, initial);
  const checkout = h
    .load("hooks/use-checkout-payment")
    .useCheckoutPayment("test-order");
  assert.deepEqual(paymentQuery.queryKey, key);
  checkout.applyCoupon("SAVE10");
  await completed;
  const applied = client.getQueryData(key);
  assert.equal(applied.total, "900");
  assert.equal(applied.appliedCouponCode, "SAVE10");
  assert.equal(applied.status, initial.status);
  assert.strictEqual(applied.contract, initial.contract);
  checkout.applyCoupon("INVALID");
  await assert.rejects(completed);
  assert.strictEqual(client.getQueryData(key), applied);
  assert.equal(client.getQueryState(key).status, "success");
  assert.equal(observer.getCurrentResult().status, "error");
  await paymentQuery.queryFn({ signal: undefined });
  assert.equal(h.requests.at(-1).config.params.coupon_code, "SAVE10");
  checkout.applyCoupon("");
  await completed;
  assert.equal(client.getQueryData(key).appliedCouponCode, "");
  assert.equal(h.requests.at(-1).config.params, undefined);
  client.clear();
});

test("proforma button is enabled only when the backend provides an available PDF", () => {
  const h = harness({ render: true });
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const Summary = h.load(
    "components/checkout/checkout-payment-summary",
  ).default;
  const data = h
    .load("mappers/checkout-payment.mapper")
    .mapCheckoutPayment(paymentFixture());
  const render = (proforma) =>
    renderToStaticMarkup(
      React.createElement(Summary, {
        data: { ...data, proforma },
        method: null,
      }),
    );
  const button = (html) =>
    html.match(/<button[^>]*>مشاهده پیش‌فاکتور<\/button>/)?.[0] || "";
  const ready = {
    available: true,
    url: "/api/customer/orders/30/proforma/",
    message: "",
  };
  assert.ok(button(render(ready)));
  assert.ok(!button(render(ready)).includes('disabled=""'));
  assert.ok(
    button(render({ ...ready, available: false })).includes('disabled=""'),
  );
  assert.ok(button(render({ ...ready, url: null })).includes('disabled=""'));
});

test("protected checkout PDFs use the shared transport as blobs and reject unsafe destinations", async () => {
  const savedBase = process.env.NEXT_PUBLIC_API_URL;
  process.env.NEXT_PUBLIC_API_URL = "https://backend.example";
  try {
    const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    const h = harness({ get: () => pdf });
    const getDocument = h.load(
      "services/checkout-document.service",
    ).getCheckoutDocument;
    assert.strictEqual(
      await getDocument("/api/customer/orders/30/proforma/"),
      pdf,
    );
    assert.equal(
      h.requests[0].url,
      "https://backend.example/api/customer/orders/30/proforma/",
    );
    assert.equal(h.requests[0].config.responseType, "blob");
    assert.equal(h.requests[0].config.withCredentials, true);
    await assert.rejects(getDocument("https://other.example/api/file.pdf"));
    assert.equal(h.requests.length, 1);
    const invalid = harness({
      get: () => new Blob(["{}"], { type: "application/json" }),
    });
    await assert.rejects(
      invalid
        .load("services/checkout-document.service")
        .getCheckoutDocument("/api/customer/orders/30/proforma/"),
    );
  } finally {
    if (savedBase === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = savedBase;
  }
});

test("receipt submission requires tracking information and sends the selected file as multipart", async () => {
  const File = require("node:buffer").File;
  const file = new File(["receipt"], "receipt.png", { type: "image/png" });
  const h = harness({
    post: () => ({ id: 30, payment_status_label: "Pending review" }),
  });
  const { uploadOfflineReceipt, validateReceiptFile } = h.load(
    "services/offline-receipt.service",
  );
  await assert.rejects(uploadOfflineReceipt(30, { trackingNumber: "", file }));
  await assert.rejects(
    uploadOfflineReceipt(30, {
      trackingNumber: "tracking",
      file: new File(["x"], "unsafe.html", { type: "text/html" }),
    }),
  );
  assert.equal(h.requests.length, 0);
  assert.ok(
    validateReceiptFile(
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.pdf", {
        type: "application/pdf",
      }),
    ),
  );
  const result = await uploadOfflineReceipt(30, {
    trackingNumber: "  REF123  ",
    file,
  });
  assert.equal(result.payment_status_label, "Pending review");
  const request = h.requests[0];
  assert.equal(request.url, "/api/customer/orders/30/offline-receipt/");
  assert.equal(request.body.get("tracking_number"), "REF123");
  assert.equal(request.body.get("receipt_image").name, "receipt.png");
  assert.equal(request.config.withCredentials, true);
  assert.equal(request.config.headers["Content-Type"], undefined);
  await uploadOfflineReceipt(30, { trackingNumber: "TEXT123", file: null });
  assert.equal(h.requests[1].body.has("receipt_image"), false);
});

test("failed receipt upload retries the same prepared order without repeating checkout submission", async () => {
  const rq = require("@tanstack/react-query");
  const client = new rq.QueryClient({
    defaultOptions: { mutations: { gcTime: 0 } },
  });
  let uploads = 0;
  const h = harness({
    post: (url) => {
      if (url.includes("offline-receipt")) {
        if (++uploads === 1) throw new Error("Upload failed");
        return { id: 30, payment_status_label: "Pending review" };
      }
      return {
        order: { id: 30 },
        payment_type: "offline",
        idempotent_replay: false,
        next_action: { type: "upload_payment_receipt" },
      };
    },
    modules: {
      react: { useRef: () => ({ current: null }) },
      "@tanstack/react-query": {
        useMutation: (options) => {
          const observer = new rq.MutationObserver(client, options);
          return { mutateAsync: (input) => observer.mutate(input) };
        },
      },
    },
  });
  const hook = h.load("hooks/use-offline-receipt").useOfflineReceipt();
  const input = {
    sessionId: "session",
    checkout: {
      tracking_code: "test-order",
      address_id: 12,
      payment_type: "offline",
      contract_accepted: true,
      final_amount: "1000",
      coupon_code: "SAVE10",
    },
    receipt: { trackingNumber: "REF123", file: null },
  };
  await assert.rejects(hook.mutateAsync(input));
  const result = await hook.mutateAsync(input);
  assert.equal(result.id, 30);
  assert.equal(
    h.requests.filter((r) => r.url.includes("/checkout/payment/")).length,
    1,
  );
  assert.equal(
    h.requests.filter((r) => r.url.includes("/offline-receipt/")).length,
    2,
  );
  assert.equal(h.requests[0].body.coupon_code, "SAVE10");
  client.clear();
});

function onlineCheckoutInput() {
  return {
    tracking_code: "test-order",
    address_id: 12,
    payment_type: "online",
    gateway_code: "mellat",
    contract_accepted: true,
    final_amount: "1000",
    coupon_code: "SAVE10",
  };
}
function onlineSessionFixture() {
  return {
    order_id: 30,
    payment_id: 42,
    gateway_code: "mellat",
    already_paid: false,
    redirect: {
      method: "POST",
      url: "https://gateway.example/pay",
      fields: { RefId: "ABC" },
    },
  };
}

test("online checkout sends gateway/address/coupon and uses the returned redirect without creating another session", async () => {
  const session = onlineSessionFixture();
  const h = harness({
    post: () => ({
      order: { id: 30 },
      payment: { id: 42 },
      payment_type: "online",
      idempotent_replay: false,
      next_action: { type: "connect_online_gateway" },
      online_payment: session,
    }),
  });
  const result = await h
    .load("services/online-payment.service")
    .startOnlinePayment(onlineCheckoutInput());
  assert.equal(result.paymentId, 42);
  assert.equal(result.redirect.method, "POST");
  assert.equal(result.redirect.fields.RefId, "ABC");
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].body.gateway_code, "mellat");
  assert.equal(h.requests[0].body.coupon_code, "SAVE10");
  assert.equal(h.requests[0].body.address_id, 12);
});

test("online checkout creates a normalized session when checkout only supplies the order", async () => {
  const h = harness({
    post: (url) =>
      url.includes("/session/")
        ? onlineSessionFixture()
        : {
            order: { id: 30 },
            payment_type: "online",
            idempotent_replay: false,
            next_action: { type: "connect_online_gateway" },
          },
  });
  const result = await h
    .load("services/online-payment.service")
    .startOnlinePayment(onlineCheckoutInput());
  assert.equal(result.paymentId, 42);
  assert.equal(
    h.requests[1].url,
    "/api/customer/orders/30/payment/online/session/",
  );
  assert.deepEqual(h.requests[1].body, { gateway_code: "mellat" });
});

test("online checkout rejects missing gateways and unsafe or mismatched redirects", async () => {
  const h = harness();
  const start = h.load("services/online-payment.service").startOnlinePayment;
  await assert.rejects(
    start({ ...onlineCheckoutInput(), gateway_code: undefined }),
  );
  assert.equal(h.requests.length, 0);
  const wrong = harness({
    post: (url) =>
      url.includes("/session/")
        ? { ...onlineSessionFixture(), order_id: 31 }
        : {
            order: { id: 30 },
            payment_type: "online",
            idempotent_replay: false,
            next_action: { type: "connect_online_gateway" },
          },
  });
  await assert.rejects(
    wrong
      .load("services/online-payment.service")
      .startOnlinePayment(onlineCheckoutInput()),
  );
  const schema = h.load("schemas/online-payment.schema").onlineRedirectSchema;
  assert.equal(
    schema.safeParse({ method: "GET", url: "javascript:alert(1)", fields: {} })
      .success,
    false,
  );
  assert.equal(
    schema.safeParse({
      method: "DELETE",
      url: "https://gateway.example/pay",
      fields: {},
    }).success,
    false,
  );
});

test("gateway selection respects enabled/selectable and shows server reasons", async () => {
  const gateways = [
    {
      code: "mellat",
      title: "Mellat",
      enabled: true,
      selectable: true,
      reason: null,
      sandbox: false,
      is_default: true,
    },
    {
      code: "blocked",
      title: "Blocked",
      enabled: true,
      selectable: false,
      reason: "Unavailable",
      sandbox: true,
      is_default: false,
    },
  ];
  const h = harness({
    render: true,
    get: () => ({ default_gateway_code: "mellat", gateways }),
  });
  const result = await h
    .load("services/online-payment.service")
    .getOnlineGateways();
  assert.equal(h.requests[0].url, "/api/customer/payment-gateways/");
  const React = require("react");
  const html = require("react-dom/server").renderToStaticMarkup(
    React.createElement(
      h.load("components/checkout/checkout-online-gateways").default,
      {
        items: result.items,
        value: "blocked",
        onChange: () => {},
        pending: false,
        error: false,
        disabled: false,
        onRetry: () => {},
      },
    ),
  );
  assert.ok(html.includes("Unavailable"));
  const inputs = html.match(/<input[^>]*>/g);
  assert.ok(inputs[1].includes('disabled=""'));
  assert.ok(!html.includes('checked=""'));
});

test("finalization uses the server verified payment and preserves failure instead of claiming success", async () => {
  const response = {
    success: false,
    message: "Not verified",
    status: "pending",
    order_id: 30,
    payment_id: 42,
    tracking_code: "test-order",
  };
  const h = harness({ post: () => response });
  const finalize = h.load(
    "services/online-payment.service",
  ).finalizeOnlinePayment;
  const result = await finalize(42);
  assert.equal(result.success, false);
  assert.equal(result.message, "Not verified");
  assert.equal(
    h.requests[0].url,
    "/api/customer/checkout/online-payments/42/finalize/",
  );
  assert.equal(h.requests[0].body, undefined);
  await assert.rejects(finalize(0));
  assert.equal(h.requests.length, 1);
  const mismatched = harness({
    post: () => ({ ...response, success: true, payment_id: 43 }),
  });
  await assert.rejects(
    mismatched
      .load("services/online-payment.service")
      .finalizeOnlinePayment(42),
  );
});

test("gateway redirects support GET fields and a hidden POST form without exposing authorization", () => {
  const h = harness();
  const redirect = h.load("utils/online-payment.utils").redirectToOnlineGateway;
  let target, submitted;
  global.window.location = {
    assign: (url) => {
      target = url;
    },
  };
  redirect({
    method: "GET",
    url: "https://gateway.example/pay?existing=1",
    fields: { authority: "A&B" },
  });
  assert.equal(new URL(target).searchParams.get("authority"), "A&B");
  assert.equal(new URL(target).searchParams.get("existing"), "1");
  const savedDocument = global.document,
    savedForm = global.HTMLFormElement;
  const form = {
    style: {},
    children: [],
    appendChild(field) {
      this.children.push(field);
    },
    remove() {},
  };
  global.document = {
    createElement: (tag) => (tag === "form" ? form : {}),
    body: { appendChild() {} },
  };
  global.HTMLFormElement = {
    prototype: {
      submit() {
        submitted = {
          action: this.action,
          method: this.method,
          children: this.children,
        };
      },
    },
  };
  try {
    redirect({
      method: "POST",
      url: "https://gateway.example/pay",
      fields: { RefId: "ABC", submit: "provider-field" },
    });
    assert.equal(submitted.action, "https://gateway.example/pay");
    assert.equal(submitted.method, "POST");
    assert.equal(submitted.children[0].name, "RefId");
    assert.equal(submitted.children[0].value, "ABC");
    assert.equal(submitted.children.length, 2);
  } finally {
    global.document = savedDocument;
    global.HTMLFormElement = savedForm;
  }
});

test("desktop and mobile product cards open details in a new tab without intercepting nested controls", () => {
  const h=harness({render:true});
  const opens=[];
  global.window.open=(...args)=>{opens.push(args);return null;};
  const raw=h.load("../product/mock/product-list.mock").productListMock;
  const product=h.load("../product/mappers/product-list-result.mapper").mapProductListResult(raw).products[0];
  const React=require("react"),{renderToStaticMarkup}=require("react-dom/server");
  const Desktop=h.load("../product/components/product-card/product-card").default;
  const Mobile=h.load("../product/components/product-card/product-mobile-card").default;
  const desktop=Desktop({product});
  const article=desktop.props.children.find(child=>child?.type==="article");
  const mobile=Mobile({product});
  for(const element of [article,mobile]) {
    const start=opens.length;
    element.props.onClick({defaultPrevented:false,target:{closest:()=>null}});
    assert.equal(opens.length,start+1);
    assert.deepEqual(opens.at(-1),[h.load("../product/utils/product-path").getProductDetailsHref(product.slug),"_blank","noopener,noreferrer"]);
    element.props.onClick({defaultPrevented:false,target:{closest:()=>({tagName:"A"})}});
    element.props.onClick({defaultPrevented:true,target:{closest:()=>null}});
    assert.equal(opens.length,start+1);
  }
  const customHref="/imports/724/product?candidate_id=1";
  for(const Component of [Desktop,Mobile]) {
    const html=renderToStaticMarkup(React.createElement(Component,{product,detailsHref:customHref,onDetailsClick:()=>{}}));
    const detailLinks=(html.match(/<a\b[^>]*>/g)||[]).filter(tag=>tag.includes(`href="${customHref}"`));
    assert.ok(detailLinks.length>0);
    for(const tag of detailLinks) { assert.match(tag,/target="_blank"/);assert.match(tag,/rel="noopener noreferrer"/); }
    assert.doesNotMatch(html,/href="#"/);
  }
});
