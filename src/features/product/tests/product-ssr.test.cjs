/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable -- Execute server loaders with isolated public HTTP and real hydration. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { QueryClient, hydrate, hashKey } = require("@tanstack/react-query");

function harness(fetchResponse, renderClient = false) {
  const base = path.resolve(__dirname, "..");
  const cache = new Map();
  const requests = [];
  let browserCalls = 0;
  const browserService = {
    getProducts: async () => {
      browserCalls++;
      throw new Error("Unexpected browser catalog request");
    },
    getProductDetail: async () => {
      browserCalls++;
      throw new Error("Unexpected browser detail request");
    },
  };
  function load(file) {
    let absolute = path.resolve(base, file);
    if (absolute.endsWith(".json")) return JSON.parse(fs.readFileSync(absolute, "utf8"));
    if (fs.existsSync(absolute + ".ts")) absolute += ".ts";
    else if (fs.existsSync(absolute + ".tsx")) absolute += ".tsx";
    else absolute = path.join(absolute, "index.ts");
    if (cache.has(absolute)) return cache.get(absolute);
    const module = { exports: {} };
    cache.set(absolute, module.exports);
    const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      fileName: absolute,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const localRequire = (name) => {
      if (name === "server-only") return {};
      if (name.endsWith(".module.css")) return {__esModule:true,default:new Proxy({}, {get:(_,key)=>String(key)})};
      if (name.endsWith(".svg"))
        return {
          __esModule: true,
          default: { src: "/test-icon.svg", width: 24, height: 24 },
        };
      if (name === "next/navigation")
        return {
          useRouter: () => ({ replace() {}, push() {}, back() {} }),
          redirect: (url) => { throw new Error("redirect:" + url); },
          notFound: () => { throw new Error("not-found"); },
          usePathname: () => "/products",
          useSearchParams: () => new URLSearchParams(),
        };
      if (name === "next/image")
        return {
          __esModule: true,
          default: ({ src, alt }) =>
            require("react").createElement("img", {
              src: typeof src === "string" ? src : src.src,
              alt,
            }),
        };
      if (name === "next/link")
        return {
          __esModule: true,
          default: ({ children, href, ...props }) =>
            require("react").createElement("a", { ...props, href }, children),
        };
      if (name === "@/shared/api")
        return Object.fromEntries(
          ["httpGet", "httpPost", "httpPatch", "httpDelete"].map((method) => [
            method,
            async () => {
              browserCalls++;
              throw new Error(
                "Unexpected request during server HTML rendering",
              );
            },
          ]),
        );
      if (name === "./product.service")
        return { productService: browserService };
      if (name === "@/features/product/services/product-server-loader")
        return load("services/product-server-loader");
      if (name === "@/features/product/utils/product-query")
        return load("utils/product-query");
      if (!renderClient && name.includes("@/features/product/components/"))
        return { __esModule: true, default: () => null };
      if (name.startsWith("@/"))
        return load(path.resolve(base, "../..", name.slice(2)));
      return name.startsWith(".")
        ? load(path.relative(base, path.resolve(path.dirname(absolute), name)))
        : require(name);
    };
    vm.runInNewContext(code, {
      require: localRequire,
      module,
      exports: module.exports,
      URL,
      URLSearchParams,
      AbortSignal,
      structuredClone,
      setTimeout,
      clearTimeout,
      process: {
        env: { NEXT_PUBLIC_API_URL: "http://public-backend.test:8000" },
      },
      fetch: async (url, config) => {
        requests.push({ url, config });
        return fetchResponse(url, config, requests.length);
      },
    });
    cache.set(absolute, module.exports);
    return module.exports;
  }
  return { load, requests, browserCalls: () => browserCalls };
}
const fixtures = harness(() => {});
const listFixture = () =>
  structuredClone(fixtures.load("mock/product-list.mock").productListMock);
const detailFixture = () =>
  fixtures.load("mock/product-detail.mock").getProductDetailMock("sample");
const ok = (data) => ({ ok: true, status: 200, json: async () => data });

