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
        : name.endsWith("product-detail-loading-indicator") || name.endsWith("product-details-error")
          ? { default: name.split("/").at(-1) }
        : name.endsWith("product-search-failure-animation")
          ? { default: () => React.createElement("div", { "data-search-failure-animation": true }) }
        : name === "../../assets/china.svg" || name === "../../assets/iran.svg"
          ? { default: "/" + name.split("/").at(-1) }
        : name === "../../assets/Spinner.svg"
          ? { default: "/Spinner.svg" }
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
      window: overrides.window,
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
    categories: [{id: 5, name: "Watches", slug: ""}],
  });
  assert.equal(result.isCatalog, true);
  assert.equal(result.products.length, 2);
  assert.equal(result.productCount, 99);
  assert.equal(result.filters.sources, first.filters.sources);
  assert.equal(result.filters.categories[0].slug, "");
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
    "./use-product-navigation-categories": {useProductNavigationCategories: () => ({data: configuration.categories ?? [], isLoading: false, isError: false, refetch: noop})},
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
    react:{...React,useMemo:fn=>fn(),useEffect:()=>{},useState:()=>["",value=>errors.push(value)]},
    "next/navigation":{useRouter:()=>({replace:()=>assert.fail("text search must not redirect")})},
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

test("independent import page renders partial data and keeps it visible on polling errors",()=>{
 for(const state of ['loading','partial','ready','partial-error','empty-error']) {
  const hasData=['partial','ready','partial-error'].includes(state);
  const h=harness({
   'next/navigation':{useRouter:()=>({replace:()=>assert.fail('render must not navigate')})},
   '../hooks/use-single-product-import':{useSingleProductImport:()=>({product:{hasData,settled:state==='ready'},error:state.endsWith('error')?'Network error':null,retry:()=>{},isRetrying:false})},
   '../../product/components/detail/marketplace-product-details-view':{default:'mock-import-view'},
   '@/features/product/components/detail/product-detail-skeleton':{default:'mock-detail-skeleton'},
   '@/features/product/components/detail/product-details-error':{default:'mock-detail-error'},
  });
  const Page=h.load('../importer/components/single-product-import-page').default;
  const element=Page({url:'https://example.com',jobId:2768});
  assert.equal(element.type,state==='loading'?'mock-detail-skeleton':state==='empty-error'?'mock-detail-error':'mock-import-view');
  if(state==='partial-error') assert.equal(element.props.notice,'Network error');
 }
});
test("submitting a product URL opens the new detail loading tab immediately without discovery",async()=>{
 const url="https://www.alibaba.com/product-detail/camera.html?x=1&y=2";
 const opened=[],errors=[];let stateIndex=0;
 const h=harness({
  react:{...React,useRef:()=>({current:false}),useState:()=>[stateIndex++===0?url:"",value=>errors.push(value)]},
  "next/navigation":{useRouter:()=>({push:()=>assert.fail("must open a new tab")})},
  "next/image":{default:"mock-image"},
  "radix-ui":{Popover:{Trigger:"mock-trigger"}},
  "./import-image-search":{ImportImageSearch:"mock-image-search"},
  "@/components/ui/input":{Input:"mock-input"},
  "@/features/header/assets/search.svg":{},"@/features/header/assets/camera.svg":{},
  "../services/importer.service":{createDiscoverPayload:value=>({input:value}),isDiscoverUrlInput:()=>true,isDirectProductUrl:()=>true,
    importerService:{discover:()=>assert.fail("URL import must not call discover")},ProductImportError:Error},
  "../services/import-search-navigation":{runImportSearch:()=>assert.fail("URL import must not use legacy result navigation")},
  "@/shared/api":{httpPost:()=>assert.fail("POST belongs to the destination tab"),httpGet:()=>assert.fail("GET belongs to the destination tab")},
  window:{open:(href,target)=>{const tab={opener:{}};opened.push({href,target,tab});return tab;}},
 });
 const Header=h.load("../importer/components/import-header-input").default;
 const element=Header({});const form=element.props.children[0].props.children;
 await form.props.onSubmit({preventDefault(){}});
 assert.equal(opened.length,1);assert.equal(opened[0].target,"_blank");assert.equal(opened[0].tab.opener,null);
 const href=new URL(opened[0].href,"https://front.test");assert.equal(href.pathname,"/imports/single");assert.equal(href.searchParams.get("url"),url);
 assert.equal(errors.some(value=>typeof value==="string"&&value.length>0),false);
});
test("progressive import view renders received sections alongside placeholders without fabricated prices or purchase readiness",()=>{
 const pricingRequests = [];
 const shippingRequests = [];
 const cartRequests = [];
 const h=harness({
  '@/features/cart':{AddToCartButton:props=>{cartRequests.push(props);return React.createElement('button',{disabled:props.disabled},'Add to cart');}},
  '@/features/product/hooks/use-product-toman-pricing':{useProductTomanPricing:(...args)=>{pricingRequests.push(args);return {data:undefined};}},
  '@/features/product/services/product-toman-pricing':harness({'@/shared/api':{httpGet:()=>{}}}).load('services/product-toman-pricing'),
  'next/link':{default:'a'},
  '@/shared/components/breadcrumb/breadcrumb':{default:({items})=>React.createElement('nav',null,items.map(item=>item.label).join(' / '))},
  '@/features/product/components/detail/product-detail-actions':{default:()=>null},
  '@/features/product/components/detail/product-price-section':{default:harness().load('components/detail/product-price-section').default},
  '@/features/product/components/detail/product-details-content':{default:harness({'next/image':{default:'mock-image'},'../../assets/star.svg':{default:'/star.svg'}}).load('components/detail/product-details-content').default},
  '@/features/product/components/detail/product-other-sellers':{default:({products,previewOnly,title="دیگر فروشندگان این کالا"})=>React.createElement('section',{'data-seller-count':products.length,'data-preview':previewOnly},title)},
  '@/features/product/components/detail/product-shipping-purchase-panel':{default:props=>{
   if (props.slug) shippingRequests.push([props.slug,props.quantityValue,props.revision,props.pending,props.reuseSuccessful]);
   return React.createElement(harness().load('components/detail/product-purchase-panel').default,props);
  }},
  '@/features/product/components/detail/product-currency-label':{default:harness().load('components/detail/product-currency-label').default},
  '@/features/product/components/detail/product-quantity':{default:()=>null},
  '@/features/product/components/detail/product-comments':{default:({sourceComments})=>React.createElement('section',{'data-comments':true},sourceComments?.map(comment=>comment.text).join(' '))},
  '@/features/product/components/detail/product-purchase-preview':{default:()=>React.createElement('div',{'data-purchase-preview':true})},
  './product-mobile-gallery-controls':{default:()=>null},
  './product-mobile-seller':{default:({seller,pending})=>React.createElement('section',{'data-mobile-seller':true,'data-pending':pending},seller?.name||'Seller pending')},
  '@/features/product/components/detail/product-detail-hero':{default:({gallery,overview,purchase})=>React.createElement('div',null,gallery,overview,purchase)},
  '@/features/product/components/detail/product-gallery':{default:({product})=>React.createElement('p',null,`Gallery ${product.gallery.length}`)},
  '@/features/product/components/detail/product-specifications':{default:({product})=>React.createElement('p',{'data-full-specifications':true},Object.values(product.translatedSpecifications).join(' '))},
  '@/features/product/components/detail/supplier/product-supplier-detail':{default:({product})=>React.createElement('p',null,product.seller.name)},
  '@/features/product/components/detail/product-detail-source':{default:()=>null},
  '@/features/product/components/detail/supplier/SupplierIdentity':{default:({seller})=>React.createElement('p',null,seller.name)},
  '@/components/ui/button':{Button:'button'},
 });
 const map=h.load('../importer/mappers/import-product-view').mapImportProductView;
 const View=h.load('components/detail/marketplace-product-details-view').default;
 const raw={job_id:2768,status:'processing',next_poll_after_seconds:2,product:{title_fa:'فرنچ پرس'}};
 const render=product=>renderToStaticMarkup(React.createElement(View,{product,onRetry:()=>{},isRetrying:false}));
 const partial=render(map(raw));assert.match(partial,/فرنچ پرس/);assert.match(partial,/در حال دریافت اطلاعات/);assert.doesNotMatch(partial,/۰ یوان|[۰-۹]+ تومان/);
 const emptySections = render(map({...raw,status:'done',next_poll_after_seconds:0, product:{...raw.product,other_sellers:[],related_products:[]}}));
 for (const html of [partial, emptySections]) {
  assert.doesNotMatch(html, /دیگر فروشندگان این کالا|محصولات مشابه|data-seller-count/);
 }
 render(map({...raw,product:{...raw.product,slug:'coffee',price_cny:80}}));
 const full=render(map({...raw,status:'done',next_poll_after_seconds:0,product:{...raw.product,slug:'coffee',price_cny:84.19,gallery:['https://example.com/photo'],key_attributes:{Material:'سرامیک'},seller:{name:'Actual seller'},specifications:{Capacity:'600 ml'},other_sellers:[{slug:'seller-one',fa_title:'Offer'}],related_products:[{slug:'related-one',fa_title:'Related'},{slug:'related-two',fa_title:'Related again'}],comments:[{text:'Backend review'}]}}));
 assert.ok(full.indexOf('data-mobile-seller')<full.indexOf('data-full-specifications'));
 assert.deepEqual(pricingRequests.slice(-2),[
  ["coffee","marketplace-details",true,true,true],
  ["coffee","marketplace-details",true,false,true],
 ]);
 assert.deepEqual(shippingRequests,[
  ["coffee",1,"marketplace-details",true,true],
  ["coffee",1,"marketplace-details",true,true],
  ["coffee",1,"marketplace-details",false,true],
  ["coffee",1,"marketplace-details",false,true],
 ]);
 assert.match(full,/Gallery 1/);assert.match(full,/سرامیک/);assert.match(full,/¥84.19/);assert.doesNotMatch(full,/در حال دریافت اطلاعات/);
 assert.equal(cartRequests.at(-1).disabled,false);
 assert.deepEqual(JSON.parse(JSON.stringify(cartRequests.at(-1).payload)),{quantity:1,shipping_method:"ground"});
 assert.doesNotMatch(full,/import-purchase-note|اطلاعات موجودی/);
 assert.match(full,/data-seller-count="1"/);assert.match(full,/data-seller-count="2"/);
 assert.doesNotMatch(full,/data-preview="true"/);assert.match(full,/600 ml/);assert.match(full,/Backend review/);
});
test("Figma purchase slots retain one quantity, selected option IDs and the existing cart payload",()=>{
 const state=[2,'20','30',{},false];let index=0,slots;
 const h=harness({
  react:{...React,useState:()=>{const current=index++;return [state[current],value=>{state[current]=typeof value==='function'?value(state[current]):value;}];}},
  '@/features/cart':{AddToCartButton:'mock-cart-button'},
  './product-warranty':{default:'mock-warranty'},'./product-quantity':{default:'mock-quantity'},
  './product-color':{default:'mock-color'},'./product-sku-attributes':{default:'mock-sku'},
 });
 const Form=h.load('components/detail/product-purchase-form').default;
 const item={slug:'camera',source:'iranmobix',marketable:true,inventory:{trackingEnabled:true,marketableNumber:10},price:{attributes:[]},colors:[{id:20,name:'Black'}],guarantees:[{id:30,name:'Warranty'}]};
 const render=()=>{index=0;Form({product:item,renderLayout:value=>{slots=value;return null;}});};
 render();assert.equal(slots.quantity.props.value,2);assert.equal(slots.submit.props.disabled,false);
 assert.deepEqual(JSON.parse(JSON.stringify(slots.submit.props.payload)),{quantity:2,color:'20',guarantee:'30'});
 slots.quantity.props.onChange(4);render();assert.equal(slots.submit.props.payload.quantity,4);
 slots.options.props.children[0].props.onChange('');render();assert.equal(slots.submit.props.disabled,true);
 assert.equal('guarantee' in slots.submit.props.payload,false);
});
test("scrollable gallery includes every thumbnail and supports image selection, arrows, touch swipes and zoom",()=>{
 const values=[false,null];let cursor=0;
 const h=harness({
  react:{...React,useEffect:()=>{},useCallback:fn=>fn,useRef:()=>({current:null}),useState:()=>{const index=cursor++;return [values[index],value=>{values[index]=value;}];}},
  'next/image':{default:'mock-image'},'./product-gallery-modal':{default:'mock-gallery-modal'},
 });
 const Gallery=h.load('components/detail/product-gallery').default;
 const images=Array.from({length:11},(_,index)=>({id:index+1,url:`https://example.com/${index+1}.jpg`,isPrimary:index===0}));
 const render=()=>{cursor=0;return Gallery({product:{gallery:images,source:'alibaba',officialUrl:'https://www.alibaba.com/product'}});};
 let element=render();
 assert.equal(element.props.children[1].props.children[0].props.children.length,11);
 element.props.children[1].props.children[0].props.children[7].props.onClick();element=render();
 assert.equal(element.props.children[0].props.children[0].props.children.props.src,images[7].url);
 assert.equal(element.props.children[1].props.children[0].props.children[7].props['aria-pressed'],true);
 const arrows=element.props.children[0].props.children[1];assert.equal(arrows.length,2);
 arrows.find(button=>button.props['aria-label']==='تصویر بعدی').props.onClick();element=render();
 assert.equal(element.props.children[0].props.children[0].props.children.props.src,images[8].url);
 const swipe = (dx, dy) => {
  const image = render().props.children[0].props.children[0];
  let prevented = false;
  image.props.onTouchStart({touches:[{clientX:100,clientY:100}]});
  image.props.onTouchEnd({
   touches:[],
   changedTouches:[{clientX:100+dx,clientY:100+dy}],
   preventDefault:()=>{prevented=true;},
  });
  return prevented;
 };
 assert.equal(swipe(-60,8),true);
 assert.equal(render().props.children[0].props.children[0].props.children.props.src,images[9].url);
 assert.equal(swipe(60,8),true);
 assert.equal(swipe(-10,2),false);
 assert.equal(swipe(45,-70),false);
 element=render();
 element.props.children[0].props.children[0].props.onClick();element=render();
 assert.equal(element.props.children[2].type,'mock-gallery-modal');assert.equal(element.props.children[2].props.selectedIndex,8);
});
test("thumbnail overlay arrows scroll one image step and respect reduced motion",()=>{
 for(const reduced of [false,true]) {
  const calls=[];
  const container={firstElementChild:{getBoundingClientRect:()=>({height:60})},scrollBy:options=>calls.push(options)};
  const h=harness({
   react:{...React,useEffect:()=>{},useCallback:fn=>fn,useRef:()=>({current:container}),useState:initial=>[initial,()=>{}]},
   'next/image':{default:'mock-image'},'./product-gallery-modal':{default:'mock-gallery-modal'},
   window:{matchMedia:()=>({matches:reduced})},
  });
  const Gallery=h.load('components/detail/product-gallery').default;
  const images=Array.from({length:7},(_,index)=>({id:index+1,url:`https://example.com/${index}.jpg`,isPrimary:index===0}));
  const view=Gallery({product:{gallery:images,source:'alibaba',officialUrl:''}});
  const buttons=view.props.children[1].props.children[1];
  buttons[0].props.onClick({currentTarget:{dataset:{scrollDirection:"-1"}}});buttons[1].props.onClick({currentTarget:{dataset:{scrollDirection:"1"}}});
  assert.deepEqual(calls.map(item=>item.top),[-72,72]);assert.equal(calls[0].behavior,reduced?'auto':'smooth');
 }
});
test("main specifications show at most six nonempty values and retain full text for truncated values",()=>{
 const View=harness().load('components/detail/product-key-specifications').default;
 const specifications={empty:'   ',...Object.fromEntries(Array.from({length:8},(_,index)=>[`ویژگی ${index+1}`,`مقدار ${index+1}`]))};
 const html=renderToStaticMarkup(React.createElement(View,{specifications}));
 assert.equal((html.match(/<dt\b/g)||[]).length,6);assert.equal((html.match(/<dd\b/g)||[]).length,6);
 assert.match(html,/مقدار 6/);assert.doesNotMatch(html,/مقدار 7|مقدار 8/);
 assert.match(html,/dir="rtl"/);assert.match(html,/grid-cols-3/);assert.match(html,/line-clamp-3/);assert.match(html,/title="مقدار 1"/);
});
test("main specifications keep the weight visible while the other cells are loading", () => {
  const View = harness().load("components/detail/product-key-specifications").default;
  const specifications = { Weight: "0.19" };
  const render = (pending) => renderToStaticMarkup(React.createElement(View, { specifications, pending }));
  const partial = render(true);
  assert.match(partial, /<dd[^>]*title="0.19"[^>]*>0.19<\/dd>/);
  assert.match(partial, /aria-busy="true"/);
  assert.equal((partial.match(/<div aria-hidden="true"/g) || []).length, 5);
  const settled = render(false);
  assert.match(settled, /0.19/);
  assert.doesNotMatch(settled, /aria-busy|role="status"|aria-hidden/);
});
test('Toman pricing uses the public endpoint, normalized slug and validates money without treating null as zero',async()=>{
 const calls=[];let response={slug:'محصول',currency:'TOMAN',price:{final_amount_toman:'1514660',original_amount_toman:null,ladder_price:[{min_quantity:1,max_quantity:1,amount_toman:'0'}]}};
 const h=harness({'@/shared/api':{httpGet:async(...args)=>{calls.push(args);return response;}}});
 const service=h.load('services/product-toman-pricing');
 const options=service.productTomanPricingOptions(encodeURIComponent('محصول'),'revision-1');
 const signal=new AbortController().signal;
 const data=await options.queryFn({signal});
 assert.equal(calls[0][0],'/api/product/'+encodeURIComponent('محصول')+'/pricing/');
 assert.equal(calls[0][1].signal,signal);assert.equal(calls[0][1].headers.Authorization,false);assert.equal(calls[0][1].withCredentials,false);
 assert.equal(data.final_amount_toman,1514660);assert.equal(data.original_amount_toman,null);assert.equal(data.ladder_price[0].amount_toman,0);
 assert.equal(service.productTomanPricingOptions('').enabled,false);
 assert.notDeepEqual(options.queryKey,service.productTomanPricingOptions('محصول','revision-2').queryKey);
 response={...response,slug:'other'};await assert.rejects(options.queryFn({signal}),/شناسه/);
 response={...response,slug:'محصول',price:{final_amount_toman:'invalid'}};await assert.rejects(options.queryFn({signal}));
});

