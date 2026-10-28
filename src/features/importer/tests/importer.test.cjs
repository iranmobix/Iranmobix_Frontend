/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable -- CommonJS Node test loader for TypeScript modules. */

const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
function harness(overrides={}){const calls=[];const cache=new Map();let response;const base=path.resolve(__dirname,'..');
 function load(file){const f=path.resolve(base,file)+'.ts';if(cache.has(f))return cache.get(f);const module={exports:{}};cache.set(f,module.exports);const code=ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const req=name=>Object.hasOwn(overrides,name)?overrides[name]:name==='@/shared/api'?{httpPost:async(url,body,config)=>{calls.push({url,body,config});return response;},httpGet:async(url,config)=>{calls.push({url,config});return response;}}:name.startsWith('.')?load(path.relative(base,path.resolve(path.dirname(f),name))):require(name);
 vm.runInNewContext(code,{require:req,module,exports:module.exports,URL,URLSearchParams,FormData,setTimeout:overrides.setTimeout??setTimeout,clearTimeout});cache.set(f,module.exports);return module.exports;}
 return {load,calls,setResponse:r=>response=r};}
const accepted={job_id:4207,status:'pending',status_url:'/api/products/jobs/4207/',next_poll_after_seconds:2,import_type:'product',result_mode:'list',ready_for_frontend:false};
test('text, URL and image searches share new-tab results navigation with original context',async()=>{
 for(const [payload,suffix] of [[{query:'wireless headphones'},'?query=wireless+headphones'],[{source_url:'https://example.com/watch'},'?source_url=https%3A%2F%2Fexample.com%2Fwatch'],[undefined,'']]) {
  const h=harness();const order=[];let target;const tab={closed:false,opener:{},location:{replace:path=>{target=path;}},close(){this.closed=true;}};
  await h.load('services/import-search-navigation').runImportSearch({
   openTab:()=>{order.push('tab');return tab;},request:async()=>{order.push('request');return accepted;},
   navigate:()=>assert.fail('open result tab should receive the job'),payload,
  });
  assert.deepEqual(order,['tab','request']);assert.equal(target,`/imports/4207${suffix}`);assert.equal(tab.opener,null);assert.equal(tab.closed,false);
 }
});
test('blocked popups do not start an upload or discovery; failed requests close their temporary tab',async()=>{
 const h=harness();const {runImportSearch}=h.load('services/import-search-navigation');let requests=0;
 await assert.rejects(runImportSearch({openTab:()=>null,request:async()=>{requests++;return accepted;},navigate:()=>{}}),/تب جدید/);
 assert.equal(requests,0);
 const tab={closed:false,location:{replace:()=>assert.fail('request failed')},close(){this.closed=true;}};
 await assert.rejects(runImportSearch({openTab:()=>tab,request:async()=>{throw new Error('network');},navigate:()=>{}}),/network/);
 assert.equal(tab.closed,true);
});
test('a user-closed result tab falls back to the existing route without creating another job',async()=>{
 const h=harness();let target;let requests=0;const tab={closed:false,location:{replace:()=>assert.fail('tab is closed')},close(){this.closed=true;}};
 await h.load('services/import-search-navigation').runImportSearch({openTab:()=>tab,request:async()=>{requests++;tab.close();return accepted;},navigate:path=>{target=path;}});
 assert.equal(requests,1);assert.equal(target,'/imports/4207');
});
test('cancelling image upload closes the pending tab and prevents late navigation',async()=>{
 const h=harness();const controller=new AbortController();const tab={closed:false,location:{replace:()=>assert.fail('cancelled navigation')},close(){this.closed=true;}};
 await h.load('services/import-search-navigation').runImportSearch({openTab:()=>tab,request:async()=>{controller.abort();return accepted;},navigate:()=>assert.fail('cancelled navigation'),signal:controller.signal});
 assert.equal(tab.closed,true);
});
test('image upload sends the binary file as multipart image, forwards cancellation and accepts queued jobs',async()=>{
 const h=harness();h.setResponse({...accepted,status:'queued',import_type:'image'});
 const image=new (require('node:buffer').File)(['image-bytes'],'watch.png',{type:'image/png'});
 const signal=new AbortController().signal;
 const result=await h.load('services/importer.service').importerService.importImage({image},signal);
 assert.equal(result.job_id,4207);assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].url,'/api/products/import/image/');
 assert.ok(h.calls[0].body instanceof FormData);
 assert.equal(h.calls[0].body.get('image').name,'watch.png');
 assert.equal(await h.calls[0].body.get('image').text(),'image-bytes');
 assert.equal(h.calls[0].config.headers['Content-Type'],undefined);
 assert.equal(h.calls[0].config.signal,signal);
});
test('image validation rejects non-images, empty and oversized files before transport',async()=>{
 const h=harness();const service=h.load('services/importer.service').importerService;
 const File=require('node:buffer').File;
 for(const image of [new File(['text'],'file.txt',{type:'text/plain'}),new File([],'empty.png',{type:'image/png'}),new File([new Uint8Array(5*1024*1024+1)],'large.png',{type:'image/png'})])
  await assert.rejects(service.importImage({image}));
 assert.equal(h.calls.length,0);
});
const compactStatus=(overrides={})=>({job_id:6017,status:'done',ready_for_frontend:true,redirect_ready:false,selected_product_slug:'',product_detail_url:'',next_poll_after_seconds:0,candidates:[{candidate_id:1,source_url:'https://example.com/watch',status:'importing',slug:'',detail_url:'',import_timeout:false}],...overrides});
test('product URL queues a real import at the exact endpoint',async()=>{const h=harness();h.setResponse(accepted);const result=await h.load('services/importer.service').importerService.importProduct({url:' https://www.alibaba.com/product-detail/example.html '});assert.equal(result.job_id,4207);assert.equal(h.calls[0].url,'/api/products/import/');assert.equal(h.calls[0].body.url,'https://www.alibaba.com/product-detail/example.html');assert.equal(Object.keys(h.calls[0].body).length,1);});
test('text discovery posts a trimmed query and accepts the discovery job response',async()=>{const h=harness();h.setResponse({...accepted,status:'queued',result_mode:'discovery'});const result=await h.load('services/importer.service').importerService.discover({query:' wireless headphones '});assert.equal(result.job_id,4207);assert.equal(h.calls[0].url,'/api/products/discover/');assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{query:'wireless headphones'});});
test('URL discovery normalizes a www URL and sends only source_url',async()=>{const h=harness();h.setResponse({...accepted,result_mode:'discovery'});await h.load('services/importer.service').importerService.discover({source_url:'www.alibaba.com/product-detail/example.html'});assert.equal(h.calls[0].url,'/api/products/discover/');assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{source_url:'https://www.alibaba.com/product-detail/example.html'});});
test('discover input sends bare domains as source_url and natural text as query',async()=>{const h=harness();const service=h.load('services/importer.service');h.setResponse({...accepted,result_mode:'discovery'});const urlPayload=service.createDiscoverPayload('alibaba.com/product-detail/watch.html');await service.importerService.discover(urlPayload);assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{source_url:'https://alibaba.com/product-detail/watch.html'});const queryPayload=service.createDiscoverPayload('wireless headphones');await service.importerService.discover(queryPayload);assert.deepEqual(JSON.parse(JSON.stringify(h.calls[1].body)),{query:'wireless headphones'});});
test('discovery rejects blank/overlong text and malformed accepted responses before use',async()=>{const h=harness();const service=h.load('services/importer.service').importerService;await assert.rejects(service.discover({query:'  '}));await assert.rejects(service.discover({query:'x'.repeat(301)}));assert.equal(h.calls.length,0);h.setResponse({job_id:3});await assert.rejects(service.discover({query:'headphones'}));});
test('seller URLs use the same URL contract rather than an invented endpoint',async()=>{const h=harness();h.setResponse({...accepted,import_type:'seller'});await h.load('services/importer.service').importerService.importSeller({seller_url:'https://example.en.alibaba.com/'});assert.equal(h.calls[0].url,'/api/products/import/');assert.equal(h.calls[0].body.url,'https://example.en.alibaba.com/');});
test('invalid links fail before transport and malformed accepted responses are rejected',async()=>{const h=harness();const service=h.load('services/importer.service').importerService;await assert.rejects(service.importProduct({url:'javascript:alert(1)'}));assert.equal(h.calls.length,0);h.setResponse({status:'pending'});await assert.rejects(service.importProduct({url:'https://example.com'}));});
test('job polling preserves results, receives processing and forwards cancellation',async()=>{const h=harness();h.setResponse({id:4207,status:'processing',ready_for_frontend:false,next_poll_after_seconds:2,import_type:'product',result_mode:'list',product:null,results:[]});const signal=new AbortController().signal;const service=h.load('services/importer.service').importerService;const result=await service.getJobStatus('4207',signal);assert.equal(result.status,'processing');assert.equal(h.calls[0].url,'/api/products/jobs/4207/');assert.equal(h.calls[0].config.signal,signal);h.setResponse({...result,status:'done',ready_for_frontend:true,results:[{id:3,slug:'sample',title:'sample',images:[],min_price:'25.3',currency:'CNY'}]});const done=await service.getJobStatus('4207');assert.equal(done.results[0].min_price,'25.3');});
test('completed external-search jobs preserve candidates that need detail import',async()=>{const h=harness();const raw={id:5997,source_url:'external-search:1bc04b5291c26a46:index',source:'external-search',status:'done',product:null,main_product:{title:'index',status:'discovered',is_primary:true,source_url:'https://sale.alibaba.com/p/keep_looking_for_header_upgrade/index.html',candidate_id:1,card_metadata_status:'awaiting_detail_click',rank:1,detail_action:'import_on_click',import_payload:{url:'https://sale.alibaba.com/p/keep_looking_for_header_upgrade/index.html'}},other_products:[],import_type:'search',result_mode:'list',ready_for_frontend:true,error_message:'',error_action:{},next_poll_after_seconds:0,results:[]};h.setResponse(raw);const job=await h.load('services/importer.service').importerService.getJobStatus('5997');assert.equal(job.results.length,0);assert.equal(job.product,null);assert.equal(job.main_product.title,'index');assert.equal(job.main_product.detail_action,'import_on_click');assert.equal(job.main_product.import_payload.url,'https://sale.alibaba.com/p/keep_looking_for_header_upgrade/index.html');});
test('the discovery result keeps the main candidate above filters and maps other candidates to suggestions',()=>{const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;const {mapImportJobResults}=h.load('mappers/map-import-job-results');const mainUrl='https://www.alibaba.com/product-detail/watch.html';const otherUrl='https://www.alibaba.com/product-detail/strap.html';const job=schema.parse({id:5997,status:'done',ready_for_frontend:true,next_poll_after_seconds:0,import_type:'search',result_mode:'list',results:[],product:null,main_product:{title:'Watch',source_url:mainUrl,candidate_id:1,detail_action:'import_on_click',import_payload:{url:mainUrl}},other_products:[{title:'Strap',source_url:otherUrl,candidate_id:2,detail_action:'import_on_click',import_payload:{url:otherUrl}}]});const view=mapImportJobResults(job);assert.equal(view.requested.length,1);assert.equal(view.suggested.length,1);assert.equal(view.requested[0].title,'Watch');assert.equal(view.suggested[0].title,'Strap');assert.equal(view.requested[0].price.amount,null);assert.equal(view.requested[0].image,'');assert.equal(view.candidatesByProductId.get(view.requested[0].id).import_payload.url,mainUrl);});
test('an imported main product replaces its candidate without duplicating recommendations',()=>{const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;const {mapImportJobResults}=h.load('mappers/map-import-job-results');const url='https://example.com/watch';const main={id:4,slug:'watch',title:'Watch',source_url:url,min_price:'25',currency:'CNY'};const suggestion={id:5,slug:'strap',title:'Strap',source_url:'https://example.com/strap'};const job=schema.parse({id:42,status:'done',ready_for_frontend:true,next_poll_after_seconds:0,import_type:'search',result_mode:'list',product:main,results:[main,suggestion],main_product:{title:'Watch',source_url:url,candidate_id:1,detail_action:'import_on_click',import_payload:{url}},other_products:[]});const view=mapImportJobResults(job);assert.deepEqual([view.requested[0].id,...view.suggested.map(p=>p.id)],[4,5]);assert.equal(view.candidatesByProductId.size,0);});
test('invalid and mismatched job identifiers fail safely',async()=>{const h=harness();const service=h.load('services/importer.service').importerService;await assert.rejects(service.getJobStatus('../1'));assert.equal(h.calls.length,0);h.setResponse({id:5,status:'failed',ready_for_frontend:false,next_poll_after_seconds:0,import_type:'product',result_mode:'list',results:[],product:null,error_message:'failed'});await assert.rejects(service.getJobStatus('4207'));});

