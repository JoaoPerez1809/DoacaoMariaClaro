import { api } from './api';
import { userAPI } from './endpoints'; // 1. Importa os endpoints
import type { UserDto, UserUpdateDto, UpdateUserRoleDto } from '@/types/user'; // Importa os tipos

// Função para obter todos os usuários
export const getAllUsersRequest = async () => {
  const response = await api.get<UserDto[]>(userAPI.getAll());
  return response.data;
};

// Função para obter um usuário por ID
export const getUserByIdRequest = async (id: number) => {
  const response = await api.get<UserDto>(userAPI.getById(id));
  return response.data;
};

// Função para atualizar um usuário
export const updateUserRequest = async (id: number, data: UserUpdateDto) => {
  const response = await api.put<UserDto>(userAPI.update(id), data);
  return response.data;
};

// Função para atualizar o papel de um usuário
export const updateUserRoleRequest = async (id: number, data: UpdateUserRoleDto) => {
  const response = await api.put(userAPI.updateRole(id), data);
  return response.data;
};

// Função para deletar um usuário
export const deleteUserRequest = async (id: number) => {
  const response = await api.delete(userAPI.delete(id));
  return response.data;
};
