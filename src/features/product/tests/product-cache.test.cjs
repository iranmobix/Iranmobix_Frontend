/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable -- Isolated transport with the real React Query cache. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const {
  QueryClient,
  InfiniteQueryObserver,
  hashKey,
  dehydrate,
  hydrate,
} = require("@tanstack/react-query");

function harness(service = {}, globals = {}, overrides = {}) {
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
      Object.hasOwn(overrides, name)
        ? overrides[name]
        : name === "./product.service"
          ? { productService: service }
          : name.startsWith(".")
            ? load(
                path.relative(base, path.resolve(path.dirname(absolute), name)),
              )
            : require(name);
    vm.runInNewContext(code, {
      require: localRequire,
      module,
      exports: module.exports,
      crypto: require("node:crypto").webcrypto,
      ...globals,
    });
    cache.set(absolute, module.exports);
    return module.exports;
  }
  return { load, options: () => load("services/product-query-options") };
}
function client(t) {
  const value = new QueryClient();
  t.after(() => value.clear());
  return value;
}
const page = (id = 1, nextCursor = null) => ({
  products: [{ id }],
  count: 2,
  filters: {},
  nextCursor,
  previousCursor: null,
  limit: 1,
});

test("equivalent list filters share one identity, retain false/zero and do not mutate input", () => {
  const { productQueryKeys: keys, normalizeProductListQuery } =
    harness().options();
  const input = {
    brands: [2, 1, 2],
    sources: ["1688", "alibaba"],
    colors: [],
    min_price: "0",
    in_iranmobix_inventory: false,
    cursor: "page-two",
  };
  const other = {
    brands: [1, 2],
    sources: ["alibaba", "1688"],
    min_price: "0",
    in_iranmobix_inventory: false,
    sort: "newest",
  };
  assert.equal(hashKey(keys.list(input)), hashKey(keys.list(other)));
  assert.equal(input.brands.join(","), "2,1,2");
  assert.equal(normalizeProductListQuery(input).in_iranmobix_inventory, false);
  assert.equal(normalizeProductListQuery(input).min_price, "0");
  assert.equal(
    hashKey(keys.list()),
    hashKey(keys.list({ search: "", brands: [] })),
  );
  assert.notEqual(
    hashKey(keys.list({ limit: 1 })),
    hashKey(keys.list({ limit: 2 })),
  );
});

test("list/detail and API/mock caches remain isolated for public products", () => {
  const { productQueryKeys: keys } = harness().options();
  const values = [
    keys.list(),
    keys.detail("watch"),
    keys.list({}, "mock"),
    keys.detail("watch", "mock"),
  ];
  assert.equal(new Set(values.map(hashKey)).size, values.length);
});

test("concurrent equivalent catalog requests are deduplicated", async (t) => {
  let calls = 0;
  const h = harness({
    getProducts: async () => {
      calls++;
      return page();
    },
  });
  const queryClient = client(t);
  const { productListQueryOptions: options } = h.options();
  await Promise.all([
    queryClient.fetchInfiniteQuery(options({ brands: [1, 2] })),
    queryClient.fetchInfiniteQuery(options({ brands: [2, 1, 1] })),
  ]);
  assert.equal(calls, 1);
  assert.equal(queryClient.getQueryCache().getAll().length, 1);
});

test("fresh details are reused while expired details are fetched again", async (t) => {
  let calls = 0;
  const h = harness({
    getProductDetail: async (slug) => ({ slug, version: ++calls }),
  });
  const queryClient = client(t);
  const { productDetailQueryOptions: options, PRODUCT_CACHE_POLICY } =
    h.options();
  const config = options("watch");
  assert.equal((await queryClient.fetchQuery(config)).version, 1);
  assert.equal((await queryClient.fetchQuery(options("watch"))).version, 1);
  queryClient.setQueryData(
    config.queryKey,
    { slug: "watch", version: 1 },
    { updatedAt: Date.now() - PRODUCT_CACHE_POLICY.staleTime - 1 },
  );
  assert.equal((await queryClient.fetchQuery(config)).version, 2);
  assert.equal(calls, 2);
});

