/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const axios = require("axios");

function harness() {
  const src = path.resolve(__dirname,"../../..");
  const cache = new Map();
  const calls = [];
  let tokenReads = 0, refreshes = 0, fail = false;
  const client = axios.create({adapter:async config => {
    calls.push(config);
    const response = {data:{ok:true}, status:fail?401:200, statusText:fail?"Unauthorized":"OK",headers:{},config};
    if(fail) throw new axios.AxiosError("Unauthorized","ERR_BAD_REQUEST",config,{},response);
    return response;
  }});
  function load(file) {
    const absolute = path.resolve(src,file)+".ts";
    if(cache.has(absolute))return cache.get(absolute);
    const module = {exports:{}};
    const code = ts.transpileModule(fs.readFileSync(absolute,"utf8"), {
      compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true},
    }).outputText;
    vm.runInNewContext(code,{module,exports:module.exports,URL,require(name){
      if(name === "@/features/auth/utils/token-storage") return {tokenStorage:{getAccessToken(){tokenReads++;return "test-access-token";}}};
      if(name === "@/features/auth/services/token.service") return {refreshAccessToken:async()=>{refreshes++;throw Error("Unexpected refresh");}};
      if(name === "@/shared/api") return {httpGet:async(url,config)=>(await client.get(url,config)).data};
      return name.startsWith(".")?load(path.relative(src,path.resolve(path.dirname(absolute),name))):require(name);
    }});
    cache.set(absolute,module.exports);
    return module.exports;
  }
  load("shared/api/interceptors").setupInterceptors(client);
  return {load,calls,client,tokenReads:()=>tokenReads,refreshes:()=>refreshes,fail:()=>{fail=true;}};
}

test("public product reads omit the login token while protected reads retain authentication", async()=>{
  const h=harness();
  const api=h.load("features/product/api/product.api").productApi;
  await api.getProductDetail(encodeURIComponent("محصول-تست"));
  assert.equal(h.calls[0].url,`/api/product/${encodeURIComponent("محصول-تست")}/`);
  assert.equal(h.calls[0].headers.toJSON().Authorization,undefined);
  assert.equal(h.calls[0].withCredentials,false);
  assert.equal(h.calls[0].timeout,30000);
  assert.equal(h.tokenReads(),0);
  await h.client.get("/api/customer/orders/profile/");
  assert.equal(h.calls[1].headers.toJSON().Authorization,"Bearer test-access-token");
  await api.getProducts();
  assert.equal(h.calls[2].headers.toJSON().Authorization,undefined);
  assert.equal(h.tokenReads(),1);
});

test("a public product 401 never refreshes or clears the user's private login", async()=>{
  const h=harness();h.fail();
  await assert.rejects(h.load("features/product/api/product.api").productApi.getProductDetail("item"));
  assert.equal(h.calls.length,1);
  assert.equal(h.tokenReads(),0);
  assert.equal(h.refreshes(),0);
});

test("raw, escaped and nested escaped slugs have the same canonical product URL",()=>{
  const {normalizeProductSlug,getProductDetailsHref,getProductDetailApiPath}=harness().load("features/product/utils/product-path");
  const slug="محصول-تست-2026";
  for(const input of [slug,encodeURIComponent(slug),encodeURIComponent(encodeURIComponent(slug))]){
    assert.equal(normalizeProductSlug(input),slug);
    assert.equal(getProductDetailsHref(input),`/products/${encodeURIComponent(slug)}`);
    assert.equal(getProductDetailApiPath(input),`/api/product/${encodeURIComponent(slug)}/`);
  }
  assert.equal(getProductDetailApiPath("watch/a b"),"/api/product/watch%2Fa%20b/");
  assert.equal(getProductDetailApiPath("50%broken"),"/api/product/50%25broken/");
});
