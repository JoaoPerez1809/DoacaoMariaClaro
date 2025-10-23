// frontend/src/types/user.ts

// 1. Definindo os possíveis papéis de usuário, exatamente como no backend (Enum TipoUsuario)
export type UserRole = 'Doador' | 'Colaborador' | 'Administrador';

// --- NOVO TIPO ADICIONADO ---
// Representa o Enum TipoPessoa do backend
export type TipoPessoa = 'Fisica' | 'Juridica';

// 1. TIPO ADICIONADO AQUI - Representa o usuário logado no estado da aplicação
export type User = {
  id: string;   // Vem do 'nameid' do token
  name: string; // Vem do 'name' do token
  role: UserRole; // Vem do 'role' do token
};


/**
 * DTO principal do usuário, usado para exibir dados.
 * Corresponde ao `UserDTO.cs` no backend.
 */
export type UserDto = {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: UserRole;
  // --- CAMPOS ADICIONADOS ---
  tipoPessoa?: TipoPessoa; // Pode ser nulo se não preenchido
  documento?: string;    // Pode ser nulo se não preenchido
};

/**
 * DTO para o registro de um novo usuário.
 * Corresponde ao `UserRegisterDTO.cs` no backend.
 */
export type UserRegisterDto = {
  nome: string;
  email: string;
  senha: string;
  // --- CAMPOS ADICIONADOS ---
  tipoPessoa: TipoPessoa;
  documento: string;
};

/**
 * DTO para o login de um usuário.
 * Corresponde ao `UserLoginDTO.cs` no backend.
 */
export type UserLoginDto = {
  email: string;
  senha: string;
};

/**
 * DTO para a atualização dos dados de um usuário.
 * Corresponde ao `UserUpdateDTO.cs` no backend.
 */
export type UserUpdateDto = {
  nome: string;
  email: string;
  // --- CAMPOS ADICIONADOS (OPCIONAIS) ---
  tipoPessoa?: TipoPessoa;
  documento?: string;
};

/**
 * DTO para a atualização do papel (role) de um usuário.
 * Corresponde ao `UpdateUserRoleDTO.cs` no backend.
 */
export type UpdateUserRoleDto = {
  // ATENÇÃO: Corrigido para corresponder ao backend DTO
  novoTipoUsuario: UserRole;
};

/**
 * Representa os dados decodificados do token JWT.
 */
export type DecodedToken = {
  nameid: string; // ID do usuário
  name: string;   // Nome do usuário
  role: UserRole; // Papel do usuário
  exp: number;
  iat: number;
};