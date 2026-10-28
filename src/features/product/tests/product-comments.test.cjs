/* eslint-disable @typescript-eslint/no-require-imports, @next/next/no-assign-module-variable */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");

// Exercise the actual event handlers with controlled auth and persistent hook state.
function harness(component, initialToken = null) {
  const state = {token: initialToken, hooks: [], cursor: 0, redirects: [], submitted: []};
  const mockReact = {...React, useId: () => "comment-form", useState(initial) {
    const index = state.cursor++;
    if (!(index in state.hooks)) state.hooks[index] = typeof initial === "function" ? initial() : initial;
    return [state.hooks[index], (value) => { state.hooks[index] = typeof value === "function" ? value(state.hooks[index]) : value; }];
  }};
  const base = path.resolve(__dirname, "..");
  const cache = new Map();
  function load(file) {
    let absolute = path.resolve(base, file);
    absolute += fs.existsSync(absolute + ".ts") ? ".ts" : ".tsx";
    if (cache.has(absolute)) return cache.get(absolute);
    const module = {exports:{}};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
      fileName:absolute,
      compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true},
    }).outputText, {
      module, exports:module.exports, crypto:require("node:crypto").webcrypto,
      window:{location:{pathname:"/products/item", search:"?currency=CNY"}},
      require(name) {
        if (name === "react") return mockReact;
        if (name === "next/navigation") return {useRouter:() => ({push:url => state.redirects.push(url)})};
        if (name === "next/image") return {__esModule:true,default:"mock-image"};
        if (name === "@/features/auth/hooks/use-access-token") return {useAccessToken:() => state.token};
        if (name === "@/features/auth/utils/token-storage") return {tokenStorage:{getAccessToken:() => state.token}};
        if (name === "./product-comment-dialog") return {__esModule:true,default:"comment-dialog"};
        if (name === "radix-ui") return {
          Dialog:Object.fromEntries(["Root","Trigger","Portal","Overlay","Content","Title","Close","Description"].map(key => [key, `dialog-${key.toLowerCase()}`])),
          Tabs:Object.fromEntries(["Root","List","Trigger","Content"].map(key => [key, `tabs-${key.toLowerCase()}`])),
        };
        return name.startsWith(".") ? load(path.relative(base,path.resolve(path.dirname(absolute),name))) : require(name);
      },
    });
    cache.set(absolute, module.exports);
    return module.exports;
  }
  const Component = load(`components/detail/${component}`).default;
  return {state, render() {
    state.cursor = 0;
    return Component(component === "product-comments" ? {product:{title:"Item",slug:"item"}} : {onSubmit: text => state.submitted.push(text)});
  }};
}
function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!React.isValidElement(node)) return [];
  return [node, ...elements(node.props.children)];
}
const find = (tree, type) => elements(tree).find(element => element.type === type);

test("guests are sent to login with the exact product return path and cannot open the dialog", () => {
  const h = harness("product-comments");
  h.render().props.onOpenChange(true);
  assert.equal(h.state.redirects.length, 1);
  const url = new URL(h.state.redirects[0], "http://localhost");
  assert.equal(url.pathname, "/login");
  assert.equal(url.searchParams.get("returnTo"), "/products/item?currency=CNY#product-comments");
  assert.equal(find(h.render(), "comment-dialog"), undefined);
});

test("a signed-in user opens the dialog and adds a local preview without a name field", () => {
  const h = harness("product-comments", "access-token");
  h.render().props.onOpenChange(true);
  const dialog = find(h.render(), "comment-dialog");
  assert.ok(dialog);
  dialog.props.onSubmit("  این محصول بسیار خوب بود.  ");
  const result = h.render();
  assert.equal(result.props.open, false);
  assert.equal(find(result, "comment-dialog"), undefined);
  const comment = elements(result).find(element => element.type?.name === "CommentCard");
  assert.equal(comment.props.comment.author, "شما");
  assert.equal(comment.props.comment.text.trim(), "این محصول بسیار خوب بود.");
  assert.equal(h.state.redirects.length, 0);
});

test("losing login before submission blocks the comment and redirects to login", () => {
  const h = harness("product-comments", "access-token");
  h.render().props.onOpenChange(true);
  const dialog = find(h.render(), "comment-dialog");
  h.state.token = null;
  dialog.props.onSubmit("این متن نباید ثبت شود.");
  assert.equal(h.state.redirects.length, 1);
  const result = h.render();
  assert.equal(result.props.open, false);
  assert.equal(elements(result).some(element => element.props.comment?.author === "شما"), false);
});

test("dialog submit stays disabled for empty or short text and accepts a trimmed valid comment", () => {
  const h = harness("product-comment-dialog");
  const submitButton = tree => elements(tree).find(element => element.type === "button" && element.props.type === "submit");
  assert.equal(submitButton(h.render()).props.disabled, true);
  find(h.render(), "textarea").props.onChange({target:{value:"   "}});
  assert.equal(submitButton(h.render()).props.disabled, true);
  find(h.render(), "textarea").props.onChange({target:{value:"کوتاه"}});
  assert.equal(submitButton(h.render()).props.disabled, true);
  find(h.render(), "textarea").props.onChange({target:{value:"  دیدگاه معتبر درباره محصول.  "}});
  assert.equal(submitButton(h.render()).props.disabled, false);
  find(h.render(), "form").props.onSubmit({preventDefault(){}});
  assert.equal(h.state.submitted[0], "دیدگاه معتبر درباره محصول.");
  assert.equal(elements(h.render()).some(element => element.type === "input"), false);
});

test("overlong comments cannot bypass the disabled submit handler", () => {
  const h = harness("product-comment-dialog");
  find(h.render(), "textarea").props.onChange({target:{value:"x".repeat(2001)}});
  find(h.render(), "form").props.onSubmit({preventDefault(){}});
  assert.equal(h.state.submitted.length, 0);
});