test("cursor pages stay in one infinite cache and preserve filters and source", async (t) => {
  const calls = [];
  const h = harness({
    getProducts: async (query, source) => {
      calls.push({ query, source });
      return page(calls.length, calls.length === 1 ? "next" : null);
    },
  });
  const queryClient = client(t);
  const observer = new InfiniteQueryObserver(queryClient, {
    ...h.options().productListQueryOptions({ brands: [3] }),
    enabled: false,
  });
  t.after(() => observer.destroy());
  await observer.fetchNextPage();
  await observer.fetchNextPage();
  await observer.fetchNextPage();
  assert.equal(calls.length, 2);
  assert.equal(calls[0].query.cursor, undefined);
  assert.equal(calls[1].query.cursor, "next");
  assert.equal(calls[1].query.brands[0], 3);
  assert.equal(calls[1].source, "api");
  assert.equal(observer.getCurrentResult().data.pages.length, 2);
  assert.equal(observer.getCurrentResult().hasNextPage, false);
});

test("completed imports invalidate API lists and the chosen detail without touching mocks or other details", async (t) => {
  const { productQueryKeys: keys, invalidateProductCache } =
    harness().options();
  const queryClient = client(t);
  const stale = [
    keys.list({}, "api"),
    keys.list({ brands: [1] }, "api"),
    keys.detail("watch"),
  ];
  const untouched = [
    keys.detail("strap"),
    keys.list({}, "mock"),
    keys.detail("watch", "mock"),
    ["import-job", "1"],
  ];
  for (const key of [...stale, ...untouched])
    queryClient.setQueryData(key, { value: true });
  await invalidateProductCache(queryClient, "watch");
  for (const key of stale)
    assert.equal(queryClient.getQueryState(key).isInvalidated, true);
  for (const key of untouched)
    assert.equal(queryClient.getQueryState(key).isInvalidated, false);
});

