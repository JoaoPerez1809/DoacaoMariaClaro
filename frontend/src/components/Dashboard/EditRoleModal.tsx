"use client"; 

import React, { useState } from 'react';
import { updateUserRoleRequest } from '@/services/userService';
import type { UserDto, UserRole, UpdateUserRoleDto } from '@/types/user';
import './EditRoleModal.css';
import { FaTimes } from 'react-icons/fa';
import { AxiosError } from 'axios';

// --- 1. IMPORTE O TOAST ---
import toast from 'react-hot-toast';

type EditRoleModalProps = {
  user: UserDto | null; 
  onClose: () => void; 
  onRoleUpdated: () => void; 
};

const EditRoleModal: React.FC<EditRoleModalProps> = ({ user, onClose, onRoleUpdated }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>(user?.tipoUsuario || '');
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null); // <-- Removido

  const availableRoles: UserRole[] = ['Doador', 'Colaborador', 'Administrador'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    // setError(null); // <-- Removido

    if (!user || !selectedRole) {
      // --- 2. SUBSTITUA 'setError' POR 'toast.error' ---
      toast.error("Usuário ou papel inválido.");
      return;
    }

    setIsLoading(true); 

    const updateData: UpdateUserRoleDto = {
      novoTipoUsuario: selectedRole
    };

    try {
      await updateUserRoleRequest(user.id, updateData); 
      // --- 3. SUBSTITUA O 'alert' POR 'toast.success' ---
      toast.success("Papel do usuário atualizado com sucesso!");
      onRoleUpdated(); 
      onClose();       
    } catch (err) {
      // --- 4. SUBSTITUA O 'setError' NO CATCH ---
      console.error("Erro ao atualizar papel:", err);
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data;
        const message = apiError.message || apiError.title || (typeof apiError === 'string' ? apiError : "Não foi possível atualizar o papel.");
        toast.error(message);
      } else {
        toast.error("Erro de conexão ao tentar atualizar o papel.");
      }
    } finally {
      setIsLoading(false); 
    }
  };

  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}> 
      <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Editar Papel do Usuário</h2>

        <div className="user-info-summary">
            <p><strong>Usuário:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Papel Atual:</strong> {user.tipoUsuario}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roleSelect">Novo Papel:</label>
            <select
              id="roleSelect"
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value as UserRole)} 
              disabled={isLoading} 
              required 
            >
              <option value="" disabled>Selecione um papel</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* --- 5. REMOVA O <p> DE ERRO --- */}
          {/* {error && <p className="error-message" ...>{error}</p>} */}

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