test('Toman quantity ladders match boundaries rather than API order and preserve original discounted prices',()=>{
 const service=harness({'@/shared/api':{httpGet:()=>{}}}).load('services/product-toman-pricing');
 const pricing={ladder_price:[{min_quantity:10,max_quantity:null,amount_toman:700,original_amount_toman:900},{min_quantity:1,max_quantity:9,amount_toman:1000,original_amount_toman:1100}]};
 assert.equal(service.findTomanPriceTier(pricing,1,9).amount_toman,1000);
 assert.equal(service.findTomanPriceTier(pricing,10,null).amount_toman,700);
 assert.equal(service.findTomanPriceTier(pricing,1,null),undefined);
 assert.equal(service.findTomanPriceTier(pricing,null,null),undefined);
 const Price=harness().load('components/detail/product-price-section').default;
 const html=renderToStaticMarkup(React.createElement(Price,{amount:20,amountToman:1000,tiers:[{amount:20,currency:'CNY',amountToman:1000,originalToman:1100,label:'1-9'},{amount:15,currency:'CNY',amountToman:700,label:'10+'}]}));
 assert.match(html,/۱٬۰۰۰/);assert.match(html,/<del\b/);assert.match(html,/۱٬۱۰۰/);
});
test('thumbnail hover scroll runs at either edge and stops on leaving, blur, touch and disposal',()=>{
 const {attachThumbnailHoverScroll}=harness().load('utils/thumbnail-hover-scroll');
 const target=()=>{const listeners=new Map();return {addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),fire:(name,event={})=>listeners.get(name)?.(event),listeners};};
 const host=target(),view=target(),doc=target();const frames=new Map();let id=0,reduced=false;
 Object.assign(view,{requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),matchMedia:()=>({matches:reduced})});
 Object.assign(doc,{defaultView:view,visibilityState:'visible'});
 const container={parentElement:host,ownerDocument:doc,scrollTop:100,scrollHeight:600,clientHeight:260,firstElementChild:{getBoundingClientRect:()=>({height:56})},getBoundingClientRect:()=>({top:10,height:260})};
 const cleanup=attachThumbnailHoverScroll(container);
 const move=(y,type='mouse')=>host.fire('pointermove',{clientY:y,pointerType:type});
 const tick=time=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time));};
 move(260);tick(0);tick(50);assert.equal(container.scrollTop,106);
 move(20);tick(100);assert.equal(container.scrollTop,100);
 move(140);assert.equal(frames.size,0);
 move(260);host.fire('pointerleave');assert.equal(frames.size,0);
 move(260);view.fire('blur');assert.equal(frames.size,0);
 move(260,'touch');assert.equal(frames.size,0);
 reduced=true;move(260);assert.equal(frames.size,0);reduced=false;
 container.scrollTop=339;move(260);tick(200);tick(250);assert.equal(container.scrollTop,340);assert.equal(frames.size,0);
 container.scrollTop=100;move(260);doc.visibilityState='hidden';doc.fire('visibilitychange');assert.equal(frames.size,0);
 move(260);cleanup();assert.equal(frames.size,0);assert.equal(host.listeners.size,0);assert.equal(view.listeners.size,0);assert.equal(doc.listeners.size,0);
});
test('gallery hover zoom follows mouse position, clamps its origin and clears for touch or exit',()=>{
 const {updateGalleryHoverZoom:update,clearGalleryHoverZoom:clear}=harness().load('utils/gallery-hover-zoom');
 const properties={};const target={dataset:{},style:{setProperty:(key,value)=>{properties[key]=value;}},getBoundingClientRect:()=>({left:100,top:50,width:400,height:200})};
 const move=(x,y,pointerType='mouse')=>update({currentTarget:target,clientX:x,clientY:y,pointerType});
 move(200,200);assert.equal(properties['--zoom-x'],'25%');assert.equal(properties['--zoom-y'],'75%');assert.equal(target.dataset.zoom,'true');
 move(-10,800);assert.equal(properties['--zoom-x'],'0%');assert.equal(properties['--zoom-y'],'100%');
 clear({currentTarget:target});assert.equal(target.dataset.zoom,undefined);
 move(300,100);move(300,100,'touch');assert.equal(target.dataset.zoom,undefined);
 move(300,100,'pen');assert.equal(target.dataset.zoom,undefined);
});
test('prohibited import always shows an explanation without retry even if older product data exists',()=>{
 const h=harness({
  'next/navigation':{useRouter:()=>({replace:()=>{}})},
  '../hooks/use-single-product-import':{useSingleProductImport:()=>({product:{hasData:true,settled:true},isProhibited:true,canRetry:false,error:'این محصول مجاز نیست',retry:()=>assert.fail('no retry'),isRetrying:false})},
  '@/features/product/components/detail/product-details-error':{default:'mock-error'},
  '@/features/product/components/detail/product-detail-skeleton':{default:'mock-skeleton'},
  '../../product/components/detail/marketplace-product-details-view':{default:'mock-view'},
 });
 const Page=h.load('../importer/components/single-product-import-page').default;
 const view=Page({jobId:3080});assert.equal(view.type,'mock-error');assert.equal(view.props.onRetry,undefined);assert.match(view.props.title,/قابل نمایش نیست/);
 const ErrorView=harness({'@/components/ui/button':{Button:props=>React.createElement('button',props)}}).load('components/detail/product-details-error').default;
 const html=renderToStaticMarkup(React.createElement(ErrorView,{message:'این محصول مجاز نیست',title:'این محصول قابل نمایش نیست',onBack:()=>{},isRetrying:false}));
 assert.doesNotMatch(html,/تلاش دوباره/);assert.match(html,/بازگشت به نتایج/);assert.match(html,/این محصول قابل نمایش نیست/);
});
test('shipping cost sends slug and quantity to the public API and retains null costs and genuine zero',async()=>{
 const calls=[];
 const response={currency:'TOMAN',land:{china_total_yuan:'1159.8',china_total_toman:'46693548',iranmobix_services_toman:'1400806',insurance_toman:'2801613',clearance_toman:'2334677',international_shipping_toman:'0',total_toman:'59202444'},sea:{china_total_toman:'46693548',international_shipping_toman:null,total_toman:null},air:{assigned_sales_expert:{id:1,name:'Expert',mobile:'09134464043',email:'expert@example.com'}}};
 const h=harness({'@/shared/api':{httpGet:async(...args)=>{calls.push(args);return response;}}});
 const service=h.load('services/product-shipping-cost');const options=service.productShippingCostOptions(encodeURIComponent('محصول'),10);
 const signal=new AbortController().signal;const data=await options.queryFn({signal});
 assert.equal(calls[0][0],'/api/product/'+encodeURIComponent('محصول')+'/shipping-cost/');assert.equal(calls[0][1].params.quantity,10);assert.equal(calls[0][1].signal,signal);
 assert.equal(calls[0][1].headers.Authorization,false);assert.equal(calls[0][1].withCredentials,false);
 assert.equal(data.land.total_toman,59202444);assert.equal(data.land.international_shipping_toman,0);assert.equal(data.sea.total_toman,null);assert.equal(data.air.assigned_sales_expert.mobile,'09134464043');
 assert.notDeepEqual(options.queryKey,service.productShippingCostOptions('محصول',1).queryKey);
 for(const quantity of [0,-1,1.5,NaN])assert.equal(service.productShippingCostOptions('item',quantity).enabled,false);
 assert.equal(service.productShippingCostOptions('',1).enabled,false);
});

