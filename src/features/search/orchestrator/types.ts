import type { Product } from "@/features/product/types/domain";

export type SearchState =
  | {
      state: "SEARCH_RESULT";
      data: Product[];
    }
  | {
      state: "IMPORT_STARTED";
      jobId: string;
    }
  | {
      state: "ERROR";
      message: string;
    };
