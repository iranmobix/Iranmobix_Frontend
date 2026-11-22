/* eslint-disable @typescript-eslint/no-require-imports -- Transpile local TS modules with isolated API boundaries. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ts=require("typescript");
const React=require("react");
const {renderToStaticMarkup}=require("react-dom/server");
const {QueryClient}=require("@tanstack/react-query");
function harness(overrides={}) {
  const base=path.resolve(__dirname,"../../.."), cache=new Map(), requests=[];
  function load(file) {
    const root=path.resolve(base,file);
    const full=[root,root+".ts",root+".tsx"].find(candidate=>fs.existsSync(candidate));
    if(cache.has(full))return cache.get(full).exports;
    const loaded={exports:{}};cache.set(full,loaded);
    const code=ts.transpileModule(fs.readFileSync(full,"utf8"),{compilerOptions:{
      module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,
    }}).outputText;
    const localRequire=name=>{
      if(overrides.modules && name in overrides.modules)return overrides.modules[name];
      if(name==="@/shared/api")return {httpGet:async(url,config)=>{
        requests.push({url,config});return overrides.response??[];
      }};
      if(name.startsWith("@/"))return load(name.slice(2));
      if(name.startsWith("."))return load(path.resolve(path.dirname(full),name));
      return require(name);
    };
    new Function("require","module","exports",code)(localRequire,loaded,loaded.exports);
    return loaded.exports;
  }
  return {load,requests};
}
const fixture=[
  {id:101,name:"Parent",parent_id:null},
  {id:234,name:"Child",parent_id:101},
  {id:987,name:"Grandchild",parent_id:234},
  {id:555,name:"Independent",parent_id:null},
];
test("navigation preserves public IDs and nests categories by parent_id",()=>{
  const {buildProductCategoryTree,productNavigationCategoriesSchema}=harness().load("features/product/services/product-navigation-categories");
  const tree=buildProductCategoryTree(productNavigationCategoriesSchema.parse(fixture));
  assert.deepEqual(tree.map(c=>c.id),[101,555]);
  assert.equal(tree[0].children[0].id,234);
  assert.equal(tree[0].children[0].children[0].id,987);
  assert.ok(!("children" in fixture[0]));
  assert.equal(productNavigationCategoriesSchema.safeParse([...fixture,fixture[0]]).success,false);
});
test("orphan and cyclic parents cannot hide categories or recurse forever",()=>{
  const {buildProductCategoryTree}=harness().load("features/product/services/product-navigation-categories");
  const tree=buildProductCategoryTree([
    {id:1,name:"orphan",parent_id:99},
    {id:2,name:"cycle-a",parent_id:3},{id:3,name:"cycle-b",parent_id:2},
    {id:4,name:"self",parent_id:4},
  ]);
  assert.deepEqual(tree.map(c=>c.id),[1,2,3,4]);
  assert.ok(tree.every(c=>c.children.length===0));
});
test("public category API is cached across menu openings and forwards cancellation",async(t)=>{
  const h=harness({response:fixture}),client=new QueryClient();
  t.after(()=>client.clear());
  const {productNavigationCategoriesOptions}=h.load("features/product/services/product-navigation-categories");
  await client.fetchQuery(productNavigationCategoriesOptions());
  await client.fetchQuery(productNavigationCategoriesOptions());
  assert.equal(h.requests.length,1);
  assert.equal(h.requests[0].url,"/api/product/categories/");
  assert.equal(h.requests[0].config.headers.Authorization,false);
  assert.ok(h.requests[0].config.signal instanceof AbortSignal);
});
function menuHarness(state={}) {
  let stateIndex=0;
  const query={
    data:state.data??[],isPending:false,isError:false,refetch:()=>{},
    ...state,
  };
  const passthrough=({children})=>React.createElement("div",null,children);
  const h=harness({modules:{
    react:{...React,useState:()=>stateIndex++===0?[true,()=>{}]:[null,()=>{}]},
    "@tanstack/react-query":{...require("@tanstack/react-query"),useQuery:()=>query},
    "radix-ui":{Popover:{Root:passthrough,Trigger:passthrough,Portal:passthrough,Content:passthrough}},
    "next/link":({href,children,onClick,className})=>React.createElement("a",{href,onClick,className},children),
  }});
  return {h,render:(props)=>renderToStaticMarkup(React.createElement(h.load("features/header/components/header-products-menu").HeaderProductsMenu,props))};
}
test("desktop mega menu links roots and descendants to filtered products and uses a button trigger",()=>{
  const {buildProductCategoryTree}=harness().load("features/product/services/product-navigation-categories");
  const {render}=menuHarness({data:buildProductCategoryTree(fixture)});
  const html=render({});
  assert.ok(html.includes("<button"));
  assert.ok(html.includes("/products?category=101&amp;sort=newest"));
  assert.ok(html.includes("/products?category=234&amp;sort=newest"));
  assert.ok(html.includes("/products?category=987&amp;sort=newest"));
  assert.ok(html.includes("Grandchild"));
});
test("mobile category menu includes expandable parents and shares the same destinations",()=>{
  const {buildProductCategoryTree}=harness().load("features/product/services/product-navigation-categories");
  const {render}=menuHarness({data:buildProductCategoryTree(fixture)});
  const html=render({mobile:true,onNavigate:()=>{}});
  assert.ok(html.includes("<details"));
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes("/products?category=234&amp;sort=newest"));
});
test("loading, API errors and empty categories have explicit states and an all-products escape",()=>{
  for(const state of [{isPending:true},{isError:true},{data:[]}]) {
    const {render}=menuHarness(state), html=render({});
    assert.ok(html.includes('href="/products"'));
    if(state.isPending)assert.ok(html.includes('role="status"'));
    if(state.isError)assert.ok(html.includes('role="alert"'));
    assert.ok(!html.includes("undefined"));
  }
});