test("import price queries stop polling after success and keep the quote fresh", () => {
  let options;
  const h = harness({
    react: { useState: (initial) => [initial, () => {}], useEffect: () => {} },
    "@tanstack/react-query": {
      queryOptions: (value) => value,
      useQuery: (value) => {
        options = value;
        return {};
      },
    },
    "@/shared/api": { httpGet: () => {} },
  });
  const { useProductTomanPricing } = h.load("hooks/use-product-toman-pricing");
  const { useProductShippingCost } = h.load("hooks/use-product-shipping-cost");
  for (const request of [
    () => useProductTomanPricing("coffee", "marketplace-details", true, true, true),
    () => useProductShippingCost("coffee", 1, false, "marketplace-details", true, true, true),
  ]) {
    request();
    assert.equal(options.refetchInterval({ state: {} }), 2000);
    assert.equal(options.refetchInterval({ state: { data: {} } }), false);
    assert.equal(options.staleTime, Infinity);
    assert.equal(options.refetchOnReconnect, false);
  }
});

test('shipping requests start at one, debounce rapid changes for 1500ms and pause during empty quantity editing',()=>{
 const state=[];let stateIndex=0,effect,cleanup,options,quote;const timers=new Map();let timerId=0;
 const h=harness({
  react:{useState:initial=>{const index=stateIndex++;if (!(index in state)) state[index]=initial;return [state[index],value=>{state[index]=value;}];},useEffect:fn=>{effect=fn;}},
  window:{setTimeout:(fn,delay)=>{assert.equal(delay,1500);timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)},
  '@tanstack/react-query':{queryOptions:value=>value,useQuery:value=>{options=value;return {data:quote,isPending:!quote,isFetching:!quote};}},
  '@/shared/api':{httpGet:()=>{}},
 });
 const hook=h.load('hooks/use-product-shipping-cost').useProductShippingCost;
 const render=(quantity,editing=false)=>{cleanup?.();stateIndex=0;const result=hook('item',quantity,editing);cleanup=effect();return result;};
 assert.equal(render(1).isRecalculatingQuantity,false);
 quote={currency:'TOMAN'};
 assert.ok(render(1).data);assert.equal(options.enabled,true);assert.equal(options.queryKey[4],1);assert.equal(timers.size,0);
 const updated=render(10);
 assert.equal(updated.isRecalculatingQuantity,true);assert.equal(updated.data,undefined);assert.equal(options.enabled,false);assert.equal(timers.size,1);
 render(100);assert.equal(timers.size,1);assert.equal(options.enabled,false);
 const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());
 assert.ok(render(100).data);
 assert.equal(render(100).isRecalculatingQuantity,false);assert.equal(options.enabled,true);assert.equal(options.queryKey[4],100);
 assert.equal(render(100,true).data,undefined);assert.equal(options.enabled,false);assert.equal(timers.size,0);
 render(200);assert.equal(timers.size,1);render(200,true);assert.equal(timers.size,0);assert.equal(options.enabled,false);
 cleanup?.();
});