test("a late older detail request cannot overwrite invalidated product data", async (t) => {
  let finish;
  const h = harness({
    getProductDetail: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  const { productDetailQueryOptions: options, invalidateProductCache } =
    h.options();
  const queryClient = client(t);
  const config = options("watch");
  const outcome = queryClient.fetchQuery(config).catch((error) => error);
  await invalidateProductCache(queryClient, "watch");
  finish({ slug: "watch", old: true });
  await outcome;
  assert.equal(queryClient.getQueryData(config.queryKey), undefined);
  assert.equal(queryClient.getQueryState(config.queryKey).isInvalidated, true);
});

test("prefetched infinite cache hydrates with the same options without another initial request", async (t) => {
  let calls = 0;
  const h = harness({
    getProducts: async () => {
      calls++;
      return page();
    },
  });
  const server = client(t);
  const browser = client(t);
  const options = h.options().productListQueryOptions({ sort: "newest" });
  await server.prefetchInfiniteQuery(options);
  hydrate(browser, dehydrate(server));
  const data = await browser.fetchInfiniteQuery(
    h.options().productListQueryOptions(),
  );
  assert.equal(calls, 1);
  assert.equal(data.pages[0].products[0].id, 1);
});

test("failed fetches do not retry automatically and a manual fetch can recover", async (t) => {
  let calls = 0;
  const h = harness({
    getProductDetail: async () => {
      if (++calls === 1) throw new Error("offline");
      return { slug: "watch" };
    },
  });
  const queryClient = client(t);
  const options = h.options().productDetailQueryOptions("watch");
  await assert.rejects(queryClient.fetchQuery(options), /offline/);
  assert.equal(calls, 1);
  assert.equal((await queryClient.fetchQuery(options)).slug, "watch");
  assert.equal(calls, 2);
});

test("raw and escaped product slugs share cache and transient 503 errors recover without a manual refresh", async (t) => {
  const slug = "محصول-تست";
  let calls = 0;
  const h = harness({getProductDetail: async (requested) => {
    assert.equal(requested, slug);
    calls++;
    if (calls < 3) throw Object.assign(new Error("Temporarily unavailable"), {response:{status:503}});
    return {slug};
  }});
  const queryClient = client(t);
  const options = h.options().productDetailQueryOptions(encodeURIComponent(encodeURIComponent(slug)));
  const result = await queryClient.fetchQuery({...options,retryDelay:0});
  assert.equal(result.slug, slug);
  assert.equal(calls, 3);
  assert.equal(await queryClient.fetchQuery(h.options().productDetailQueryOptions(slug)), result);
  assert.equal(calls, 3);
});

test("detail retries are bounded and never retry missing products, validation or cancelled requests", () => {
  const retry = harness().load("utils/product-request-policy").retryProductDetail;
  assert.equal(retry(0, {response:{status:503}}), true);
  assert.equal(retry(1, {code:"ECONNABORTED"}), true);
  assert.equal(retry(2, {response:{status:503}}), false);
  for (const error of [{response:{status:404}}, {response:{status:401}}, {response:{status:400}},
    {name:"ZodError"}, {name:"AbortError"}, {code:"ERR_CANCELED"}]) {
    assert.equal(retry(0,error), false);
  }
});

test("switching list/detail previews back to API invalidates the exact fresh snapshot", async (t) => {
  const queryClient = client(t);
  for (const kind of ["list", "detail"]) {
    let state = null;
    let refetches = 0;
    let lastOptions;
    const rq = require("@tanstack/react-query");
    const h = harness(
      {},
      {},
      {
        react: {
          useState: () => [
            state,
            (value) => {
              state = value;
            },
          ],
        },
        "@tanstack/react-query": {
          ...rq,
          useQueryClient: () => queryClient,
          useQuery: (options) => {
            lastOptions = options;
            return {
              refetch: () => {
                refetches++;
              },
            };
          },
          useInfiniteQuery: (options) => {
            lastOptions = options;
            return {
              refetch: () => {
                refetches++;
              },
            };
          },
        },
      },
    );
    const read =
      kind === "list"
        ? () => h.load("hooks/use-products").useProducts({ brands: [1] })
        : () => h.load("hooks/use-product").useProduct("watch");
    let result = read();
    const apiKey = lastOptions.queryKey;
    queryClient.setQueryData(apiKey, { value: "old-api" });
    result.useMockData();
    result = read();
    assert.equal(result.isMock, true);
    result.useApiData();
    result = read();
    assert.equal(result.isMock, false);
    assert.equal(queryClient.getQueryState(apiKey).isInvalidated, true);
    assert.equal(hashKey(lastOptions.queryKey), hashKey(apiKey));
    result.useApiData();
    assert.equal(refetches, 1);
  }
});

test("cache cancellation aborts the service signal and preserves the previous detail without an error state", async (t) => {
  let signal;
  const h = harness({
    getProductDetail: (_slug, _source, requestSignal) => {
      signal = requestSignal;
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    },
  });
  const queryClient = client(t);
  const {
    productDetailQueryOptions: options,
    invalidateProductCache,
    PRODUCT_CACHE_POLICY,
  } = h.options();
  const config = options("watch");
  queryClient.setQueryData(
    config.queryKey,
    { slug: "watch", previous: true },
    { updatedAt: Date.now() - PRODUCT_CACHE_POLICY.staleTime - 1 },
  );
  const outcome = queryClient.fetchQuery(config).catch((error) => error);
  await invalidateProductCache(queryClient, "watch");
  await outcome;
  assert.equal(signal.aborted, true);
  assert.equal(queryClient.getQueryData(config.queryKey).previous, true);
  assert.equal(queryClient.getQueryState(config.queryKey).error, null);
  assert.equal(queryClient.getQueryState(config.queryKey).isInvalidated, true);
});

test("a shared detail read only aborts when its last consumer leaves", (t) => {
  const { QueryObserver } = require("@tanstack/react-query");
  let signal;
  let requests = 0;
  const h = harness({
    getProductDetail: (_slug, _source, requestSignal) => {
      signal = requestSignal;
      requests++;
      return new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        }),
      );
    },
  });
  const queryClient = client(t);
  const config = h.options().productDetailQueryOptions("watch");
  const first = new QueryObserver(queryClient, config);
  const second = new QueryObserver(queryClient, config);
  const stopFirst = first.subscribe(() => {});
  const stopSecond = second.subscribe(() => {});
  assert.equal(requests, 1);
  stopFirst();
  assert.equal(signal.aborted, false);
  stopSecond();
  assert.equal(signal.aborted, true);
  assert.equal(queryClient.getQueryState(config.queryKey).error, null);
  first.destroy();
  second.destroy();
});

