import { api } from './api';
import { authAPI } from './endpoints'; // 1. Importa os endpoints
import type { UserRegisterDto, UserLoginDto } from '@/types/user'; // Importa os tipos

type LoginResponse = {
  token: string;
};

// Função para fazer o login
export const loginRequest = async (data: UserLoginDto) => {
  // 2. Usa a URL do ficheiro de endpoints
  const response = await api.post<LoginResponse>(authAPI.login(), data);
  return response.data;
};

// Função para fazer o registo
export const registerRequest = async (data: UserRegisterDto) => {
  // 3. Usa a URL do ficheiro de endpoints
  const response = await api.post(authAPI.register(), data);
  return response.data;
};