test('quantity input can be cleared, accepts Persian digits and clamps incomplete edits on blur',()=>{
 let draft=null,value=1,editing=false;
 const h=harness({
  react:{...React,useId:()=>'quantity',useState:()=>[draft,next=>{draft=next;}]},
  'next/image':{default:'mock-image'},'../../assets/plus1.svg':{default:''},'../../assets/minus.svg':{default:''},
 });
 const Quantity=h.load('components/detail/product-quantity').default;
 const render=()=>Quantity({value,onChange:next=>{value=next;},onEditingChange:next=>{editing=next;},maximum:99,disabled:false,stock:null});
 const input=()=>render().props.children[1].props.children[1];
 input().props.onChange({target:{value:''}});assert.equal(input().props.value,'');assert.equal(value,1);assert.equal(editing,true);
 input().props.onChange({target:{value:'۱۲'}});assert.equal(input().props.value,'12');assert.equal(value,12);assert.equal(editing,false);
 input().props.onChange({target:{value:'1000'}});assert.equal(input().props.value,'1000');assert.equal(value,12);assert.equal(editing,true);
 input().props.onBlur();assert.equal(value,99);assert.equal(editing,false);assert.equal(input().props.value,'99');
 input().props.onChange({target:{value:''}});input().props.onBlur();assert.equal(input().props.value,'99');assert.equal(editing,false);
});

test('shipping tabs show their own breakdown and use the assigned expert instead of a fixed telephone',()=>{
 let selected='ground';
 const h=harness({react:{...React,useId:()=>'shipping',useState:()=>[selected,value=>{selected=value;}]}});
 const Panel=h.load('components/detail/product-purchase-panel').default;
 const shipping={currency:'TOMAN',land:{china_total_toman:100,china_total_yuan:2,insurance_toman:6,iranmobix_services_toman:3,clearance_toman:5,international_shipping_toman:10,total_toman:124},sea:{china_total_toman:100,china_total_yuan:2,insurance_toman:6,iranmobix_services_toman:3,clearance_toman:5,international_shipping_toman:null,total_toman:null},air:{assigned_sales_expert:{name:'فرنوش شفیعی',mobile:'09134464043'}}};
 const render=()=>Panel({quantity:null,submit:null,shipping});
 let view=render(),html=renderToStaticMarkup(view);assert.match(html,/۱۲۴/);assert.match(html,/خدمات ایران‌موبیکس/);
 const labels=["قیمت در چین", "حمل و نقل", "بیمه", "ترخیص", "خدمات ایران‌موبیکس", "قیمت تحویل در ایران"];
 for(let i=1;i<labels.length;i++)assert.ok(html.indexOf(labels[i-1])<html.indexOf(labels[i]));
 view.props.children[0].props.children[1].props.children[0].props.children[0].props.onChange();
 html=renderToStaticMarkup(render());assert.doesNotMatch(html,/۱۲۴/);assert.match(html,/— تومان/);
 selected='express';html=renderToStaticMarkup(render());assert.match(html,/tel:09134464043/);assert.match(html,/فرنوش شفیعی/);assert.doesNotMatch(html,/03136637634/);assert.match(html,/inert=""/);
});
test('expert messaging links preserve the recipient and prefill the current product and quantity safely',()=>{
 const {buildProductInquiryMessage:message,buildExpertChatLink:link}=harness().load('utils/product-expert-chat');
 const text=message({title:'دوربین & کیف',code:'IRM-123',quantity:100,sourceUrl:'https://www.alibaba.com/product-detail/item.html?a=1&b=2'});
 assert.match(text,/دوربین & کیف/);assert.match(text,/IRM-123/);assert.match(text,/تعداد: ۱۰۰ عدد/);assert.match(text,/ارسال هوایی/);assert.match(text,/a=1&b=2/);
 const whatsapp=new URL(link('whatsapp','https://wa.me/989134464043',text));
 assert.equal(whatsapp.pathname,'/989134464043');assert.equal(whatsapp.searchParams.get('text'),text);
 const telegram=new URL(link('telegram','https://t.me/hamkar_city?profile',text));
 assert.equal(telegram.pathname,'/hamkar_city');assert.equal(telegram.searchParams.get('text'),text);assert.equal(telegram.searchParams.has('profile'),false);
 for(const bad of [null,'javascript:alert(1)','https://wa.me.evil.test/989134464043','https://t.me/share/url'])assert.equal(link('whatsapp',bad,text),null);
 assert.equal(link('telegram','https://t.me.evil.test/hamkar_city',text),null);
 assert.doesNotMatch(message({quantity:1,sourceUrl:'javascript:alert(1)'}),/javascript/);
 assert.match(message({quantity:2}),/تعداد: ۲ عدد/);
});

