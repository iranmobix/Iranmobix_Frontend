/* eslint-disable @typescript-eslint/no-require-imports -- Run the scroll controller against deterministic browser/media boundaries. */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
function setup({readyState=2,reduced=false,sources=[]}={}) {
  const target=()=>{const listeners=new Map();return {
    addEventListener:(name,callback)=>listeners.set(name,callback),
    removeEventListener:(name,callback)=>{if(listeners.get(name)===callback)listeners.delete(name);},
    emit:name=>listeners.get(name)?.(),listeners,
  };};
  let effects=[],index=0,cleanup,clock=0,nextId=0,rectReads=0,styleWrites=0,observer;
  const frames=new Map(),seeks=[],properties=new Map();
  const window={...target(),scrollY:0,
    requestAnimationFrame:callback=>{const id=++nextId;frames.set(id,callback);return id;},
    cancelAnimationFrame:id=>frames.delete(id),
  };
  const motion={...target(),matches:reduced};const mediaQueries=new Map(sources.filter(source=>source.media).map(source=>[source.media,{...target(),matches:source.matches??false}]));
  window.matchMedia=query=>mediaQueries.get(query)??motion;
  const section={offsetHeight:2000,dataset:{},style:{setProperty:(name,value)=>{styleWrites++;properties.set(name,value);}},getBoundingClientRect:()=>{rectReads++;return {top:200-window.scrollY};}};
  const stage={offsetHeight:600};
  const header={getBoundingClientRect:()=>{rectReads++;return {height:100};}};
  let currentTime=0,loadCount=0;
  const video={...target(),poster:"/videos/hero-poster.jpg",getAttribute:name=>name==="poster"?video.poster:null,querySelectorAll:()=>sources,currentSrc:sources.find(source=>!source.media||source.matches)?.src??"",load:()=>{loadCount++;currentTime=0;video.seeking=false;video.readyState=0;video.currentSrc=sources.find(source=>!source.media||mediaQueries.get(source.media)?.matches)?.src??"";},readyState,duration:8,seeking:false,pause:()=>{},get currentTime(){return currentTime;},set currentTime(value){currentTime=value;seeks.push(value);video.seeking=true;}};
  const refs=[section,stage,video];
  const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,"../components/hero/use-scroll-video.ts"),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const mod={exports:{}};
  new Function("require","module","exports","window","document","ResizeObserver",source)(
    name=>name==="react"?{useRef:()=>({current:refs[index++]}),useEffect:effect=>effects.push(effect)}:require(name),
    mod,mod.exports,window,{querySelector:()=>header},
    class {constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){this.disconnected=true;}},
  );
  mod.exports.useScrollVideo();cleanup=effects[0]();
  const flush=()=>{const pending=[...frames.values()];frames.clear();clock+=16;pending.forEach(callback=>callback(clock));};
  return {window,video,motion,section,seeks,frames,flush,cleanup,observer,properties,mediaQueries,loads:()=>loadCount,
    decoded:()=>{video.seeking=false;video.emit("seeked");},
    reads:()=>rectReads,writes:()=>styleWrites};
}
test("scroll bursts coalesce without measuring layout or rewriting styles every frame",()=>{
  const s=setup();s.flush();const reads=s.reads(),writes=s.writes();
  s.window.scrollY=900;
  for(let n=0;n<100;n++)s.window.emit("scroll");
  assert.equal(s.frames.size,1);
  s.flush();
  assert.equal(s.seeks.length,1);
  assert.equal(s.reads(),reads);assert.equal(s.writes(),writes);
  s.cleanup();
});
test("seeks wait for decoding, ease forward and follow the latest reverse-scroll target",()=>{
  const s=setup();s.flush();s.window.scrollY=900;s.window.emit("scroll");s.flush();
  const first=s.video.currentTime;
  const target=(900+100-200)/1400*(8-1/24);
  assert.ok(first>0 && first<target);
  s.window.scrollY=1200;s.window.emit("scroll");s.flush();
  assert.equal(s.seeks.length,1);
  s.window.scrollY=0;s.decoded();s.flush();
  assert.ok(s.video.currentTime<first);
  s.cleanup();
});
test("controller settles on the scroll target and leaves no continuous animation loop",()=>{
  const s=setup();s.flush();s.window.scrollY=900;s.window.emit("scroll");s.flush();
  for(let n=0;n<150 && s.video.seeking;n++){s.decoded();s.flush();}
  assert.equal(s.frames.size,0);
  assert.ok(Math.abs(s.video.currentTime-(800/1400*(8-1/24)))<1/48);
  s.cleanup();
});
test("unready video waits for media data and reduced motion stays on its first frame",()=>{
  const s=setup({readyState:0});s.window.scrollY=900;s.flush();assert.equal(s.seeks.length,0);
  s.video.readyState=2;s.video.emit("loadeddata");s.flush();assert.equal(s.seeks.length,1);s.cleanup();
  const reduced=setup({reduced:true});reduced.window.scrollY=1000;reduced.flush();
  assert.equal(reduced.video.currentTime,0);assert.equal(reduced.seeks.length,0);reduced.cleanup();
});
test("resize invalidates geometry while cleanup removes scroll/media listeners and queued work",()=>{
  const s=setup();s.flush();const reads=s.reads();
  s.window.emit("resize");s.flush();assert.ok(s.reads()>reads);
  s.window.emit("scroll");assert.equal(s.frames.size,1);
  s.cleanup();assert.equal(s.frames.size,0);assert.equal(s.window.listeners.size,0);
  assert.equal(s.video.listeners.size,0);assert.equal(s.motion.listeners.size,0);
  assert.equal(s.observer.disconnected,true);
});

