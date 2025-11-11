import { api } from './api';
import { userAPI, pagamentoAPI } from './endpoints';
import type { UserDto, UserUpdateDto, UpdateUserRoleDto, PagamentoDto } from '@/types/user';

// ... (Tipos PagedUsersResponse e UserFilters) ...
export type PagedUsersResponse = {
  items: UserDto[];
  totalCount: number;
};
export type UserFilters = {
    search?: string;
    role?: string;
    tipoPessoa?: string;
}

// ... (Funções getAllUsersRequest, getUserByIdRequest, getMyProfile, etc.) ...
export const getAllUsersRequest = async (
    pageNumber: number = 1,
    pageSize: number = 20,
    filters: UserFilters = {} 
): Promise<PagedUsersResponse> => { 
  const params = {
      pageNumber,
      pageSize,
      ...(filters.search && { search: filters.search }),
      ...(filters.role && { role: filters.role }),
      ...(filters.tipoPessoa && { tipoPessoa: filters.tipoPessoa }),
  };
  const response = await api.get<PagedUsersResponse>(userAPI.getAll(), { params });
  return response.data; 
};
export const getUserByIdRequest = async (id: number): Promise<UserDto> => {
  const response = await api.get<UserDto>(userAPI.getById(id));
  return response.data;
};
export const getMyProfile = async (): Promise<UserDto> => {
   const response = await api.get<UserDto>('/Users/me'); // Endpoint específico
  return response.data;
};
export const updateUserRequest = async (id: number, data: UserUpdateDto): Promise<UserDto> => {
  const response = await api.put<UserDto>(userAPI.update(id), data);
  return response.data;
};
export const updateUserRoleRequest = async (id: number, data: UpdateUserRoleDto): Promise<any> => { 
  const response = await api.put(userAPI.updateRole(id), data);
  return response.data;
};
export const deleteUserRequest = async (id: number): Promise<any> => {
  const response = await api.delete(userAPI.delete(id));
  return response.data;
};
export const getMyDonationsRequest = async (): Promise<PagamentoDto[]> => {
  const response = await api.get<PagamentoDto[]>(pagamentoAPI.getMyDonations());
  return response.data;
};

// === ADICIONE ESTA NOVA FUNÇÃO NO FINAL ===
/**
 * (Admin) Busca o histórico de doações de um usuário específico.
 * @param userId ID do usuário (doador).
 * @returns Promise com a lista de doações.
 */
export const getDonationsByUserIdRequest = async (userId: number): Promise<PagamentoDto[]> => {
  const response = await api.get<PagamentoDto[]>(pagamentoAPI.getDonationsByUserId(userId));
  return response.data;
};