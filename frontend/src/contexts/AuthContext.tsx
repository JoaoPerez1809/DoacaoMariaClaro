'use client';

import { createContext, useState, useEffect } from 'react';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { api } from '../services/api';
import { loginRequest } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

// Tipos para o utilizador e o contexto
type User = {
  id: string;
  name: string;
  role: 'Doador' | 'Colaborador' | 'Administrador';
};

type SignInCredentials = {
  email: string;
  senha: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: SignInCredentials) => Promise<void>;
  signOut: () => void;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const isAuthenticated = !!user;

  useEffect(() => {
    // Quando a aplicação carrega, verifica se existe um token nos cookies
    const { 'doacao.token': token } = parseCookies();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUser({
          id: decodedToken.nameid,
          name: decodedToken.unique_name,
          role: decodedToken.role,
        });
      } catch (error) {
        console.error("Token inválido:", error);
        signOut();
      }
    }
  }, []);

  async function signIn({ email, senha }: SignInCredentials) {
    // Chama a função do nosso serviço de autenticação
    const { token } = await loginRequest({ email, senha });

    // Guarda o token nos cookies do navegador por 30 dias
    setCookie(undefined, 'doacao.token', token, {
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: '/',
    });

    // Descodifica o token para obter os dados do utilizador
    const decodedToken: any = jwtDecode(token);
    setUser({
      id: decodedToken.nameid,
      name: decodedToken.unique_name,
      role: decodedToken.role,
    });
    
    // Define o token como padrão para futuras requisições do Axios
    api.defaults.headers['Authorization'] = `Bearer ${token}`;

    // Redireciona o utilizador para a sua página de perfil
    router.push('/doador/perfil');
  }

  function signOut() {
    destroyCookie(undefined, 'doacao.token');
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
