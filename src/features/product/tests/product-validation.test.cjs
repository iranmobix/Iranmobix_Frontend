/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable -- Execute feature TypeScript using isolated, mocked transport. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function harness(response) {
  const base = path.resolve(__dirname, "..");
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(base, file) + ".ts";
    if (cache.has(absolute)) return cache.get(absolute);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    const localRequire = (name) =>
      name === "@/shared/api"
        ? {
            httpGet: async (url, config) =>
              typeof response === "function" ? response(url, config) : response,
          }
        : name.startsWith(".")
          ? load(
              path.relative(base, path.resolve(path.dirname(absolute), name)),
            )
          : require(name);
    vm.runInNewContext(code, {
      require: localRequire,
      module,
      exports: module.exports,
      structuredClone,
      setTimeout,
      clearTimeout,
    });
    cache.set(absolute, module.exports);
    return module.exports;
  }
  return { load };
}

const fixtures = harness();
const listFixture = () =>
  structuredClone(fixtures.load("mock/product-list.mock").productListMock);
const detailFixture = () =>
  fixtures.load("mock/product-detail.mock").getProductDetailMock("sample");

test("internal product detail accepts compact categories, nullable USD amounts and missing images", () => {
  const raw = detailFixture();
  raw.product.source = "iranmobix";
  raw.product.price = {
    amount:"10000", currency:"IRR", minimum:"10000", maximum:"10000",
    original_amount:"10000", final_amount:"10000", has_discount:false,
    discount_amount:"0", amount_toman:"1000", amount_usd:null,
    final_amount_toman:"1000", final_amount_usd:null, discount_percentage:0,
  };
  raw.product.category = {id:1220,name:"Internal category",slug:"internal-category",parent:null};
  raw.product.seller.id = null;
  raw.product.official_url = null;
  raw.product.inventory.marketable_number = 47;
  raw.primary_image = null;
  raw.gallery = [];
  raw.related_products = raw.related_products.slice(0, 1).map((item) => ({
    ...item, image:null, price:{...raw.product.price}, source:{...item.source,url:null},
  }));
  const detail = harness().load("mappers/product-detail.mapper").mapProductDetail(raw);
  assert.equal(detail.price.finalAmount, 10000);
  assert.equal(detail.price.finalAmountToman, 1000);
  assert.equal(detail.price.amountUsd, null);
  assert.equal(detail.price.finalAmountUsd, null);
  assert.equal(detail.primaryImage, "");
  assert.equal(detail.gallery.length, 0);
  assert.equal(detail.officialUrl, "");
  assert.equal(detail.category.name, "Internal category");
  assert.equal(detail.category.parent, null);
  assert.equal(detail.category.status, null);
  assert.equal(detail.category.isDelete, null);
  assert.equal(detail.seller.id, null);
  assert.equal(detail.inventory.marketableNumber, 47);
  assert.equal(detail.relatedProducts[0].image, "");
  assert.equal(detail.relatedProducts[0].price.finalAmountUsd, null);
});

test("optional detail USD conversions preserve missing versus zero and reject malformed present values", () => {
  const map = harness().load("mappers/product-detail.mapper").mapProductDetail;
  for (const value of [null, undefined, "", "0"]) {
    const raw = detailFixture();
    raw.product.price.amount_usd = value;
    raw.product.price.final_amount_usd = value;
    const result = map(raw);
    assert.equal(result.price.amountUsd, value === "0" ? 0 : null);
    assert.equal(result.price.finalAmountUsd, value === "0" ? 0 : null);
  }
  for (const value of ["oops", "-1", true, 10]) {
    const raw = detailFixture();
    raw.product.price.final_amount_usd = value;
    assert.throws(() => map(raw));
  }
});

