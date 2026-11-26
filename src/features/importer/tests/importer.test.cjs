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
test('text discovery posts a trimmed input and accepts the discovery job response',async()=>{const h=harness();h.setResponse({...accepted,status:'queued',result_mode:'discovery'});const result=await h.load('services/importer.service').importerService.discover({query:' wireless headphones '});assert.equal(result.job_id,4207);assert.equal(h.calls[0].url,'/api/products/discover/');assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{input:'wireless headphones'});});
test('URL discovery normalizes a www URL and sends only input',async()=>{const h=harness();h.setResponse({...accepted,result_mode:'discovery'});await h.load('services/importer.service').importerService.discover({source_url:'www.alibaba.com/product-detail/example.html'});assert.equal(h.calls[0].url,'/api/products/discover/');assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{input:'https://www.alibaba.com/product-detail/example.html'});});
test('discovery normalizes bare domains and natural text under input',async()=>{const h=harness();const service=h.load('services/importer.service');h.setResponse({...accepted,result_mode:'discovery'});const urlPayload=service.createDiscoverPayload('alibaba.com/product-detail/watch.html');await service.importerService.discover(urlPayload);assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{input:'https://alibaba.com/product-detail/watch.html'});const queryPayload=service.createDiscoverPayload('wireless headphones');await service.importerService.discover(queryPayload);assert.deepEqual(JSON.parse(JSON.stringify(h.calls[1].body)),{input:'wireless headphones'});});
test('discovery rejects blank/overlong text and malformed accepted responses before use',async()=>{const h=harness();const service=h.load('services/importer.service').importerService;await assert.rejects(service.discover({query:'  '}));await assert.rejects(service.discover({query:'x'.repeat(301)}));assert.equal(h.calls.length,0);h.setResponse({job_id:3});await assert.rejects(service.discover({query:'headphones'}));});
test('invalid single-product links fail before transport and malformed job responses are rejected', async () => {
 const h=harness();const service=h.load('services/single-product-import');
 await assert.rejects(service.singleProductImportStartOptions('javascript:alert(1)').queryFn());
 assert.equal(h.calls.length,0);
 h.setResponse({status:'pending'});
 await assert.rejects(service.singleProductImportStartOptions('https://example.com').queryFn());
});
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

test('URL jobs open their ready main product even when the job redirect fields are empty',()=>{
 const {getImportLinkDetailsPath:route}=harness().load('utils/import-link-navigation');
 const source_url='https://www.alibaba.com/product-detail/camera_123.html';
 const job={status:'done',ready_for_frontend:true,redirect_ready:false,selected_product_slug:'',product_detail_url:'',product:null,
  main_product:{status:'ready',metadata_pending:false,slug:'camera-bag',source_url,detail_url:'/api/product/camera-bag/'}};
 assert.equal(route(job,{source_url}),'/products/camera-bag');
 assert.equal(route({...job,main_product:{...job.main_product,slug:'محصول تست'}},{source_url}),'/products/%D9%85%D8%AD%D8%B5%D9%88%D9%84%20%D8%AA%D8%B3%D8%AA');
 assert.equal(route({...job,main_product:{source_url,catalog_card:{slug:'catalog-bag'}}},{source_url}),'/products/catalog-bag');
 for(const payload of [null,{query:'camera'},{cursor:'next'}]) assert.equal(route(job,payload),null);
 for(const change of [{status:'processing'},{status:'failed'},{ready_for_frontend:false},{main_product:{...job.main_product,metadata_pending:true}},{main_product:{source_url}},{main_product:{...job.main_product,source_url:'https://example.com/other'}}])
  assert.equal(route({...job,...change},{source_url}),null);
});

test('ready URL imports suppress automatic recommendation requests',()=>{
 let requests=0;
 const source_url='https://example.com/product';
 const h=harness({
  react:{useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:fn=>fn()},
  '@tanstack/react-query':{infiniteQueryOptions:value=>value,useInfiniteQuery:()=>({fetchNextPage:async()=>{requests++;},isFetching:false,isError:false})},
  './use-import-job':{useImportJob:()=>({data:{status:'done',ready_for_frontend:true,main_product:{slug:'ready-product',source_url},discovery:{pagination:{has_more:true,next_cursor:'next'}}}})},
  '../mappers/map-import-job-results':{mapImportJobPages:()=>({requested:[{id:1}],suggested:[]})},
  '../services/importer.service':{importerService:{}},
 });
 const result=h.load('hooks/use-import-results').useImportResults('2063',{source_url});
 assert.equal(result.detailsPath,'/products/ready-product');assert.equal(result.hasNextPage,false);assert.equal(requests,0);
});
test('single-product import uses the new POST and same-URL GET contract',async()=>{
 const h=harness();const service=h.load('services/single-product-import');
 const pending={job_id:2066,status:'processing',next_poll_after_seconds:2,product:null,error:''};
 h.setResponse(pending);
 const started=await service.singleProductImportStartOptions('https://www.alibaba.com/product-detail/camera.html?tracking=1').queryFn();
 assert.equal(h.calls[0].url,'/api/product/import/');
 assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)),{url:'https://www.alibaba.com/product-detail/camera.html?tracking=1'});
 assert.equal(started.job_id,2066);
 const ready={...pending,status:'done',next_poll_after_seconds:0,product:{slug:'camera-bag',title_fa:'کیف',price_cny:614.46,gallery:['https://example.com/photo.jpg']}};
 h.setResponse(ready);
 const signal=new AbortController().signal;
 const result=await service.singleProductImportStatusOptions(2066).queryFn({signal});
 assert.equal(h.calls[1].url,'/api/product/import/');assert.equal(h.calls[1].config.params.job_id,2066);assert.equal(h.calls[1].config.signal,signal);
 assert.equal(result.product.price_cny,614.46);assert.equal(result.product.gallery[0],'https://example.com/photo.jpg');
 assert.equal(service.isSingleProductImportSettled(result),true);
 assert.equal(h.calls.some(call=>call.url.includes('/jobs/')||call.url.includes('/discover/')),false);
});

