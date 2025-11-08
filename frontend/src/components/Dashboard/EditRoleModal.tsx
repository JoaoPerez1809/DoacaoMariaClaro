"use client"; // Necessário para hooks

import React, { useState } from 'react';
// Importa a função do serviço para atualizar o papel
import { updateUserRoleRequest } from '@/services/userService';
// Importa os tipos necessários
import type { UserDto, UserRole, UpdateUserRoleDto } from '@/types/user';
// Importa os estilos (criaremos a seguir)
import './EditRoleModal.css';
// Importa ícone de fechar
import { FaTimes } from 'react-icons/fa';
// Para tratamento de erros da API
import { AxiosError } from 'axios';

// Define as propriedades que o modal receberá
type EditRoleModalProps = {
  user: UserDto | null; // Recebe o objeto completo do usuário a ser editado
  onClose: () => void; // Função para fechar o modal
  onRoleUpdated: () => void; // Função para ser chamada após a atualização (para recarregar a lista)
};

const EditRoleModal: React.FC<EditRoleModalProps> = ({ user, onClose, onRoleUpdated }) => {
  // Estado para guardar o papel selecionado no dropdown, inicializado com o papel atual do usuário
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>(user?.tipoUsuario || '');
  // Estado para feedback visual durante a chamada da API
  const [isLoading, setIsLoading] = useState(false);
  // Estado para exibir mensagens de erro
  const [error, setError] = useState<string | null>(null);

  // Lista de papéis disponíveis para seleção (baseado no Enum do backend)
  const availableRoles: UserRole[] = ['Doador', 'Colaborador', 'Administrador'];

  // Função chamada ao submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede recarregamento da página
    setError(null); // Limpa erros anteriores

    // Validação básica: verifica se um usuário foi passado e um papel foi selecionado
    if (!user || !selectedRole) {
      setError("Usuário ou papel inválido.");
      return;
    }

    setIsLoading(true); // Ativa o estado de carregamento

    // Cria o objeto DTO para enviar à API
    const updateData: UpdateUserRoleDto = {
      novoTipoUsuario: selectedRole
    };

    try {
      // Chama a função do serviço para atualizar o papel na API
      await updateUserRoleRequest(user.id, updateData); //
      alert("Papel do usuário atualizado com sucesso!"); // Feedback de sucesso
      onRoleUpdated(); // Chama a função passada por props para atualizar a lista no Dashboard
      onClose();       // Fecha o modal
    } catch (err) {
      console.error("Erro ao atualizar papel:", err);
      // Tratamento de erro da API
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data;
        // Tenta extrair a mensagem de erro da resposta da API
        const message = apiError.message || apiError.title || (typeof apiError === 'string' ? apiError : "Não foi possível atualizar o papel.");
        setError(message);
      } else {
        setError("Erro de conexão ao tentar atualizar o papel.");
      }
    } finally {
      setIsLoading(false); // Desativa o estado de carregamento
    }
  };

  // Se o objeto 'user' não for passado por algum motivo, não renderiza o modal
  if (!user) return null;

  // Renderização do Modal
  return (
    // Overlay semi-transparente que cobre a tela
    <div className="modal-overlay" onClick={onClose}> {/* Fecha o modal ao clicar fora */}
      {/* Conteúdo do modal (stopPropagation impede fechar ao clicar DENTRO) */}
      <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
        {/* Botão de fechar (X) no canto */}
        <button className="modal-close-button" onClick={onClose}>
          <FaTimes />
        </button>
        {/* Título do Modal */}
        <h2>Editar Papel do Usuário</h2>

        {/* Exibe informações básicas do usuário que está sendo editado */}
        <div className="user-info-summary">
            <p><strong>Usuário:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Papel Atual:</strong> {user.tipoUsuario}</p>
        </div>

        {/* Formulário para seleção do novo papel */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roleSelect">Novo Papel:</label>
            <select
              id="roleSelect"
              value={selectedRole} // Valor controlado pelo estado
              onChange={(e) => setSelectedRole(e.target.value as UserRole)} // Atualiza o estado ao mudar
              disabled={isLoading} // Desabilita durante o carregamento
              required // Campo obrigatório
            >
              <option value="" disabled>Selecione um papel</option>
              {/* Mapeia os papéis disponíveis para criar as opções do select */}
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Exibe mensagens de erro, se houver */}
          {error && <p className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}

          {/* Botões de Ação (Cancelar / Salvar) */}
          <div className="edit-actions">
            <button type="button" onClick={onClose} disabled={isLoading} className='cancel-button'>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading || !selectedRole || selectedRole === user.tipoUsuario} className='save-button'>
              {isLoading ? 'Salvando...' : 'Salvar Novo Papel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;