test("changing catalog filters aborts the old read while the new read remains active", (t) => {
  const flights = [];
  const h = harness({
    getProducts: (query, _source, signal) => {
      flights.push({ query, signal });
      return new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        }),
      );
    },
  });
  const queryClient = client(t);
  const { productListQueryOptions: options } = h.options();
  const observer = new InfiniteQueryObserver(
    queryClient,
    options({ brands: [1] }),
  );
  const stop = observer.subscribe(() => {});
  observer.setOptions(options({ brands: [2] }));
  assert.equal(flights.length, 2);
  assert.equal(flights[0].signal.aborted, true);
  assert.equal(flights[1].signal.aborted, false);
  assert.equal(flights[1].query.brands[0], 2);
  stop();
  observer.destroy();
  assert.equal(flights[1].signal.aborted, true);
});

test("returning to a fresh catalog restores every loaded page without a backend read", async (t) => {
  const requests = [];
  const h = harness({getProducts: async (query) => {
    requests.push(query.cursor);
    return query.cursor ? page(2) : page(1,"page-two");
  }});
  const {productListQueryOptions,PRODUCT_LIST_CACHE_POLICY,productDetailQueryOptions} = h.options();
  assert.equal(PRODUCT_LIST_CACHE_POLICY.staleTime,5*60_000);
  assert.equal(PRODUCT_LIST_CACHE_POLICY.gcTime,30*60_000);
  assert.equal(productDetailQueryOptions("watch").staleTime,30_000);
  const queryClient = client(t);
  const options = productListQueryOptions({brands:[2,1]});
  const first = new InfiniteQueryObserver(queryClient,options);
  const stop = first.subscribe(()=>{});
  await first.refetch({cancelRefetch:false});
  await first.fetchNextPage();
  assert.equal(requests.length,2);
  stop(); first.destroy();
  // Spend more than the old 30-second freshness period on a detail page.
  queryClient.setQueryData(options.queryKey,data=>data,{updatedAt:Date.now()-60_000});
  const returning = new InfiniteQueryObserver(queryClient,productListQueryOptions({brands:[1,2]}));
  const stopReturning = returning.subscribe(()=>{});
  try {
  await new Promise(resolve=>setImmediate(resolve));
  const result = returning.getCurrentResult();
  assert.equal(result.isFetching,false);
  assert.equal(requests.length,2);
  assert.deepEqual(result.data.pages.map(item=>item.products[0].id),[1,2]);
  assert.deepEqual(result.data.pageParams,[undefined,"page-two"]);
  } finally { stopReturning(); returning.destroy(); }
});

test("expired catalog snapshots refetch and different filters remain isolated", async (t) => {
  let requests=0;
  const h=harness({getProducts:async()=>{requests++;return page(requests);}});
  const {productListQueryOptions,PRODUCT_LIST_CACHE_POLICY}=h.options();
  const queryClient=client(t);
  const options=productListQueryOptions({sources:["alibaba"]});
  await queryClient.fetchInfiniteQuery(options);
  await queryClient.fetchInfiniteQuery(options);
  assert.equal(requests,1);
  queryClient.setQueryData(options.queryKey,data=>data,{updatedAt:Date.now()-PRODUCT_LIST_CACHE_POLICY.staleTime-1});
  await queryClient.fetchInfiniteQuery(options);
  assert.equal(requests,2);
  await queryClient.fetchInfiniteQuery(productListQueryOptions({sources:["1688"]}));
  assert.equal(requests,3);
  await queryClient.fetchInfiniteQuery(options);
  assert.equal(requests,3);
});