test('single-product import honors the backend poll delay and stops at zero or failure',()=>{
 const h=harness();const service=h.load('services/single-product-import');
 const response={job_id:2066,status:'processing',next_poll_after_seconds:3,product:null,error:''};
 const options=service.singleProductImportStatusOptions(2066,response);
 const interval=data=>options.refetchInterval({state:{status:'success',data}});
 assert.equal(interval(response),3000);
 assert.equal(interval({...response,status:'done',next_poll_after_seconds:2}),2000);
 assert.equal(service.isSingleProductImportSettled({...response,product:{title_fa:'early'}}),false);
 const ready={...response,status:'done',next_poll_after_seconds:0,product:{slug:'محصول'}};
 assert.equal(interval(ready),false);assert.equal(service.isSingleProductImportSettled(ready),true);
 assert.equal(interval({...response,status:'failed',error:'scraping failed'}),false);
 assert.equal(service.getSingleProductImportError({...response,next_poll_after_seconds:0}).includes('بک'),true);
 assert.equal(service.getSingleProductImportError({...ready,error:'failed'}),'failed');
 assert.equal(options.refetchInterval({state:{status:'error',data:response}}),false);
 assert.equal(options.initialData.job_id,2066);
 assert.equal(service.singleProductImportStatusOptions(2067,response).initialData,undefined);
 assert.equal(options.retry,false);assert.equal(options.refetchOnWindowFocus,false);
 assert.equal(service.singleProductImportStartOptions('https://example.com').retry,false);
});

test('single-product import validates responses, rejects a different job and preserves resume parameters',async()=>{
 const h=harness();const service=h.load('services/single-product-import');
 h.setResponse({job_id:2067,status:'done',next_poll_after_seconds:0,product:{slug:'wrong'}});
 await assert.rejects(service.singleProductImportStatusOptions(2066).queryFn({signal:new AbortController().signal}),/شناسه/);
 h.setResponse({job_id:2066,status:'processing',next_poll_after_seconds:-1});
 await assert.rejects(service.singleProductImportStartOptions('https://example.com').queryFn());
 const target=new URL(service.singleProductImportPath('https://example.com/p?a=1&b=2',2066),'https://front.test');
 assert.equal(target.pathname,'/imports/single');assert.equal(target.searchParams.get('job_id'),'2066');assert.equal(target.searchParams.get('url'),'https://example.com/p?a=1&b=2');
 assert.throws(()=>service.singleProductImportPath('javascript:alert(1)'));
});
test('progressive import accepts a product before slug and retains already loaded sections across polls',()=>{
 const h=harness();const service=h.load('services/single-product-import');const map=h.load('mappers/import-product-view').mapImportProductView;
 const first=service.singleProductImportSchema.parse({job_id:2768,status:'processing',next_poll_after_seconds:2,product:{title_fa:'فرنچ پرس',gallery:['https://example.com/a.jpg']},error:''});
 assert.equal(map(first).hasData,true);assert.equal(map(first).settled,false);assert.equal(map(first).amount,null);
 const second=service.reconcileSingleProductImport(first,{...first,product:{price_cny:84.19,seller:{name:'Seller'}}});
 assert.equal(second.product.title_fa,'فرنچ پرس');assert.equal(map(second).gallery.length,1);assert.equal(map(second).amount,84.19);
 const temporary=service.reconcileSingleProductImport(second,{...first,product:{gallery:[],seller:null}});
 assert.equal(map(temporary).gallery.length,1);assert.equal(map(temporary).seller.name,'Seller');
 assert.equal(service.reconcileSingleProductImport(second,{...first,product:null}).product.price_cny,84.19);
 const final=service.reconcileSingleProductImport(temporary,{...first,status:'done',next_poll_after_seconds:0,product:{slug:'coffee',gallery:[],seller:null}});
 assert.equal(map(final).settled,true);assert.equal(map(final).gallery.length,0);assert.equal(map(final).seller,null);assert.equal(map(final).amount,84.19);
 const failed=service.reconcileSingleProductImport(second,{...first,status:'failed',next_poll_after_seconds:0,error:'failed',product:null});
 assert.equal(map(failed).amount,84.19);assert.equal(map(failed).settled,true);
 const other=service.reconcileSingleProductImport(second,{...first,job_id:999,product:{title_fa:'Different'}});
 assert.equal(map(other).amount,null);assert.equal(map(other).gallery.length,0);
});

