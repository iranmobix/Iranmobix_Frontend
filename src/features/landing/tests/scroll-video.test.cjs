/* eslint-disable @typescript-eslint/no-require-imports -- Run the scroll controller against deterministic browser/media boundaries. */
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),ts=require("typescript");
function setup({readyState=2,reduced=false,sources=[],touch=false,play,initialSrc}={}) {
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
  mediaQueries.set("(pointer: coarse)",{...target(),matches:touch});
  window.matchMedia=query=>mediaQueries.get(query)??motion;
  const section={offsetHeight:2000,dataset:{},style:{setProperty:(name,value)=>{styleWrites++;properties.set(name,value);}},getBoundingClientRect:()=>{rectReads++;return {top:200-window.scrollY};}};
  const stage={offsetHeight:600};
  const header={getBoundingClientRect:()=>{rectReads++;return {height:100};}};
  let currentTime=0,loadCount=0,playCount=0,pauseCount=0;
  const video={...target(),setAttribute:()=>{},play:()=>{playCount++;return play?play():Promise.resolve();},poster:"/videos/hero-poster.jpg",getAttribute:name=>name==="poster"?video.poster:null,querySelectorAll:()=>sources,currentSrc:initialSrc??sources.find(source=>!source.media||source.matches)?.src??"",load:()=>{loadCount++;currentTime=0;video.seeking=false;video.readyState=0;video.currentSrc=sources.find(source=>!source.media||mediaQueries.get(source.media)?.matches)?.src??"";},readyState,duration:8,seeking:false,pause:()=>{pauseCount++;},get currentTime(){return currentTime;},set currentTime(value){currentTime=value;seeks.push(value);video.seeking=true;}};
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
  return {window,video,motion,section,seeks,frames,flush,cleanup,observer,properties,mediaQueries,loads:()=>loadCount,plays:()=>playCount,pauses:()=>pauseCount,
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
  const target=(900-200)/1400*(8-1/24);
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
  assert.ok(Math.abs(s.video.currentTime-(700/1400*(8-1/24)))<1/48);
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

test("metadata-only media can seek without waiting for loadeddata",()=>{
  const s=setup({readyState:1});s.window.scrollY=900;s.flush();
  assert.equal(s.seeks.length,1);
  s.cleanup();
});
test("touch gestures initialize muted inline decoding once, then pause",async()=>{
  const s=setup({touch:true,readyState:1});s.flush();
  s.window.emit("touchstart");s.window.emit("pointerdown");
  assert.equal(s.plays(),1);
  await Promise.resolve();
  assert.equal(s.video.muted,true);assert.equal(s.video.defaultMuted,true);assert.equal(s.video.playsInline,true);
  assert.ok(s.pauses()>=2);
  s.window.emit("touchend");assert.equal(s.plays(),1);
  s.cleanup();
});
test("blocked mobile play is handled and a later allowed gesture can retry",async()=>{
  let blocked=true;
  const s=setup({touch:true,play:()=>blocked?Promise.reject(new Error("NotAllowedError")):Promise.resolve()});
  s.flush();s.window.emit("touchstart");await Promise.resolve();
  assert.equal(s.plays(),1);
  blocked=false;s.window.emit("touchend");await Promise.resolve();
  assert.equal(s.plays(),2);
  s.cleanup();
});
test("touch seeks are frame-aligned, bounded and follow the newest scroll target",()=>{
  const s=setup({touch:true});s.flush();
  s.window.scrollY=900;s.window.emit("scroll");s.flush();
  assert.equal(s.seeks.length,1);
  assert.ok(Math.abs(s.video.currentTime*24-Math.round(s.video.currentTime*24))<1e-8);
  s.decoded();s.flush();
  s.window.scrollY=1000;s.window.emit("scroll");s.flush();
  assert.equal(s.seeks.length,1);
  s.window.scrollY=1200;s.window.emit("scroll");s.flush();
  assert.equal(s.seeks.length,2);
  const target=Math.round((1000/1400*(8-1/24))*24)/24;
  assert.ok(Math.abs(s.video.currentTime-target)<1e-8);
  s.decoded();s.flush();assert.equal(s.frames.size,0);
  s.cleanup();
});
test("mobile decoder initialization respects reduced motion and never runs on desktop",()=>{
  for(const settings of [{touch:true,reduced:true},{touch:false}]) {
    const s=setup(settings);s.flush();s.window.emit("touchstart");s.window.emit("click");
    assert.equal(s.plays(),0);s.cleanup();
  }
});
test("a delayed play promise cannot resume work after the component unmounts",async()=>{
  let complete;
  const s=setup({touch:true,play:()=>new Promise(resolve=>{complete=resolve;})});
  s.window.emit("touchstart");s.cleanup();complete();await Promise.resolve();
  assert.equal(s.frames.size,0);
  assert.equal(s.window.listeners.size,0);
});
test("explicit source choice corrects browsers that initially select the wrong video",()=>{
  const sources=[
    {src:"https://front.test/mobile.mp4",media:"mobile",matches:true},
    {src:"https://front.test/desktop.mp4",media:""},
  ];
  const s=setup({sources,initialSrc:sources[1].src});
  assert.equal(s.video.src,sources[0].src);
  assert.equal(s.video.currentSrc,sources[0].src);
  assert.equal(s.loads(),1);
  s.cleanup();
});

test("video stays on its first frame until the hero reaches the top of the viewport",()=>{
  const s=setup({touch:true});s.flush();
  for(const position of [0,100,199,200]) {
    s.window.scrollY=position;s.window.emit("scroll");s.flush();
    assert.equal(s.video.currentTime,0);
    assert.equal(s.seeks.length,0);
  }
  s.window.scrollY=400;s.window.emit("scroll");s.flush();
  assert.ok(s.video.currentTime>0);
  s.decoded();s.flush();
  s.window.scrollY=200;s.window.emit("scroll");s.flush();s.flush();
  assert.equal(s.video.currentTime,0);
  s.cleanup();
});
