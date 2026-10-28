export interface SalesExpertApi {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string;
  bio: string;
  phone?: string | null;
  telegram_url: string;
  whatsapp_url: string;
  instagram_url: string;
  profile_image: string;
  display_order: number;
}
