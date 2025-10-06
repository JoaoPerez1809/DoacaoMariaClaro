"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

import { loginRequest } from '@/services/authService';
import { api } from '@/services/api';
import type { UserLoginDto, DecodedToken } from '@/types/user';
import { jwtDecode } from 'jwt-decode';

// Define a interface para os dados do usuário
type User = {
  id: string;
  name: string;
  role: string;
};

// Define a interface para o contexto de autenticação
type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: UserLoginDto) => Promise<void>;
  signOut: () => void;
};

// Cria o contexto de autenticação
const AuthContext = createContext({} as AuthContextType);

// Define o provedor de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isAuthenticated = !!user;

  // Efeito para recuperar o token dos cookies na inicialização
  useEffect(() => {
    const { 'doacao.token': token } = parseCookies();
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUser({ id: decodedToken.nameid, name: decodedToken.name, role: decodedToken.role });
        api.defaults.headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("Token inválido:", error);
        signOut();
      }
    }
  }, []);

  // Função para fazer login
  async function signIn(data: UserLoginDto) {
    try {
      const { token } = await loginRequest(data);

      // Salva o token nos cookies por 1 dia
      setCookie(undefined, 'doacao.token', token, {
        maxAge: 60 * 60 * 24, // 1 dia em segundos
        path: '/',
      });

      // Configura o token no cabeçalho padrão do Axios
      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      // Decodifica o token para obter os dados do usuário e atualizar o estado
      const decodedToken: DecodedToken = jwtDecode(token);
      setUser({ id: decodedToken.nameid, name: decodedToken.name, role: decodedToken.role });

      // Redireciona o usuário para a página de perfil
      router.push('/doador/perfil');
    } catch (error) {
      console.error("Falha no login:", error);
      // Lança o erro para que o formulário de login possa tratá-lo
      throw error;
    }
  }

  // Função para fazer logout
  function signOut() {
    destroyCookie(undefined, 'doacao.token');
    delete api.defaults.headers['Authorization'];
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  return useContext(AuthContext);
};