test('imported results adapt to shared product cards without inventing converted prices',()=>{
 const h=harness();const schema=h.load('schemas/importer.schema').importProductSchema;
 const map=h.load('mappers/import-product.mapper').mapImportedProduct;
 const dto=schema.parse({id:1,slug:'sample',title:'Full title',short_title:'Short',currency:'CNY',min_price:'25.3',source:'alibaba',source_url:'https://example.com',images:[{image_url:'https://example.com/photo',is_primary:true}],colors:[{id:2,color_name:'Black',color:'#000'}]});
 const card=map(dto);assert.equal(card.title,'Short');assert.equal(card.price.amount,25.3);assert.equal(card.price.amountIrr,null);assert.equal(card.image,'https://example.com/photo');assert.equal(card.colors[0].name,'Black');assert.equal(map({...dto,min_price:null}).price.amount,null);
});
test('import filters operate only on the job results and preserve input ordering',()=>{
 const h=harness();const map=h.load('mappers/import-product.mapper').mapImportedProduct;
 const {filterImportedProducts,getImportedProductFilters}=h.load('../product/utils/imported-products.utils');
 const products=[map({id:1,slug:'a',title:'A',source:'alibaba',currency:'CNY',min_price:'30'}),map({id:2,slug:'b',title:'B',source:'1688',currency:'CNY',min_price:'20'})];
 assert.equal(filterImportedProducts(products,{sources:['1688']})[0].slug,'b');
 assert.equal(filterImportedProducts(products,{sort:'price_asc'})[0].slug,'b');
 assert.equal(products[0].slug,'a');assert.equal(getImportedProductFilters(products).sources.length,2);
});

