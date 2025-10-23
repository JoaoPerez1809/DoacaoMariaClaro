"use client"; // Adicione esta linha no topo

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Precisaremos para o signOut
// Importe as funções de serviço necessárias
import { getMyProfile, deleteUserRequest, updateUserRequest } from '@/services/userService';
// Importe os tipos necessários
import type { UserDto, UserUpdateDto, TipoPessoa } from '@/types/user';
import "./Profile.css"; // Seu CSS
import { useRouter } from 'next/navigation'; // Para redirecionar após deletar
import { AxiosError } from 'axios'; // Para tratar erros da API
import Link from 'next/link'; // Para o link de edição (se usar)

// Importe as funções de validação que criamos
import { isValidCPF, isValidCNPJ } from "@/utils/validators";

// Opcional: Instale react-input-mask se quiser máscara para CPF/CNPJ na edição
// npm install react-input-mask @types/react-input-mask
// import InputMask from 'react-input-mask';

const Profile: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter(); // Hook para redirecionamento

  // Estados para dados do usuário, carregamento e erro geral
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o modo de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTipoPessoa, setEditTipoPessoa] = useState<TipoPessoa | undefined>(undefined);
  const [editDocumento, setEditDocumento] = useState("");
  const [editError, setEditError] = useState<string | null>(null); // Erro específico da edição
  const [isUpdating, setIsUpdating] = useState(false); // Para feedback no botão Salvar

  // Função para buscar o perfil
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyProfile(); //
      setUser(data);
      // Inicializa os estados de edição com os dados atuais do perfil
      setEditNome(data.nome);
      setEditEmail(data.email);
      setEditTipoPessoa(data.tipoPessoa); // Usa o tipo que veio da API
      setEditDocumento(data.documento || ""); // Usa o documento que veio da API ou vazio
    } catch (err) {
      console.error("Falha ao buscar dados do perfil:", err);
      setError("Não foi possível carregar seu perfil. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Busca o perfil quando o componente é montado
  useEffect(() => {
    fetchProfile();
  }, []); // O array vazio garante que a busca ocorre apenas uma vez

  // Função auxiliar para limpar máscara/pontuação do documento
  const limparDocumento = (doc: string): string => {
    return doc.replace(/[^\d]/g, ""); // Remove tudo que não for dígito
  };

  // Função para salvar as alterações do perfil
  const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault(); // Impede o recarregamento da página
      setEditError(null); // Limpa erros de edição anteriores
      setIsUpdating(true); // Ativa o estado de "salvando"

      const documentoLimpo = limparDocumento(editDocumento);

      // --- Validação do Documento (Frontend) ---
      // Só valida se um documento foi preenchido
      if (documentoLimpo.length > 0) {
          if (editTipoPessoa === 'Fisica' && !isValidCPF(documentoLimpo)) {
              setEditError("CPF inválido. Verifique os dígitos.");
              setIsUpdating(false);
              return;
          }
          if (editTipoPessoa === 'Juridica' && !isValidCNPJ(documentoLimpo)) {
              setEditError("CNPJ inválido. Verifique os dígitos.");
              setIsUpdating(false);
              return;
          }
           // Verifica se o tipo foi selecionado quando há documento
           if (!editTipoPessoa) {
             setEditError("Selecione o tipo de pessoa (Física ou Jurídica) para o documento informado.");
             setIsUpdating(false);
             return;
           }
      } else if (editTipoPessoa && documentoLimpo.length === 0) {
          // Se selecionou tipo mas limpou o documento, permite (para remover o doc)
      } else if (!editTipoPessoa && documentoLimpo.length === 0) {
          // Se não selecionou tipo e limpou o documento, permite
      }
      // --- Fim da Validação ---

      if (!user) return; // Segurança caso o usuário não esteja carregado

      // Monta o objeto DTO para enviar ao backend
      const updateData: UserUpdateDto = {
          nome: editNome,
          email: editEmail,
          // Envia o tipoPessoa e o documento (limpo ou undefined se vazio)
          tipoPessoa: editTipoPessoa,
          documento: documentoLimpo.length > 0 ? documentoLimpo : undefined,
      };

      try {
          // Chama a função do serviço para atualizar o usuário na API
          await updateUserRequest(user.id, updateData); //
          alert("Perfil atualizado com sucesso!");
          setIsEditing(false); // Sai do modo de edição
          fetchProfile(); // Recarrega os dados atualizados do perfil
      } catch (err) {
          // Tratamento de erro da API
          if (err instanceof AxiosError && err.response?.data) {
              const apiError = err.response.data;
              // Tenta extrair a mensagem de erro da resposta da API
              const message = apiError.message || apiError.title || (typeof apiError === 'string' ? apiError : "Erro ao atualizar perfil.");
              setEditError(message);
          } else {
              setEditError("Não foi possível conectar ao servidor. Tente novamente.");
              console.error(err);
          }
      } finally {
          setIsUpdating(false); // Desativa o estado de "salvando"
      }
  };

  // Função para deletar a conta (mantida do seu código original)
  const handleDelete = async () => {
    if (user && window.confirm("Tem certeza que deseja deletar sua conta? Esta ação é irreversível.")) {
      try {
        await deleteUserRequest(user.id); //
        alert("Conta deletada com sucesso.");
        signOut(); // Desloga
        router.push("/"); // Redireciona para a home
      } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        alert("Não foi possível deletar a conta. Tente novamente.");
      }
    }
  };

  // --- Renderização Condicional ---

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando perfil...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;
  }

  // Se carregou e não deu erro, mas user é nulo (improvável se logado, mas por segurança)
  if (!user) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Nenhum dado de usuário encontrado.</p>;
  }

  // --- Renderização Principal (Visualização ou Edição) ---
  return (
    <>
      {/* Barra azul no topo */}
      <header className="topbar">Perfil</header>

      {/* Container principal */}
      <div className="perfil-container">
        {/* Título da página (muda se estiver editando) */}
        <h1 className="perfil-nome">{isEditing ? 'Editar Perfil' : user.nome}</h1>

        {/* Card de informações */}
        <div className="card">
          <h2 className="card-title">Informações Pessoais</h2>

          {/* Renderiza o formulário de edição OU as informações de visualização */}
          {isEditing ? (
            <form onSubmit={handleUpdate} className='edit-form'> {/* */}
              {/* Campo Nome/Razão Social */}
              <div className="form-group">
                <label htmlFor="nome">Nome / Razão Social:</label>
                <input type="text" id="nome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required disabled={isUpdating} />
              </div>
              {/* Campo Email */}
              <div className="form-group">
                 <label htmlFor="email">Email:</label>
                 <input type="email" id="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required disabled={isUpdating} />
              </div>
              {/* Campo Tipo de Pessoa (Radio buttons) */}
              <div className="form-group tipo-pessoa-edit">
                 <label>Tipo de Pessoa:</label>
                 <div>
                    <label>
                       <input type="radio" name="editTipoPessoa" value="Fisica" checked={editTipoPessoa === 'Fisica'} onChange={() => setEditTipoPessoa('Fisica')} disabled={isUpdating} /> Física
                    </label>
                    <label>
                       <input type="radio" name="editTipoPessoa" value="Juridica" checked={editTipoPessoa === 'Juridica'} onChange={() => setEditTipoPessoa('Juridica')} disabled={isUpdating} /> Jurídica
                    </label>
                 </div>
              </div>
              {/* Campo Documento (CPF/CNPJ) */}
               <div className="form-group">
                  <label htmlFor="documento">CPF / CNPJ:</label>
                  <input
                     type="text" // Usar 'text' permite máscaras; 'number' pode causar problemas
                     id="documento"
                     placeholder={editTipoPessoa === 'Fisica' ? "CPF (somente números)" : editTipoPessoa === 'Juridica' ? "CNPJ (somente números)" : "Selecione o tipo acima"}
                     value={editDocumento}
                     onChange={(e) => setEditDocumento(e.target.value)}
                     disabled={isUpdating || !editTipoPessoa} // Desabilita se não selecionar o tipo
                     maxLength={editTipoPessoa === 'Fisica' ? 11 : 14} // Limite de dígitos (sem máscara)
                     // pattern="\d*" // Garante que só números sejam aceitos (HTML5, mas JS é mais seguro)
                  />
                  {/* Alternativa com Máscara (requer instalação e importação):
                  <InputMask
                    mask={editTipoPessoa === 'Fisica' ? "999.999.999-99" : "99.999.999/9999-99"}
                    value={editDocumento}
                    onChange={(e) => setEditDocumento(e.target.value)}
                    disabled={isUpdating || !editTipoPessoa}
                  >
                    {(inputProps: any) => <input {...inputProps} type="text" id="documento" placeholder={editTipoPessoa === 'Fisica' ? "CPF" : "CNPJ"} />}
                  </InputMask>
                  */}
               </div>

               {/* Exibe erros de validação/API */}
               {editError && <p className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{editError}</p>}

               {/* Botões de Ação (Cancelar / Salvar) */}
               <div className="edit-actions">
                   <button type="button" onClick={() => { setIsEditing(false); setEditError(null); }} disabled={isUpdating} className='cancel-button'>Cancelar</button>
                   <button type="submit" disabled={isUpdating} className='save-button'>
                      {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                   </button>
               </div>
            </form>
          ) : (
            // Modo de Visualização
            <>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Email:</strong>
                  <span>{user.email}</span>
                </div>
                <div className="info-item">
                  <strong>Tipo de Conta:</strong>
                  <span>{user.tipoUsuario}</span>
                </div>
                {/* Exibe Tipo de Pessoa e Documento */}
                <div className="info-item">
                  <strong>Tipo de Pessoa:</strong>
                  <span>{user.tipoPessoa || 'Não informado'}</span>
                </div>
                <div className="info-item">
                  <strong>CPF/CNPJ:</strong>
                  <span>{user.documento || 'Não informado'}</span>
                  {/* TODO: Aplicar máscara de CPF/CNPJ na exibição se desejar */}
                </div>
              </div>
              {/* Botões de Ação (Editar / Deletar) */}
               <div className="actions">
                  <button className="edit-button" onClick={() => setIsEditing(true)}>Editar Perfil</button>
                  {/* Se quiser manter o botão deletar: */}
                  {/* <button className="delete-button" onClick={handleDelete}>Deletar Conta</button> */}
               </div>
            </>
          )}
        </div>

        {/* Card de Histórico de Doações (Mantido do seu código original) */}
        <br />
        <div className="card">
          <h2 className="card-title">Histórico de Doações</h2>
          <table className="tabela-doacoes">
             <thead><tr><th>Data</th><th>Valor</th><th>Status</th></tr></thead>
             <tbody>
               {/* Aqui você precisará buscar e mapear os dados de doações */}
               <tr><td colSpan={3}>Nenhuma doação encontrada.</td></tr>
             </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Profile;