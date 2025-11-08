"use client";

import React, { useState, useEffect, useCallback } from "react";
// Ícones
import { FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaEdit } from "react-icons/fa";
// Estilos
import "./Dashboard.css";
// Serviços da API e Tipos
import { getAllUsersRequest, UserFilters } from "@/services/userService";
import type { UserDto } from "@/types/user";
// Contexto de Autenticação
import { useAuth } from "@/contexts/AuthContext";
// Modais
import UserDetailsModal from './UserDetailsModal';
import EditRoleModal from './EditRoleModal'; // Importa o novo modal
// Utilitário Debounce
import debounce from 'lodash/debounce'; // Lembre-se: npm install lodash @types/lodash

// Constante para o número de itens por página
const PAGE_SIZE = 20;

const Dashboard: React.FC = () => {
  // Estados para a lista de usuários, carregamento e erro geral
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Obtém o usuário logado e a função signOut do contexto
  const { user: authUser, signOut } = useAuth();

  // Estados para controle da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Estados para o modal de DETALHES
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados para o modal de EDIÇÃO DE PAPEL
  const [editingUser, setEditingUser] = useState<UserDto | null>(null); // Guarda o objeto User a editar
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);

  // Estados para os valores dos FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTipoPessoa, setSelectedTipoPessoa] = useState('');

  // Calcula o número total de páginas baseado no total de usuários e itens por página
  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  // --- Função para buscar os usuários da API ---
  // useCallback evita que a função seja recriada em cada renderização,
  // otimizando o uso no useEffect e no debounce.
  const fetchUsers = useCallback(async (page: number, filters: UserFilters = {}) => {
    try {
      setLoading(true); // Ativa indicador de carregamento
      setError(null); // Limpa erros anteriores
      // Chama o serviço da API passando página e filtros
      const data = await getAllUsersRequest(page, PAGE_SIZE, filters);
      setUsers(data.items); // Atualiza a lista de usuários com os resultados da página
      setTotalUsers(data.totalCount); // Atualiza o contador total de usuários (considerando filtros)
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Não foi possível carregar os usuários. Tente recarregar a página.");
    } finally {
      setLoading(false); // Desativa indicador de carregamento
    }
  }, []); // Array de dependências vazio, pois a função em si não depende de props/state

  // --- useEffect principal para buscar dados ---
  // É acionado na montagem inicial e sempre que a página atual ou algum filtro mudar.
  useEffect(() => {
    // Cria o objeto de filtros com os valores atuais dos estados
    const currentFilters: UserFilters = {
      search: searchTerm || undefined, // Envia undefined se a string for vazia
      role: selectedRole || undefined,
      tipoPessoa: selectedTipoPessoa || undefined,
    };
    // Chama a função para buscar os dados da API
    fetchUsers(currentPage, currentFilters);
  }, [currentPage, searchTerm, selectedRole, selectedTipoPessoa, fetchUsers]); // Dependências do useEffect

  // --- Lógica de Debounce para o campo de busca ---
  // Cria uma versão "atrasada" da função fetchUsers específica para a busca
  const debouncedSearch = useCallback(
    // A função debounce do lodash cria uma nova função que só executa
    // a função original (fetchUsers) após 500ms sem ser chamada novamente.
    debounce((term: string, currentRole: string, currentTipo: string) => {
      // Monta os filtros incluindo o termo de busca atualizado
      const currentFilters: UserFilters = {
        search: term || undefined,
        role: currentRole || undefined,
        tipoPessoa: currentTipo || undefined,
      };
      // Chama fetchUsers para a página 1 com os filtros atualizados
      fetchUsers(1, currentFilters);
    }, 500), // Atraso de 500 milissegundos
    [fetchUsers] // O debounce em si só precisa ser recriado se fetchUsers mudar (o que não deve acontecer)
  );

  // Função chamada quando o valor do input de busca muda
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); // Atualiza o estado do termo de busca imediatamente
    setCurrentPage(1); // Volta para a primeira página ao iniciar uma nova busca
    // Chama a versão com debounce da busca, passando o novo termo e os outros filtros atuais
    debouncedSearch(newSearchTerm, selectedRole, selectedTipoPessoa);
  };
  // --- Fim da Lógica de Debounce ---

  // Função chamada quando o select de Papel (Role) muda
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value); // Atualiza o estado do filtro de papel
    setCurrentPage(1); // Volta para a primeira página ao mudar o filtro
    // A busca será acionada automaticamente pelo useEffect principal, pois selectedRole mudou
  };

  // Função chamada quando o select de Tipo de Pessoa muda
  const handleTipoPessoaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTipoPessoa(event.target.value); // Atualiza o estado do filtro de tipo
    setCurrentPage(1); // Volta para a primeira página ao mudar o filtro
    // A busca será acionada automaticamente pelo useEffect principal
  };

  // Funções para controle da paginação
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1)); // Vai para pág anterior, mínimo 1
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)); // Vai para pág seguinte, máximo totalPages

  // Funções para abrir/fechar o modal de DETALHES
  const handleRowClick = (userId: number) => { // Chamado ao clicar na linha da tabela
    setSelectedUserId(userId);
    setIsDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUserId(null); // Limpa o ID selecionado
  };

  // Funções para abrir/fechar o modal de EDIÇÃO DE PAPEL
  const handleEditRoleClick = (event: React.MouseEvent, userToEdit: UserDto) => { // Chamado ao clicar no botão de lápis
    event.stopPropagation(); // Impede que o handleRowClick (abrir detalhes) seja chamado também
    setEditingUser(userToEdit); // Guarda o objeto do usuário que será editado
    setIsEditRoleModalOpen(true); // Abre o modal de edição
  };
  const handleCloseEditRoleModal = () => {
    setIsEditRoleModalOpen(false);
    setEditingUser(null); // Limpa o usuário selecionado
  };
  // Função passada para o EditRoleModal, chamada após a atualização ser salva com sucesso
  const handleRoleUpdated = () => {
      // Rebusca os usuários da página ATUAL com os filtros ATUAIS
      const currentFilters: UserFilters = { search: searchTerm, role: selectedRole, tipoPessoa: selectedTipoPessoa };
      fetchUsers(currentPage, currentFilters);
  };

  // --- Renderização do Componente ---
  return (
    <div className="dashboard-container">
      {/* Sidebar (Menu Lateral Amarelo) */}
      <aside className="sidebar">
         <ul>
           <li><FaThLarge title="Visão Geral (Não implementado)" /></li>
           <li className="active"><FaUsers title="Usuários" /></li>
           <li><FaFileAlt title="Doações (Não implementado)" /></li>
           <li><FaUser title="Meu Perfil" /></li> {/* Idealmente um Link para /doador/perfil */}
           <li onClick={signOut} title="Sair"><FaSignOutAlt /></li>
         </ul>
      </aside>

      {/* Conteúdo Principal (à direita da sidebar) */}
      <div className="dashboard-content">
        {/* Header (Barra Azul no Topo) */}
        <header className="dashboard-header">Dashboard</header>

        {/* Área Principal abaixo do Header */}
        <main className="dashboard-main">
          {/* Título da Seção */}
          <h2 className="section-title">Gerenciamento de Usuários</h2>

          {/* Área de Filtros */}
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou ID..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange} // Usa a função com debounce
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

          {/* Exibição Condicional: Carregando / Erro / Tabela */}
          {loading && <p style={{ textAlign: 'center', padding: '30px' }}>Carregando usuários...</p>}
          {error && <p style={{ color: 'red', textAlign: 'center', padding: '30px' }}>{error}</p>}

          {!loading && !error && ( // Só mostra tabela e paginação se não estiver carregando e não houver erro
            <>
              <div className="tabela-container">
                <table className="tabela tabela-usuarios">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Papel</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Mapeia a lista de usuários 'users' para criar as linhas */}
                    {users.map((user) => (
                      // A linha inteira abre o modal de detalhes ao ser clicada
                      <tr key={user.id} onClick={() => handleRowClick(user.id)} title="Clique para ver detalhes">
                        <td>{user.nome}</td>
                        <td>{user.email}</td>
                        <td>{user.tipoUsuario}</td>
                        {/* Célula de Ações */}
                        <td>
                          {/* Botão para abrir modal de detalhes (opcional, já que a linha é clicável) */}
                          <button className="details-button" onClick={(e) => { e.stopPropagation(); handleRowClick(user.id); }}>
                            Detalhes
                          </button>

                          {/* Botão para Editar Papel */}
                          {/* Condições: Usuário logado é Admin E não é o próprio usuário */}
                          {authUser?.role === 'Administrador' && user.id !== parseInt(authUser.id, 10) && (
                             <button
                               className="edit-role-button" //
                               // Passa o evento (e) para parar a propagação e o objeto user
                               onClick={(e) => handleEditRoleClick(e, user)}
                               title="Editar Papel"
                              >
                               <FaEdit /> {/* Ícone de Lápis */}
                             </button>
                          )}
                           {/* TODO: Adicionar botão Deletar aqui (condicional para Admin, não deletar a si mesmo) */}
                        </td>
                      </tr>
                    ))}
                    {/* Linha exibida se a busca não retornar resultados */}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                          Nenhum usuário encontrado com os filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de Paginação (só aparecem se houver mais de uma página) */}
              {totalPages > 1 && (
                <div className="pagination-controls"> {/* */}
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

      {/* Renderização Condicional dos Modais */}
      {/* Modal de Detalhes */}
      {isDetailsModalOpen && selectedUserId && (
        <UserDetailsModal userId={selectedUserId} onClose={handleCloseDetailsModal} />
      )}

      {/* Modal de Edição de Papel */}
      {isEditRoleModalOpen && editingUser && (
        <EditRoleModal
          user={editingUser} // Passa o objeto User completo
          onClose={handleCloseEditRoleModal} // Passa a função para fechar
          onRoleUpdated={handleRoleUpdated} // Passa a função para recarregar a lista após salvar
        />
      )}
    </div>
  );
};

export default Dashboard;