test('real completed job with fallback brand IDs renders valid product data',()=>{
 const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/job-fallback-brand.json'),'utf8'));
 const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;
 const job=schema.parse(raw);const map=h.load('mappers/import-product.mapper').mapImportedProduct;
 assert.equal(job.ready_for_frontend,true);assert.equal(job.results.length,2);
 assert.equal(job.product.brand.id,null);
 const cards=job.results.map(map);
 assert.equal(cards.length,2);assert.ok(cards.every(p=>p.slug&&p.title&&p.image));
 assert.ok(cards.every(p=>p.brand===null));
 const incomplete=schema.parse({...raw,product:null,results:[{...raw.results[0],brand:{...raw.results[0].brand,id:'bad'}}]});
 const partial=h.load('mappers/map-import-job-results').mapImportJobResults(incomplete).requested[0];
 assert.ok(partial.image);assert.equal(partial.price.amount,0.98);assert.equal(partial.brand,null);
 const validBrand={...raw.results[0],brand:{...raw.results[0].brand,id:7}};
 assert.equal(map(schema.parse({...raw,results:[validBrand]}).results[0]).brand.id,7);
});

test('detail loading resumes the accepted import job after a route transition without another import',async()=>{
 const {QueryClient}=require('@tanstack/react-query');const client=new QueryClient();
 const h=harness();const service=h.load('services/importer.service').importerService;
 const options=h.load('services/import-product-details-query').importProductDetailsQueryOptions(client,'6017',{candidate_id:1,source_url:'https://example.com/watch'});
 let starts=0;let polls=0;
 service.importCandidate=async()=>{starts++;return {job_id:42};};
 service.waitForCandidateDetails=async(initial)=>{assert.equal(initial.job_id,42);polls++;if(polls===1)throw new Error('polling interrupted');return '/products/watch';};
 try {await assert.rejects(client.fetchQuery(options),/interrupted/);assert.equal(await client.fetchQuery(options),'/products/watch');assert.equal(starts,1);} finally {client.clear();}
});

