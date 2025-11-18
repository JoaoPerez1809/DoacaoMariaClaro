"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { 
  FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt, 
  FaChevronLeft, FaChevronRight, FaEdit, FaHandHoldingHeart 
} from "react-icons/fa";
import "./Dashboard.css";

// --- 1. IMPORTE O NOVO SERVIÇO E TIPO ---
import { 
  getAllUsersRequest, 
  UserFilters, 
  getUserStatsRequest 
} from "@/services/userService";
import type { UserDto, UserStatsDto } from "@/types/user";

import { useAuth } from "@/contexts/AuthContext";
import UserDetailsModal from './UserDetailsModal';
import EditRoleModal from './EditRoleModal'; 
import debounce from 'lodash/debounce';
import { ActionBar } from '@/components/layout/ActionBar';

const PAGE_SIZE = 10;

// --- Helper para o loading dos cards ---
const StatsLoadingCard = () => (
  <div className="info-card stats-loading">
    <div className="loading-shimmer title"></div>
    <div className="loading-shimmer value"></div>
  </div>
);

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser, signOut } = useAuth();
  
  // --- 2. NOVOS ESTADOS PARA ESTATÍSTICAS ---
  const [stats, setStats] = useState<UserStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ... (Estados de paginação e filtros existentes) ...
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null); 
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTipoPessoa, setSelectedTipoPessoa] = useState('');

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  // Função para buscar os usuários (paginados)
  const fetchUsers = useCallback(async (page: number, filters: UserFilters = {}) => {
    try {
      setLoading(true); 
      setError(null); 
      const data = await getAllUsersRequest(page, PAGE_SIZE, filters);
      setUsers(data.items); 
      setTotalUsers(data.totalCount); 
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Não foi possível carregar os usuários. Tente recarregar a página.");
    } finally {
      setLoading(false); 
    }
  }, []); 

  // --- 3. NOVO useEffect PARA BUSCAR ESTATÍSTICAS (Roda 1 vez) ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await getUserStatsRequest();
        setStats(statsData);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        // Não define o erro principal, para a tabela ainda carregar
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchStats();
  }, []); // Array vazio, roda só no início

  // useEffect principal para buscar a lista de usuários (paginada)
  useEffect(() => {
    const currentFilters: UserFilters = {
      search: searchTerm || undefined, 
      role: selectedRole || undefined,
      tipoPessoa: selectedTipoPessoa || undefined,
    };
    fetchUsers(currentPage, currentFilters);
  }, [currentPage, searchTerm, selectedRole, selectedTipoPessoa, fetchUsers]); 

  // ... (debounce e handlers existentes) ...
  const debouncedSearch = useCallback(
    debounce((term: string, currentRole: string, currentTipo: string) => {
      const currentFilters: UserFilters = {
        search: term || undefined,
        role: currentRole || undefined,
        tipoPessoa: currentTipo || undefined,
      };
      fetchUsers(1, currentFilters);
    }, 500), 
    [fetchUsers] 
  );
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); 
    setCurrentPage(1);
    debouncedSearch(newSearchTerm, selectedRole, selectedTipoPessoa);
  };
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value); 
    setCurrentPage(1); 
  };
  const handleTipoPessoaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTipoPessoa(event.target.value); 
    setCurrentPage(1); 
  };
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1)); 
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)); 
  const handleRowClick = (userId: number) => { 
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUserId(null); 
  };
  const handleEditRoleClick = (event: React.MouseEvent, userToEdit: UserDto) => { 
    event.stopPropagation(); 
    setEditingUser(userToEdit); 
    setIsEditRoleModalOpen(true); 
  };
  const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setEditingUser(null); 
  };
  const handleRoleUpdated = () => {
      // Atualiza a lista E as estatísticas
      const currentFilters: UserFilters = { search: searchTerm, role: selectedRole, tipoPessoa: selectedTipoPessoa };
      fetchUsers(currentPage, currentFilters);
      getUserStatsRequest().then(setStats).catch(console.error); // Recarrega stats
  };

  // --- Renderização do Componente ---
  return (
    <div className="dashboard-container">
      {/* Sidebar (Atualizada) */}
      <aside className="sidebar">
         <ul>
           <li><Link href="/admin/dashboard" title="Visão Geral (Não implementado)"><FaThLarge /></Link></li>
           <li className="active"><Link href="/admin/dashboard" title="Usuários"><FaUsers /></Link></li>
           <li><Link href="/admin/doacoes" title="Doações Recebidas"><FaHandHoldingHeart /></Link></li>
           <li><Link href="/admin/relatorios" title="Relatórios de Arrecadação"><FaFileAlt /></Link></li>
           <li><Link href="/doador/perfil" title="Meu Perfil"><FaUser /></Link></li> 
           <li onClick={signOut} title="Sair"><FaSignOutAlt /></li>
         </ul>
      </aside>

      {/* Conteúdo Principal */}
      <div className="dashboard-content">
        <header className="dashboard-header">Dashboard</header>
        <ActionBar />
        <main className="dashboard-main">
          
          {/* --- 4. NOVOS CARDS INFORMATIVOS (USUÁRIOS) --- */}
          <div className="info-card-container stats-grid">
            {statsLoading ? (
              // Mostra 6 "esqueletos" de loading
              <>
                <StatsLoadingCard />
                <StatsLoadingCard />
                <StatsLoadingCard />
                <StatsLoadingCard />
                <StatsLoadingCard />
                <StatsLoadingCard />
              </>
            ) : stats ? (
              // Mostra os cards reais
              <>
                <div className="info-card">
                  <h3 className="info-card-title">Total de Usuários</h3>
                  <p className="info-card-value">{stats.totalUsuarios}</p>
                </div>
                <div className="info-card">
                  <h3 className="info-card-title">Pessoa Física</h3>
                  <p className="info-card-value">{stats.totalPessoaFisica}</p>
                </div>
                <div className="info-card">
                  <h3 className="info-card-title">Pessoa Jurídica</h3>
                  <p className="info-card-value">{stats.totalPessoaJuridica}</p>
                </div>
                <div className="info-card">
                  <h3 className="info-card-title">Doadores</h3>
                  <p className="info-card-value">{stats.totalDoadores}</p>
                </div>
                <div className="info-card">
                  <h3 className="info-card-title">Colaboradores</h3>
                  <p className="info-card-value">{stats.totalColaboradores}</p>
                </div>
                <div className="info-card">
                  <h3 className="info-card-title">Administradores</h3>
                  <p className="info-card-value">{stats.totalAdministradores}</p>
                </div>
              </>
            ) : (
              <p style={{color: 'red'}}>Não foi possível carregar as estatísticas.</p>
            )}
          </div>
          {/* --- FIM DOS CARDS --- */}


          {/* Título da Seção (Gerenciamento) */}
          <h2 className="section-title">Gerenciamento de Usuários</h2>

          {/* Área de Filtros (Sem alteração) */}
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou ID..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange} 
            />
            <select className="filter-select" value={selectedRole} onChange={handleRoleChange}>
              <option value="">Todos os Papéis</option>
              <option value="Doador">Doador</option>
              <option value="Colaborador">Colaborador</option>
              <option value="Administrador">Administrador</option>
            </select>
            <select className="filter-select" value={selectedTipoPessoa} onChange={handleTipoPessoaChange}>
              <option value="">Todos os Tipos</option>
              <option value="Fisica">Pessoa Física</option>
              <option value="Juridica">Pessoa Jurídica</option>
            </select>
          </div>

          {loading && <p style={{ textAlign: 'center', padding: '30px' }}>Carregando usuários...</p>}
          {error && <p style={{ color: 'red', textAlign: 'center', padding: '30px' }}>{error}</p>}

          {!loading && !error && ( 
            <>
              {/* Grelha de Cards (Já implementada) */}
              <div className="user-card-grid">
                {users.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-card-info">
                      <span className={`user-card-role role-${user.tipoUsuario.toLowerCase()}`}>
                        {user.tipoUsuario}
                      </span>
                      <h3 className="user-card-name">{user.nome}</h3>
                      <p className="user-card-email">{user.email}</p>
                    </div>
                    <div className="user-card-actions">
                      <button className="details-button" onClick={() => handleRowClick(user.id)}>
                        Detalhes
                      </button>
                      {authUser?.role === 'Administrador' && user.id !== parseInt(authUser.id, 10) && (
                         <button
                           className="edit-role-button" 
                           onClick={(e) => handleEditRoleClick(e, user)}
                           title="Editar Papel"
                          >
                           <FaEdit /> 
                         </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <p className="no-users-found">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </p>
                )}
              </div>
              
              {/* Paginação (Sem alteração) */}
              {totalPages > 1 && (
                <div className="pagination-controls"> 
                  <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <FaChevronLeft /> Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Próxima <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modais (Sem alteração) */}
      {isDetailsModalOpen && selectedUserId && (
        <UserDetailsModal userId={selectedUserId} onClose={handleCloseDetailsModal} />
      )}
      {isEditRoleModalOpen && editingUser && (
        <EditRoleModal
          user={editingUser} 
          onClose={handleCloseEditRoleModal} 
          onRoleUpdated={handleRoleUpdated} 
        />
      )}
    </div>
  );
};

export default Dashboard;