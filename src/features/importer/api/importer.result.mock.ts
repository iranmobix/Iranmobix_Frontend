export const mockImportResult = {
  getResult: async (jobId: string) => {
    await new Promise((r) => setTimeout(r, 500));

    return {
      job_id: jobId,
      items: [
        {
          id: "1",
          title: "Product 1",
          type: "product",
        },
        {
          id: "2",
          title: "Product 2",
          type: "product",
        },
        {
          id: "3",
          title: "Seller A",
          type: "seller",
        },
        {
          id: "4",
          title: "Imported Image",
          type: "image",
        },
      ],
    };
  },
};