import { api } from './api';
import { userAPI, pagamentoAPI } from './endpoints';
// 1. IMPORTE OS NOVOS DTOs
import type { 
  UserDto, UserUpdateDto, UpdateUserRoleDto, PagamentoDto, 
  RelatorioArrecadacaoDto, PagedDonationsResponse, UserStatsDto 
} from '@/types/user';

// Tipo para a resposta paginada da API
export type PagedUsersResponse = {
  items: UserDto[];
  totalCount: number;
};

// Tipo para os filtros opcionais
export type UserFilters = {
    search?: string;
    role?: string;
    tipoPessoa?: string;
}

// Tipo para os filtros do Relatório
export type RelatorioFilters = {
  ano: number;
  tipo: 'mensal' | 'trimestral' | 'semestral';
  periodo: number;
};

// ... (Funções existentes: getAllUsersRequest, getUserByIdRequest, getMyProfile, etc.) ...
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
   const response = await api.get<UserDto>('/Users/me'); 
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
export const getDonationsByUserIdRequest = async (userId: number): Promise<PagamentoDto[]> => {
  const response = await api.get<PagamentoDto[]>(pagamentoAPI.getDonationsByUserId(userId));
  return response.data;
};
export const getRelatorioArrecadacaoRequest = async (filters: RelatorioFilters): Promise<RelatorioArrecadacaoDto> => {
  const response = await api.get<RelatorioArrecadacaoDto>(pagamentoAPI.getRelatorioArrecadacao(), {
    params: filters 
  });
  return response.data;
};
export const getAnosDisponiveisRequest = async (): Promise<number[]> => {
  const response = await api.get<number[]>(pagamentoAPI.getAnosDisponiveis());
  return response.data;
};
export const getListaDoacoesRequest = async (
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<PagedDonationsResponse> => { 
  const params = { pageNumber, pageSize };
  const response = await api.get<PagedDonationsResponse>(pagamentoAPI.getListaDoacoes(), { params });
  return response.data; 
};

// === 2. ADICIONE ESTA NOVA FUNÇÃO ===
/**
 * (Admin) Busca as estatísticas de usuários para os cards.
 */
export const getUserStatsRequest = async (): Promise<UserStatsDto> => {
  const response = await api.get<UserStatsDto>(userAPI.getStats());
  return response.data;
};