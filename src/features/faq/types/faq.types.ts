export interface Faq {
  id: number;
  question: string;
  answer: string;
  slug: string;
  tags: string[];
  status: boolean;
  createdAt: Date;
}