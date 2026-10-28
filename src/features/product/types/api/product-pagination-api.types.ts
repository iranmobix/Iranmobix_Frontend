export interface ProductPaginationApi {
  cursor: string | null;
  offset: number;
  next_offset: number | null;
  previous_offset: number | null;
  has_next: boolean;
  has_previous: boolean;
  returned: number;
}
