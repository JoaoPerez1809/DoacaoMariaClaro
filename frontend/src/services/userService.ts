import { api } from './api';
import { userAPI, pagamentoAPI } from './endpoints';
// 1. IMPORTE O NOVO DTO
import type { UserDto, UserUpdateDto, UpdateUserRoleDto, PagamentoDto, RelatorioArrecadacaoDto } from '@/types/user';

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

// 2. TIPO PARA OS FILTROS DO NOVO RELATÓRIO
export type RelatorioFilters = {
  ano: number;
  tipo: 'mensal' | 'trimestral' | 'semestral';
  periodo: number;
};

/**
 * Busca usuários da API com paginação e filtros opcionais.
 */
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

/**
 * Busca um usuário específico pelo ID.
 */
export const getUserByIdRequest = async (id: number): Promise<UserDto> => {
  const response = await api.get<UserDto>(userAPI.getById(id));
  return response.data;
};

/**
 * Busca os dados do perfil do usuário autenticado.
 */
export const getMyProfile = async (): Promise<UserDto> => {
   const response = await api.get<UserDto>('/Users/me'); // Endpoint específico
  return response.data;
};

/**
 * Atualiza os dados de um usuário.
 */
export const updateUserRequest = async (id: number, data: UserUpdateDto): Promise<UserDto> => {
  const response = await api.put<UserDto>(userAPI.update(id), data);
  return response.data;
};

/**
 * Atualiza o papel (role) de um usuário.
 */
export const updateUserRoleRequest = async (id: number, data: UpdateUserRoleDto): Promise<any> => { 
  const response = await api.put(userAPI.updateRole(id), data);
  return response.data;
};

/**
 * Deleta um usuário.
 */
export const deleteUserRequest = async (id: number): Promise<any> => {
  const response = await api.delete(userAPI.delete(id));
  return response.data;
};

/**
 * Busca o histórico de doações do usuário autenticado (página de perfil).
 */
export const getMyDonationsRequest = async (): Promise<PagamentoDto[]> => {
  const response = await api.get<PagamentoDto[]>(pagamentoAPI.getMyDonations());
  return response.data;
};

/**
 * (Admin) Busca o histórico de doações de um usuário específico.
 */
export const getDonationsByUserIdRequest = async (userId: number): Promise<PagamentoDto[]> => {
  const response = await api.get<PagamentoDto[]>(pagamentoAPI.getDonationsByUserId(userId));
  return response.data;
};

// === 3. FUNÇÃO DE RELATÓRIO ATUALIZADA (COM FILTROS) ===
/**
 * (Admin) Busca o relatório de arrecadação total com filtros.
 * @returns Promise com o relatório.
 */
export const getRelatorioArrecadacaoRequest = async (filters: RelatorioFilters): Promise<RelatorioArrecadacaoDto> => {
  const response = await api.get<RelatorioArrecadacaoDto>(pagamentoAPI.getRelatorioArrecadacao(), {
    params: filters // Passa os filtros (ano, tipo, periodo) como query params
  });
  return response.data;
};

// === 4. NOVA FUNÇÃO PARA BUSCAR OS ANOS ===
/**
 * (Admin) Busca a lista de anos que tiveram doações.
 */
export const getAnosDisponiveisRequest = async (): Promise<number[]> => {
  const response = await api.get<number[]>(pagamentoAPI.getAnosDisponiveis());
  return response.data;
};