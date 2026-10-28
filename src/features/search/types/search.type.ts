export type SearchSource =
  | "local"
  | "alibaba"
  | "1688"
  | "amazon";

export interface ProductImage {
  id: number;
  image_url: string;
  width: number;
  height: number;
  score: number;
  is_primary: boolean;
}

export interface ProductSupplier {
  id: number;
  supplier_name: string;
  supplier_external_id: string;
  verified: boolean;
  rating: number;
  years_in_business: number;
  response_rate: number;
  price: string;
  score: number;
}

export interface Product {
  id: number;
  source: SearchSource;
  source_url: string;
  external_id: string;

  title: string;

  short_description: {
    intro: string;
    advantages: string;
  };

  original_description: string;

  currency: string;
  min_price: string;
  max_price: string;

  best_supplier_score: number;
  rating: number;
  review_count: number;

  specifications: Record<string, string>;

  imported_at: string;
  updated_at: string;

  suppliers: ProductSupplier[];
  images: ProductImage[];
}

export interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface SearchItem {
  id: number;
  title: string;
  image: string | null;
  source: SearchSource;

  minPrice: string;
  maxPrice: string;

  rating: number;

  sourceUrl: string;
}