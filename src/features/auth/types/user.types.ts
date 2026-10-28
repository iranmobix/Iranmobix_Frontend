export interface UserApiResponse {
  id: number;

  email: string | null;

  mobile: string | null;

  first_name: string | null;

  last_name: string | null;

  full_name: string | null;

  user_type: string;

  person_type: string;

  email_verify_at: string | null;

  mobile_verified_at: string | null;

  activation: 0 | 1;

  status: 0 | 1;
}

export interface User {
  id: number;

  email: string | null;

  mobile: string | null;

  firstName: string | null;

  lastName: string | null;

  user_type: string;
}