test("server catalog serializes public filters and never forwards credentials or authorization", async () => {
  const h = harness(() => ok(listFixture()));
  const state = await h
    .load("services/product-server-loader")
    .loadProductListState({
      brands: [2, 1],
      min_price: "0",
      in_iranmobix_inventory: false,
      sort: "price_desc",
    });
  assert.equal(h.requests.length, 1);
  const { url, config } = h.requests[0];
  assert.equal(url.origin, "http://public-backend.test:8000");
  assert.equal(url.pathname, "/api/products/");
  assert.equal(url.searchParams.get("brands"), "1,2");
  assert.equal(url.searchParams.get("min_price"), "0");
  assert.equal(url.searchParams.get("in_iranmobix_inventory"), "false");
  assert.equal(config.credentials, "omit");
  assert.equal(config.cache, "no-store");
  assert.equal(config.redirect, "error");
  assert.equal(config.headers.Authorization, undefined);
  assert.equal(config.headers.Cookie, undefined);
  assert.equal(state.queries.length, 1);
  assert.equal(state.queries[0].state.data.pages.length, 1);
  assert.equal(h.browserCalls(), 0);
});

test("catalog hydration uses the exact client key and avoids another initial GET", async (t) => {
  const h = harness(() => ok(listFixture()));
  const queryClient = new QueryClient();
  t.after(() => queryClient.clear());
  const query = h
    .load("utils/product-query")
    .parseProductRouteQuery({ brands: ["2,1", "3"], sort: "price_asc" });
  const state = await h
    .load("services/product-server-loader")
    .loadProductListState(query);
  hydrate(queryClient, state);
  const options = h
    .load("services/product-query-options")
    .productListQueryOptions({ brands: [1, 2], sort: "price_asc" });
  assert.equal(hashKey(options.queryKey), hashKey(state.queries[0].queryKey));
  const data = await queryClient.fetchInfiniteQuery(options);
  assert.equal(data.pages[0].products.length, listFixture().results.length);
  assert.equal(h.browserCalls(), 0);
});

test("detail prefetch uses the public endpoint and hydrates without a duplicate browser read", async (t) => {
  const raw = detailFixture();
  const h = harness(() => ok(raw));
  const queryClient = new QueryClient();
  t.after(() => queryClient.clear());
  const state = await h
    .load("services/product-server-loader")
    .loadProductDetailState(raw.product.slug);
  hydrate(queryClient, state);
  const product = await queryClient.fetchQuery(
    h
      .load("services/product-query-options")
      .productDetailQueryOptions(raw.product.slug),
  );
  assert.equal(product.slug, raw.product.slug);
  assert.equal(
    product.price.finalAmount,
    Number(raw.product.price.final_amount),
  );
  assert.equal(
    h.requests[0].url.pathname,
    `/api/product/${encodeURIComponent(raw.product.slug)}/`,
  );
  assert.equal(h.browserCalls(), 0);
});

test("SSR normalizes an escaped slug into the same client cache and only encodes the request once", async (t) => {
  const raw = detailFixture();
  const slug = "محصول-تست";
  raw.product.slug = slug;
  const h = harness(() => ok(raw));
  const encoded = encodeURIComponent(encodeURIComponent(slug));
  const state = await h.load("services/product-server-loader").loadProductDetailState(encoded);
  assert.equal(h.requests[0].url.pathname, `/api/product/${encodeURIComponent(slug)}/`);
  const client = new QueryClient();
  t.after(() => client.clear());
  hydrate(client,state);
  const config = h.load("services/product-query-options").productDetailQueryOptions(slug);
  assert.equal(client.getQueryData(config.queryKey).slug, slug);
  assert.equal(h.requests.length, 1);
});

test("separate server requests do not share QueryClient data", async () => {
  const h = harness((_url, _config, index) => {
    const raw = listFixture();
    raw.count = index * 10;
    return ok(raw);
  });
  const loader = h.load("services/product-server-loader");
  const [first, second] = await Promise.all([
    loader.loadProductListState({}),
    loader.loadProductListState({}),
  ]);
  assert.equal(h.requests.length, 2);
  assert.equal(first.queries[0].state.data.pages[0].count, 10);
  assert.equal(second.queries[0].state.data.pages[0].count, 20);
});