test('shipping response retains the expert social URLs and the air tab renders the three Figma contact icons',async()=>{
 const expert={id:1,name:'فرنوش شفیعی',mobile:'09134464043',email:'Farnooshshafiei899@gmail.com',whatsapp_url:'https://wa.me/989134464043',telegram_url:'https://t.me/hamkar_city'};
 const service=harness({'@/shared/api':{httpGet:async()=>({currency:'TOMAN',land:null,sea:null,air:{assigned_sales_expert:expert}})}}).load('services/product-shipping-cost');
 const shipping=await service.productShippingCostOptions('camera',1).queryFn({signal:new AbortController().signal});
 assert.equal(shipping.air.assigned_sales_expert.whatsapp_url,expert.whatsapp_url);assert.equal(shipping.air.assigned_sales_expert.telegram_url,expert.telegram_url);
 const Panel=harness({react:{...React,useId:()=>'expert',useState:()=>['express',()=>{}]}}).load('components/detail/product-purchase-panel').default;
 const html=renderToStaticMarkup(Panel({quantity:null,submit:null,shipping,inquiry:{title:'دوربین',code:'IRM-123',quantity:5,sourceUrl:'https://example.com/item'}}));
 assert.match(html,/tel:09134464043/);assert.doesNotMatch(html,/mailto:|Farnooshshafiei899@gmail.com/);assert.match(html,/https:\/\/wa.me\/989134464043\?text=/);assert.match(html,/https:\/\/t.me\/hamkar_city\?text=/);assert.match(html,/فرنوش شفیعی/);
});
test('air purchase layout shares the card height and keeps its commercial quantity and express contacts',()=>{
 const Panel=harness({react:{...React,useId:()=>'shipping',useState:()=>['express',()=>{}]}}).load('components/detail/product-purchase-panel').default;
 const view=Panel({quantity:React.createElement('span',null,'QUANTITY_FIELD'),notice:'FORM_NOTICE',submit:React.createElement('button',{disabled:true},'افزودن به سبد خرید'),shipping:{currency:'TOMAN',air:{assigned_sales_expert:{name:'Expert',mobile:'09134464043',whatsapp_url:'https://wa.me/989134464043',telegram_url:'https://t.me/hamkar_city'}}}});
 const html=renderToStaticMarkup(view);
 assert.match(html,/جهت استعلام هزینه‌های ارسال و خدمات با کارشناسان ما تماس بگیرید/);
 assert.equal((html.match(/<a\b/g)||[]).length,3);assert.match(html,/invisible/);assert.match(html,/pointer-events-none/);assert.match(html,/aria-hidden="true" inert=""/);
 assert.doesNotMatch(html,/min-h-\[520px\]|min-h-\[580px\]/);assert.match(html,/col-start-1 row-start-1/);assert.match(html,/<button[^>]*disabled=""/);
});
test('new air contract maps commercial total and nested express expert to their own sections',async()=>{
 const expert={id:3,name:'محدثه امینی',mobile:'09133777103',email:'expert@example.com',whatsapp_url:'https://wa.me/989133777103',telegram_url:null};
 const raw={currency:'TOMAN',product_type:'normal',land:{china_total_yuan:'106.11',china_total_toman:'4219995'},sea:{china_total_yuan:'106.11',china_total_toman:'4219995'},air:{express:{assigned_sales_expert:expert},commercial:{total_toman:1558984}}};
 const service=harness({'@/shared/api':{httpGet:async()=>raw}}).load('services/product-shipping-cost');
 const shipping=await service.productShippingCostOptions('camera',1).queryFn({signal:new AbortController().signal});
 assert.equal(shipping.air.commercial.total_toman,1558984);assert.equal(shipping.air.express.assigned_sales_expert.mobile,expert.mobile);
 const Panel=harness({react:{...React,useId:()=>'shipping',useState:()=>['express',()=>{}]}}).load('components/detail/product-purchase-panel').default;
 const tree=Panel({quantity:React.createElement('input',{'aria-label':'تعداد تجاری'}),submit:null,shipping});
 const html=renderToStaticMarkup(tree);
 assert.match(html,/ارسال هوایی تجاری/);assert.match(html,/ارسال هوایی اکسپرس/);assert.match(html,/۱٬۵۵۸٬۹۸۴/);assert.match(html,/۴٬۲۱۹٬۹۹۵/);
 assert.match(html,/tel:09133777103/);assert.match(html,/wa.me\/989133777103/);assert.doesNotMatch(html,/hamkar_city|09134464043/);
 assert.equal((html.match(/aria-label="تعداد تجاری"/g)||[]).length,1);
 const airSection=tree.props.children[1].props.children[1].props.children[1];
 assert.equal(airSection.props.children[1].props.children[1].props.children.type,'input');
});
test('air modes open only one section and preserve the existing quantity when switching',()=>{
 const state=['express','commercial'];let index=0;
 const Panel=harness({react:{...React,useId:()=>'air-mode',useState:()=>{const position=index++;return [state[position],value=>{state[position]=value;}];}}}).load('components/detail/product-purchase-panel').default;
 const quantity=React.createElement('input',{value:12,readOnly:true});
 const render=()=>{index=0;return Panel({quantity,submit:null}).props.children[1].props.children[1].props.children[1];};
 let air=render();let commercial=air.props.children[1],express=air.props.children[2].props.children[1];
 assert.equal(commercial.props.hidden,false);assert.equal(express.props.hidden,true);
 assert.equal(commercial.props.children[1].props.children,quantity);
 air.props.children[2].props.children[0].props.children[0].props.onChange();
 air=render();commercial=air.props.children[1];express=air.props.children[2].props.children[1];
 assert.equal(commercial.props.hidden,true);assert.equal(express.props.hidden,false);
 air.props.children[0].props.children[0].props.onChange();air=render();
 assert.equal(air.props.children[1].props.hidden,false);assert.equal(air.props.children[2].props.children[1].props.hidden,true);
 assert.equal(air.props.children[1].props.children[1].props.children,quantity);
});
test('import seller preview reuses the carousel and card, keeps arrow navigation and disables placeholder detail requests',()=>{
 const scrolls=[];const api={canScrollPrev:()=>true,canScrollNext:()=>true,scrollPrev:jump=>scrolls.push(['prev',jump]),scrollNext:jump=>scrolls.push(['next',jump])};
 const h=harness({
  react:{...React,useId:()=>'seller-carousel',useCallback:fn=>fn,useSyncExternalStore:(_,snapshot)=>snapshot()},
  'embla-carousel-react':{default:()=>[()=>{},api]},
  '../../product-card/product-card':{default:'mock-shared-product-card'},
  window:{matchMedia:()=>({matches:false})},
 });
 const products=h.load('../importer/mocks/import-other-sellers.mock').importOtherSellersMock;
 const Carousel=h.load('components/detail/similar-products/similar-products-carousel').default;
 const preview=Carousel({products,title:'دیگر فروشندگان این کالا',compactMobile:true,previewOnly:true,wideLayout:true});
 const track=preview.props.children[1].props.children[0].props.children;
 assert.equal(track.props.children.length,8);assert.equal(new Set(track.props.children.map(slide=>slide.key)).size,8);
 for(const slide of track.props.children) {assert.equal(slide.props.children.type,'mock-shared-product-card');assert.equal(slide.props.children.props.detailsDisabled,true);slide.props.children.props.onDetailsClick();}
 preview.props.children[1].props.children[1].props.onClick();preview.props.children[1].props.children[2].props.onClick();
 assert.deepEqual(scrolls,[['prev',false],['next',false]]);
 const regular=Carousel({products,compactMobile:true});
 const card=regular.props.children[1].props.children[0].props.children.props.children[0].props.children;
 assert.equal(card.props.detailsDisabled,false);assert.equal(card.props.onDetailsClick,undefined);
 assert.equal(card.props.detailsHref, "/products/" + encodeURIComponent(products[0].slug));
 const sourceUrl = "https://www.alibaba.com/product-detail/watch.html?a=1&b=2";
 const sourceOnly = { ...products[0], slug: "", source: { ...products[0].source, name: "alibaba", url: sourceUrl } };
 const fallback = Carousel({products:[sourceOnly],compactMobile:true});
 const fallbackCard = fallback.props.children[1].props.children[0].props.children.props.children[0].props.children;
 assert.equal(fallbackCard.props.detailsDisabled, false);
 const fallbackUrl = new URL(fallbackCard.props.detailsHref, "https://front.test");
 assert.equal(fallbackUrl.pathname, "/imports/single");
 assert.equal(fallbackUrl.searchParams.get("url"), sourceUrl);
});
test("selected delivery tabs report the exact add-to-cart shipping method", () => {
  const h=harness({react:{...React,useId:()=>"shipping",useState:initial=>[initial,()=>{}]}});
  const Panel=h.load("components/detail/product-purchase-panel").default;
  let selected="ground";
  const render=()=>Panel({quantity:null,submit:null,shippingMethod:selected,onShippingMethodChange:next=>{selected=next;}});
  const methods=render().props.children[0].props.children;
  methods[1].props.children[0].props.children[0].props.onChange();
  assert.equal(selected,"sea");
  methods[2].props.children[0].props.children[0].props.onChange();
  assert.equal(selected,"commercial_air");
  let air=render().props.children[1].props.children[1].props.children[1];
  air.props.children[2].props.children[0].props.children[0].props.onChange();
  assert.equal(selected,"air_express");
  air=render().props.children[1].props.children[1].props.children[1];
  air.props.children[0].props.children[0].props.onChange();
  assert.equal(selected,"commercial_air");
});

test("imported purchase leaves omitted SKU selections to the backend", () => {
  const state=[1,"","",{},false];let cursor=0,slots;
  const h=harness({
    react:{...React,useState:()=>{const index=cursor++;return [state[index],value=>{state[index]=typeof value==="function"?value(state[index]):value;}];}},
    "@/features/cart":{AddToCartButton:"mock-cart-button"},
    "./product-warranty":{default:"mock-warranty"},
    "./product-quantity":{default:"mock-quantity"},
    "./product-color":{default:"mock-color"},
    "./product-sku-attributes":{default:"mock-sku"},
  });
  const Form=h.load("components/detail/product-purchase-form").default;
  const product={slug:"camera",source:"alibaba",marketable:true,inventory:{trackingEnabled:false,marketableNumber:0},price:{attributes:[{name:"color",values:[{value:"Black"},{value:"White"}]},{name:"Size",values:[]}]},colors:[],guarantees:[]};
  const render=()=>{cursor=0;Form({product,shippingMethod:"air_express",renderLayout:value=>{slots=value;return null;}});};
  render();
  assert.equal(slots.submit.props.disabled,false);
  assert.deepEqual(JSON.parse(JSON.stringify(slots.submit.props.payload)),{quantity:1,shipping_method:"air_express"});
  slots.options.props.children[1].props.onChange("color","White");render();
  assert.deepEqual(JSON.parse(JSON.stringify(slots.submit.props.payload)),{quantity:1,shipping_method:"air_express",sku_attributes:{color:"White"}});
});


