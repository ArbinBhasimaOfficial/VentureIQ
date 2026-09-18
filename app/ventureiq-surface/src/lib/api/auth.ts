import apiClient from "./client";

export type LoginInput = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthResponse = {
  status: string;
  message: string;
  data: {
    user: AuthUser;
    token?: string;
  };
};

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", input);

  return response.data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", input);

  return response.data;
}

export async function getMe(): Promise<{
  status: string;
  data: AuthUser;
}> {
  const response = await apiClient.get<{
    status: string;
    data: AuthUser;
  }>("/api/v1/auth/me");

  return response.data;
}
