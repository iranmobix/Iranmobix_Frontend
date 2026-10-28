import { mockProducts } from "../mocks/search.mock";

export const searchApi = {
  async search(query: string) {
    await new Promise((r) => setTimeout(r, 300));

    const results = mockProducts.filter((product) =>
      product.title
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    };
  },
};