test("catalog categories and breadcrumb use the dedicated category query instead of product metadata",()=>{
  const stale=page([product(1)]);
  stale.filters={...filters,categories:[{id:99,name:"Outdated product metadata",slug:"old"}]};
  const state=renderController({},{
    data:{pages:[stale]},
    categories:[{id:84,name:"Dedicated API category",slug:""}],
  });
  assert.equal(state.model.filters.categories.length,1);
  assert.equal(state.model.filters.categories[0].id,84);
  assert.equal(state.model.filters.categories[0].name,"Dedicated API category");
  const result=prepare({pages:[stale],query:{category:[84]},categories:state.model.filters.categories});
  assert.equal(result.breadcrumbItems.at(-1).label,"Dedicated API category");
});
test("legacy color and guarantee URL filters no longer affect product queries",()=>{
  const parse=harness().load("utils/product-query").parseProductQuery;
  const query=parse(new URLSearchParams("category=84&colors=1,2&guarantees=iranmobix&sort=newest"));
  assert.equal(query.category[0],84);
  assert.equal("colors" in query,false);
  assert.equal("guarantees" in query,false);
});


test("catalog failure replaces developer controls with one full-page refresh action",()=>{
  let refreshes=0,clicked;
  const h=harness({
    window:{location:{reload:()=>{refreshes++;}}},
    react:{...React,useState:()=>[false,()=>{}]},
    "./product-catalog-unavailable.module.css":{default:new Proxy({}, {get:(_,name)=>String(name)})},
    "@/components/ui/button":{Button:({children,onClick,disabled})=>{clicked=onClick;return React.createElement("button",{onClick,disabled},children);}},
  });
  const ErrorState=h.load("components/product-catalog-unavailable").default;
  const html=renderToStaticMarkup(React.createElement(ErrorState));
  assert.ok(html.includes("تازه‌سازی صفحه"));
  assert.ok(html.includes('role="alert"'));
  assert.ok(!html.includes("دادهٔ نمونه"));
  assert.ok(!html.includes("تلاش دوباره"));
  assert.equal((html.match(/<button/g)||[]).length,1);
  clicked();
  assert.equal(refreshes,1);
});
test("only an initial catalog error selects the graphic; valid empty results retain their existing flow",()=>{
  const noop=()=>null;
  const h=harness({
    "./product-catalog-unavailable":{default:()=>React.createElement("div",{"data-catalog-unavailable":true},"catalog-unavailable")},
    "@/shared/components/breadcrumb/breadcrumb":{default:noop},
    "./product-sort":{default:noop},
    "./product-card/product-card":{default:noop},
    "./product-page-filters":{ProductPageFilters:noop},
    "./product-page-results":{ProductPageResults:noop},
    "./product-mobile-filters":{ProductMobileFilters:noop},
  });
  const View=h.load("components/product-page-view").default;
  const model={...renderController().model,isCatalog:true,isError:true};
  const render=changes=>renderToStaticMarkup(React.createElement(View,{model:{...model,...changes},options:{}}));
  assert.ok(render({}).includes("data-catalog-unavailable"));
  assert.ok(!render({isError:false,products:[]}).includes("data-catalog-unavailable"));
});

test("shared product carousel stops at both boundaries and hides unavailable arrows", () => {
  let previous=false,next=true,options;
  const scrolls=[];
  const api={
    canScrollPrev:()=>previous,canScrollNext:()=>next,
    scrollPrev:()=>scrolls.push("previous"),scrollNext:()=>scrolls.push("next"),
  };
  const h=harness({
    react:{...React,useId:()=>"bounded-carousel",useCallback:fn=>fn,useSyncExternalStore:(_,snapshot)=>snapshot()},
    "embla-carousel-react":{default:value=>{options=value;return [()=>{},api];}},
    "../../product-card/product-card":{default:"mock-card"},
    window:{matchMedia:()=>({matches:false})},
  });
  const products=h.load("../importer/mocks/import-other-sellers.mock").importOtherSellersMock;
  const Carousel=h.load("components/detail/similar-products/similar-products-carousel").default;
  const render=()=>Carousel({products}).props.children[1].props.children;
  let children=render();
  assert.equal(options.loop,false);
  assert.equal(options.containScroll,"trimSnaps");
  assert.equal(options.breakpoints["(min-width: 1024px)"].containScroll,"trimSnaps");
  assert.equal(options.breakpoints["(min-width: 1024px)"].startIndex,0);
  assert.equal(children[1],false);
  assert.ok(children[2]);
  const key=key=>children[0].props.onKeyDown({key,target:api,currentTarget:api,preventDefault(){}});
  key("ArrowRight");key("ArrowLeft");
  assert.deepEqual(scrolls,["next"]);
  const staleNextButton=children[2];
  previous=true;next=false;children=render();
  assert.ok(children[1]);assert.equal(children[2],false);
  staleNextButton.props.onClick();
  key("ArrowLeft");key("ArrowRight");
  assert.deepEqual(scrolls,["next","previous"]);
  previous=false;children=render();
  assert.equal(children[1],false);assert.equal(children[2],false);
});

test("detail breadcrumbs prefer Persian, fall back to English and keep real category links",()=>{
  const build=harness().load("utils/build-product-detail-breadcrumb").buildProductDetailBreadcrumb;
  const product={title:"Generic title",englishTitle:"English product",persianTitle:" ",category:{id:1925,name:"دسته محصول"}};
  let crumbs=build(product);
  assert.equal(crumbs.at(-1).label,"English product");
  assert.equal(crumbs[2].href,"/products?category=1925&sort=newest");
  crumbs=build({...product,persianTitle:" عنوان فارسی "});
  assert.equal(crumbs.at(-1).label,"عنوان فارسی");
  assert.equal(build({title:"Existing native title",category:null}).at(-1).label,"Existing native title");
});

test("progressive import breadcrumbs switch to translated titles without backend-facing messages",()=>{
  const h=harness(),build=h.load("utils/build-product-detail-breadcrumb").buildProductDetailBreadcrumb;
  const map=h.load("mappers/marketplace-product-details.mapper").mapMarketplaceProductDetails;
  const raw={title_en:"English import title",title_fa:"",category:"",slug:"import"};
  const partial=build(map(raw,false));
  assert.equal(partial.at(-1).label,"English import title");
  assert.equal(partial[2].label,"در حال مشخص‌شدن دسته‌بندی…");
  assert.equal(partial[2].href,undefined);
  const settled=build(map(raw,true));
  assert.equal(settled.at(-1).label,"English import title");
  assert.equal(settled[2].label,"دسته‌بندی مشخص نشده");
  const translated=build(map({...raw,title_fa:"نام فارسی محصول",category:"کیف دوربین",category_id:1925},false));
  assert.equal(translated.at(-1).label,"نام فارسی محصول");
  assert.equal(translated[2].label,"کیف دوربین");
  assert.equal(translated[2].href,"/products?category=1925&sort=newest");
  for(const crumbs of [partial,settled,translated]) {
    assert.ok(crumbs.every(item=>!item.label.includes("از بک")));
  }
});

test("mobile specifications show four two-column rows and expand below the table without changing desktop rows",()=>{
  let expanded=false;
  const h=harness({react:{...React,useId:()=>"mobile-specifications",useState:()=>[expanded,value=>{expanded=value;}]}});
  const View=h.load("components/detail/product-specifications").default;
  const product={translatedSpecifications:Object.fromEntries(Array.from({length:6},(_,i)=>["Spec "+i,"Value "+i]))};
  const parts=()=>{
    const tree=View({product}),mobile=tree.props.children[2],desktop=tree.props.children[1];
    return {tree,mobile,button:mobile.props.children[1],
      rows:mobile.props.children[0].props.children.props.children[2].props.children[1],
      desktopRows:desktop.props.children.props.children[2].props.children[1]};
  };
  let state=parts();
  assert.equal(state.rows.length,4);
  assert.equal(state.desktopRows.length,3);
  assert.equal(state.rows[0].props.children.length,2);
  assert.equal(state.rows[0].props.children[0].type,"th");
  assert.equal(state.rows[0].props.children[0].props.scope,"row");
  assert.equal(state.button.props["aria-expanded"],false);
  assert.equal(state.button.props["aria-controls"],"mobile-specifications");
  state.button.props.onClick();state=parts();
  assert.equal(state.rows.length,6);
  assert.equal(state.desktopRows.length,3);
  assert.equal(state.button.props["aria-expanded"],true);
  state.button.props.onClick();assert.equal(parts().rows.length,4);
});