test('a ready selected import invalidates only its product API cache before redirect',async()=>{
 const {QueryClient}=require('@tanstack/react-query');const client=new QueryClient();const h=harness();
 const service=h.load('services/importer.service').importerService;
 service.importCandidate=async()=>compactStatus();service.waitForCandidateDetails=async()=>'/products/watch/';
 const keys=h.load('../product/services/product-query-options').productQueryKeys;
 const detail=keys.detail('watch');const list=keys.list();const mock=keys.detail('watch','mock');const other=keys.detail('strap');
 for(const key of [detail,list,mock,other])client.setQueryData(key,{value:true});
 try {
  const options=h.load('services/import-product-details-query').importProductDetailsQueryOptions(client,'6017',{candidate_id:1});
  assert.equal(await client.fetchQuery(options),'/products/watch/');
  assert.equal(client.getQueryState(detail).isInvalidated,true);assert.equal(client.getQueryState(list).isInvalidated,true);
  assert.equal(client.getQueryState(mock).isInvalidated,false);assert.equal(client.getQueryState(other).isInvalidated,false);
 } finally {client.clear();}
});

test('retrying a terminal product import failure starts a fresh job',async()=>{
 const {QueryClient}=require('@tanstack/react-query');const client=new QueryClient();const h=harness();
 const {importerService:service,ProductImportError}=h.load('services/importer.service');
 const options=h.load('services/import-product-details-query').importProductDetailsQueryOptions(client,'6017',{candidate_id:1,source_url:'https://example.com/watch'});
 let starts=0;service.importCandidate=async()=>{starts++;return {job_id:starts};};
 service.waitForCandidateDetails=async()=>{if(starts===1)throw new ProductImportError('failed');return '/products/watch';};
 try {await assert.rejects(client.fetchQuery(options),/failed/);assert.equal(await client.fetchQuery(options),'/products/watch');assert.equal(starts,2);} finally {client.clear();}
});

