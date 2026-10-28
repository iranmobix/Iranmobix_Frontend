/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const base = path.resolve(__dirname, "..");
const cache = new Map();
function load(file) {
  let absolute = path.resolve(base, file);
  absolute += fs.existsSync(absolute + ".ts") ? ".ts" : ".tsx";
  if (cache.has(absolute)) return cache.get(absolute);
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    fileName: absolute,
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true},
  }).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, structuredClone, require: (name) => {
    if (name === "next/image") return {__esModule: true, default: ({src,alt}) => React.createElement("img", {src,alt})};
    return name.startsWith(".") ? load(path.relative(base, path.resolve(path.dirname(absolute), name))) : require(name);
  }});
  cache.set(absolute, module.exports);
  return module.exports;
}
const supplier = (changes = {}) => ({id: 1, name: "Supplier", logo: null, location: null,
  rating: null, badges: null, market: null, services: null, companyOverview: null,
  trust: {score: 0, level: "", label: "", verified: false, trusted: false}, ...changes});
const overview = (changes = {}) => ({yearFounded:null, floorspace:null, responseTime:null,
  onTimeDispatchRate:null, onlineRevenue:null, employees:null, mainMarkets:null, serviceQualityControl:null, ...changes});
const component = (name) => load(`components/detail/supplier/${name}`).default;
const render = (name, props) => renderToStaticMarkup(React.createElement(component(name), props));
const helpers = load("components/detail/supplier/productSupplierDetail.constants");

test("missing seller or an entirely empty seller leaves no empty about section", () => {
  assert.equal(render("product-supplier-detail", {product:{seller:null}}), "");
  assert.equal(render("product-supplier-detail", {product:{seller:supplier({name:"  "})}}), "");
});

test("empty company data hides its labels, box, markets, services and rating", () => {
  const html = render("product-supplier-detail", {product:{seller:supplier({companyOverview:overview()})}});
  assert.ok(html.includes("Supplier"));
  for (const absent of ["سال تأسیس", "مساحت", "بازارهای اصلی", "خدمات و کنترل کیفیت", "امتیاز فروشنده", "<dl", "<img", "undefined", "null", "—"]) {
    assert.equal(html.includes(absent), false, absent);
  }
});

test("partial stats only display present values and retain a real zero", () => {
  const stats = helpers.getSupplierStats(overview({yearFounded:"2003", floorspace:" ", employees:"0"}));
  assert.equal(stats.length, 2);
  const html = render("SupplierStats", {stats});
  assert.ok(html.includes("سال تأسیس"));
  assert.ok(html.includes("2003"));
  assert.ok(html.includes("تعداد کارکنان"));
  assert.ok(html.includes(">0<"));
  assert.equal(html.includes("مساحت"), false);
});

test("location, rating and verification render only from actual identity data", () => {
  const html = render("SupplierIdentity", {seller:supplier({logo:"/logo.png", location:"Shenzhen", rating:4.3,
    trust:{score:70, level:"trusted", label:"Trusted", verified:true, trusted:true}})});
  assert.ok(html.includes("/logo.png"));
  assert.ok(html.includes("Shenzhen"));
  assert.ok(html.includes("امتیاز فروشنده"));
  assert.ok(html.includes("فروشنده تأییدشده"));
  assert.equal(html.includes("امتیاز اعتماد"), false);
});

test("invalid ratings are omitted and real zero is not treated as missing", () => {
  for (const rating of [null, NaN, 6, -1]) {
    assert.equal(render("SupplierIdentity", {seller:supplier({rating})}).includes("امتیاز فروشنده"), false);
  }
  assert.ok(render("SupplierIdentity", {seller:supplier({rating:0})}).includes("امتیاز فروشنده"));
});

test("market distribution uses explicit percentages without fabricating missing shares", () => {
  const markets = helpers.getSupplierMarkets(supplier({market:[{name:"Asia",percentage:60},{name:"Europe",percentage:"40%"},null,""]}));
  const html = render("SupplierMarkets", {markets});
  assert.ok(html.includes('role="img"'));
  assert.ok(html.includes("width:60%"));
  assert.ok(html.includes("width:40%"));
  assert.ok(html.includes("Asia"));
  assert.equal(html.includes("سایر"), false);
});

test("market names without percentages render as text and never create an invented chart", () => {
  const markets = helpers.getSupplierMarkets(supplier({market:["Asia", "Europe"]}));
  const html = render("SupplierMarkets", {markets});
  assert.ok(html.includes("Europe"));
  assert.equal(html.includes('role="img"'), false);
  assert.equal(render("SupplierMarkets", {markets:[]}), "");
});

test("empty market/service arrays fall back to company overview and remove empty entries", () => {
  const seller = supplier({market:[], services:[], companyOverview:overview({mainMarkets:"Europe (40%), Asia (60%)", serviceQualityControl:"QA/QC\n\nCustomization"})});
  const markets = helpers.getSupplierMarkets(seller);
  assert.equal(markets.length, 2);
  assert.equal(markets[0].percentage, 40);
  assert.equal(helpers.getSupplierServiceValues(seller).join("|"), "QA/QC|Customization");
  const services = helpers.getSupplierServiceValues(supplier({services:["QA/QC", " ", null, {label:"Customization"}, "QA/QC"]}));
  assert.equal(services.join("|"), "QA/QC|Customization");
  assert.equal(render("SupplierServices", {services:[]}), "");
});

test("seller mapper trims empty text and uses nonempty overview logo/location", () => {
  const map = load("mappers/product-detail-seller.mapper").mapProductDetailSeller;
  const seller = map({...supplier(), logo:" ", location:"", company_overview:{logo:"/logo.png",location:"CN",year_founded:null, floorspace:" "}});
  assert.equal(seller.logo, "/logo.png");
  assert.equal(seller.location, "CN");
  assert.equal(seller.companyOverview.yearFounded, null);
  assert.equal(seller.companyOverview.floorspace, null);
});

test("detail contract accepts null company overview and null fields without rejecting the product", () => {
  const {productDetailResponseSchema} = load("schemas/product-response.schema");
  const fixture = load("mock/product-detail.mock").getProductDetailMock("sample");
  fixture.product.seller.company_overview = null;
  assert.ok(productDetailResponseSchema.safeParse(fixture).success);
  fixture.product.seller.company_overview = {year_founded:null, floorspace:null, response_time:null,
    on_time_dispatch_rate:null, online_revenue:null, employees:null, main_markets:null, service_quality_control:null};
  assert.ok(productDetailResponseSchema.safeParse(fixture).success);
});