test("hero exit is reversible and starts only after the video scroll range ends",()=>{
  const s=setup();s.flush();
  s.window.scrollY=1200;s.window.emit("scroll");s.flush();
  assert.equal(s.properties.has("--hero-exit"),false);
  s.window.scrollY=1800;s.window.emit("scroll");s.flush();
  assert.ok(Number(s.properties.get("--hero-exit"))>0);
  s.window.scrollY=1200;s.window.emit("scroll");s.flush();
  assert.equal(s.properties.get("--hero-exit"),"0");
  s.cleanup();
});


test("mobile-only video selection preserves desktop source and scroll position across breakpoints",()=>{
  const sources=[
    {src:"https://front.test/videos/hero-scroll-mobile.mp4",media:"(max-width: 767px)",matches:false,dataset:{poster:"/videos/hero-poster-mobile.jpg"}},
    {src:"https://front.test/videos/hero-scroll.mp4",media:"",dataset:{poster:"/videos/hero-poster.jpg"}},
  ];
  const s=setup({sources});s.flush();
  assert.equal(s.video.currentSrc,sources[1].src);
  assert.equal(s.video.poster,"/videos/hero-poster.jpg");
  assert.equal(s.loads(),0);
  s.window.scrollY=900;s.window.emit("scroll");s.flush();
  for(let n=0;n<150 && s.video.seeking;n++){s.decoded();s.flush();}
  const position=s.video.currentTime;
  const mobile=s.mediaQueries.get("(max-width: 767px)");
  mobile.matches=true;mobile.emit("change");
  assert.equal(s.loads(),1);
  assert.equal(s.video.currentSrc,sources[0].src);
  assert.equal(s.video.poster,"/videos/hero-poster-mobile.jpg");
  s.video.readyState=2;s.video.emit("loadeddata");s.flush();
  assert.ok(Math.abs(s.video.currentTime-position)<1/48);
  mobile.emit("change");assert.equal(s.loads(),1);
  mobile.matches=false;mobile.emit("change");
  assert.equal(s.video.currentSrc,sources[1].src);
  assert.equal(s.video.poster,"/videos/hero-poster.jpg");
  s.cleanup();
  assert.equal(mobile.listeners.size,0);
});
