export interface Contact {
  id: number;
  username: string;
  email: string;
  message: string;
  created_at: string;
  updated_at: string | null;
}

export interface ContactSubmitResponse {
  success: boolean;
  message: string;
}