"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { registerRequest } from "@/services/authService";
import type { UserRegisterDto, TipoPessoa } from "@/types/user";
import "./RegisterForm.css";
import { AxiosError } from "axios";
// 1. Importe a função de validação
import { isValidCPF, isValidCNPJ } from "@/utils/validators";

// ... (restante do código do componente) ...

const RegisterForm: React.FC = () => {
  // ... (seus estados: nome, email, senha, tipoPessoa, documento, error, isLoading) ...
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('Fisica');
  const [documento, setDocumento] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Função para limpar o documento (remover não-dígitos) - Opcional, mas útil
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

    // --- VALIDAÇÃO USANDO A FUNÇÃO IMPORTADA ---
    if (tipoPessoa === 'Fisica' && !isValidCPF(documentoLimpo)) {
      setError("CPF inválido. Verifique os dígitos.");
      return;
    }
    if (tipoPessoa === 'Juridica' && !isValidCNPJ(documentoLimpo)) { // Use a validação de CNPJ
      setError("CNPJ inválido. Verifique os dígitos.");
      return;
    }
    // --- FIM DA VALIDAÇÃO ---

    setIsLoading(true);

    const userData: UserRegisterDto = {
      nome,
      email,
      senha,
      tipoPessoa,
      documento: documentoLimpo // Envia o documento limpo
    };

    try {
      // ... (chamada para registerRequest) ...
       const responseMessage = await registerRequest(userData);
       alert("Usuário cadastrado com sucesso!");
       router.push('/login');

    } catch (err) {
      // --- ESTE É O BLOCO DE CÓDIGO ATUALIZADO ---
       if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data;

        if (typeof apiError === 'string') {
          // Captura erros do seu catch (Exception ex)
          setError(apiError);
        } else if (apiError.errors) {
          // Captura erros de validação [Required], [EmailAddress], etc.
          // Pega a primeira mensagem de erro do primeiro campo que falhou
          const firstErrorKey = Object.keys(apiError.errors)[0];
          const firstErrorMessage = apiError.errors[firstErrorKey][0];
          setError(firstErrorMessage);
        } else if (apiError.message) {
          // Captura outros erros estruturados
          setError(apiError.message);
        } else {
          // Erro genérico se não conseguir ler a resposta
          setError("Ocorreu um erro ao tentar cadastrar.");
        }
      } else {
        // Erro de rede ou outro problema
        setError("Não foi possível conectar ao servidor.");
        console.error(err);
      }
      // --- FIM DO BLOCO ATUALIZADO ---
    } finally {
      setIsLoading(false);
    }
  };

  // ... (restante do JSX do formulário, incluindo os campos tipoPessoa e documento) ...
    return (
    <div className="cadastro-container">
      <header className="topbar">Cadastro</header>
      <div className="form-box">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          {/* Inputs para nome, email, senha, confirmarSenha */}
           <input type="text" placeholder="Nome Completo ou Razão Social" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={isLoading} />
           <input type="email" placeholder="Insira seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
           <input type="password" placeholder="Insira sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={isLoading} />
           <input type="password" placeholder="Confirme sua senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required disabled={isLoading} />

          {/* Seleção de Tipo de Pessoa */}
          <div className="tipo-pessoa-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ marginRight: '15px' }}>
              <input type="radio" name="tipoPessoa" value="Fisica" checked={tipoPessoa === 'Fisica'} onChange={() => setTipoPessoa('Fisica')} disabled={isLoading} /> Pessoa Física
            </label>
            <label>
              <input type="radio" name="tipoPessoa" value="Juridica" checked={tipoPessoa === 'Juridica'} onChange={() => setTipoPessoa('Juridica')} disabled={isLoading} /> Pessoa Jurídica
            </label>
          </div>

          {/* Input Documento */}
          <input
            type="text" // Use text para permitir máscara no futuro se quiser
            placeholder={tipoPessoa === 'Fisica' ? "CPF (somente números)" : "CNPJ (somente números)"}
            value={documento}
            onChange={(e) => setDocumento(e.target.value)} // Você pode limpar aqui ou antes de validar/enviar
            required
            disabled={isLoading}
            maxLength={tipoPessoa === 'Fisica' ? 14 : 18} // Aumenta para acomodar máscara (opcional)
          />

          {error && <p className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default RegisterForm;