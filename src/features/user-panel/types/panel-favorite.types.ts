export interface PanelFavorite {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  sourceUrl: string;
  priceCny: string;
  priceToman: string | null;
  sellerName: string;
  sellerVerified: boolean;
  colors: { name: string; value: string }[];
}
// Provisional mock transport until a favorites API is agreed.
export interface PanelFavoriteApi {
  id: string;
  title: string;
  image: string | null;
  source_url: string;
  price_cny: string;
  price_toman: string | null;
  seller_name: string;
  seller_verified: boolean;
  colors: { name: string; value: string }[];
}