test('current coffee import contract maps real prices, tiers, gallery and all seller fields without mock detail data',()=>{
 const h=harness();const map=h.load('mappers/import-product-view').mapImportProductView;
 const view=map({job_id:2768,status:'done',next_poll_after_seconds:0,error:'',product:{
  slug:'coffee',product_code:'IRM-477199',title_en:'French Coffee Press',title_fa:'فرنچ پرس',source_url:'https://www.alibaba.com/product-detail/coffee.html',price_cny:'84.19',original_price_cny:93.52,percentage:10,weight_kg:1.05,
  ladder_price:[{min_quantity:50,max_quantity:99,price:'102.06',currency:'CNY',original_price:'113.37'},{min_quantity:1000,max_quantity:null,price:'84.19',currency:'CNY'}],
  key_attributes:{Material:'سرامیک',Usage:'خانه'},gallery:['https://example.com/1.jpg','https://example.com/1.jpg','javascript:alert(1)'],
  specifications:{Capacity:'600 ml'},
  other_sellers:[{slug:'seller-offer',fa_title:'Offer',price_cny:'0',price_toman:'12500',alibaba_verified:true,iranmobix_verified:true}],
  related_products:[{slug:'related-one',fa_title:'Related',price_cny:'-1'}],
  comments:[{author_name:'Reviewer',published_at_jalali:'1405/09/01',text:'Original',translated_text:'Translated'}],
  seller:{seller_url:'https://www.alibaba.com/store/sample',name:'Guangzhou Donghan Ceramics Co., Ltd.',verified:true,is_iranmobix_selected:true,location:'Guangzhou, Guangdong, CN',rating:5,image:'https://example.com/seller.jpg',response_time:'≤5h',floorspace:'1000m²',year_founded:'2002',employees:'11',online_revenue:'US$ 630,000+',on_time_dispatch_rate:'100.0%',main_markets:[],service_quality_control:['Minor customization','Finished product inspection']},
 }});
 assert.equal(view.title,'فرنچ پرس');assert.equal(view.code,'IRM-477199');assert.equal(view.amount,84.19);assert.equal(view.original,93.52);assert.equal(view.percentage,10);
 assert.equal(view.tiers.length,2);assert.equal(view.tiers[1].maximum,null);assert.equal(view.gallery.length,1);
 assert.deepEqual(Object.entries(view.translatedSpecifications),[['Capacity','600 ml']]);
 assert.equal(view.mainSpecifications.Material,view.mainSpecifications.Material.trim());
 assert.equal(view.seller.rating,5);assert.equal(view.seller.trust.verified,true);assert.equal(view.seller.logo,'https://example.com/seller.jpg');assert.equal(view.seller.companyOverview.yearFounded,'2002');assert.equal(view.seller.companyOverview.employees,'11');assert.equal(view.seller.services.length,2);
 assert.equal(view.seller.officialUrl,'https://www.alibaba.com/store/sample');
 assert.equal(view.otherSellers[0].price.amount,0);assert.equal(view.otherSellers[0].price.amountIrr,125000);
 assert.equal(view.otherSellers[0].seller.badges.join(','),'verified,iranmobix');
 assert.equal(view.relatedProducts[0].price.amount,null);
 assert.equal(view.comments[0].text,'Translated');assert.equal(view.comments[0].date,'1405/09/01');
});

test('missing and invalid import values stay unavailable while a genuine zero price is retained',()=>{
 const h=harness();const map=h.load('mappers/import-product-view').mapImportProductView;
 const response={job_id:1,status:'processing',next_poll_after_seconds:2,product:{price_cny:null,gallery:[],seller:null}};
 assert.equal(map(response).amount,null);assert.equal(map(response).hasData,false);
 for(const price of ['',true,-1,'NaN','Infinity','abc']) assert.equal(map({...response,product:{price_cny:price}}).amount,null);
 assert.equal(map({...response,product:{price_cny:0}}).amount,0);
 assert.equal(map({...response,status:'failed',error:'failed'}).settled,true);
});