test("mobile specifications omit the expand button for short lists and show a friendly empty message",()=>{
  const h=harness({react:{...React,useId:()=>"short-specifications",useState:()=>[false,()=>{}]}});
  const View=h.load("components/detail/product-specifications").default;
  const short=View({product:{translatedSpecifications:{Material:"Ceramic"}}});
  assert.equal(short.props.children[2].props.children[1],false);
  const empty=renderToStaticMarkup(View({product:{translatedSpecifications:{}}}));
  assert.ok(empty.includes("مشخصاتی برای نمایش ثبت نشده است."));
});

test("main specifications are desktop-only while keeping their original desktop content",()=>{
  const h=harness({"next/image":{default:"mock-image"},"../../assets/star.svg":{default:"/star.svg"}});
  const Content=h.load("components/detail/product-details-content").default;
  const tree=Content({title:"Product",seller:null,pricing:null,specifications:{Weight:"1kg"}});
  const main=tree.props.children.at(-1);
  assert.ok(main.props.className.includes("hidden"));
  assert.ok(main.props.className.includes("lg:block"));
});

function mobilePurchaseHarness() {
  let open=false,method="ground",resetCalls=0,addCalls=0;
  const pass=({children})=>React.createElement("div",null,children);
  const h=harness({
    react:{...React,useRef:()=>({current:null}),useId:()=>"mobile-delivery",useState:()=>[open,value=>{open=value;}],useEffect:()=>{}},
    "radix-ui":{Dialog:{Root:pass,Trigger:pass,Portal:pass,Overlay:pass,Content:pass,Close:pass,Title:"h2",Description:"p"}},
    "@/components/ui/button":{Button:"button"},
    "../../assets/china.svg":{default:"/china.svg"},
    "../../assets/iran.svg":{default:"/iran.svg"},
    "./product-mobile-purchase.module.css":{default:{bar:"purchase-bar",sheet:"purchase-sheet",overlay:"purchase-overlay"}},
    "next/image":{default:"mock-image"},
  });
  const View=h.load("components/detail/product-mobile-purchase").default;
  const quantity=React.createElement("input",{"data-quantity":true,readOnly:true,value:1});
  const submit=React.createElement("button",{onClick:()=>addCalls++},"Real cart submit");
  const shipping={currency:"TOMAN",
    land:{china_total_toman:1000,china_total_yuan:20,total_toman:1500,international_shipping_toman:200,insurance_toman:60,clearance_toman:50,iranmobix_services_toman:30},
    sea:{china_total_toman:1000,china_total_yuan:20,total_toman:1700,international_shipping_toman:400,insurance_toman:60,clearance_toman:50,iranmobix_services_toman:30},
    air:{commercial:{total_toman:1900},express:{assigned_sales_expert:{name:"Expert",mobile:"09134464043",whatsapp_url:"https://wa.me/989134464043",telegram_url:"https://t.me/expert"}}},
  };
  const render=changes=>View({shipping,shippingMethod:method,onShippingMethodChange:value=>{method=value;},quantity,submit,canOpen:true,onResetQuantityEditing:()=>resetCalls++,...changes});
  const parts=()=>{
    const root=render(),bar=root.props.children[0],content=root.props.children[1].props.children[1];
    return {root,bar,content,trigger:bar.props.children.props.children[1],sections:content.props.children[3].props.children[0].props.children};
  };
  return {render,parts,quantity,submit,shipping,addCalls:()=>addCalls,resetCalls:()=>resetCalls};
}

test("mobile purchase opens its sheet without submitting and keeps only the selected shipping option expanded",()=>{
  const m=mobilePurchaseHarness();
  assert.equal(m.parts().root.props.open,false);
  assert.equal(m.parts().trigger.props.children.props.onClick,undefined);
  m.parts().root.props.onOpenChange(true);
  assert.equal(m.parts().root.props.open,true);
  assert.equal(m.addCalls(),0);
  for(const method of ["sea","commercial_air","air_express","ground"]) {
    const choice=m.parts().sections.find(section=>section.key===method);
    choice.props.children[0].props.children[0].props.onChange();
    const sections=m.parts().sections;
    assert.equal(sections.filter(section=>Boolean(section.props.children[1])).length,1);
    assert.equal(sections.find(section=>section.key===method).props.children[0].props.children[0].props.checked,true);
    const html=renderToStaticMarkup(m.render());
    assert.equal((html.match(/data-quantity/g)||[]).length,method === "air_express" ? 0 : 1);
  }
  m.parts().content.props.children[4].props.children.props.onClick();
  assert.equal(m.addCalls(),1);
  m.parts().root.props.onOpenChange(false);
  assert.equal(m.parts().root.props.open,false);
  assert.equal(m.resetCalls(),5);
});

test("mobile air express uses real expert contacts and quote-only delivery instead of a fabricated total",()=>{
  const m=mobilePurchaseHarness();
  m.parts().sections.find(section=>section.key==="air_express").props.children[0].props.children[0].props.onChange();
  const html=renderToStaticMarkup(m.render());
  assert.ok(html.includes("نیاز به استعلام"));
  assert.ok(html.includes("tel:09134464043"));
  assert.ok(html.includes("https://wa.me/989134464043"));
  assert.ok(html.includes("https://t.me/expert"));
  const disabled=m.render({canOpen:false}).props.children[0].props.children.props.children[1].props.children;
  assert.equal(disabled.props.disabled,true);
});

test("mobile purchase and desktop share one shipping quote and the original quantity and submit slots",()=>{
  const requests=[],shipping={currency:"TOMAN",land:{total_toman:123}};
  const h=harness({
    "../../hooks/use-product-shipping-cost":{useProductShippingCost:(...args)=>{requests.push(args);return {data:shipping,isUpdating:false,isRecalculatingQuantity:false,isError:false,refetch:()=>{}};}},
    "./product-purchase-panel":{default:"desktop-purchase"},
    "./product-mobile-purchase":{default:"mobile-purchase"},
  });
  const View=h.load("components/detail/product-shipping-purchase-panel").default;
  const quantity=React.createElement("input",{readOnly:true,value:3}),submit=React.createElement("button",null,"Submit");
  const props={slug:"camera",quantityValue:3,quantityEditing:false,revision:"stable",quantity,submit,shippingMethod:"sea",mobilePurchase:true};
  const tree=View(props);
  assert.equal(requests.length,1);
  assert.equal(tree.props.children[0].props.className,"hidden lg:block");
  const desktop=tree.props.children[0].props.children,mobile=tree.props.children[1];
  assert.equal(desktop.props.shipping,shipping);
  assert.equal(mobile.props.shipping,shipping);
  assert.equal(mobile.props.quantity,quantity);
  assert.equal(mobile.props.submit,submit);
  assert.equal(mobile.props.shippingMethod,"sea");
  assert.equal(View({...props,mobilePurchase:false}).type,"desktop-purchase");
});

test("image cards always open the single-link import route even when the listing already has a slug", () => {
  const opens=[];
  const card={...product(1),source:{name:"alibaba",label:"Alibaba",url:"https://www.alibaba.com/product-detail/Fan_1600000000000.html"}};
  const grouped={requested:[card],suggested:[],candidatesByProductId:new Map(),candidateJobIdsByProductId:new Map()};
  const h=harness({
    react:{...React,useMemo:fn=>fn(),useEffect:()=>{},useState:()=>["",()=>{}]},
    "next/navigation":{useRouter:()=>({replace:()=>assert.fail("image search must not redirect before selection")})},
    "../hooks/use-import-results":{useImportResults:()=>({query:{data:{status:"processing",import_type:"image",ready_for_frontend:true}},grouped,hasNextPage:false})},
    "@/features/product/components/product-page":{default:"mock-product-page"},
    "@/features/product/components/product-grid/product-grid-skeleton":{default:"mock-skeleton"},
    "@/features/product/utils/product-path":harness().load("utils/product-path"),
    "@/features/product/utils/product-navigation":{openProductDetailsTab:href=>opens.push(href)},
    "@/components/ui/button":{Button:"button"},
  });
  const element=h.load("../importer/components/import-results-page").default({jobId:"10789",imageSearch:true});
  assert.equal(element.props.importedProducts.length,1);
  assert.equal(element.props.discoveryProducts,undefined);
  const href=element.props.getProductDetailsLink(card);
  assert.equal(new URL(href,"https://front.test").pathname,"/imports/single");
  assert.equal(new URL(href,"https://front.test").searchParams.get("url"),card.source.url);
  element.props.onProductDetailsClick(card);assert.deepEqual(opens,[href]);
});

