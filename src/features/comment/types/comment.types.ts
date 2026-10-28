export interface Comment {
  id: number;

  body: string;

  authorName: string;

  createdAt: string;

  parentId: number | null;

  approved: boolean;

  replies?: Comment[];
}