test("compact category metadata remains validated when supplied and preserves real false and zero", () => {
  const raw = detailFixture();
  raw.product.category = {id:1220,name:"Internal category",slug:"internal-category",parent:0,status:0,is_delete:false};
  const map = harness().load("mappers/product-detail.mapper").mapProductDetail;
  const detail = map(raw);
  assert.equal(detail.category.parent, 0);
  assert.equal(detail.category.status, 0);
  assert.equal(detail.category.isDelete, false);
  raw.product.category.is_delete = "false";
  assert.throws(() => map(raw));
});

test("a product with a null image does not discard a cursor page or its other cards", () => {
  const raw = listFixture();
  raw.results[0].image = null;
  const list = harness().load("mappers/product-list-result.mapper").mapProductListResult(raw);
  assert.equal(list.products.length, raw.results.length);
  assert.equal(list.products[0].id, raw.results[0].id);
  assert.equal(list.products[0].image, "");
  assert.equal(list.nextCursor, raw.next_cursor);
});

test("invalid image types still fail validation instead of silently dropping products", () => {
  const raw = listFixture();
  raw.results[0].image = 123;
  assert.throws(() => harness().load("mappers/product-list-result.mapper").mapProductListResult(raw));
});

test("local products retain their seller and badge when external URLs and seller ID are null", () => {
  const raw = listFixture();
  const item = raw.results[0];
  item.source.url = null;
  item.official_url = null;
  item.seller = { id: null, name: "IranMobix", badges: ["iranmobix"] };
  const list = harness().load("mappers/product-list-result.mapper").mapProductListResult(raw);
  assert.equal(list.products.length, raw.results.length);
  assert.equal(list.products[0].source.url, "");
  assert.equal(list.products[0].officialUrl, "");
  assert.equal(list.products[0].seller.id, null);
  assert.equal(list.products[0].seller.name, "IranMobix");
  assert.equal(list.products[0].seller.badges[0], "iranmobix");
});

test("valid list and detail responses retain backend prices, conversions and pagination", () => {
  const h = harness();
  const rawList = listFixture();
  const list = h
    .load("mappers/product-list-result.mapper")
    .mapProductListResult(rawList);
  assert.equal(list.products.length, rawList.results.length);
  assert.equal(
    list.products[0].price.amount,
    Number(rawList.results[0].price.amount),
  );
  assert.equal(
    list.products[0].price.amountIrr,
    Number(rawList.results[0].price.amount_irr),
  );
  assert.equal(list.nextCursor, rawList.next_cursor);
  const rawDetail = detailFixture();
  const detail = h
    .load("mappers/product-detail.mapper")
    .mapProductDetail(rawDetail);
  assert.equal(
    detail.price.finalAmount,
    Number(rawDetail.product.price.final_amount),
  );
  assert.equal(
    detail.price.finalAmountToman,
    Number(rawDetail.product.price.final_amount_toman),
  );
  assert.equal(
    detail.relatedProducts.length,
    rawDetail.related_products.length,
  );
});

test("blank, null and omitted list amounts remain unavailable while explicit zero stays zero", () => {
  const map = harness().load("mappers/product-list.mapper").mapProductListItem;
  for (const value of ["", "   ", null, undefined]) {
    const card = listFixture().results[0];
    card.price.amount = value;
    card.price.amount_irr = value;
    card.price.original_amount = value;
    const mapped = map(card);
    assert.equal(mapped.price.amount, null);
    assert.equal(mapped.price.amountIrr, null);
    assert.equal(mapped.price.originalAmount, null);
  }
  const card = listFixture().results[0];
  card.price.amount = "0";
  card.price.amount_irr = "0.00";
  assert.equal(map(card).price.amount, 0);
  assert.equal(map(card).price.amountIrr, 0);
});

test("list prices reject malformed, negative, unsafe and implicitly coercible values", () => {
  const map = harness().load("mappers/product-list.mapper").mapProductListItem;
  for (const value of [
    "abc",
    "NaN",
    "Infinity",
    "1e3",
    "0x10",
    "1,000",
    "-1",
    true,
    false,
    0,
    {},
    [],
    "9007199254740993",
    "9007199254740991.1",
    "0." + "0".repeat(400) + "1",
  ]) {
    const card = listFixture().results[0];
    card.price.amount = value;
    assert.throws(() => map(card), undefined, String(value));
  }
});