test('listing cards preserve string images, seller names and provided toman prices',()=>{
 const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;
 const candidate={candidate_id:1,title:'Watch',source:'alibaba',source_url:'https://example.com/watch',images:['https://example.com/watch.jpg'],min_price:'481.82',currency:'CNY',price_toman:'19581165',best_offer:{id:null,supplier_name:'Supplier',verified:false},catalog_card:{id:null,slug:''},colors:[]};
 const job=schema.parse({id:6017,status:'done',ready_for_frontend:true,next_poll_after_seconds:0,import_type:'search',result_mode:'list',product:null,main_product:null,results:[candidate],other_products:[candidate]});
 const view=h.load('mappers/map-import-job-results').mapImportJobResults(job);const product=view.requested[0];
 assert.equal(view.requested.length,1);assert.equal(view.suggested.length,0);assert.equal(product.image,'https://example.com/watch.jpg');assert.equal(product.price.amount,481.82);assert.equal(product.price.amountIrr,195811650);assert.equal(product.seller.name,'Supplier');
 const issues=view.dataIssuesByProductId.get(product.id);assert.equal(issues.find(issue=>issue.label==='رنگ‌ها').status,'empty');assert.equal(issues.find(issue=>issue.label==='مسیر جزئیات').status,'empty');assert.equal(issues.some(issue=>issue.label==='تأیید فروشنده'),false);
 assert.equal(h.calls.length,0);
});

test('completed import keeps incomplete cards and distinguishes missing keys, empty values and zero prices',()=>{
 const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;
 const job=schema.parse({id:6018,status:'done',ready_for_frontend:false,next_poll_after_seconds:0,import_type:'search',result_mode:'list',product:null,results:[{candidate_id:1,title:null,source_url:'https://example.com/incomplete',images:[],min_price:null,currency:null},{candidate_id:2,title:'Free',source_url:'https://example.com/free',min_price:0,currency:'CNY',image_url:'https://example.com/free.jpg'}]});
 const view=h.load('mappers/map-import-job-results').mapImportJobResults(job);assert.equal(view.requested.length+view.suggested.length,2);
 const incomplete=view.requested[0];assert.equal(incomplete.image,'');assert.equal(incomplete.title,'');assert.equal(incomplete.price.amount,null);assert.equal(incomplete.price.currency,'');
 const issues=view.dataIssuesByProductId.get(incomplete.id);assert.equal(issues.find(issue=>issue.label==='قیمت تومان').status,'missing');assert.equal(issues.find(issue=>issue.label==='قیمت مبدا').status,'empty');assert.equal(issues.find(issue=>issue.label==='تصویر').status,'empty');assert.equal(issues.find(issue=>issue.label==='عنوان').status,'empty');
 assert.equal(view.suggested[0].price.amount,0);assert.equal(view.dataIssuesByProductId.get(view.suggested[0].id).some(issue=>issue.label==='قیمت مبدا'),false);
});