test('single import controller persists its job and never navigates to a product or fetches product details',()=>{
 for(const state of ['accepted','processing','done','network-error']) {
  const navigations=[],effects=[],options=[];let calls=0;
  const response={job_id:2768,status:state==='done'?'done':'processing',next_poll_after_seconds:state==='done'?0:2,product:{title_fa:'Coffee',slug:'coffee',price_cny:84.19},error:''};
  const h=harness({react:{useEffect:fn=>effects.push(fn)},'next/navigation':{useRouter:()=>({replace:href=>navigations.push(href)})},'@tanstack/react-query':{queryOptions:value=>value,useQuery:option=>{options.push(option);calls++;return calls===1?{data:response,isError:false,isFetching:false}:{data:response,isError:state==='network-error',isFetching:false};}}});
  const result=h.load('hooks/use-single-product-import').useSingleProductImport('https://example.com/coffee',state==='accepted'?undefined:2768);
  effects.forEach(effect=>effect());
  assert.equal(result.product.title,'Coffee');assert.equal(result.product.amount,84.19);
  assert.equal(options[0].enabled,state==='accepted');assert.equal(options[1].enabled,true);
  assert.equal(navigations.some(path=>path.startsWith('/products/')),false);assert.equal(h.calls.length,0);
  assert.equal(navigations.length,state==='accepted'?1:0);
  if(navigations[0])assert.equal(new URL(navigations[0],'https://front.test').searchParams.get('job_id'),'2768');
  assert.equal(Boolean(result.error),state==='network-error');
 }
});
test('single import displays each valid section on its own',()=>{
 const map=harness().load('mappers/import-product-view').mapImportProductView;
 const base={job_id:1,status:'processing',next_poll_after_seconds:2};
 const product={title_en:'Coffee',gallery:['https://example.com/a.jpg'],price_cny:0,key_attributes:{Material:'Ceramic'}};
 assert.equal(map({...base,product}).hasData,true);
 for(const key of ['title_en','gallery','price_cny','key_attributes']) {
  const incomplete={[key]:product[key]};
  assert.equal(map({...base,product:incomplete}).hasData,true,key);
 }
 assert.equal(map({...base,product:{...product,title_en:'',title_fa:'قهوه'}}).hasData,true);
 assert.equal(map({...base,product:{gallery:['javascript:alert(1)']}}).hasData,false);
 const ratingOnly=map({...base,product:{seller:{rating:4.7}}});
 assert.equal(ratingOnly.hasData,true);assert.equal(ratingOnly.seller.rating,4.7);assert.equal(ratingOnly.seller.name,'');
 const ratingZero=map({...base,product:{...product,seller:{rating:0}}});
 assert.equal(ratingZero.seller.rating,0);
 const service=harness().load('services/single-product-import');
 const merged=service.reconcileSingleProductImport({...base,product:{...product,seller:{rating:4.7}}},{...base,product:{seller:{name:'Supplier'}}});
 const enriched=map(merged);assert.equal(enriched.hasData,true);assert.equal(enriched.seller.rating,4.7);assert.equal(enriched.seller.name,'Supplier');
});
test('prohibited imports accept structured errors, stop polling and discard any previously received product',async()=>{
 const h=harness();const service=h.load('services/single-product-import');
 const response={job_id:3080,status:'failed',next_poll_after_seconds:0,product:null,error:{code:'prohibited_product',message:'این کالا مجاز نیست؛ بیسیم / واکی تاکی',reason_code:'radio',retryable:false}};
 const parsed=service.singleProductImportSchema.parse(response);
 assert.equal(service.isSingleProductImportProhibited(parsed),true);assert.equal(service.canRetrySingleProductImport(parsed),false);
 assert.match(service.getSingleProductImportError(parsed),/امکان واردکردن و نمایش/);assert.match(service.getSingleProductImportError(parsed),/واکی تاکی/);
 const previous={...response,status:'processing',next_poll_after_seconds:2,error:'',product:{title_fa:'Product',price_cny:5}};
 assert.equal(service.reconcileSingleProductImport(previous,parsed).product,null);
 assert.equal(service.singleProductImportStatusOptions(3080).refetchInterval({state:{status:'success',data:parsed}}),false);
 h.setResponse(response);assert.equal((await service.singleProductImportStartOptions('https://www.alibaba.com/product-detail/item.html').queryFn()).error.code,'prohibited_product');
 const mapped=h.load('mappers/import-product-view').mapImportProductView(parsed);assert.equal(mapped.settled,true);assert.equal(mapped.hasData,false);
 assert.equal(service.getSingleProductImportError({...response,error:'legacy error'}),'legacy error');
 assert.equal(service.canRetrySingleProductImport({...response,error:{code:'unavailable',message:'Later',retryable:false}}),false);
});

