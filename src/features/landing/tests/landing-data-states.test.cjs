/* eslint-disable @typescript-eslint/no-require-imports */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),ts=require("typescript"),React=require("react");
const {renderToStaticMarkup}=require("react-dom/server");
function harness(query={}) {
  const root=path.resolve(__dirname,"../../.."),cache=new Map();
  function load(file) {
    const base=path.resolve(root,file),full=[base,base+".ts",base+".tsx"].find(p=>fs.existsSync(p));
    if(full.endsWith(".json"))return JSON.parse(fs.readFileSync(full,"utf8"));
    if(cache.has(full))return cache.get(full).exports;
    const loaded={exports:{}};cache.set(full,loaded);
    const source=ts.transpileModule(fs.readFileSync(full,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
    const localRequire=name=>{
      if(name==="react")return {...React,useState:initial=>[initial,()=>{}]};
      if(name==="../hooks/use-sales-experts")return {useSalesExperts:()=>query};
      if(name==="./SalesExpertCard")return {SalesExpertCard:({expert})=>React.createElement("div",{"data-expert":expert.id},expert.full_name)};
      if(name==="@/components/ui/button")return {Button:({children,...props})=>React.createElement("button",props,children)};
      if(name==="next/link")return {__esModule:true,default:({children,...props})=>React.createElement("a",props,children)};
      if(name==="next/image")return {__esModule:true,default:({src,priority,...props})=>{void priority;return React.createElement("img",{...props,src:typeof src==="string"?src:src.src});}};
      if(name.endsWith(".svg"))return {__esModule:true,default:{src:"/test-icon.svg",width:20,height:20}};
      if(name.startsWith("@/"))return load(name.slice(2));
      if(name.startsWith("."))return load(path.resolve(path.dirname(full),name));
      return require(name);
    };
    new Function("require","module","exports",source)(localRequire,loaded,loaded.exports);
    return loaded.exports;
  }
  return {load};
}

test("expert loading, errors and empty responses never display invented staff",()=>{
  for(const [query,text,role] of [
    [{isPending:true},"در حال دریافت اطلاعات کارشناسان","status"],
    [{isError:true,refetch:()=>{}},"ارتباط با کارشناسان فعلاً در دسترس نیست","alert"],
    [{data:[]},"اطلاعات کارشناسان به‌زودی نمایش داده می‌شود","status"],
  ]) {
    const Component=harness(query).load("features/sales-experts/components/SalesExpertsSection").SalesExpertsSection;
    const html=renderToStaticMarkup(React.createElement(Component));
    assert.ok(html.includes(text));
    assert.ok(html.includes('role="'+role+'"'));
    assert.ok(!html.includes("data-expert"));
    assert.ok(!html.includes("/images/aks.png"));
  }
});

test("real experts remain visible, including during background refresh failures",()=>{
  const Component=harness({data:[{id:24,full_name:"کارشناس واقعی"}],isError:true}).load("features/sales-experts/components/SalesExpertsSection").SalesExpertsSection;
  const html=renderToStaticMarkup(React.createElement(Component));
  assert.ok(html.includes('data-expert="24"'));
  assert.ok(html.includes("کارشناس واقعی"));
  assert.ok(!html.includes('role="alert"'));
});

test("approved sample reviews retain mobile swipe and the existing desktop card",()=>{
  const Component=harness().load("features/landing/components/trusted-customers/trusted-customers-slider").TrustedCustomersSlider;
  const tree=Component(),mobile=tree.props.children[0],desktop=tree.props.children[1];
  assert.ok(mobile.props.className.includes("overflow-x-auto"));
  assert.ok(mobile.props.className.includes("snap-x"));
  assert.equal(mobile.props.children.props.children.length,3);
  const cards=mobile.props.children.props.children.map(slide=>slide.props.children.props);
  assert.equal(new Set(cards.map(card=>card.comment)).size,3);
  assert.equal(new Set(cards.map(card=>card.mobileAuthor)).size,3);
  assert.ok(desktop.props.className.includes("lg:flex"));
  const html=renderToStaticMarkup(tree);
  assert.ok(html.includes("محمدرضا احمدزاده"));
  assert.ok(!html.includes("شرکت آریا تجارت"));
  assert.ok(!html.includes("در حال حاضر در دسترس نیستند"));
});

test("retry state invokes the supplied real query action",()=>{
  let calls=0;
  const State=harness().load("shared/components/section-data-state").SectionDataState;
  const tree=State({kind:"error",title:"Error",description:"Unavailable",onRetry:()=>calls++});
  tree.props.children.at(-1).props.onClick();
  assert.equal(calls,1);
});

test("missing expert photos use a neutral icon instead of another person's photo",()=>{
  const Card=harness().load("features/sales-experts/components/SalesExpertCard").SalesExpertCard;
  const expert={id:1,full_name:"کارشناس",profile_image:"",telegram_url:"",whatsapp_url:""};
  const html=renderToStaticMarkup(React.createElement(Card,{expert}));
  assert.ok(!html.includes("/images/aks.png"));
  assert.ok(!html.includes('alt="کارشناس"'));
  const withPhoto=renderToStaticMarkup(React.createElement(Card,{expert:{...expert,profile_image:"https://example.com/real.jpg"}}));
  assert.ok(withPhoto.includes("https://example.com/real.jpg"));
});

test("mobile footer includes the centered brand, contact link, social row and the official Enamad seal",()=>{
  const Mobile=harness().load("features/landing/components/Footer/FooterMobile").FooterMobile;
  const html=renderToStaticMarkup(React.createElement(Mobile));
  assert.ok(html.includes("کارگو واردات از چین و امارات"));
  assert.ok(html.includes('href="/contact-us"'));
  assert.ok(html.includes("تماس با ما"));
  assert.ok(html.includes("lg:hidden"));
  assert.equal((html.match(/h-\[120px\]/g)||[]).length,1);
  assert.ok(html.includes("trustseal.enamad.ir/logo.aspx?id=7502693"));
  assert.ok(html.includes("footer-mobile-licenses-title"));
  assert.ok(!html.includes("خیابان شریف واقفی"));
});

test("desktop contact section retains its phone and address",()=>{
  const Contact=harness().load("features/landing/components/Footer/FooterContact").default;
  const html=renderToStaticMarkup(React.createElement(Contact));
  assert.ok(html.includes('href="tel:03136637634"'));
  assert.ok(html.includes("اصفهان، خیابان شریف واقفی"));
  assert.ok(html.includes("iranmobix@gmail.com"));
});
