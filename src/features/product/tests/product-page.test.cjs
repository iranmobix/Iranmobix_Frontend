/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable -- Load TS modules with mocked browser and query boundaries. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function harness(overrides = {}) {
  const base = path.resolve(__dirname, "..");
  const cache = new Map();
  function load(file) {
    let absolute = path.resolve(base, file);
    absolute += fs.existsSync(absolute + ".ts") ? ".ts" : ".tsx";
    if (cache.has(absolute)) return cache.get(absolute);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const localRequire = (name) =>
      Object.hasOwn(overrides, name)
        ? overrides[name]
        : name.startsWith(".")
          ? load(
              path.relative(base, path.resolve(path.dirname(absolute), name)),
            )
          : require(name);
    vm.runInNewContext(code, {
      require: localRequire,
      module,
      exports: module.exports,
      URL,
      URLSearchParams,
    });
    cache.set(absolute, module.exports);
    return module.exports;
  }
  return { load };
}

function product(id, amount = 10) {
  return {
    id,
    slug: `product-${id}`,
    title: `Product ${id}`,
    image: "",
    source: { name: "alibaba", label: "Alibaba", url: "" },
    colors: [],
    price: {
      amount,
      amountIrr: amount,
      currency: "CNY",
      hasDiscount: false,
      originalAmount: null,
      discountAmount: null,
      discountPercentage: null,
    },
    brand: null,
    seller: null,
    guarantee: null,
    inIranMobixInventory: false,
    officialUrl: "",
    marketable: true,
  };
}
const filters = {
  sources: [],
  categories: [],
  brands: [],
  colors: [],
  sellerTypes: [],
  guarantees: [],
};
const page = (products, count = products.length) => ({
  products,
  count,
  filters,
  nextCursor: null,
  previousCursor: null,
  limit: 12,
});
const prepare = harness().load("utils/product-page-data").getProductPageData;

test("catalog combines loaded pages and retains server count and filter metadata", () => {
  const first = page([product(1)], 99);
  first.filters = {
    ...filters,
    categories: [{ id: 5, name: "Watches", slug: "watches" }],
  };
  const result = prepare({
    pages: [first, page([product(2)])],
    query: { search: "backend-filter", category: [5] },
  });
  assert.equal(result.isCatalog, true);
  assert.equal(result.products.length, 2);
  assert.equal(result.productCount, 99);
  assert.equal(result.filters, first.filters);
  assert.equal(result.breadcrumbItems.at(-1).label, "Watches");
});

test("overlapping catalog pages render each product once in its original position with the latest data", () => {
  const first = page([product(572), product(571, 10), product(570)], 359);
  const updated = product(571, 25);
  const next = page([updated, product(569)], 359);
  const result = prepare({pages: [first, next], query: {}});
  assert.equal(result.products.map((item) => item.id).join(","), "572,571,570,569");
  assert.equal(result.products[1], updated);
  assert.equal(result.productCount, 359);
  assert.equal(first.products[1].price.amountIrr, 10);
  assert.equal(next.products.length, 2);
});

test("duplicates inside one catalog page do not generate duplicate card keys", () => {
  const result = prepare({pages: [page([product(571), product(571), product(570)])], query: {}});
  assert.equal(result.products.length, 2);
  assert.equal(new Set(result.products.map((item) => item.id)).size, 2);
});

test("discovery filters recommendations while retaining metadata from the requested product", () => {
  const requested = product(1, 1000);
  requested.brand = {
    id: 7,
    name: "Requested",
    originalName: "Requested",
    logo: null,
  };
  const result = prepare({
    pages: [page([product(99)])],
    query: { search: "Product 3" },
    discoveryProducts: {
      requested: [requested],
      suggested: [product(2, 20), product(3, 30)],
    },
  });
  assert.equal(result.isCatalog, false);
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].id, 3);
  assert.equal(result.productCount, 1);
  assert.equal(result.filters.brands[0].id, 7);
  assert.equal(result.priceMin, 30);
  assert.equal(result.priceMax, 30);
});

test("empty imported results remain a local source and do not expose cached catalog cards", () => {
  const result = prepare({
    pages: [page([product(9)])],
    importedProducts: [],
    query: {},
  });
  assert.equal(result.isCatalog, false);
  assert.equal(result.products.length, 0);
  assert.equal(result.productCount, 0);
});

test("local sorting does not mutate the input array or requested product order", () => {
  const input = [product(1, 40), product(2, 10)];
  const result = prepare({
    pages: [],
    importedProducts: input,
    query: { sort: "price_asc" },
  });
  assert.equal(result.products[0].id, 2);
  assert.equal(input[0].id, 1);
});

test("price bounds preserve zero and ignore unavailable or nonfinite display amounts", () => {
  const rows = [
    product(1, null),
    product(2, 0),
    product(3, 20),
    product(4, NaN),
  ];
  const result = prepare({ pages: [page(rows)], query: {} });
  assert.equal(result.priceMin, 0);
  assert.equal(result.priceMax, 20);
  assert.equal(prepare({ pages: [], query: {} }).sourceCurrencyLabel, "یوان");
  rows[0].price.currency = "USD";
  assert.equal(
    prepare({ pages: [page(rows)], query: {} }).sourceCurrencyLabel,
    "ارز کالا",
  );
});

