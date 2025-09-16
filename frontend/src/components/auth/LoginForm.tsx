'use client';

import React, { useState, useContext } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './AuthForms.module.css';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

   const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // --- FUNÇÃO FALTANTE ADICIONADA AQUI ---
  // Esta função é chamada quando o formulário é submetido.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Impede que a página recarregue
    setError(null);
    try {
      await signIn({ email, senha: password });
      // Redireciona para o perfil após o login bem-sucedido
      router.push('/doador/perfil'); 
    } catch (err) {
      setError('Email ou senha inválidos. Tente novamente.');
      console.error(err);
    }
  };

  return (
    <div className={styles.authCard}>
      <h2 className={styles.cardTitle}>Login</h2>
      {/* O onSubmit agora encontra a função handleSubmit */}
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Insira seu e-mail" 
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className={styles.inputWrapper}>
          <input 
            type={isPasswordVisible ? 'text' : 'password'} 
            placeholder="Insira sua senha" 
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className={styles.passwordIcon} onClick={togglePasswordVisibility}>
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

        <button type="submit" className={styles.button}>
          Entrar
        </button>
      </form>
      <a href="#" className={styles.link}>
        Esqueci minha senha
      </a>
    </div>
  );
}
