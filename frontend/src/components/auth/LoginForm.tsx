"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { AxiosError } from "axios";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { useAuth } from "@/contexts/AuthContext";
import { loginRequest } from "@/services/authService";
import type { UserLoginDto } from "@/types/user";

import "./RegisterForm.css";
import "./LoginForm.css";

import { ActionBar } from '@/components/layout/ActionBar';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  const router = useRouter();
  const { signIn } = useAuth();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn({ email, senha });
    } catch (err) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <> {/* <--- CORREÇÃO AQUI (removido o comentário com erro) */}
      <header className="topbar">Login</header>
      
      <ActionBar />
      
      <div className="cadastro-container">
        <div className="form-box">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Insira seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <div className="input-wrapper">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="Insira sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={isLoading}
              />
              <span className="password-icon" onClick={togglePasswordVisibility}>
                {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginForm;