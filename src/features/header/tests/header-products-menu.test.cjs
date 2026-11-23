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
    new Function("require","module","exports","document","setTimeout","clearTimeout",code)(localRequire,loaded,loaded.exports,overrides.document,overrides.timers?.setTimeout??setTimeout,overrides.timers?.clearTimeout??clearTimeout);
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
    react:{...React,useState:initial=>{const index=stateIndex++;return index===0?[true,()=>{}]:[index===2?(state.search??initial):initial,()=>{}];}},
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

test("category search finds nested matches, preserves ancestors and does not mutate cached data",()=>{
  const h=harness();
  const {buildProductCategoryTree}=h.load("features/product/services/product-navigation-categories");
  const {filterHeaderCategories}=h.load("features/header/utils/header-category-search");
  const tree=buildProductCategoryTree(fixture), before=JSON.stringify(tree);
  const result=filterHeaderCategories(tree,"grandchild");
  assert.deepEqual(result.map(c=>c.id),[101]);
  assert.equal(result[0].children[0].children[0].id,987);
  assert.deepEqual(filterHeaderCategories(tree,"Parent"),[tree[0]]);
  assert.equal(filterHeaderCategories(tree,"   "),tree);
  assert.equal(filterHeaderCategories(tree,"unmatched").length,0);
  assert.equal(JSON.stringify(tree),before);
});

test("Persian category search normalizes Arabic letters, whitespace and diacritics",()=>{
  const {filterHeaderCategories}=harness().load("features/header/utils/header-category-search");
  const tree=[{id:1,name:"تجهیزات بازی و گیمینگ",children:[{id:2,name:"کُنسول‌های بازی",children:[]}]}];
  assert.equal(filterHeaderCategories(tree,"كنسول هاي")[0].children[0].id,2);
  assert.equal(filterHeaderCategories(tree,"گیمینگ تجهیزات")[0].id,1);
});

test("category data stays cached for the session without focus, reconnect or mount refetch",async(t)=>{
  const h=harness({response:fixture}),client=new QueryClient();
  t.after(()=>client.clear());
  const options=h.load("features/product/services/product-navigation-categories").productNavigationCategoriesOptions();
  assert.equal(options.staleTime,Infinity);
  assert.equal(options.gcTime,Infinity);
  assert.equal(options.refetchOnWindowFocus,false);
  assert.equal(options.refetchOnReconnect,false);
  assert.equal(options.refetchOnMount,false);
  await client.fetchQuery(options);
  client.setQueryData(options.queryKey,data=>data,{updatedAt:Date.now()-24*60*60_000});
  await client.fetchQuery(options);
  assert.equal(h.requests.length,1);
});

function interactiveMenu() {
  const states=[],refs=[],timers=new Map(),document={activeElement:null};
  let stateIndex=0,refIndex=0,id=0,effect;
  const h=harness({
    document,
    timers:{setTimeout:callback=>{timers.set(++id,callback);return id;},clearTimeout:id=>timers.delete(id)},
    modules:{
      react:{...React,
        useState:initial=>{const index=stateIndex++;if(!(index in states))states[index]=initial;return [states[index],value=>{states[index]=typeof value==="function"?value(states[index]):value;}];},
        useRef:initial=>{const index=refIndex++;return refs[index]??(refs[index]={current:initial});},
        useEffect:callback=>{effect??=callback;},
      },
      "@tanstack/react-query":{...require("@tanstack/react-query"),useQuery:()=>({data:[],isPending:false,isError:false})},
      "radix-ui":{Popover:{Root:"root",Trigger:"trigger",Portal:"portal",Content:"content"}},
    },
  });
  const Menu=h.load("features/header/components/header-products-menu").HeaderProductsMenu;
  const render=(props={})=>{stateIndex=0;refIndex=0;return Menu(props);};
  render();const cleanup=effect();
  const parts=()=>{const root=render();return {root,trigger:root.props.children[0].props.children,content:root.props.children[1].props.children};};
  return {render,parts,timers,document,refs,cleanup,flush:()=>{const pending=[...timers.values()];timers.clear();pending.forEach(callback=>callback());}};
}

test("mouse hover opens products and crossing into the panel cancels delayed closing",()=>{
  const m=interactiveMenu();
  m.parts().trigger.props.onPointerEnter({pointerType:"touch"});
  assert.equal(m.parts().root.props.open,false);
  m.parts().trigger.props.onPointerEnter({pointerType:"mouse"});
  assert.equal(m.parts().root.props.open,true);
  let prevented=0;
  m.parts().content.props.onOpenAutoFocus({preventDefault:()=>prevented++});
  assert.equal(prevented,1);
  m.parts().trigger.props.onPointerLeave({pointerType:"mouse"});
  assert.equal(m.timers.size,1);
  m.parts().content.props.onPointerEnter();
  assert.equal(m.timers.size,0);
  m.flush();assert.equal(m.parts().root.props.open,true);
  m.parts().content.props.onPointerLeave({pointerType:"mouse"});
  m.flush();assert.equal(m.parts().root.props.open,false);
  m.cleanup();
});

test("click and keyboard opening preserve autofocus, focused search stays open, and timers clean up",()=>{
  const m=interactiveMenu();
  m.parts().root.props.onOpenChange(true);
  let prevented=0;
  m.parts().content.props.onOpenAutoFocus({preventDefault:()=>prevented++});
  assert.equal(prevented,0);
  const input={};m.document.activeElement=input;
  m.refs[1].current={contains:node=>node===input};
  m.parts().content.props.onPointerLeave({pointerType:"mouse"});
  m.flush();assert.equal(m.parts().root.props.open,true);
  m.parts().root.props.onOpenChange(false);
  assert.equal(m.parts().root.props.open,false);
  m.parts().trigger.props.onPointerLeave({pointerType:"mouse"});
  assert.equal(m.timers.size,1);
  m.cleanup();assert.equal(m.timers.size,0);
  const mobile=m.render({mobile:true});
  assert.equal(mobile.props.children[0].props.onPointerEnter,undefined);
});
