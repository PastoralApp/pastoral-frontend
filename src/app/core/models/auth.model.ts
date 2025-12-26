export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role: string;
  roleName?: string;
  grupoId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface GoogleLoginExistingResponse {
  requiresCompletion: false;
  token: string;
  user: AuthUser;
}

export interface GoogleLoginNewResponse {
  requiresCompletion: true;
  registrationToken: string;
  prefill: {
    email: string;
    name: string;
    photoUrl?: string;
  };
}

export type GoogleLoginResponse = GoogleLoginExistingResponse | GoogleLoginNewResponse;

export interface GoogleCompleteDto {
  registrationToken: string;
  name: string;
  password: string;
  verificationCode: string;
}

export interface GoogleCompleteResponse {
  token: string;
  user: AuthUser;
}

export interface SendCodeDto {
  name: string;
  email: string;
}

export interface SendCodeResponse {
  message: string;
  email: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  verificationCode: string;
}

export interface RegisterResponse {
  token: string;
  user: AuthUser;
}

export interface ResendCodeDto {
  email: string;
}

export interface ResendCodeResponse {
  message: string;
}

export interface GoogleLoginNewResponseWithCode extends GoogleLoginNewResponse {
  message?: string;
}
