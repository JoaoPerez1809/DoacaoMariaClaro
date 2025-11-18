import React, { useState, useEffect } from 'react';
import { getUserByIdRequest, getDonationsByUserIdRequest } from '@/services/userService';
import type { UserDto, PagamentoDto } from '@/types/user';
import './UserDetailsModal.css'; 
import { FaTimes } from 'react-icons/fa'; 

// --- 1. IMPORTE TUDO DE FORMATTERS ---
// Importa os formatadores de data/valor e as novas máscaras
import { 
  formatDataExibicao, 
  formatValor, 
  formatStatus,
  maskCPF,
  maskCNPJ,
  maskTelefone,
  maskCEP
} from '@/utils/formatters';


// --- 2. REMOVA OS HELPERS LOCAIS ---
// const formatDataExibicao = (...) // REMOVIDO
// const formatValor = (...) // REMOVIDO
// const formatStatus = (...) // REMOVIDO


type UserDetailsModalProps = {
  userId: number;
  onClose: () => void; // Função para fechar o modal
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ userId, onClose }) => {
  const [userDetails, setUserDetails] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1); // 1: Obrigatórios, 2: Extras, 3: Doações
  const [donations, setDonations] = useState<PagamentoDto[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationsError, setDonationsError] = useState<string | null>(null);

  // Função para buscar doações (só é chamada quando necessário)
  const fetchUserDonations = async (id: number) => {
    // Evita buscar múltiplas vezes se já tiver os dados
    if (donations.length > 0) return; 
    
    try {
      setDonationsLoading(true);
      setDonationsError(null);
      const data = await getDonationsByUserIdRequest(id);
      setDonations(data);
    } catch (err) {
      console.error(`Erro ao buscar doações do usuário ${id}:`, err);
      setDonationsError("Não foi possível carregar o histórico de doações.");
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return; 

      try {
        setLoading(true);
        setError(null);
        const data = await getUserByIdRequest(userId); 
        setUserDetails(data);
      } catch (err) {
        console.error(`Erro ao buscar detalhes do usuário ${userId}:`, err);
        setError("Não foi possível carregar os detalhes do usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]); 

  // Novo Effect para buscar doações quando a página 3 for ativada
  useEffect(() => {
    if (currentPage === 3 && userId) {
      fetchUserDonations(userId);
    }
  }, [currentPage, userId]); // Depende do currentPage e userId

  
  // --- 3. Lógica para os Dados Extras (Página 2) - ATUALIZADA ---
  const renderDadosExtras = () => {
    if (!userDetails) return null;

    // Mapeia os campos extras
    const extraFields = [
      // APLICA A MÁSCARA AQUI
      { label: 'Telefone', value: userDetails.telefone ? maskTelefone(userDetails.telefone) : null },
      { label: 'Gênero', value: userDetails.genero },
      { label: 'Data Nasc.', value: formatDataExibicao(userDetails.dataNascimento) },
      // APLICA A MÁSCARA AQUI
      { label: 'CEP', value: userDetails.cep ? maskCEP(userDetails.cep) : null },
      { label: 'Endereço', value: userDetails.endereco },
      { label: 'Bairro', value: userDetails.bairro },
      { label: 'Cidade', value: userDetails.cidade },
      { label: 'Estado', value: userDetails.estado },
      { label: 'End. Comercial', value: userDetails.comercioEndereco }
    ];

    // Filtra apenas os campos que têm valor (e não "Não informado")
    const filledExtraFields = extraFields.filter(field => 
        field.value && field.value !== 'Não informado'
    );

    if (filledExtraFields.length === 0) {
      return <p className="modal-no-data">Nenhum dado extra preenchido.</p>;
    }

    return (
      <div className="user-details-grid">
        {filledExtraFields.map(field => (
          <div className="detail-item" key={field.label}>
            <strong>{field.label}:</strong> {field.value}
          </div>
        ))}
      </div>
    );
  };

  // --- Lógica para as Doações (Página 3) ---
  const renderDoacoes = () => {
    if (donationsLoading) {
      return <p className="modal-no-data">Carregando doações...</p>;
    }
    if (donationsError) {
      return <p className="modal-no-data" style={{ color: 'red' }}>{donationsError}</p>;
    }
    if (donations.length === 0) {
      return <p className="modal-no-data">Nenhuma doação aprovada encontrada para este usuário.</p>;
    }

    return (
      <table className="modal-tabela-doacoes">
         <thead>
           <tr>
             <th>Data</th>
             <th>Valor</th>
             <th>Status</th>
           </tr>
         </thead>
         <tbody>
            {donations.map((doacao, index) => (
              <tr key={index}>
                <td>{formatDataExibicao(doacao.dataCriacao)}</td>
                <td>{formatValor(doacao.valor)}</td>
                <td>{formatStatus(doacao.status)}</td>
              </tr>
            ))}
         </tbody>
      </table>
    );
  };


  return (
    // Overlay semi-transparente
    <div className="modal-overlay" onClick={onClose}>
      {/* Conteúdo do Modal (stopPropagation impede fechar ao clicar dentro) */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <FaTimes />
        </button>
        
        {/* Título (muda com base no usuário) */}
        <h2>{userDetails ? `Detalhes de ${userDetails.nome}` : 'Detalhes do Usuário'}</h2>

        {/* === BOTÕES DE PAGINAÇÃO === */}
        <div className="modal-pagination">
          <button 
            className={`modal-page-button ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            Dados Obrigatórios
          </button>
          <button 
            className={`modal-page-button ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            Dados Extras
          </button>
          <button 
            className={`modal-page-button ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            Doações
          </button>
        </div>
        {/* === FIM DOS BOTÕES === */}


        {/* Conteúdo principal (carregamento / erro / dados) */}
        <div className="modal-page-content">
          {loading && <p>Carregando...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && !error && userDetails && (
            <>
              {/* Página 1: Dados Obrigatórios */}
              {currentPage === 1 && (
                <div className="user-details-grid">
                  <div className="detail-item"><strong>ID:</strong> {userDetails.id}</div>
                  <div className="detail-item"><strong>Nome:</strong> {userDetails.nome}</div>
                  <div className="detail-item"><strong>Email:</strong> {userDetails.email}</div>
                  <div className="detail-item"><strong>Papel:</strong> {userDetails.tipoUsuario}</div>
                  <div className="detail-item"><strong>Tipo Pessoa:</strong> {userDetails.tipoPessoa || 'Não informado'}</div>
                  
                  {/* --- 4. ATUALIZADO PARA USAR MÁSCARA (Documento) --- */}
                  <div className="detail-item">
                    <strong>Documento:</strong> 
                    <span>
                      {userDetails.tipoPessoa === 'Fisica' ? maskCPF(userDetails.documento || '') :
                       userDetails.tipoPessoa === 'Juridica' ? maskCNPJ(userDetails.documento || '') :
                       userDetails.documento || 'Não informado'}
                    </span>
                  </div>
                  
                  <div className="detail-item"><strong>Membro desde:</strong> {formatDataExibicao(userDetails.dataCadastro)}</div>
                </div>
              )}
              
              {/* Página 2: Dados Extras */}
              {currentPage === 2 && renderDadosExtras()}
              
              {/* Página 3: Doações */}
              {currentPage === 3 && renderDoacoes()}
            </>
          )}
          
          {!loading && !error && !userDetails && (
              <p>Usuário não encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;