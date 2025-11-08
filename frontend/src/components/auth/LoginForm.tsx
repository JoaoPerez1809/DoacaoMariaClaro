"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { AxiosError } from "axios";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importando os ícones de olho

import { useAuth } from "@/contexts/AuthContext";
import { loginRequest } from "@/services/authService";
import type { UserLoginDto } from "@/types/user";

// Reutilizando o CSS do RegisterForm para manter a consistência visual
import "./RegisterForm.css";
// Adicionando um CSS específico para pequenas adaptações do login, como o ícone
import "./LoginForm.css";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Estado para o ícone do olho
  const router = useRouter();

  const { signIn } = useAuth();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginData: UserLoginDto = { email, senha };

    try {
      // 3. Chame a função signIn do contexto
      await signIn({ email, senha });
      // O redirecionamento e o salvamento do token agora são feitos pelo AuthContext
    } catch (err) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Usando a mesma estrutura base do RegisterForm
    <div className="cadastro-container">
      <header className="topbar">Doação</header>
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

          {/* Div para agrupar o input de senha e o ícone */}
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

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <a href="#" className="forgot-password-link">
          Esqueci minha senha
        </a>
      </div>
    </div>
  );
};

export default LoginForm;