test('nonretryable import failures cannot start a replacement job through retry',()=>{
 const response={job_id:3080,status:'failed',next_poll_after_seconds:0,product:null,error:{code:'prohibited_product',message:'ممنوع',retryable:false}};
 const options=[];
 const h=harness({react:{useEffect:()=>{}},'next/navigation':{useRouter:()=>({replace:()=>{}})},'@tanstack/react-query':{queryOptions:value=>value,useQuery:option=>{options.push(option);return {data:response,isError:false,isFetching:false,refetch:()=>assert.fail('must not retry prohibited import')};}}});
 const state=h.load('hooks/use-single-product-import').useSingleProductImport('https://example.com/item');
 assert.equal(state.canRetry,false);assert.equal(state.isProhibited,true);assert.equal(options[1].enabled,false);state.retry();
});
test('main import specifications prioritize weight, use only key attributes and never exceed six items',()=>{
 const map=harness().load('mappers/import-product-view').mapImportProductView;
 const attributes=Object.fromEntries(Array.from({length:8},(_,i)=>['Attribute '+i,'Value '+i]));
 const response={job_id:1,status:'processing',next_poll_after_seconds:2,product:{weight_kg:'1.05',key_attributes:attributes,specifications:{Unrelated:'Full specification'}}};
 const view=map(response);const entries=Object.entries(view.mainSpecifications);
 assert.equal(entries.length,6);assert.deepEqual(entries[0],['وزن','1.05 کیلوگرم']);assert.equal(entries[1][0],'Attribute 0');assert.equal(entries[5][0],'Attribute 4');
 assert.equal(view.translatedSpecifications.Unrelated,'Full specification');assert.equal(view.mainSpecifications.Unrelated,undefined);
 for(const weight of [undefined,null,'',-1,'invalid']) {
  const without=map({...response,product:{...response.product,weight_kg:weight}});
  assert.equal(Object.keys(without.mainSpecifications).length,6);assert.equal(Object.keys(without.mainSpecifications)[0],'Attribute 0');
 }
 const onlyWeight=map({...response,product:{weight_kg:0}});assert.equal(onlyWeight.mainSpecifications['وزن'],'0 کیلوگرم');
 const empty=map({...response,product:{key_attributes:{Blank:' ',Nested:{value:'x'},Zero:0,Material:'Ceramic'}}});
 assert.deepEqual(Object.keys(empty.mainSpecifications),['Zero','Material']);
});
test("image job listing contract maps complete cards without product-detail scraping", async () => {
  const h=harness();
  const response={id:10788,status:"done",status_label:"تکمیل شده",import_type:"image",result_mode:"list",ready_for_frontend:true,next_poll_after_seconds:0,results:[{
    slug:"portable-neck-fan",primary_image:"https://example.com/product.jpg",source_url:"https://www.alibaba.com/product-detail/example_1600000000000.html",
    en_title:"Portable Neck Fan",fa_title:"",seller_name:"Example Supplier Co., Ltd.",seller_url:"",alibaba_verified:true,iranmobix_verified:false,
    price_in_china_cny:"28.07",price_in_china_toman:"1180000",final_price_iran:null
  }]};
  h.setResponse(response);
  const job=await h.load("services/importer.service").importerService.getJobStatus("10788");
  const card=h.load("mappers/map-import-job-results").mapImportJobResults(job).requested[0];
  assert.equal(card.slug,"portable-neck-fan");
  assert.equal(card.title,"Portable Neck Fan");
  assert.equal(card.image,response.results[0].primary_image);
  assert.equal(card.price.amount,28.07);
  assert.equal(card.price.currency,"CNY");
  assert.equal(card.price.amountIrr,11800000);
  assert.equal(card.seller.name,"Example Supplier Co., Ltd.");
  assert.ok(card.seller.badges.includes("verified"));
  assert.equal(h.calls.length,1);
  assert.equal(h.calls[0].url,"/api/products/jobs/10788/");
  const translated={...response,results:[{...response.results[0],fa_title:"پنکه گردنی",price_in_china_cny:"0",iranmobix_verified:true}]};
  const mapped=h.load("mappers/map-import-job-results").mapImportJobResults(h.load("schemas/importer.schema").importJobSchema.parse(translated)).requested[0];
  assert.equal(mapped.title,"پنکه گردنی");assert.equal(mapped.price.amount,0);assert.ok(mapped.seller.badges.includes("trusted"));
});

test("image polling stops at ready_for_frontend even while processing and follows server intervals before readiness", () => {
  let options;
  const h=harness({"@tanstack/react-query":{useQuery:value=>{options=value;return value;}}});
  h.load("hooks/use-import-job").useImportJob("10788");
  const job={id:10788,import_type:"image",status:"processing",ready_for_frontend:false,next_poll_after_seconds:3};
  const state=data=>({state:{status:"success",data}});
  assert.equal(options.refetchInterval(state(job)),3000);
  assert.equal(options.refetchInterval(state({...job,ready_for_frontend:true})),false);
  assert.equal(options.staleTime(state({...job,ready_for_frontend:true})),Infinity);
  assert.equal(options.refetchInterval(state({...job,status:"done"})),false);
});