test('empty completed discovery pages request the next page with the original query and cursor',async()=>{
 const h=harness();const service=h.load('services/importer.service').importerService;const signal=new AbortController().signal;
 let request;service.discover=async(payload,receivedSignal)=>{request={payload,receivedSignal};return {job_id:61};};
 service.getJobStatus=async(id,receivedSignal)=>{assert.equal(id,'61');assert.equal(receivedSignal,signal);return {id:61,status:'done',ready_for_frontend:false,next_poll_after_seconds:0,import_type:'search',result_mode:'list',results:[],product:null,discovery:{pagination:{has_more:true,next_cursor:'opaque-cursor'}}};};
 const page=await service.getNextDiscoveryPage({query:'iphone'},'opaque-cursor',signal);
 assert.deepEqual(JSON.parse(JSON.stringify(request.payload)),{query:'iphone',cursor:'opaque-cursor'});assert.equal(request.receivedSignal,signal);assert.equal(page.ready_for_frontend,false);assert.equal(page.status,'done');
});

test('selected-card import posts only the chosen candidate to its owning job endpoint',async()=>{
 const h=harness();h.setResponse(compactStatus());const service=h.load('services/importer.service').importerService;
 const response=await service.importCandidate('6017',{candidate_id:1,source_url:'https://example.com/watch'});
 assert.equal(response.job_id,6017);assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,'/api/products/jobs/6017/candidates/import/');
 assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{candidate_id:1,source_url:'https://example.com/watch'});
 await assert.rejects(service.importCandidate('6017',{}));await assert.rejects(service.importCandidate('6017',{candidate_id:0}));assert.equal(h.calls.length,1);
});

test('detail polling uses the small compact contract and validates job identity',async()=>{
 const h=harness();h.setResponse(compactStatus());const signal=new AbortController().signal;
 const service=h.load('services/importer.service').importerService;await service.getCandidateImportStatus('6017',signal);
 assert.equal(h.calls[0].url,'/api/products/jobs/6017/');assert.equal(h.calls[0].config.params.compact,true);assert.equal(h.calls[0].config.signal,signal);
 h.setResponse(compactStatus({job_id:99}));await assert.rejects(service.getCandidateImportStatus('6017'),/شناسه/);
});

test('a done discovery job keeps polling while its selected card is importing',async()=>{
 const h=harness();const service=h.load('services/importer.service').importerService;let polls=0;const signal=new AbortController().signal;
 service.getCandidateImportStatus=async(id,receivedSignal)=>{assert.equal(id,'6017');assert.equal(receivedSignal,signal);polls++;return compactStatus({redirect_ready:true,selected_product_slug:'watch',candidates:[{candidate_id:1,source_url:'https://example.com/watch',status:'imported',slug:'watch'}]});};
 const route=await service.waitForCandidateDetails(compactStatus(),{candidate_id:1,source_url:'https://example.com/watch'},signal);
 assert.equal(route,'/products/watch');assert.equal(polls,1);
});

test('ready selected-card responses redirect immediately without another status request',async()=>{
 const h=harness();const service=h.load('services/importer.service').importerService;
 const response=compactStatus({redirect_ready:true,selected_product_slug:'watch',candidates:[]});
 assert.equal(await service.waitForCandidateDetails(response,{candidate_id:1},new AbortController().signal),'/products/watch');assert.equal(h.calls.length,0);
});

test('selected-card redirects obey readiness and never use another card redirect',()=>{
 const h=harness();const {getCandidateImportState:state}=h.load('services/candidate-import-state');const selected={candidate_id:1,source_url:'https://example.com/watch'};
 assert.equal(state(compactStatus({selected_product_slug:'watch'}),selected).path,null);
 const another=compactStatus({redirect_ready:true,selected_product_slug:'strap',candidates:[{candidate_id:1,source_url:selected.source_url,status:'importing',slug:''},{candidate_id:2,source_url:'https://example.com/strap',status:'imported',slug:'strap'}]});
 assert.equal(state(another,selected).path,null);
 const own=compactStatus({redirect_ready:true,selected_product_slug:'strap',candidates:[{candidate_id:1,source_url:selected.source_url,status:'imported',slug:'watch'}]});assert.equal(state(own,selected).path,'/products/watch');
 assert.equal(state({...own,selected_product_slug:'watch',candidates:[{candidate_id:1,source_url:selected.source_url,status:'unknown-new-status',slug:'watch'}]},selected).path,'/products/watch');
 assert.equal(state(own,{candidate_id:1,source_url:'https://example.com/different'}).path,null);
});

