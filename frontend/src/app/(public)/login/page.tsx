// FileName: LoginPage.jsx
"use client";

import React, { useState } from 'react';
import styles from './LoginPage.module.css'; 
import '../../globals.css'; // 1. Importa o nosso novo arquivo CSS
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importando os ícones de olho

// --- 1. COMPONENTE DO CABEÇALHO (HEADER) ---
import { Header } from "@/components/layout/Header";

// --- 2. COMPONENTE DA FAIXA DE TÍTULO AZUL ---
import { TitleBanner } from "@/components/ui/TitleBanner";

// --- 3. COMPONENTE DO CARD DE LOGIN 
const LoginCard = () => {  
  // Adicionar estados para controlar os inputs e a visibilidade da senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  //  Função para alternar a visibilidade da senha
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  return (
    <div className="login-card">
      <h2 className="card-title">Login</h2>
      <form>
        {/* Input de E-mail (agora controlado pelo estado) */}
        <input 
          type="email" 
          placeholder="Insira seu e-mail" 
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        {/* 4. Envolvemos o input de senha e o ícone em uma div para posicionamento */}
        <div className="input-wrapper">
          <input 
            // 5. O tipo do input muda de acordo com o estado
            type={isPasswordVisible ? 'text' : 'password'} 
            placeholder="Insira sua senha" 
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* 6. O ícone que é renderizado também muda e tem um evento de clique */}
          <span className="password-icon" onClick={togglePasswordVisibility}>
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>
      <a href="#" className="forgot-password-link">
        Esqueci minha senha
      </a>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
function LoginPage() {
    return (
        <div className="page-container">
            <Header />
            <TitleBanner title='Login' />
            <main className="main-content">
                <LoginCard />
            </main>
        </div>
    );
}

export default LoginPage;