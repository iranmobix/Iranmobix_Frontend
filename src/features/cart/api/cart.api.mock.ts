import { cartApiMock } from "../mock/cart-api.mock";

/** Read-only adapter. Mock data never participates in cart mutations. */
export const cartMockApi = {
  async getCart(): Promise<unknown> {
    return structuredClone(cartApiMock);
  },
};
