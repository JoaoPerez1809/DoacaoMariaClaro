// frontend/src/types/user.ts

export type UserRole = 'Doador' | 'Colaborador' | 'Administrador';
export type TipoPessoa = 'Fisica' | 'Juridica';

export type User = {
  id: string;
  name: string;
  role: UserRole;
};

/**
 * DTO principal do usuário (UserDTO.cs)
 */
export type UserDto = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  tipoPessoa?: TipoPessoa;
  documento?: string;
  
  telefone?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  comercioEndereco?: string;
  dataNascimento?: string; 
  dataCadastro: string; 
};

/**
 * DTO para registro de usuário (UserRegisterDTO.cs)
 */
export type UserRegisterDto = {
  nome: string;
  email: string;
  senha: string;
  tipoPessoa: TipoPessoa;
  documento: string;
};

/**
 * DTO para login (UserLoginDTO.cs)
 */
export type UserLoginDto = {
  email: string;
  senha: string;
};

/**
 * DTO para atualização de usuário (UserUpdateDTO.cs)
 */
export type UserUpdateDto = {
  nome: string;
  email: string;
  tipoPessoa?: TipoPessoa;
  documento?: string;
  
  telefone?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  comercioEndereco?: string;
  dataNascimento?: string; 
};

/**
 * DTO para atualização de papel (UpdateUserRoleDTO.cs)
 */
export type UpdateUserRoleDto = {
  novoTipoUsuario: UserRole;
};

/**
 * Token JWT decodificado
 */
export type DecodedToken = {
  nameid: string;
  name: string;
  role: UserRole;
  exp: number;
  iat: number;
};

/**
 * DTO para o histórico de pagamentos (PagamentoDto.cs)
 */
export type PagamentoDto = {
  dataCriacao: string; // Vem como string ISO da API
  valor: number;
  status: string;
};

/**
 * DTO para o relatório de arrecadação (RelatorioArrecadacaoDto.cs)
 */
export type RelatorioArrecadacaoDto = {
  totalArrecadado: number;
  totalLiquido: number;
  totalDoacoesAprovadas: number;
};

/**
 * DTO para a lista detalhada de doações (DoacaoDetalhadaDto.cs)
 */
export type DoacaoDetalhadaDto = {
  pagamentoId: number;
  valor: number;
  valorLiquido: number | null; 
  status: string;
  dataCriacao: string;
  doadorId: number;
  doadorNome: string;
  doadorEmail: string;
};

/**
 * Resposta paginada da API de doações (PagedDonationsResult.cs)
 */
export type PagedDonationsResponse = {
  items: DoacaoDetalhadaDto[];
  totalCount: number;
  totalArrecadadoBruto: number;
  totalArrecadadoLiquido: number;
};

// === NOVO TIPO (PARA ESTATÍSTICAS DE USUÁRIOS) ===

/**
 * DTO para as estatísticas do dashboard (UserStatsDto.cs)
 */
export type UserStatsDto = {
  totalUsuarios: number;
  totalPessoaFisica: number;
  totalPessoaJuridica: number;
  totalDoadores: number;
  totalColaboradores: number;
  totalAdministradores: number;
};