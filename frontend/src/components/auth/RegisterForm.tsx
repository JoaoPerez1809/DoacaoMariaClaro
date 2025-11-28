"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { registerRequest } from "@/services/authService";
import type { UserRegisterDto, TipoPessoa } from "@/types/user";
import "./RegisterForm.css";
import { AxiosError } from "axios";
import { isValidCPF, isValidCNPJ } from "@/utils/validators";
import { ActionBar } from '@/components/layout/ActionBar';

// --- 1. IMPORTE O TOAST ---
import toast from 'react-hot-toast';

const RegisterForm: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa | undefined>(undefined);
  const [documento, setDocumento] = useState("");
  // const [error, setError] = useState<string | null>(null); // <-- Removido
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const limparDocumento = (doc: string): string => {
    return doc.replace(/[^\d]/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null); // <-- Removido

    // --- 2. SUBSTITUA 'setError' POR 'toast.error' ---
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem!");
      return;
    }

    const documentoLimpo = limparDocumento(documento);

    if (documentoLimpo.length > 0) {
        if (!tipoPessoa) {
            toast.error("Se informar documento, selecione o Tipo de Pessoa.");
            return;
        }
        if (tipoPessoa === 'Fisica' && !isValidCPF(documentoLimpo)) {
          toast.error("CPF inválido.");
          return;
        }
        if (tipoPessoa === 'Juridica' && !isValidCNPJ(documentoLimpo)) { 
          toast.error("CNPJ inválido.");
          return;
        }
    }
    
    setIsLoading(true);

    const userData: UserRegisterDto = {
      nome,
      email,
      senha,
      tipoPessoa: tipoPessoa!,
      documento: documentoLimpo 
    };

    try {
       await registerRequest(userData);
       // --- 3. SUBSTITUA O 'alert' POR 'toast.success' ---
       toast.success("Usuário cadastrado com sucesso!");
       router.push('/login'); 

    } catch (err) {
       // --- 4. SUBSTITUA O 'setError' NO CATCH ---
       if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data;
        if (typeof apiError === 'string') {
          toast.error(apiError);
        } else if (apiError.errors) {
          const firstErrorKey = Object.keys(apiError.errors)[0];
          const firstErrorMessage = apiError.errors[firstErrorKey][0];
          toast.error(firstErrorMessage);
        } else if (apiError.message) {
          toast.error(apiError.message);
        } else {
          toast.error("Ocorreu um erro ao tentar cadastrar.");
        }
      } else {
        toast.error("Não foi possível conectar ao servidor.");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <> 
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
            <label>Abaixo é opcional</label>
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
              disabled={isLoading}
              maxLength={tipoPessoa === 'Fisica' ? 14 : 18} 
            />

            {/* --- 5. REMOVA O <p> DE ERRO --- */}
            {/* {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>} */}

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