test("applying, sorting and clearing filters preserves the image search job", () => {
  const urls=[];const search=new URLSearchParams("image_job=10789&category=1925");
  const h=harness({
    react:{...React,useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:()=>{},useRef:value=>({current:value}),useState:value=>[value,()=>{}]},
    "next/navigation":{useRouter:()=>({replace:url=>urls.push(url)}),usePathname:()=>"/products",useSearchParams:()=>search},
  });
  const state=h.load("hooks/use-product-query").useProductQuery();
  state.applyQuery();state.setSort("price_asc");state.resetQuery();
  assert.equal(urls.length,3);
  for(const url of urls) assert.equal(new URL(url,"https://front.test").searchParams.get("image_job"),"10789");
  assert.equal(new URL(urls[2],"https://front.test").searchParams.has("category"),false);
});

test("main specifications prioritize weight, package and CBM before attributes and specification fallback", () => {
  const build = harness().load("utils/build-main-specifications").buildMainSpecifications;
  const result = build("1.05", {Material: "Ceramic", Feature: "Reusable", Weight: "99", single_package_size: "duplicate"}, {
    singlePackageSize: "10.0 × 10.0 × 10.0 cm", cbm: 0.001,
    specifications: {Material: "Duplicate", Color: "Black", Extra: "Ignored"},
  });
  assert.deepEqual(Object.keys(result), ["وزن", "ابعاد بسته‌بندی", "حجم بسته (CBM)", "Material", "Feature", "Color"]);
  assert.equal(result["وزن"], "1.05 کیلوگرم");
  assert.equal(result["حجم بسته (CBM)"], "0.001 مترمکعب");
  assert.equal(result["ابعاد بسته‌بندی"], "10.0 × 10.0 × 10.0 cm");
  const partial = build(null, {Material: "Bamboo", Empty: ""}, {specifications: {Color: "Black", Feature: "Reusable", Shape: "Round", Origin: "CN", Model: "A", Extra: "No"}});
  assert.equal(Object.keys(partial).length, 6);
  assert.equal(partial.Extra, undefined);
  assert.equal(build(0, {}, {cbm: "0"})["وزن"], "0 کیلوگرم");
  assert.equal(build(-1, {}, {cbm: -1})["وزن"], undefined);
});

test("main specification card always reserves six cells after processing completes", () => {
  const View = harness().load("components/detail/product-key-specifications").default;
  for (const specifications of [{}, {Material: "Bamboo"}]) {
    const html = renderToStaticMarkup(React.createElement(View, {specifications, pending: false}));
    assert.equal((html.match(/<dt\b/g) || []).length, 6);
    assert.equal((html.match(/<dd\b/g) || []).length, 6);
    assert.doesNotMatch(html, /aria-busy|role="status"|animate-pulse/);
  }
});

test("commercial_air is authoritative for China and Iran prices, including null delivery costs", async () => {
  const raw = {currency: "TOMAN",
    commercial_air: {clearance_toman: "0", iranmobix_services_toman: "0", insurance_toman: "0", china_total_yuan: "178.81", china_total_toman: "7882000", international_shipping_toman: null, total_toman: null, rate_per_kg_yuan: "98", billable_weight_kg: null, shipping_yuan: null, assigned_sales_expert: null},
    land: {china_total_toman: "1234", china_total_yuan: "22"},
    air: {commercial: {total_toman: "9999"}},
  };
  const service = harness({"@/shared/api": {httpGet: async () => raw}}).load("services/product-shipping-cost");
  const shipping = await service.productShippingCostOptions("camera", 1).queryFn({signal: new AbortController().signal});
  assert.equal(shipping.commercial_air.rate_per_kg_yuan, 98);
  assert.equal(shipping.commercial_air.total_toman, null);
  const resolve = harness().load("utils/product-commercial-air-cost").getCommercialAirCost;
  assert.equal(resolve(shipping).chinaToman, 7882000);
  assert.equal(resolve(shipping).chinaYuan, 178.81);
  assert.equal(resolve(shipping).total, null);
  const mobile = mobilePurchaseHarness();
  const html = renderToStaticMarkup(mobile.render({shipping, shippingMethod: "commercial_air"}));
  assert.match(html, /۷٬۸۸۲٬۰۰۰/);
  assert.doesNotMatch(html, /۹٬۹۹۹|۱٬۲۳۴/);
  shipping.commercial_air.total_toman = 0;
  assert.equal(resolve(shipping).total, 0);
});

test("text and category submissions use discover and keep the original input in the results tab", async () => {
  for (const input of ["wireless headphones", "https://www.alibaba.com/catalog/headphones.html", "https://supplier.en.alibaba.com/"]) {
    const requests = [], errors = [], calls = [];
    let stateIndex = 0;
    const service = harness({"@/shared/api": {}}).load("../importer/services/importer.service");
    const h = harness({
      react: {...React, useRef: () => ({current:false}), useState: () => [stateIndex++ === 0 ? input : "", value => errors.push(value)]},
      "next/navigation": {useRouter: () => ({push: () => {}})},
      "next/image": {default:"mock-image"}, "radix-ui": {Popover:{Trigger:"mock-trigger"}},
      "./import-image-search": {ImportImageSearch:"mock-image-search"}, "@/components/ui/input": {Input:"mock-input"},
      "@/features/header/assets/search.svg": {}, "@/features/header/assets/camera.svg": {},
      "../services/importer.service": {...service, importerService:{discover: payload => {requests.push(payload); return Promise.resolve({job_id:10801});}}},
      "../services/import-search-navigation": {runImportSearch: async options => {calls.push(options); await options.request();}},
      "@/shared/api": {},
      window: {open: () => assert.fail("only the navigation helper opens discovery tabs")},
    });
    const Header = h.load("../importer/components/import-header-input").default;
    const form = Header({}).props.children[0].props.children;
    await form.props.onSubmit({preventDefault(){}});
    assert.deepEqual(JSON.parse(JSON.stringify(requests)), [{input}]);
    const route = new URL(calls[0].resultsPath(10801), "https://front.test");
    assert.equal(route.pathname, "/products");
    assert.equal(route.searchParams.get("search_job"), "10801");
    assert.equal(route.searchParams.get("search_input"), input);
    assert.equal(errors.some(value => typeof value === "string" && value.trim()), false);
  }
});

test("discovery results reuse the product list and import a chosen card by its original URL", () => {
  const source = "https://www.alibaba.com/product-detail/Watch_123.html";
  const card = {...product(1), slug:"watch", source:{name:"alibaba",label:"Alibaba",url:source}};
  const opens = [];
  const h = harness({
    react:{...React,useMemo:fn=>fn(),useEffect:()=>{},useState:()=>["",()=>{}]},
    "next/navigation":{useRouter:()=>({replace:()=>assert.fail("discovery must keep the result list")})},
    "../hooks/use-import-results":{useImportResults:()=>({
      query:{data:{id:10801,status:"processing",ready_for_frontend:true,listing_search:true,import_type:"search"},isError:false,isPending:false},
      grouped:{requested:[card],suggested:[],candidatesByProductId:new Map(),candidateJobIdsByProductId:new Map()},
    })},
    "@/features/product/components/product-page":{default:"shared-product-page"},
    "@/features/product/components/product-grid/product-grid-skeleton":{default:"mock-skeleton"},
    "@/features/product/utils/product-path":harness().load("utils/product-path"),
    "@/features/product/utils/product-navigation":{openProductDetailsTab:path=>opens.push(path)},
    "@/components/ui/button":{Button:"button"},
  });
  const page = h.load("../importer/components/import-results-page").default({jobId:"10801",discoverySearch:true});
  assert.equal(page.type,"shared-product-page");
  assert.equal(page.props.importedProducts.length,1);
  assert.equal(page.props.discoveryProducts,undefined);
  const href=page.props.getProductDetailsLink(card);
  assert.equal(new URL(href,"https://front.test").pathname,"/imports/single");
  assert.equal(new URL(href,"https://front.test").searchParams.get("url"),source);
  page.props.onProductDetailsClick(card);
  assert.deepEqual(opens,[href]);
});

test("discovery filtering and reset retain both the job and its original input", () => {
  const urls=[], search=new URLSearchParams("search_job=10801&search_input=headphones&category=1925");
  const h=harness({
    react:{...React,useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:()=>{},useRef:value=>({current:value}),useState:value=>[value,()=>{}]},
    "next/navigation":{useRouter:()=>({replace:url=>urls.push(url)}),usePathname:()=>"/products",useSearchParams:()=>search},
  });
  const state=h.load("hooks/use-product-query").useProductQuery();
  state.applyQuery();state.setSort("price_asc");state.resetQuery();
  for(const url of urls) {
    const params=new URL(url,"https://front.test").searchParams;
    assert.equal(params.get("search_job"),"10801");
    assert.equal(params.get("search_input"),"headphones");
  }
});
