export interface NavigationApiResponse {
  id: number;
  name: string;
  url: string;
  status: number;
  parent: number | null;
}