test("discount percentages are finite and between zero and one hundred", () => {
  const h = harness();
  for (const value of [-1, 101, NaN, Infinity, "20"]) {
    const card = listFixture().results[0];
    card.price.discount_percentage = value;
    assert.throws(() =>
      h.load("mappers/product-list.mapper").mapProductListItem(card),
    );
    const detail = detailFixture();
    detail.product.price.discount_percentage = value;
    assert.throws(() =>
      h.load("mappers/product-detail.mapper").mapProductDetail(detail),
    );
  }
});

test("unexpected response envelopes and broken nested list fields fail before rendering", () => {
  const map = harness().load(
    "mappers/product-list-result.mapper",
  ).mapProductListResult;
  for (const value of [
    null,
    [],
    { error: { message: "unavailable" } },
    { results: [] },
  ])
    assert.throws(() => map(value));
  const raw = listFixture();
  raw.results[0].colors = null;
  assert.throws(() => map(raw));
  const filters = listFixture();
  filters.filters.brands = "bad";
  assert.throws(() => map(filters));
  const booleans = listFixture();
  booleans.results[0].marketable = "false";
  assert.throws(() => map(booleans));
});

test("required detail money never defaults to zero and missing inventory fails closed", () => {
  const map = harness().load("mappers/product-detail.mapper").mapProductDetail;
  for (const value of ["", " ", null, undefined, "-10", "not-a-price"]) {
    const raw = detailFixture();
    raw.product.price.final_amount_toman = value;
    assert.throws(() => map(raw));
  }
  const raw = detailFixture();
  delete raw.product.inventory;
  assert.throws(() => map(raw));
});

test("optional price arrays stay optional and unknown future fields do not break valid responses", () => {
  const raw = detailFixture();
  delete raw.product.price.attributes;
  delete raw.product.price.ladder_price;
  delete raw.product.price.range;
  raw.future_field = { enabled: true };
  const detail = harness()
    .load("mappers/product-detail.mapper")
    .mapProductDetail(raw);
  assert.equal(detail.price.attributes.length, 0);
  assert.equal(detail.price.ladderPrices.length, 0);
  assert.equal(detail.price.range, null);
});

test("reversed core price ranges fail; invalid optional tiers are omitted without hiding the product", () => {
  const map = harness().load("mappers/product-detail.mapper").mapProductDetail;
  const price = detailFixture();
  price.product.price.minimum = "999999";
  assert.throws(() => map(price));
  const tier = detailFixture();
  tier.product.price.ladder_price[0].min_quantity = 10;
  tier.product.price.ladder_price[0].max_quantity = 1;
  const mapped = map(tier);
  assert.equal(
    mapped.price.ladderPrices.length,
    tier.product.price.ladder_price.length - 1,
  );
  assert.ok(
    mapped.price.ladderPrices.every(
      (value) =>
        value.minQuantity === null ||
        value.maxQuantity === null ||
        value.minQuantity <= value.maxQuantity,
    ),
  );
  const badPrice = detailFixture();
  badPrice.product.price.ladder_price[0].amount = "bad";
  assert.equal(
    map(badPrice).price.ladderPrices.length,
    badPrice.product.price.ladder_price.length - 1,
  );
});

test("related products, SKU option prices and color adjustments are validated too", () => {
  const map = harness().load("mappers/product-detail.mapper").mapProductDetail;
  const related = detailFixture();
  related.related_products[0].price.final_amount = "oops";
  assert.throws(() => map(related));
  const sku = detailFixture();
  sku.product.price.attributes[0].values[0].amount = "-1";
  assert.throws(() => map(sku));
  const color = detailFixture();
  color.colors = [
    {
      id: 1,
      color_name: "Black",
      color: "#000",
      price_increase: "NaN",
      status: 1,
      sold_number: 0,
      frozen_number: 0,
      marketable_number: 1,
    },
  ];
  assert.throws(() => map(color));
});