test('selected-card timeouts are terminal and redirect URLs stay inside product routes',()=>{
 const h=harness();const {getCandidateImportState:state}=h.load('services/candidate-import-state');
 assert.ok(state(compactStatus({candidates:[{candidate_id:1,status:'importing',import_timeout:true}]}),{candidate_id:1}).error);
 const ready=compactStatus({redirect_ready:true,candidates:[],product_detail_url:'https://store.example/products/watch/'});
 assert.equal(state(ready,{candidate_id:1}).path,'/products/watch/');assert.equal(state({...ready,product_detail_url:'https://evil.example/login'},{candidate_id:1}).path,null);
});

test('merged discovery pages keep unique cards, stable UI IDs and the correct candidate owner',()=>{
 const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;
 const make=(id,results)=>schema.parse({id,status:'done',ready_for_frontend:true,next_poll_after_seconds:0,import_type:'search',result_mode:'list',product:null,results});
 const first={candidate_id:1,title:'Watch',source_url:'https://example.com/watch'};const second={candidate_id:1,title:'Strap',source_url:'https://example.com/strap'};
 const view=h.load('mappers/map-import-job-results').mapImportJobPages([make(10,[first]),make(20,[second,{...first,candidate_id:7}])]);
 assert.equal(view.requested.length,1);assert.equal(view.suggested.length,1);const a=view.requested[0];const b=view.suggested[0];assert.notEqual(a.id,b.id);
 assert.equal(view.candidatesByProductId.get(a.id).candidate_id,7);assert.equal(view.candidateJobIdsByProductId.get(a.id),'20');assert.equal(view.candidatesByProductId.get(b.id).candidate_id,1);assert.equal(view.candidateJobIdsByProductId.get(b.id),'20');
});

test('discovery pagination can resume from an opaque cursor after a direct results-page visit',async()=>{
 const h=harness();h.setResponse({...accepted,import_type:'search'});await h.load('services/importer.service').importerService.discover({cursor:'opaque-page-cursor'});
 assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{cursor:'opaque-page-cursor'});
});

test('discovery scroll fetches only requested cursors, appends pages and stops at the last page',async()=>{
 const {QueryClient,InfiniteQueryObserver}=require('@tanstack/react-query');const client=new QueryClient();const h=harness();
 const service=h.load('services/importer.service').importerService;const requests=[];
 service.getNextDiscoveryPage=async(payload,cursor)=>{requests.push({payload,cursor});return {id:requests.length,status:'done',discovery:{pagination:{has_more:requests.length===1,next_cursor:requests.length===1?'page-two':''}}};};
 const options=h.load('hooks/use-import-results').discoveryPagesQueryOptions('6017',{query:'iphone'},'page-one');
 const observer=new InfiniteQueryObserver(client,options);
 try {assert.equal(requests.length,0);await observer.fetchNextPage();await observer.fetchNextPage();await observer.fetchNextPage();assert.equal(requests.length,2);assert.equal(requests[0].cursor,'page-one');assert.equal(requests[1].cursor,'page-two');assert.equal(requests[1].payload.query,'iphone');assert.equal(observer.getCurrentResult().data.pages.length,2);assert.equal(observer.getCurrentResult().hasNextPage,false);} finally {observer.destroy();client.clear();}
});

test('unidentified incomplete cards stay visible instead of collapsing into a single null-ID card',()=>{
 const h=harness();const schema=h.load('schemas/importer.schema').importJobSchema;
 const job=schema.parse({id:6020,status:'done',ready_for_frontend:false,next_poll_after_seconds:0,import_type:'search',result_mode:'list',results:[{title:null,candidate_id:null},{title:null,candidate_id:null}],product:null});
 const mapped=h.load('mappers/map-import-job-results').mapImportJobResults(job);assert.equal(mapped.requested.length+mapped.suggested.length,2);
});