test("server HTTP and schema failures dehydrate no errors and retain the existing client fallback", async () => {
  for (const response of [
    { ok: false, status: 503 },
    ok({ results: "invalid" }),
  ]) {
    const h = harness(() => response);
    const state = await h
      .load("services/product-server-loader")
      .loadProductListState({});
    assert.equal(state.queries.length, 0);
    assert.equal(state.mutations.length, 0);
    assert.equal(h.requests.length, 1);
  }
});

test("server service rejects mock previews and does not ship unknown response fields", async () => {
  const raw = listFixture();
  raw.results[0].unexpected_secret = "not-for-html";
  const h = harness(() => ok(raw));
  const state = await h
    .load("services/product-server-loader")
    .loadProductListState({});
  assert.equal(JSON.stringify(state).includes("not-for-html"), false);
  await assert.rejects(
    h
      .load("services/product-server.service")
      .productServerService.getProducts({}, "mock"),
  );
});

test("route search arrays use the same first-value semantics as the browser", () => {
  const parse = harness(() => {}).load(
    "utils/product-query",
  ).parseProductRouteQuery;
  const query = parse({
    brands: ["1,2", "3"],
    search: ["watch", "strap"],
    sort: "invalid",
    min_price: "0",
    empty: undefined,
  });
  assert.equal(query.brands.join(","), "1,2");
  assert.equal(query.search, "watch");
  assert.equal(query.sort, "newest");
  assert.equal(query.min_price, "0");
});

test("server product transport preserves encoded slugs and supports cancellation", async () => {
  const h = harness(
    (_url, config) =>
      new Promise((_resolve, reject) =>
        config.signal.addEventListener(
          "abort",
          () => reject(config.signal.reason),
          { once: true },
        ),
      ),
  );
  const controller = new AbortController();
  const pending = h
    .load("api/product-server.api")
    .productServerApi.getProductDetail("watch/a b", controller.signal);
  assert.equal(h.requests[0].url.pathname, "/api/product/watch%2Fa%20b/");
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(h.requests[0].config.signal.aborted, true);
  await assert.rejects(
    h
      .load("api/product-server.api")
      .productServerApi.getProducts({}, controller.signal),
    { name: "AbortError" },
  );
  assert.equal(h.requests.length, 1);
});

test("both product routes wrap their existing client page in hydrated server data", async () => {
  const h = harness((url) =>
    ok(url.pathname === "/api/products/" ? listFixture() : detailFixture()),
  );
  const listRoute = h.load("../../app/(main)/products/page");
  const listElement = await listRoute.default({
    searchParams: Promise.resolve({ search: "watch" }),
  });
  assert.equal(listRoute.dynamic, "force-dynamic");
  assert.equal(listElement.props.state.queries.length, 1);
  const detailRoute = h.load("../../app/(main)/products/[slug]/page");
  const detailElement = await detailRoute.default({
    params: Promise.resolve({ slug: detailFixture().product.slug }),
  });
  assert.equal(detailRoute.dynamic, "force-dynamic");
  assert.equal(detailElement.props.state.queries.length, 1);
  assert.equal(
    detailElement.props.children.props.slug,
    detailFixture().product.slug,
  );
});

test("initial server HTML contains actual catalog cards rather than only loading placeholders", async (t) => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const {
    QueryClientProvider,
    HydrationBoundary,
  } = require("@tanstack/react-query");
  const raw = listFixture();
  const h = harness(() => ok(raw), true);
  const state = await h
    .load("services/product-server-loader")
    .loadProductListState({});
  const client = new QueryClient();
  t.after(() => client.clear());
  const Page = h.load("components/product-page").default;
  const html = renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(
        HydrationBoundary,
        { state },
        React.createElement(Page),
      ),
    ),
  );
  assert.ok(html.includes(`/products/${raw.results[0].slug}`));
  assert.ok(html.includes(raw.results[0].short_title));
  assert.equal(h.browserCalls(), 0);
});

