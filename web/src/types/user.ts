export interface User {
  id: string;
  name: string;
  token?: string;
}

export interface LoginForm {
  account: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
