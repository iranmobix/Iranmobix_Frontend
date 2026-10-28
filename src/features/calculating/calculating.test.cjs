/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function harness(http = {}) {
  const cache = new Map();
  function load(file) {
    let absolute = path.resolve(__dirname, file);
    absolute += fs.existsSync(absolute + '.ts') ? '.ts' : '.tsx';
    if (cache.has(absolute)) return cache.get(absolute);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
      fileName: absolute,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports,
      require: (name) => name === '@/shared/api' ? http : name.startsWith('.')
        ? load(path.relative(__dirname, path.resolve(path.dirname(absolute), name))) : require(name),
    });
    cache.set(absolute, module.exports);
    return module.exports;
  }
  return load;
}
const input = (extra = {}) => ({ type: 'cbm', cbm: 0.06, cartonCount: 2,
  actualWeight: 10, shippingMethod: 'sea', cargoCategory: 'کالای نرمال', productValue: 100,
  hasBattery: true, hasMagnet: false, isBranded: false, ...extra });
const response = (extra = {}) => ({ calculation_basis: 'dimensions',
  volumetric_weight_kg: '20.04', actual_weight_kg: '20', carton_price_irt: '32000000',
  domestic_shipping_irt: '0', purchase_service_fee_irt: '609600', total_irt: '36673600',
  total_cbm: '0.12', status: 'calculated', ...extra });
const load = harness();
const schema = load('schemas/calculating.schema').calculatingSchema;
const payload = load('mappers/calculating.mapper').toCalculatingApiPayload;
const map = load('mappers/calculating-result.mapper').mapCalculatingResult;

test('CBM sends exact category and per-carton values without dimensions', () => {
  const value = payload(input({length: 30, hasMagnet: true}));
  assert.equal(value.cargo_category, 'کالای نرمال');
  assert.equal(value.cbm, '0.06');
  assert.equal(value.carton_count, 2);
  assert.equal(value.actual_weight_kg, '10');
  assert.equal(value.item_value, '100');
  assert.equal(value.has_battery, true);
  assert.equal(value.has_magnet, true);
  assert.equal('length_cm' in value, false);
});
test('dimensions never sends CBM and supports combined shipping', () => {
  const value = payload(input({type: 'dimensions', length: 30, width: 40, height: 50, shippingMethod: 'combined'}));
  assert.equal(value.length_cm, '30');
  assert.equal(value.shipping_mode, 'combined');
  assert.equal('cbm' in value, false);
});
test('category is mandatory and carton count must be an integer', () => {
  for (const change of [{cargoCategory:''}, {cartonCount:1.5}, {cartonCount:0}]) {
    assert.equal(schema.safeParse(input(change)).success, false);
  }
});
test('rejects missing, negative, infinite and overprecision measurements', () => {
  for (const change of [{cbm:undefined}, {cbm:-1}, {cbm:Infinity}, {cbm:0.0000001},
    {actualWeight:1.2345}, {productValue:1.001}, {type:'dimensions',length:1.001,width:2,height:3}]) {
    assert.equal(schema.safeParse(input(change)).success, false);
  }
});
test('maps server totals without multiplying cartons or converting IRT again', () => {
  const value = map(response());
  assert.equal(value.cbm, 0.12);
  assert.equal(value.totalCost, 36673600);
  assert.equal(value.actualWeight, 20);
  assert.equal(value.domesticShippingCost, 0);
});
test('missing and null amounts remain unavailable while actual zero remains zero', () => {
  const value = map(response({carton_price_irt:null,total_irt:undefined,total_cbm:undefined}));
  assert.equal(value.cartonPrice, null);
  assert.equal(value.totalCost, null);
  assert.equal(value.cbm, null);
  assert.equal(value.domesticShippingCost, 0);
});
test('quote_required and expert review never display a final amount', () => {
  for (const extra of [{status:'quote_required'}, {requires_expert_review:true}]) {
    const value = map(response(extra));
    assert.equal(value.status, 'quote_required');
    assert.equal(value.totalCost, null);
    assert.equal(value.cartonPrice, null);
  }
});
test('malformed backend money is rejected instead of becoming NaN or zero', () => {
  for (const total_irt of ['', 'oops', '-1', false, '99999999999999999999']) {
    assert.throws(() => map(response({total_irt})));
  }
});
test('service uses documented paths and preserves exact category names', async () => {
  const calls = [];
  const local = harness({
    httpGet: async (url) => {calls.push(url); return {categories:['کالای نرمال']};},
    httpPost: async (url, body) => {calls.push(url,body); return response({calculation_basis:'cbm'});},
  });
  const service = local('services/calculating.service');
  assert.equal((await service.getFreightCategories())[0], 'کالای نرمال');
  await service.calculateFreight(payload(input()));
  assert.equal(calls[0], '/api/shipping/freight/categories/');
  assert.equal(calls[1], '/api/shipping/freight/calculate/');
  assert.equal(calls[2].cargo_category, 'کالای نرمال');
});
test('service rejects responses for the wrong calculation basis', async () => {
  const local = harness({httpPost: async () => response()});
  await assert.rejects(local('services/calculating.service').calculateFreight(payload(input())));
});
test('result rendering shows expert message without price rows', () => {
  const Component = load('components/calculating-result').CalculatingResult;
  const html = renderToStaticMarkup(React.createElement(Component, {
    type:'dimensions', result:map(response({status:'quote_required', message:'نیاز به استعلام'})),
  }));
  assert.ok(html.includes('نیاز به استعلام'));
  assert.equal(html.includes('جمع کل'), false);
});
test('result formatting distinguishes missing values and actual zero', () => {
  const format = load('utils/format-number').formatResultValue;
  assert.equal(format(null, 'تومان'), '—');
  assert.equal(format(undefined), '—');
  assert.equal(format(0, 'تومان'), '۰ تومان');
});
test('API error messages survive validation, missing rate and currency failures', () => {
  const errorMessage = load('utils/calculating-error').getCalculatingError;
  for (const message of ['دسته‌بندی نامعتبر', 'تعرفه موجود نیست', 'نرخ ارز موجود نیست']) {
    assert.equal(errorMessage({isAxiosError:true,response:{data:{error:{message}}}}),message);
  }
});
