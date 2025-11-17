"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { registerRequest } from "@/services/authService";
import type { UserRegisterDto, TipoPessoa } from "@/types/user";
import "./RegisterForm.css";
import { AxiosError } from "axios";
import { isValidCPF, isValidCNPJ } from "@/utils/validators";
import { ActionBar } from '@/components/layout/ActionBar';

const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('Fisica');
  const [documento, setDocumento] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const limparDocumento = (doc: string): string => {
    return doc.replace(/[^\d]/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    const documentoLimpo = limparDocumento(documento);

    if (tipoPessoa === 'Fisica' && !isValidCPF(documentoLimpo)) {
      setError("CPF inválido. Verifique os dígitos.");
      return;
    }
    if (tipoPessoa === 'Juridica' && !isValidCNPJ(documentoLimpo)) { 
      setError("CNPJ inválido. Verifique os dígitos.");
      return;
    }
    
    setIsLoading(true);

    const userData: UserRegisterDto = {
      nome,
      email,
      senha,
      tipoPessoa,
      documento: documentoLimpo 
    };

    try {
       await registerRequest(userData);
       alert("Usuário cadastrado com sucesso!");
       router.push('/login'); 

    } catch (err) {
       if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data;

        if (typeof apiError === 'string') {
          setError(apiError);
        } else if (apiError.errors) {
          const firstErrorKey = Object.keys(apiError.errors)[0];
          const firstErrorMessage = apiError.errors[firstErrorKey][0];
          setError(firstErrorMessage);
        } else if (apiError.message) {
          setError(apiError.message);
        } else {
          setError("Ocorreu um erro ao tentar cadastrar.");
        }
      } else {
        setError("Não foi possível conectar ao servidor.");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <> {/* <--- CORREÇÃO AQUI (removido o comentário com erro) */}
      <header className="topbar">Cadastro</header>
      
      <ActionBar />
      
      <div className="cadastro-container">
        <div className="form-box">
          <h2>Cadastro</h2>
          <form onSubmit={handleSubmit}>
             <input type="text" placeholder="Nome Completo ou Razão Social" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading} />
             <input type="email" placeholder="Insira seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
             <input type="password" placeholder="Insira sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={isLoading} />
             <input type="password" placeholder="Confirme sua senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required disabled={isLoading} />

            <div className="tipo-pessoa-group">
              <label>
                <input type="radio" name="tipoPessoa" value="Fisica" checked={tipoPessoa === 'Fisica'} onChange={() => setTipoPessoa('Fisica')} disabled={isLoading} /> Pessoa Física
              </label>
              <label>
                <input type="radio" name="tipoPessoa" value="Juridica" checked={tipoPessoa === 'Juridica'} onChange={() => setTipoPessoa('Juridica')} disabled={isLoading} /> Pessoa Jurídica
              </label>
            </div>

            <input
              type="text" 
              placeholder={tipoPessoa === 'Fisica' ? "CPF (somente números)" : "CNPJ (somente números)"}
              value={documento}
              onChange={(e) => setDocumento(e.target.value)} 
              required
              disabled={isLoading}
              maxLength={tipoPessoa === 'Fisica' ? 14 : 18} 
            />

            {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    </> 
  );
};
export default RegisterForm;