test("image URL submission uses JSON while uploads retain multipart", async () => {
  const h=harness();h.setResponse({...accepted,import_type:"image"});
  await h.load("services/importer.service").importerService.importImage({image_url:"https://example.com/product.jpg"});
  assert.equal(h.calls.length,1);
  assert.equal(h.calls[0].url,"/api/products/import/image/");
  assert.equal(h.calls[0].body.image_url,"https://example.com/product.jpg");
  assert.ok(!(h.calls[0].body instanceof FormData));
});

test("ready image results paginate only on scroll, not because there is a single card", async () => {
  let requests=0;
  const h=harness({
    react:{useMemo:fn=>fn(),useCallback:fn=>fn,useEffect:fn=>fn()},
    "@tanstack/react-query":{infiniteQueryOptions:value=>value,useInfiniteQuery:()=>({fetchNextPage:async()=>{requests++;},isFetching:false,isError:false})},
    "./use-import-job":{useImportJob:()=>({data:{status:"processing",ready_for_frontend:true,import_type:"image",discovery:{pagination:{has_more:true,next_cursor:"lens-next"}}}})},
    "../mappers/map-import-job-results":{mapImportJobPages:()=>({requested:[{id:1}],suggested:[]})},
    "../services/importer.service":{importerService:{}},
  });
  const result=h.load("hooks/use-import-results").useImportResults("10788",null);
  assert.equal(result.hasNextPage,true);assert.equal(requests,0);
  await result.fetchNextPage();assert.equal(requests,1);
});

test("pending image jobs with null pagination remain valid and continue polling", async () => {
  const h=harness();
  const response={
    id:10789,source_url:"image-search",source:"image-search",status:"pending",
    product:null,main_product:null,other_products:[],import_type:"image",result_mode:"list",
    status_label:"در حال پردازش",ready_for_frontend:false,error_message:"",error_action:{},
    next_poll_after_seconds:3,discovered_urls:[],
    discovery:{enabled:true,enrichment_pending:false,urls:[],candidates:[],candidate_count:0,ranking_status:"pending",pagination:null},
    results:[],selected_product_slug:"",product_detail_url:"",redirect_ready:false
  };
  h.setResponse(response);
  const job=await h.load("services/importer.service").importerService.getJobStatus("10789");
  assert.equal(job.discovery.pagination,null);
  assert.equal(job.status,"pending");
  const view=h.load("mappers/map-import-job-results").mapImportJobResults(job);
  assert.equal(view.requested.length+view.suggested.length,0);
  const polling=harness({"@tanstack/react-query":{useQuery:value=>value}}).load("hooks/use-import-job").useImportJob("10789");
  assert.equal(polling.refetchInterval({state:{status:"success",data:job}}),3000);
  assert.equal(polling.staleTime({state:{status:"success",data:job}}),0);
});

test("image upload navigates its preopened tab to products with image_job", async () => {
  const h=harness();let target;
  const order=[];
  const {imageSearchResultsPath}=h.load("utils/image-search-navigation");
  const tab={closed:false,opener:{},location:{replace:path=>{target=path;}},close(){this.closed=true;}};
  await h.load("services/import-search-navigation").runImportSearch({
    request:async()=>{order.push("upload");return {...accepted,job_id:10789,import_type:"image"};},
    resultsPath:imageSearchResultsPath,
    openTab:()=>{order.push("tab");return tab;},navigate:()=>assert.fail("result tab is open"),
  });
  assert.equal(target,"/products?image_job=10789");assert.deepEqual(order,["tab","upload"]);
});

test("image result selection imports the source URL and leaves reuse to the backend", async () => {
  const h=harness({"@tanstack/react-query":{queryOptions:value=>value}});
  const source="https://www.alibaba.com/product-detail/Portable-Fan_1600000000000.html?x=1&y=2";
  const href=h.load("utils/image-search-navigation").imageSearchProductPath(source);
  const route=new URL(href,"https://front.test");
  assert.equal(route.pathname,"/imports/single");
  assert.equal(route.searchParams.get("url"),source);
  assert.equal(h.calls.length,0);
  h.setResponse({job_id:123,status:"pending",next_poll_after_seconds:3,product:null,error:null});
  await h.load("services/single-product-import").singleProductImportStartOptions(route.searchParams.get("url")).queryFn({});
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].url,"/api/product/import/");assert.equal(h.calls[0].body.url,source);
  assert.equal(h.load("utils/image-search-navigation").imageSearchProductPath("javascript:alert(1)"),undefined);
});

