export interface RegisterAuthUserDTO {
  first_name: string;
  last_name: string;
  email: string;
  is_admin: boolean;
  password_hash: string;
}
