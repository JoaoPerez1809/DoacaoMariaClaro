// A URL base da sua API .NET.
const BASE_URL = 'http://localhost:5041/api';

// Factory para criar endpoints CRUD (Criar, Ler, Atualizar, Deletar)
const crudAPI = (resource: string) => ({
  getAll: () => `${BASE_URL}/${resource}`,
  getById: (id: number) => `${BASE_URL}/${resource}/${id}`,
  update: (id: number) => `${BASE_URL}/${resource}/${id}`,
  delete: (id: number) => `${BASE_URL}/${resource}/${id}`,
  updateRole: (id: number) => `${BASE_URL}/${resource}/${id}/role`,
});

// Endpoints para Autenticação
export const authAPI = {
  login: () => `${BASE_URL}/Auth/login`,
  register: () => `${BASE_URL}/Auth/register`,
};

// Endpoints para Gerenciamento de Usuários, usando a factory CRUD
export const userAPI = crudAPI('Users');

// Endpoints para Pagamentos/Doações
export const pagamentoAPI = {
  getMyDonations: () => `${BASE_URL}/Pagamento/me`,
  getDonationsByUserId: (userId: number) => `${BASE_URL}/Pagamento/${userId}`,
  
  // Rota para o relatório com filtros
  getRelatorioArrecadacao: () => `${BASE_URL}/Pagamento/relatorio-arrecadacao`,
  
  // Rota para buscar os anos
  getAnosDisponiveis: () => `${BASE_URL}/Pagamento/anos-disponiveis`,
};