test("URL parser is reusable without React, router or window and retains current filter semantics", () => {
  const parse = harness().load("utils/product-query").parseProductQuery;
  const query = parse(
    new URLSearchParams(
      "search=watch&brands=1,2&category=3&sources=alibaba,1688&min_price=0&max_price=100&seller_types=verified&guarantees=iranmobix&in_iranmobix_inventory=false&sort=price_desc",
    ),
  );
  assert.equal(query.search, "watch");
  assert.equal(query.brands.join(","), "1,2");
  assert.equal(query.category[0], 3);
  assert.equal(query.min_price, "0");
  assert.equal(query.in_iranmobix_inventory, false);
  assert.equal(query.sort, "price_desc");
  assert.equal(parse(new URLSearchParams("sort=invalid")).sort, "newest");
});

function renderController(options = {}, configuration = {}) {
  let captured;
  let enabled;
  let observer;
  let applied = 0;
  const noop = () => {};
  const catalogFetch = async () => {};
  const h = harness({
    "./use-product-query": {
      useProductQuery: () => ({
        query: {},
        draftQuery: {},
        hasExplicitSort: false,
        updateQuery: noop,
        applyQuery: () => {
          applied++;
        },
        setSort: noop,
        resetDraftQuery: noop,
        resetQuery: noop,
      }),
    },
    "./use-products": {
      useProducts: (_query, active) => {
        enabled = active;
        return {
          data: { pages: [page([product(99)])] },
          isLoading: false,
          isError: false,
          isMock: false,
          isFetching: false,
          useMockData: noop,
          useApiData: noop,
          hasNextPage: true,
          isFetchingNextPage: false,
          fetchNextPage: catalogFetch,
          ...configuration,
        };
      },
    },
    "./use-infinite-product-scroll": {
      useInfiniteProductScroll: (config) => {
        observer = config;
        return { loadMoreRef: { current: null } };
      },
    },
  });
  function Probe() {
    captured = h.load("hooks/use-product-page").useProductPage(options);
    return null;
  }
  renderToStaticMarkup(React.createElement(Probe));
  return {
    model: captured,
    enabled,
    observer,
    applied: () => applied,
    catalogFetch,
  };
}

test("catalog controller enables the catalog source and delegates its pagination", () => {
  const state = renderController();
  assert.equal(state.enabled, true);
  assert.equal(state.model.products[0].id, 99);
  assert.equal(state.observer.fetchNextPage, state.catalogFetch);
  state.model.applyFilters();
  assert.equal(state.applied(), 1);
});

test("discovery controller disables catalog fetching and retains the owning pagination callback", () => {
  const fetchNextPage = async () => {};
  const state = renderController({
    discoveryProducts: { requested: [product(1)], suggested: [product(2)] },
    discoveryPagination: {
      hasNextPage: true,
      isFetchingNextPage: false,
      isError: false,
      fetchNextPage,
    },
  });
  assert.equal(state.enabled, false);
  assert.equal(state.model.products[0].id, 2);
  assert.equal(state.observer.fetchNextPage, fetchNextPage);
});

test("a discovery pagination error stops automatic scrolling while keeping manual retry available", () => {
  const fetchNextPage = async () => {};
  const state = renderController({
    discoveryProducts: { requested: [], suggested: [] },
    discoveryPagination: {
      hasNextPage: true,
      isFetchingNextPage: false,
      isError: true,
      fetchNextPage,
    },
  });
  assert.equal(state.observer.hasNextPage, false);
  assert.equal(state.model.pagination.fetchNextPage, fetchNextPage);
});

test("a catalog next-page error retains loaded cards and exposes the existing pagination retry", () => {
  const state = renderController({}, {isError: true, isFetchNextPageError: true});
  assert.equal(state.model.products.length, 1);
  assert.equal(state.model.isError, false);
  assert.equal(state.model.pagination.isError, true);
  assert.equal(state.observer.hasNextPage, false);
  assert.equal(state.model.pagination.fetchNextPage, state.catalogFetch);
});

test("an initial catalog failure still uses the existing page error state", () => {
  const state = renderController({}, {data: undefined, isError: true, isFetchNextPageError: false});
  assert.equal(state.model.isError, true);
  assert.equal(state.model.products.length, 0);
  assert.equal(state.model.pagination.isError, false);
});

