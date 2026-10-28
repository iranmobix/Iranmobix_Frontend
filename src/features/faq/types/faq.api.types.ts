export interface FaqApiResponse {
  id: number;
  question: string;
  answer: string;
  slug: string;
  tags: string;
  status: number;
  created_at: string;
}