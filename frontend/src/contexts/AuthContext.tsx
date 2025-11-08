"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { loginRequest } from '@/services/authService';
import { api } from '@/services/api';
import type { UserLoginDto, DecodedToken, User } from '@/types/user';
import { jwtDecode } from 'jwt-decode';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean; // Estado para saber se a verificação inicial já terminou
  signIn: (data: UserLoginDto) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começa 'true'
  const router = useRouter();

  useEffect(() => {
    const { 'doacao.token': token } = parseCookies();
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUser({ id: decodedToken.nameid, name: decodedToken.name, role: decodedToken.role });
        api.defaults.headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        destroyCookie(undefined, 'doacao.token');
      }
    }
    // Informa que a verificação inicial terminou
    setLoading(false); 
  }, []);

  async function signIn(data: UserLoginDto) {
    const { token } = await loginRequest(data);
    setCookie(undefined, 'doacao.token', token, { maxAge: 60 * 60 * 24, path: '/' });
    api.defaults.headers['Authorization'] = `Bearer ${token}`;
    const decodedToken: DecodedToken = jwtDecode(token);
    setUser({ id: decodedToken.nameid, name: decodedToken.name, role: decodedToken.role });
    router.push('/doador/perfil');
  }

  function signOut() {
    destroyCookie(undefined, 'doacao.token');
    delete api.defaults.headers['Authorization'];
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};