test("initial detail HTML includes the real title and purchase form without browser-only crashes", async (t) => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const {
    QueryClientProvider,
    HydrationBoundary,
  } = require("@tanstack/react-query");
  const raw = detailFixture();
  const h = harness(() => ok(raw), true);
  const state = await h
    .load("services/product-server-loader")
    .loadProductDetailState(raw.product.slug);
  const client = new QueryClient();
  t.after(() => client.clear());
  const Page = h.load("components/detail/product-detail-page").default;
  const html = renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client },
      React.createElement(
        HydrationBoundary,
        { state },
        React.createElement(Page, { slug: raw.product.slug }),
      ),
    ),
  );
  assert.ok(html.includes(raw.product.title));
  assert.ok(html.includes("افزودن به سبد خرید"));
  assert.equal(h.browserCalls(), 0);
});

test("a flat marketplace detail renders through the catalog route with the shared marketplace layout", async (t) => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const { QueryClientProvider } = require("@tanstack/react-query");
  const raw = {
    slug: "portable-game-console",
    product_code: "IRM-134174",
    title_fa: "کنسول دستی",
    title_en: "Portable Game Console",
    category: "Gaming",
    seller: { name: "Marketplace Supplier", rating: 4.7 },
    price_cny: 106.11,
    gallery: ["https://iranmobix.com/product-images/products/728/65481.jpg"],
    key_attributes: { Model: "X9" },
    specifications: { Screen: "5.5 inches" },
    other_sellers: [{ slug: "", source_url: "https://www.alibaba.com/product-detail/alternate.html", fa_title: "Another seller" }],
    related_products: [{ slug: "similar-console", fa_title: "Similar console" }],
    comments: [{ author_name: "Buyer", text: "Great console" }],
  };
  const h = harness(() => ok(raw), true);
  const client = new QueryClient();
  t.after(() => client.clear());
  const route = h.load("../../app/(main)/products/[slug]/page").default;
  const page = await route({ params: Promise.resolve({ slug: raw.slug }) });
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url.pathname, "/api/product/portable-game-console/");
  assert.equal(page.props.state.queries[0].state.data.kind, "marketplace");
  const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, page));
  for (const content of [raw.title_fa, raw.title_en, raw.product_code, raw.category, raw.gallery[0],
    raw.seller.name, "106.11", "X9", "5.5 inches", "Another seller", raw.other_sellers[0].source_url, "Similar console", "Great console"]) {
    assert.ok(html.includes(content), content);
  }
  const cardLinks = html.match(/<a[^>]*target="_blank"[^>]*>/g) ?? [];
  assert.ok(cardLinks.some((link) => link.includes('href="/products/similar-console"')));
  const importHref = "/imports/single?" + new URLSearchParams({ url: raw.other_sellers[0].source_url });
  assert.ok(cardLinks.some((link) => link.includes('href="' + importHref + '"')));
  assert.equal(h.browserCalls(), 0);
});

