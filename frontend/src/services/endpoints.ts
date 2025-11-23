// A URL base da sua API .NET.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041/api';

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
export const userAPI = {
  ...crudAPI('Users'), // Mantém getAll, getById, etc.
  
  // === ADICIONE ESTA LINHA ===
  getStats: () => `${BASE_URL}/Users/stats`, // Novo endpoint de estatísticas
};

// Endpoints para Pagamentos/Doações
export const pagamentoAPI = {
  getMyDonations: () => `${BASE_URL}/Pagamento/me`,
  getDonationsByUserId: (userId: number) => `${BASE_URL}/Pagamento/${userId}`,
  getRelatorioArrecadacao: () => `${BASE_URL}/Pagamento/relatorio-arrecadacao`,
  getAnosDisponiveis: () => `${BASE_URL}/Pagamento/anos-disponiveis`,
  getListaDoacoes: () => `${BASE_URL}/Pagamento/lista-doacoes`,
};