test('discovery automatically fetches suggestions after the requested product and stops on data, error or exhaustion',()=>{
 for(const state of [{},{fetching:true},{error:true},{more:false},{enriching:true},{suggested:[{id:2}]}]) {
  let requests=0;
  const grouped={requested:[{id:1}],suggested:state.suggested??[]};
  const h=harness({
   react:{useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:fn=>fn()},
   '@tanstack/react-query':{infiniteQueryOptions:value=>value,useInfiniteQuery:()=>({fetchNextPage:async()=>{requests++;},isFetching:!!state.fetching,isError:!!state.error})},
   './use-import-job':{useImportJob:()=>({data:{status:'done',discovery:{enrichment_pending:!!state.enriching,pagination:{has_more:state.more!==false,next_cursor:'next-page'}}}})},
   '../mappers/map-import-job-results':{mapImportJobPages:()=>grouped},
   '../services/importer.service':{importerService:{}},
  });
  const stateResult=h.load('hooks/use-import-results').useImportResults('123',{source_url:'https://example.com/product'});
  assert.equal(stateResult.isWaitingForResults,!!state.enriching);
  assert.equal(requests, Object.keys(state).length===0?1:0,JSON.stringify(state));
 }
});

test('done jobs keep polling while enrichment is pending even when ready and progress are complete',()=>{
 const h=harness({'@tanstack/react-query':{useQuery:options=>options}});
 const options=h.load('hooks/use-import-job').useImportJob('724');
 const job={id:724,status:'done',ready_for_frontend:true,next_poll_after_seconds:2,
  discovery:{enrichment_pending:true,pagination:{has_more:false,next_cursor:''}},
  progress:{percentage:100},result_summary:{is_complete:true}};
 const state=data=>({state:{status:'success',data}});
 assert.equal(options.refetchInterval(state(job)),2000);
 assert.equal(options.staleTime(state(job)),0);
 const complete={...job,discovery:{...job.discovery,enrichment_pending:false}};
 assert.equal(options.refetchInterval(state(complete)),false);
 assert.equal(options.staleTime(state(complete)),Infinity);
 assert.equal(options.refetchInterval(state({...job,status:'failed'})),false);
 // Metadata that explicitly waits for a detail click must not start endless polling.
 assert.equal(options.refetchInterval(state({...complete,main_product:{metadata_pending:true,card_metadata_status:'awaiting_detail_click'}})),false);
});

test('next discovery pages wait on the same job until enrichment delivers late suggestions',async()=>{
 const delays=[];
 const h=harness({setTimeout:(callback,delay)=>{delays.push(delay);return setTimeout(callback,0);}});
 const service=h.load('services/importer.service').importerService;
 let discoveries=0,polls=0;
 service.discover=async()=>{discoveries++;return {job_id:724};};
 const signal=new AbortController().signal;
 service.getJobStatus=async(id,receivedSignal)=>{
  assert.equal(id,'724');assert.equal(receivedSignal,signal);polls++;
  return {id:724,status:'done',ready_for_frontend:true,next_poll_after_seconds:2,
   discovery:{enrichment_pending:polls===1,pagination:{has_more:false,next_cursor:''}},
   main_product:{title:'Main'},other_products:polls===1?[]:[{title:'Late suggestion'}]};
 };
 const page=await service.getNextDiscoveryPage({source_url:'https://example.com/product'},'page-five',signal);
 assert.equal(discoveries,1);assert.equal(polls,2);assert.deepEqual(delays,[2000]);
 assert.equal(page.other_products[0].title,'Late suggestion');
});

test('pending discovery enrichment remains cancellable and never starts another discovery',async()=>{
 const controller=new AbortController();
 const h=harness({setTimeout:()=>setTimeout(()=>controller.abort(),0)});
 const service=h.load('services/importer.service').importerService;
 let discoveries=0,polls=0;
 service.discover=async()=>{discoveries++;return {job_id:724};};
 service.getJobStatus=async()=>{polls++;return {id:724,status:'done',next_poll_after_seconds:2,discovery:{enrichment_pending:true}};};
 await assert.rejects(service.getNextDiscoveryPage(null,'page-five',controller.signal),/لغو/);
 assert.equal(discoveries,1);assert.equal(polls,1);
});
