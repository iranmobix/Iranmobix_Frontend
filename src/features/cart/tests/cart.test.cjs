/* eslint-disable @typescript-eslint/no-require-imports -- This Node CommonJS test harness loads TypeScript modules in memory. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

// Compile just the pure cart modules in memory; no extra test dependency or emitted files.
const previousLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  if (!filename.startsWith(path.resolve(__dirname, "..") + path.sep)) {
    if (previousLoader) return previousLoader(module, filename);
    throw new Error("Test loader only supports cart modules.");
  }
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  module._compile(source.outputText, filename);
};

const {
  cartReducer,
  createCartState,
} = require("../services/cart-preview.service.ts");
const {
  getCartTotals,
  normalizeQuantityDigits,
} = require("../utils/cart.utils.ts");
const { cartMock, emptyCartMock } = require("../mock/cart.mock.ts");
const {
  calculateCheckoutTotals,
  canPayCheckout,
  resolveCheckoutCoupon,
} = require("../services/checkout.service.ts");
const { checkoutMock } = require("../mock/checkout.mock.ts");
if (previousLoader) require.extensions[".ts"] = previousLoader;
else delete require.extensions[".ts"];

test("mock totals use quantities, discounts and shipping exactly once", () => {
  assert.deepEqual(getCartTotals(cartMock), {
    quantity: 5000,
    originalSubtotal: 69450,
    discount: 6950,
    subtotal: 62500,
    shipping: 250,
    total: 62750,
  });
});

test("changing one row updates totals without mutating the mock or other rows", () => {
  const state = createCartState(cartMock);
  const next = cartReducer(state, {
    type: "quantity",
    id: state.items[0].id,
    quantity: 2,
  });
  assert.equal(next.items[0].quantity, 2);
  assert.equal(state.items[0].quantity, 1000);
  assert.equal(cartMock.items[0].quantity, 1000);
  assert.equal(next.items[1], state.items[1]);
  assert.equal(getCartTotals(next).subtotal, 50025);
});

test("invalid quantities preserve the previous selection", () => {
  const state = createCartState(cartMock);
  for (const quantity of [0, -1, NaN, Infinity, 1.5, 10001]) {
    const next = cartReducer(state, {
      type: "quantity",
      id: state.items[0].id,
      quantity,
    });
    assert.equal(next.items, state.items);
    assert.ok(next.notice);
  }
});

test("removing one selected variant leaves other variants and undo preserves position", () => {
  const state = createCartState(cartMock);
  const removed = cartReducer(state, { type: "remove", id: state.items[2].id });
  assert.equal(removed.items.length, 4);
  assert.equal(getCartTotals(removed).subtotal, 50000);
  const restored = cartReducer(removed, { type: "undo-remove" });
  assert.deepEqual(restored.items, state.items);
  assert.equal(restored.removedItem, null);
});

test("last removal clears shipping and blocks continuation; undo restores the cart", () => {
  let state = createCartState(cartMock);
  for (const item of cartMock.items)
    state = cartReducer(state, { type: "remove", id: item.id });
  assert.equal(state.items.length, 0);
  assert.equal(getCartTotals(state).total, 0);
  assert.equal(getCartTotals(state).shipping, 0);
  assert.equal(cartReducer(state, { type: "continue" }).step, "cart");
  const restored = cartReducer(state, { type: "undo-remove" });
  assert.equal(restored.items.length, 1);
  assert.equal(getCartTotals(restored).total, 12750);
});

test("review is local, read-only and returns to the same selection", () => {
  const state = createCartState(cartMock);
  const review = cartReducer(state, { type: "continue" });
  assert.equal(review.step, "review");
  assert.equal(
    cartReducer(review, { type: "remove", id: state.items[0].id }),
    review,
  );
  assert.deepEqual(cartReducer(review, { type: "back" }).items, state.items);
});

test("Persian and Arabic quantity digits normalize without decimal or sign coercion", () => {
  assert.equal(normalizeQuantityDigits("۱٬۲۳۴"), "1234");
  assert.equal(normalizeQuantityDigits("١٢٣٤"), "1234");
  assert.equal(normalizeQuantityDigits("-۲"), "-2");
  assert.equal(normalizeQuantityDigits("۱.۵"), "1.5");
});

test("money does not accumulate binary floating-point errors", () => {
  const line = cartMock.items[0];
  const cart = {
    ...cartMock,
    shippingFee: 0.2,
    items: [
      {
        ...line,
        quantity: 3,
        product: {
          ...line.product,
          price: { ...line.product.price, amount: 0.1, hasDiscount: false },
        },
      },
    ],
  };
  assert.equal(getCartTotals(cart).subtotal, 0.3);
  assert.equal(getCartTotals(cart).total, 0.5);
});

test("empty state and currency mismatch are handled explicitly", () => {
  assert.equal(getCartTotals(emptyCartMock).total, 0);
  assert.throws(() => createCartState({ ...cartMock, currency: "USD" }), /ارز/);
});

test("invalid initial prices and duplicate IDs are rejected", () => {
  const line = cartMock.items[0];
  assert.throws(
    () => createCartState({ ...cartMock, items: [line, line] }),
    /شناسه/,
  );
  for (const amount of [-1, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() =>
      createCartState({
        ...cartMock,
        items: [
          {
            ...line,
            product: {
              ...line.product,
              price: { ...line.product.price, amount },
            },
          },
        ],
      }),
    );
  }
});

test("approved checkout totals use rial unit snapshots and delivery fees", () => {
  const address = checkoutMock.addresses[1];
  const totals = calculateCheckoutTotals(cartMock, checkoutMock, address, null);
  assert.equal(totals.quantity, 5000);
  assert.equal(totals.goodsIrr, 18750000000);
  assert.equal(totals.totalIrr, 18792500000);
  assert.equal(totals.discountIrr, 0);
  const office = calculateCheckoutTotals(
    cartMock,
    checkoutMock,
    checkoutMock.addresses[0],
    null,
  );
  assert.equal(office.totalIrr - totals.totalIrr, 500000);
});

test("payment requires an address and a selected method", () => {
  const address = checkoutMock.addresses[1];
  const totals = calculateCheckoutTotals(cartMock, checkoutMock, address, null);
  assert.equal(canPayCheckout(totals, address, null, 0), false);
  assert.equal(canPayCheckout(totals, null, "online", 0), false);
  for (const method of ["online", "bank-transfer", "foreign-transfer"]) {
    assert.equal(canPayCheckout(totals, address, method, 0), true);
  }
  assert.equal(
    canPayCheckout(totals, address, "wallet", checkoutMock.walletBalanceIrr),
    false,
  );
  assert.equal(
    canPayCheckout(totals, address, "wallet", totals.totalIrr),
    true,
  );
});

test("coupon is normalized, capped and not compounded", () => {
  const address = checkoutMock.addresses[1];
  const coupon = resolveCheckoutCoupon("  mobix10  ", checkoutMock);
  assert.equal(coupon.code, "MOBIX10");
  assert.equal(resolveCheckoutCoupon("INVALID", checkoutMock), null);
  assert.equal(resolveCheckoutCoupon("", checkoutMock), null);
  const plain = calculateCheckoutTotals(cartMock, checkoutMock, address, null);
  const discounted = calculateCheckoutTotals(
    cartMock,
    checkoutMock,
    address,
    coupon,
  );
  assert.equal(discounted.discountIrr, 10000000);
  assert.equal(discounted.totalIrr, plain.totalIrr - 10000000);
  assert.deepEqual(
    calculateCheckoutTotals(cartMock, checkoutMock, address, coupon),
    discounted,
  );
  assert.equal(
    calculateCheckoutTotals(cartMock, checkoutMock, address, null).totalIrr,
    plain.totalIrr,
  );
});

test("wallet eligibility follows the discounted total", () => {
  const address = checkoutMock.addresses[1];
  const original = calculateCheckoutTotals(
    cartMock,
    checkoutMock,
    address,
    null,
  );
  const discounted = calculateCheckoutTotals(
    cartMock,
    checkoutMock,
    address,
    checkoutMock.coupon,
  );
  const balance = original.totalIrr - 5000000;
  assert.equal(canPayCheckout(original, address, "wallet", balance), false);
  assert.equal(canPayCheckout(discounted, address, "wallet", balance), true);
});

test("empty checkout cannot charge shipping or proceed", () => {
  const address = checkoutMock.addresses[1];
  const totals = calculateCheckoutTotals(
    emptyCartMock,
    checkoutMock,
    address,
    checkoutMock.coupon,
  );
  assert.equal(totals.totalIrr, 0);
  assert.equal(totals.discountIrr, 0);
  assert.equal(canPayCheckout(totals, address, "online", 99999999), false);
});

test("invalid rial prices, fees and coupon percentages fail explicitly", () => {
  assert.throws(() =>
    calculateCheckoutTotals(
      cartMock,
      { ...checkoutMock, packingFeeIrr: -1 },
      null,
      null,
    ),
  );
  assert.throws(() =>
    calculateCheckoutTotals(cartMock, checkoutMock, null, {
      ...checkoutMock.coupon,
      percent: 101,
    }),
  );
  assert.throws(() =>
    calculateCheckoutTotals(cartMock, checkoutMock, null, {
      ...checkoutMock.coupon,
      maxDiscountIrr: -1,
    }),
  );
});

test("approval progresses only from review and editing invalidates that stage", () => {
  const state = createCartState(cartMock);
  assert.equal(cartReducer(state, { type: "approve" }), state);
  const review = cartReducer(state, { type: "continue" });
  const approved = cartReducer(review, { type: "approve" });
  assert.equal(approved.step, "payment");
  assert.equal(
    cartReducer(approved, {
      type: "quantity",
      id: state.items[0].id,
      quantity: 2,
    }),
    approved,
  );
  assert.equal(cartReducer(approved, { type: "back" }).step, "cart");
  assert.equal(createCartState(emptyCartMock, "payment").step, "cart");
});

test("cancelling an approved mock order preserves items and requires approval again", () => {
  const approved = createCartState(cartMock, "payment");
  const cancelled = cartReducer(approved, { type: "cancel-order" });
  assert.equal(cancelled.step, "cart");
  assert.equal(cancelled.items, approved.items);
  assert.equal(cancelled.removedItem, null);
  assert.ok(cancelled.notice);
  assert.equal(cartReducer(cancelled, { type: "approve" }), cancelled);
  assert.equal(cartReducer(cancelled, { type: "cancel-order" }), cancelled);
  const review = cartReducer(cancelled, { type: "continue" });
  assert.equal(cartReducer(review, { type: "cancel-order" }), review);
  assert.equal(cartReducer(review, { type: "approve" }).step, "payment");
});