test("mock comments render six entries, source tabs and the expert reply without a comments API", () => {
  const React = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const h = harness(() => { throw new Error("Unexpected comments API request"); }, true);
  const Comments = h.load("components/detail/product-comments").default;
  const html = renderToStaticMarkup(React.createElement(Comments, {product:{title:"Watch", slug:"watch"}}));
  assert.equal((html.match(/<article\b/g) ?? []).length, 6);
  assert.equal((html.match(/role="tab"/g) ?? []).length, 2);
  assert.ok(html.includes("دیدگاه‌ها در ایران موبیکس"));
  assert.ok(html.includes("دیدگاه‌ها در سایت مرجع"));
  assert.ok(html.includes("سپاس از همراهی شما."));
  assert.ok(html.includes("افزودن دیدگاه"));
  assert.ok(html.includes("نمایش بیشتر"));
  assert.equal(h.requests.length, 0);
  assert.equal(h.browserCalls(), 0);
  const mock = h.load("mock/product-comments.mock").productCommentsMock;
  const ids = [...mock.iranmobix, ...mock.source].map((comment) => comment.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("category breadcrumbs open the catalog with the exact category filter", async () => {
  const raw = listFixture();
  const category = raw.filters.categories[0];
  assert.ok(category);
  const h = harness(() => ok(raw.filters.categories.map(category => ({...category, parent_id: null}))));
  const getHref = h.load("utils/product-category-path").getProductCategoryHref;
  assert.equal(getHref(category.name, category.id), "/products?category=" + category.id + "&sort=newest");
  const namedUrl = new URL(getHref(category.name), "https://front.test");
  assert.equal(namedUrl.searchParams.get("category_name"), category.name);
  const route = h.load("../../app/(main)/products/page").default;
  await assert.rejects(
    route({ searchParams: Promise.resolve({ category_name: category.name }) }),
    (error) => error.message === "redirect:/products?category=" + category.id + "&sort=newest",
  );
  assert.equal(h.requests.length, 1);
  const detail = detailFixture();
  detail.product.category = { id: category.id, name: category.name, slug: category.slug };
  const mapped = h.load("mappers/product-detail.mapper").mapProductDetail(detail);
  const crumbs = h.load("utils/build-product-detail-breadcrumb").buildProductDetailBreadcrumb(mapped);
  assert.equal(crumbs[2].href, getHref(mapped.category.name, mapped.category.id));
});

test("category name differences and missing categories do not produce a 404", async () => {
  const raw = listFixture();
  raw.filters.categories = [{id:1925,name:"\u0622\u0628 \u0645\u0639\u062f\u0646\u06cc \u0628\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0634\u062f\u0647",slug:"water"}];
  const h = harness((url) => ok(new URL(url).pathname === "/api/product/categories/" ? raw.filters.categories.map(category => ({...category, parent_id: null})) : raw));
  const route = h.load("../../app/(main)/products/page").default;
  await assert.rejects(route({searchParams:Promise.resolve({category_name:"\u0622\u0628  \u0645\u0639\u062f\u0646\u064a \u0628\u0633\u062a\u0647 \u0628\u0646\u062f\u064a \u0634\u062f\u0647"})}),
    (error) => error.message === "redirect:/products?category=1925&sort=newest");
  const missing = await route({searchParams:Promise.resolve({category_name:"unknown category"})});
  assert.equal(missing.props.state.queries.length, 1);
  assert.equal(missing.props.children[0].props.role, "status");
  const direct = await route({searchParams:Promise.resolve({category:"1925",sort:"newest",category_name:"outdated name"})});
  assert.equal(direct.props.children[0], undefined);
  assert.equal(direct.props.state.queries[0].queryKey.at(-1).category[0], 1925);
});

test("image_job products route skips catalog fetching and only search results are noindex", async () => {
  const h=harness(()=>assert.fail("image job must not fetch the catalog or categories"));
  const route=h.load("../../app/(main)/products/page");
  const page=await route.default({searchParams:Promise.resolve({image_job:"10789",sort:"newest"})});
  assert.equal(page.props.jobId,"10789");assert.equal(page.props.imageSearch,true);assert.equal(h.requests.length,0);
  const meta=await route.generateMetadata({searchParams:Promise.resolve({image_job:"10789"})});
  assert.equal(meta.robots.index,false);assert.equal(meta.robots.follow,true);
  const regular=await route.generateMetadata({searchParams:Promise.resolve({})});
  assert.equal(regular.robots,undefined);
  await assert.rejects(route.default({searchParams:Promise.resolve({image_job:"bad"})}),/not-found/);
});

test("search_job route skips catalog fetching, retains input and marks discovery results noindex", async () => {
  const h = harness(() => { throw new Error("Must not fetch catalog"); });
  const route = h.load("../../app/(main)/products/page");
  const page = await route.default({searchParams: Promise.resolve({search_job: "10801", search_input: "headphones"})});
  assert.equal(page.props.jobId, "10801");
  assert.equal(page.props.discoverySearch, true);
  assert.equal(page.props.searchQuery, "headphones");
  const meta = await route.generateMetadata({searchParams: Promise.resolve({search_job: "10801"})});
  assert.equal(meta.robots.index, false);
  assert.equal(h.requests.length, 0);
  await assert.rejects(route.default({searchParams: Promise.resolve({search_job: "invalid"})}), /not-found/);
});