test("compact image pending responses use the known route context and keep polling", async () => {
  const compact={ready_for_frontend:false,status:"pending",status_label:"در حال پردازش",next_poll_after_seconds:3,error_message:"",results:[]};
  const h=harness();
  h.setResponse(compact);
  const service=h.load("services/importer.service").importerService;
  const job=await service.getJobStatus("10789",undefined,"image");
  assert.equal(job.id,10789);assert.equal(job.import_type,"image");assert.equal(job.result_mode,"list");
  assert.equal(job.status,"pending");assert.equal(job.ready_for_frontend,false);
  const polling=harness({"@tanstack/react-query":{useQuery:value=>value}}).load("hooks/use-import-job").useImportJob("10789","image");
  assert.equal(polling.refetchInterval({state:{status:"success",data:job}}),3000);
  h.setResponse({...compact,ready_for_frontend:true,status:"done",next_poll_after_seconds:0});
  const done=await service.getJobStatus("10789",undefined,"image");
  assert.equal(polling.refetchInterval({state:{status:"success",data:done}}),false);
  h.setResponse({...compact,id:999});
  await assert.rejects(service.getJobStatus("10789",undefined,"image"));
});

test("image query forwards context without guessing backend job fields", async () => {
  let sent;
  const h=harness({
    "@tanstack/react-query":{useQuery:value=>value},
    "../services/importer.service":{importerService:{getJobStatus:(...args)=>{sent=args;}}},
  });
  const signal=new AbortController().signal;
  const query=h.load("hooks/use-import-job").useImportJob("10789","image");
  await query.queryFn({signal});
  assert.deepEqual(sent,["10789",signal,"image"]);
});

test("compact completed image cards render from the legacy results route without explicit image context", async () => {
  const h=harness();
  const compact=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures/image-job-completed.json"),"utf8"));
  h.setResponse(compact);
  const job=await h.load("services/importer.service").importerService.getJobStatus("10789");
  assert.equal(job.import_type,"image");assert.equal(job.id,10789);
  const grouped=h.load("mappers/map-import-job-results").mapImportJobPages([job]);
  const cards=[...grouped.requested,...grouped.suggested];
  assert.equal(cards.length,19);
  assert.equal(cards[0].title,compact.results[0].en_title);
  assert.equal(cards[0].image,compact.results[0].primary_image);
  assert.equal(cards[0].price.amount,229);
  assert.ok(cards.every(card=>card.image && card.title && card.price.currency==="CNY"));
});

test("compact pending status remains pollable without an image-route hint", async () => {
  const h=harness();
  h.setResponse({ready_for_frontend:false,status:"pending",status_label:"processing",next_poll_after_seconds:3,error_message:"",results:[]});
  const job=await h.load("services/importer.service").importerService.getJobStatus("10789");
  assert.equal(job.id,10789);assert.equal(job.status,"pending");
  const options=harness({"@tanstack/react-query":{useQuery:value=>value}}).load("hooks/use-import-job").useImportJob("10789");
  assert.equal(options.refetchInterval({state:{status:"success",data:job}}),3000);
});

test("image results require all six fields and accept numeric zero prices", () => {
  const h=harness();
  const {isCompleteImageResult}=h.load("utils/image-result-validation");
  const valid={slug:"earrings",primary_image:"https://example.com/image.jpg",source_url:"https://www.alibaba.com/product-detail/earrings.html",en_title:"Earrings",price_in_china_cny:"0",price_in_china_toman:0};
  assert.equal(isCompleteImageResult(valid),true);
  for(const field of ["slug","primary_image","source_url","en_title","price_in_china_cny","price_in_china_toman"]) {
    assert.equal(isCompleteImageResult({...valid,[field]:""}),false,field);
    assert.equal(isCompleteImageResult({...valid,[field]:null}),false,field);
  }
  assert.equal(isCompleteImageResult({...valid,primary_image:"javascript:alert(1)"}),false);
  assert.equal(isCompleteImageResult({...valid,price_in_china_cny:"-1"}),false);
});

test("incomplete image cards stay hidden while complete cards remain visible", () => {
  const h=harness();
  const valid=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures/image-job-completed.json"),"utf8")).results[0];
  const job={id:1,import_type:"image",status:"done",ready_for_frontend:true,next_poll_after_seconds:0,result_mode:"list",results:[{...valid,slug:"empty",primary_image:"",en_title:"",price_in_china_cny:"",price_in_china_toman:null},valid]};
  const cards=h.load("mappers/map-import-job-results").mapImportJobResults(job);
  assert.equal(cards.requested.length+cards.suggested.length,1);
  assert.equal(cards.requested[0].slug,valid.slug);
});

