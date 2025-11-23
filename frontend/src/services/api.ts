import axios from 'axios';
import { parseCookies } from 'nookies';

// 1. Instale as dependências necessárias no terminal:
// npm install axios nookies

// 2. Defina a URL base da sua API .NET.
//    Verifique no seu terminal do backend qual é a porta correta (ex: 5041).
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5041/api';

export const api = axios.create({
  baseURL: API_URL,
});

// 4. Crie um "interceptor" de requisições.
//    Esta função é executada ANTES de cada requisição ser enviada.
api.interceptors.request.use(config => {
  // Procura o token de autenticação nos cookies do navegador.
  // 'doacao.token' é o nome que demos ao nosso cookie no AuthContext.
  const { 'doacao.token': token } = parseCookies();

  // Se o token existir, adiciona-o ao cabeçalho de autorização.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Retorna a configuração da requisição, agora com o token (se existir).
  return config;

  
});
