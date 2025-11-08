import React, { useState, useEffect } from 'react';
import { getUserByIdRequest } from '@/services/userService';
import type { UserDto } from '@/types/user';
import './UserDetailsModal.css'; // Criaremos este CSS a seguir
import { FaTimes } from 'react-icons/fa'; // Ícone para fechar

type UserDetailsModalProps = {
  userId: number;
  onClose: () => void; // Função para fechar o modal
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, onClose }) => {
  const [userDetails, setUserDetails] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return; // Não faz nada se não houver ID

      try {
        setLoading(true);
        setError(null);
        const data = await getUserByIdRequest(userId); // Busca dados do usuário específico
        setUserDetails(data);
      } catch (err) {
        console.error(`Erro ao buscar detalhes do usuário ${userId}:`, err);
        setError("Não foi possível carregar os detalhes do usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]); // Re-executa se o userId mudar

  return (
    // Overlay semi-transparente
    <div className="modal-overlay" onClick={onClose}>
      {/* Conteúdo do Modal (stopPropagation impede fechar ao clicar dentro) */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Detalhes do Usuário</h2>

        {loading && <p>Carregando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && userDetails && (
          <div className="user-details-grid">
            <div className="detail-item"><strong>ID:</strong> {userDetails.id}</div>
            <div className="detail-item"><strong>Nome:</strong> {userDetails.nome}</div>
            <div className="detail-item"><strong>Email:</strong> {userDetails.email}</div>
            <div className="detail-item"><strong>Papel:</strong> {userDetails.tipoUsuario}</div>
            <div className="detail-item"><strong>Tipo Pessoa:</strong> {userDetails.tipoPessoa || 'Não informado'}</div>
            <div className="detail-item"><strong>Documento:</strong> {userDetails.documento || 'Não informado'}</div>
            {/* Adicione outros campos se necessário */}
          </div>
        )}
         {!loading && !error && !userDetails && (
            <p>Usuário não encontrado.</p>
         )}
      </div>
    </div>
  );
};

export default UserDetailsModal;