test("incomplete completed image search reuploads the same image at most twice and polls replacement jobs", async () => {
  const payload={image_url:"https://example.com/upload.jpg"};
  let saved={payload,activeJobId:"10",retries:0},posts=0;
  const gets=[];
  const h=harness({
    "./image-search-request.storage":{
      readImageSearchRequest:async()=>saved,
      saveImageSearchRequest:async(id,value)=>{assert.equal(id,"10");saved=value;},
    },
    "../api/importer.api":{importerApi:{
      getJobStatus:async id=>{gets.push(id);return {id:Number(id),import_type:"image",status:"done",ready_for_frontend:true,next_poll_after_seconds:0,result_mode:"list",results:[{slug:"empty",source_url:"https://example.com/item",primary_image:"",en_title:"",price_in_china_cny:"",price_in_china_toman:null}]};},
      importImage:async value=>{assert.equal(value,payload);posts++;return {...accepted,job_id:10+posts,import_type:"image",next_poll_after_seconds:3};},
    }},
  });
  const service=h.load("services/importer.service").importerService;
  const first=await service.getJobStatus("10",undefined,"image");
  assert.equal(first.status,"processing");assert.equal(first.ready_for_frontend,false);
  assert.equal(first.next_poll_after_seconds,3);
  await service.getJobStatus("10",undefined,"image");
  const final=await service.getJobStatus("10",undefined,"image");
  assert.equal(final.status,"done");assert.equal(posts,2);
  assert.deepEqual(gets,["10","11","12"]);
});

test("pending and complete valid image responses never restart the image POST", async () => {
  const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,"fixtures/image-job-completed.json"),"utf8"));
  for(const response of [{...fixture,status:"pending",ready_for_frontend:false,next_poll_after_seconds:3,results:[{slug:"empty"}]},fixture]) {
    const h=harness({
      "./image-search-request.storage":{readImageSearchRequest:async()=>({payload:{image_url:"https://example.com/photo.jpg"},activeJobId:"10",retries:0})},
      "../api/importer.api":{importerApi:{getJobStatus:async()=>response,importImage:()=>assert.fail("unexpected reupload")}},
    });
    await h.load("services/importer.service").importerService.getJobStatus("10",undefined,"image");
  }
});

test("direct imports use canonical Alibaba product URLs while categories and sellers use discovery input", () => {
  const service = harness().load("services/importer.service");
  for (const url of [
    "https://www.alibaba.com/product-detail/Camera_1601341914574.html?spm=tracking",
    "https://m.alibaba.com/product-detail/Camera_1601341914574.html",
    "alibaba.com/product-detail/watch.html",
  ]) {
    const payload = service.createDiscoverPayload(url);
    assert.equal(service.isDirectProductUrl(payload.input), true);
  }
  for (const input of [
    "wireless headphones", "هدفون بی سیم",
    "https://www.alibaba.com/catalog/headphones_cid100.html",
    "https://www.alibaba.com/showroom/headphones.html",
    "https://www.alibaba.com/trade/search?SearchText=product-detail",
    "https://supplier.en.alibaba.com/",
    "https://alibaba.com.example.org/product-detail/camera.html",
  ]) assert.equal(service.isDirectProductUrl(service.createDiscoverPayload(input).input), false, input);
});

test("discovery input posts exactly input and optional cursor without query or source_url", async () => {
  const h = harness();
  h.setResponse({...accepted, import_type: "search"});
  const service = h.load("services/importer.service").importerService;
  await service.discover({input: " هدفون بی سیم "});
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)), {input: "هدفون بی سیم"});
  await service.discover({input: "www.alibaba.com/catalog/headphones.html", cursor: "next"});
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls[1].body)), {input: "https://www.alibaba.com/catalog/headphones.html", cursor: "next"});
});

test("text discovery polls compact jobs then reuses storefront cards without image retry or deep scraping", async () => {
  const h = harness({"@tanstack/react-query": {useQuery: value => value}});
  const service = h.load("services/importer.service").importerService;
  h.setResponse({ready_for_frontend: false, status: "pending", next_poll_after_seconds: 3, results: []});
  const pending = await service.getJobStatus("10801", undefined, "search");
  const options = h.load("hooks/use-import-job").useImportJob("10801", "search");
  assert.equal(pending.import_type, "search");
  assert.equal(options.refetchInterval({state: {status: "success", data: pending}}), 3000);
  const card = {slug: "headphones", primary_image: "https://example.com/image.jpg", source_url: "https://www.alibaba.com/product-detail/Headphones_123.html", en_title: "Headphones", fa_title: "هدفون", seller_name: "Actual Seller", alibaba_verified: true, iranmobix_verified: false, price_in_china_cny: "28.07", price_in_china_toman: "1180000", final_price_iran: null};
  h.setResponse({ready_for_frontend: true, status: "processing", next_poll_after_seconds: 2, results: [card]});
  const ready = await service.getJobStatus("10801", undefined, "search");
  assert.equal(options.refetchInterval({state: {status: "success", data: ready}}), false);
  const mapped = h.load("mappers/map-import-job-results").mapImportJobResults(ready).requested[0];
  assert.equal(mapped.title, "هدفون");
  assert.equal(mapped.image, card.primary_image);
  assert.equal(mapped.price.amount, 28.07);
  assert.equal(mapped.price.amountIrr, 11800000);
  assert.equal(mapped.price.finalPriceIranToman, null);
  assert.equal(h.calls.length, 2);
  assert.ok(h.calls.every(call => call.url === "/api/products/jobs/10801/"));
});