test("service validates the real transport before returning domain data", async () => {
  const valid = await harness(listFixture())
    .load("services/product.service")
    .productService.getProducts();
  assert.equal(valid.products.length, listFixture().results.length);
  await assert.rejects(
    harness({ results: "bad" })
      .load("services/product.service")
      .productService.getProducts(),
  );
  await assert.rejects(
    harness({ product: null })
      .load("services/product.service")
      .productService.getProductDetail("sample"),
  );
});

test("list and detail forward the exact cancellation signal through service to HTTP", async () => {
  const requests = [];
  const controller = new AbortController();
  const h = harness((url, config) => {
    requests.push({ url, config });
    return url.includes("catalog") ? listFixture() : detailFixture();
  });
  const service = h.load("services/product.service").productService;
  await service.getProducts({ brands: [1] }, "api", controller.signal);
  await service.getProductDetail("watch/a b", "api", controller.signal);
  assert.equal(requests[0].config.signal, controller.signal);
  assert.equal(requests[0].config.params.brands[0], 1);
  assert.equal(requests[0].url, "/api/catalog/products/");
  assert.equal(requests[1].config.signal, controller.signal);
  assert.equal(requests[1].url, "/api/product/watch%2Fa%20b/");
  assert.equal(requests[1].config.headers.Authorization, false);
  assert.equal(requests[1].config.withCredentials, false);
  assert.equal(requests[1].config.timeout, 30000);
});

test("browser transport accepts raw or already encoded Persian slugs with one encoding", async () => {
  const slug = "محصول-تست";
  const urls = [];
  const h = harness((url) => {urls.push(url);return detailFixture();});
  const api = h.load("api/product.api").productApi;
  for (const value of [slug,encodeURIComponent(slug),encodeURIComponent(encodeURIComponent(slug))]) {
    await api.getProductDetail(value);
  }
  assert.equal(new Set(urls).size, 1);
  assert.equal(urls[0], `/api/product/${encodeURIComponent(slug)}/`);
  assert.equal(urls[0].includes("%25D9"), false);
});

test("already-cancelled API and mock reads stop before starting transport", async () => {
  let requests = 0;
  const h = harness(() => {
    requests++;
    return listFixture();
  });
  const service = h.load("services/product.service").productService;
  const controller = new AbortController();
  controller.abort();
  for (const source of ["api", "mock"]) {
    await assert.rejects(service.getProducts({}, source, controller.signal), {
      name: "AbortError",
    });
    await assert.rejects(
      service.getProductDetail("watch", source, controller.signal),
      { name: "AbortError" },
    );
  }
  assert.equal(requests, 0);
});

test("in-flight HTTP cancellation rejects without producing product data", async () => {
  const h = harness(
    (_url, config) =>
      new Promise((_resolve, reject) => {
        config.signal.addEventListener(
          "abort",
          () => reject(config.signal.reason),
          { once: true },
        );
      }),
  );
  const controller = new AbortController();
  const pending = h
    .load("services/product.service")
    .productService.getProducts({}, "api", controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
});

test("a transport that returns after cancellation cannot reach response mapping", async () => {
  let finish;
  const controller = new AbortController();
  const h = harness(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = h
    .load("services/product.service")
    .productService.getProductDetail("watch", "api", controller.signal);
  controller.abort();
  finish({ invalid: "would fail validation if mapped" });
  await assert.rejects(pending, { name: "AbortError" });
});

test("mock list and detail delays are cancellable without waiting for preview results", async () => {
  const service = harness().load("services/product.service").productService;
  for (const kind of ["list", "detail"]) {
    const controller = new AbortController();
    const pending =
      kind === "list"
        ? service.getProducts({}, "mock", controller.signal)
        : service.getProductDetail("watch", "mock", controller.signal);
    controller.abort();
    await assert.rejects(pending, { name: "AbortError" });
  }
});
