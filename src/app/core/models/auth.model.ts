import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
