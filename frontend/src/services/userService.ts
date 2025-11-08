import { api } from './api';
import { userAPI } from './endpoints';
import type { UserDto, UserUpdateDto, UpdateUserRoleDto } from '@/types/user';

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

/**
 * Busca usuários da API com paginação e filtros opcionais.
 * @param pageNumber Número da página (padrão 1).
 * @param pageSize Quantidade por página (padrão 20).
 * @param filters Objeto contendo filtros (search, role, tipoPessoa).
 * @returns Promise com a resposta paginada.
 */
export const getAllUsersRequest = async (
    pageNumber: number = 1,
    pageSize: number = 20,
    filters: UserFilters = {} // Aceita filtros
): Promise<PagedUsersResponse> => { // Define o tipo de retorno
  // Monta os parâmetros da query string
  const params = {
      pageNumber,
      pageSize,
      // Adiciona filtros aos parâmetros apenas se eles tiverem valor
      ...(filters.search && { search: filters.search }),
      ...(filters.role && { role: filters.role }),
      ...(filters.tipoPessoa && { tipoPessoa: filters.tipoPessoa }),
  };

  // Faz a requisição GET, passando os parâmetros
  const response = await api.get<PagedUsersResponse>(userAPI.getAll(), { params });
  return response.data; // Retorna { items: [], totalCount: X }
};

/**
 * Busca um usuário específico pelo ID.
 * @param id ID do usuário.
 * @returns Promise com os dados do usuário.
 */
export const getUserByIdRequest = async (id: number): Promise<UserDto> => {
  const response = await api.get<UserDto>(userAPI.getById(id));
  return response.data;
};

/**
 * Busca os dados do perfil do usuário autenticado.
 * @returns Promise com os dados do usuário.
 */
export const getMyProfile = async (): Promise<UserDto> => {
   const response = await api.get<UserDto>('/Users/me'); // Endpoint específico
  return response.data;
};

/**
 * Atualiza os dados de um usuário.
 * @param id ID do usuário a ser atualizado.
 * @param data DTO com os novos dados.
 * @returns Promise com os dados atualizados do usuário.
 */
export const updateUserRequest = async (id: number, data: UserUpdateDto): Promise<UserDto> => {
  const response = await api.put<UserDto>(userAPI.update(id), data);
  return response.data;
};

/**
 * Atualiza o papel (role) de um usuário.
 * @param id ID do usuário.
 * @param data DTO com o novo papel.
 * @returns Promise com a resposta da API (geralmente uma mensagem de sucesso).
 */
export const updateUserRoleRequest = async (id: number, data: UpdateUserRoleDto): Promise<any> => { // Retorno pode ser só uma mensagem
  const response = await api.put(userAPI.updateRole(id), data);
  return response.data;
};

/**
 * Deleta um usuário.
 * @param id ID do usuário a ser deletado.
 * @returns Promise com a resposta da API (geralmente vazia ou mensagem).
 */
export const deleteUserRequest = async (id: number): Promise<any> => {
  const response = await api.delete(userAPI.delete(id));
  return response.data;
};