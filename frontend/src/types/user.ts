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
  
  // --- NOVOS CAMPOS ADICIONADOS ---
  telefone?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  comercioEndereco?: string;
  dataNascimento?: string; // Vem como string ISO da API (ou null)
  dataCadastro: string; // Vem como string ISO da API
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
  
  // --- NOVOS CAMPOS ADICIONADOS ---
  telefone?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  genero?: string;
  comercioEndereco?: string;
  dataNascimento?: string; // Envia como string YYYY-MM-DD
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