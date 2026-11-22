/* eslint-disable @typescript-eslint/no-require-imports -- Exercise progressive reveal with isolated viewport boundaries. */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
function setup({reduced=false,supported=true,positions=[1200,1300,1400]}={}) {
  let effect,observer;
  const listeners=new Map();
  const items=positions.map(top=>({dataset:{},getBoundingClientRect:()=>({top})}));
  const motion={matches:reduced,addEventListener:(name,callback)=>listeners.set(name,callback),removeEventListener:name=>listeners.delete(name)};
  const window={innerHeight:800,matchMedia:()=>motion};
  if(supported)window.IntersectionObserver=true;
  const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,"../components/services/services-reveal.tsx"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const loaded={exports:{}};
  new Function("require","module","exports","window","IntersectionObserver",source)(
    name=>name==="react"?{useRef:()=>({current:{querySelectorAll:()=>items}}),useEffect:callback=>{effect=callback;}}:name.endsWith(".css")?{}:require(name),
    loaded,loaded.exports,window,
    class {constructor(callback){this.callback=callback;this.observed=new Set();observer=this;}observe(item){this.observed.add(item);}unobserve(item){this.observed.delete(item);}disconnect(){this.observed.clear();this.disconnected=true;}},
  );
  loaded.exports.ServicesReveal({children:"services"});
  const cleanup=effect();
  return {items,observer,motion,listeners,cleanup};
}
test("service cards are revealed once when they enter the viewport",()=>{
  const s=setup();
  assert.ok(s.items.every(item=>item.dataset.reveal==="pending"));
  s.observer.callback([{target:s.items[0],isIntersecting:true}]);
  assert.equal(s.items[0].dataset.reveal,"visible");
  assert.equal(s.observer.observed.has(s.items[0]),false);
  assert.equal(s.items[1].dataset.reveal,"pending");
  s.cleanup();
  assert.ok(s.items.every(item=>item.dataset.reveal===undefined));
  assert.equal(s.listeners.size,0);
});
test("restored visible content is never hidden and reduced motion reveals all pending cards",()=>{
  const s=setup({positions:[400,1200]});
  assert.equal(s.items[0].dataset.reveal,undefined);
  assert.equal(s.items[1].dataset.reveal,"pending");
  s.motion.matches=true;s.listeners.get("change")();
  assert.ok(s.items.every(item=>item.dataset.reveal==="visible"));
  assert.equal(s.observer.disconnected,true);
  s.cleanup();
});
test("services stay visible with reduced motion or unsupported observers",()=>{
  for(const settings of [{reduced:true},{supported:false}]) {
    const s=setup(settings);
    assert.equal(s.observer,undefined);
    assert.ok(s.items.every(item=>item.dataset.reveal===undefined));
  }
});
