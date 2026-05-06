export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
}

export interface AuthUser {
  id?: string;
  username: string;
  email?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: AuthUser;
}