test("result presentation selects skeleton, empty message, cards and next-page retry independently", () => {
  const mockGrid = {
    default: ({ products }) =>
      React.createElement(
        "div",
        { "data-grid": true },
        products.map((item) => item.title).join(","),
      ),
  };
  const h = harness({
    "./product-grid/product-grid": mockGrid,
    "./product-grid/product-grid-skeleton": {
      default: () => React.createElement("div", null, "skeleton"),
    },
    "@/components/ui/button": {
      Button: ({ children }) => React.createElement("button", null, children),
    },
  });
  const Results = h.load("components/product-page-results").ProductPageResults;
  const model = renderController().model;
  const render = (changes, options = {}) =>
    renderToStaticMarkup(
      React.createElement(Results, {
        model: { ...model, ...changes },
        options,
      }),
    );
  assert.match(render({ isLoading: true }), /skeleton/);
  assert.match(render({ products: [] }), /محصولی با این فیلترها یافت نشد/);
  assert.match(render({}), /Product 99/);
  assert.match(
    render({
      products: [],
      pagination: { ...model.pagination, isError: true },
    }),
    /تلاش دوباره/,
  );
});

test("discovery suggestions keep their skeleton between requests until cards, exhaustion or an error", () => {
  const h = harness({
    "./product-grid/product-grid": { default: ({products}) => React.createElement("div", null, products.map(item=>item.title).join(",")) },
    "./product-grid/product-grid-skeleton": { default: () => React.createElement("div", null, "skeleton") },
    "@/components/ui/button": { Button: ({children}) => React.createElement("button", null, children) },
  });
  const Results = h.load("components/product-page-results").ProductPageResults;
  const base = renderController().model;
  const requested = [product(1)];
  const render = ({ fetching=false, more=true, error=false, waiting=false, suggested=[], visible=suggested }={}) => renderToStaticMarkup(React.createElement(Results, {
    model: {...base, isCatalog:false, isLoading:false, products:visible, query:{}, pagination:{...base.pagination,hasNextPage:more,isFetchingNextPage:fetching,isError:error,isWaitingForResults:waiting}},
    options:{discoveryProducts:{requested,suggested}},
  }));
  for (const fetching of [false,true,false,true,false]) {
    const html = render({fetching});
    assert.match(html,/skeleton/);
    assert.doesNotMatch(html,/هنوز محصول پیشنهادی|محصولی با این فیلترها/);
  }
  const enriching = render({more:false,waiting:true});
  assert.match(enriching,/skeleton/);
  assert.doesNotMatch(enriching,/هنوز محصول پیشنهادی/);
  const loaded = render({suggested:[product(2)]});
  assert.match(loaded,/Product 2/);
  assert.doesNotMatch(loaded,/skeleton/);
  const refreshing = render({fetching:true,suggested:[product(2)]});
  assert.match(refreshing,/Product 2/);
  assert.doesNotMatch(refreshing,/skeleton/);
  assert.match(render({more:false}),/هنوز محصول پیشنهادی/);
  assert.doesNotMatch(render({more:false}),/skeleton/);
  assert.match(render({error:true}),/تلاش دوباره/);
  assert.doesNotMatch(render({error:true}),/skeleton/);
  assert.doesNotMatch(render({suggested:[product(2)],visible:[]}),/skeleton/);
});

test("import cards expose real new-tab detail links for ready products and their owning discovery jobs", () => {
  const opens=[],errors=[];
  const ready=product(1),candidate=product(2),invalid=product(3);
  const grouped={requested:[ready],suggested:[candidate,invalid],
    candidatesByProductId:new Map([[2,{candidate_id:7,source_url:"https://example.com/camera"}],[3,{}]]),
    candidateJobIdsByProductId:new Map([[2,"724"]])};
  const h=harness({
    react:{...React,useMemo:fn=>fn(),useState:()=>["",value=>errors.push(value)]},
    "../hooks/use-import-results":{useImportResults:()=>({query:{data:{status:"done"}},grouped,hasNextPage:false,isFetchingNextPage:false,isNextPageError:false})},
    "@/features/product/components/product-page":{default:"mock-product-page"},
    "@/features/product/components/product-grid/product-grid-skeleton":{default:"mock-skeleton"},
    "@/features/product/utils/product-path":harness().load("utils/product-path"),
    "@/features/product/utils/product-navigation":{openProductDetailsTab:href=>opens.push(href)},
    "@/components/ui/button":{Button:"button"},
  });
  const Page=h.load("../importer/components/import-results-page").default;
  const element=Page({jobId:"700"});
  assert.equal(element.props.getProductDetailsLink(ready),"/products/product-1");
  const path=element.props.getProductDetailsLink(candidate);
  const url=new URL(path,"https://frontend.test");
  assert.equal(url.pathname,"/imports/724/product");
  assert.equal(url.searchParams.get("candidate_id"),"7");
  assert.equal(url.searchParams.get("source_url"),"https://example.com/camera");
  element.props.onProductDetailsClick(ready);
  element.props.onProductDetailsClick(candidate);
  assert.deepEqual(opens,["/products/product-1",path]);
  assert.equal(element.props.getProductDetailsLink(invalid),undefined);
  element.props.onProductDetailsClick(invalid);
  assert.equal(opens.length,2);
  assert.match(errors.at(-1),/اطلاعات لازم/);
});
