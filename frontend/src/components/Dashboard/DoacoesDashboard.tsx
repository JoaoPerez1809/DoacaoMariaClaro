"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
// Ícones
import { 
  FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt, 
  FaChevronLeft, FaChevronRight, FaHandHoldingHeart 
} from "react-icons/fa";
// CSS
import "./Dashboard.css"; 
import "./DoacoesDashboard.css"; // Continua a usar este CSS
// Serviços e Tipos
import { getListaDoacoesRequest } from "@/services/userService";
import type { DoacaoDetalhadaDto } from "@/types/user";
import { formatDataExibicao, formatValor } from "@/utils/formatters"; // Removido formatStatus
// Contexto
import { useAuth } from "@/contexts/AuthContext";
import { ActionBar } from '@/components/layout/ActionBar';

const PAGE_SIZE = 10; 

const DoacoesDashboard: React.FC = () => {
  const { signOut } = useAuth();
  
  // Estados para a lista de doações
  const [doacoes, setDoacoes] = useState<DoacaoDetalhadaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para controle da paginação
  const [currentPage, setCurrentPage] = useState(1);
  
  const [totalDoacoes, setTotalDoacoes] = useState(0);
  const [totalBruto, setTotalBruto] = useState(0);
  const [totalLiquido, setTotalLiquido] = useState(0);

  const totalPages = Math.ceil(totalDoacoes / PAGE_SIZE);

  // Função para buscar as doações da API
  const fetchDoacoes = useCallback(async (page: number) => {
    try {
      setLoading(true); 
      setError(null); 
      
      const data = await getListaDoacoesRequest(page, PAGE_SIZE);
      
      setDoacoes(data.items); 
      setTotalDoacoes(data.totalCount);
      setTotalBruto(data.totalArrecadadoBruto);
      setTotalLiquido(data.totalArrecadadoLiquido);
      
    } catch (err) {
      console.error("Erro ao buscar doações:", err);
      setError("Não foi possível carregar as doações. Tente recarregar a página.");
    } finally {
      setLoading(false); 
    }
  }, []); 

  // useEffect principal para buscar dados
  useEffect(() => {
    fetchDoacoes(currentPage);
  }, [currentPage, fetchDoacoes]); 

  // Handlers da Paginação
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1)); 
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)); 

  // --- Renderização do Componente ---
  return (
    <div className="dashboard-container">
      {/* Sidebar (Menu Lateral Amarelo) */}
      <aside className="sidebar">
         <ul>
           <li>
             <Link href="/admin/dashboard" title="Visão Geral (Não implementado)">
               <FaThLarge />
             </Link>
           </li>
           <li>
             <Link href="/admin/dashboard" title="Usuários">
               <FaUsers />
             </Link>
           </li>
           {/* MARCA ESTA PÁGINA COMO ATIVA */}
           <li className="active">
             <Link href="/admin/doacoes" title="Doações Recebidas">
               <FaHandHoldingHeart />
             </Link>
           </li>
           <li>
             <Link href="/admin/relatorios" title="Relatórios de Arrecadação">
               <FaFileAlt />
             </Link>
           </li>
           <li>
             <Link href="/doador/perfil" title="Meu Perfil">
              <FaUser />
             </Link>
           </li> 
           <li onClick={signOut} title="Sair"><FaSignOutAlt /></li>
         </ul>
      </aside>

      {/* Conteúdo Principal (à direita da sidebar) */}
      <div className="dashboard-content">
        {/* Header (Barra Azul no Topo) */}
        <header className="dashboard-header">Dashboard</header>
        
        <ActionBar />

        {/* Área Principal abaixo do Header */}
        <main className="dashboard-main">
          {/* Título da Seção */}
          <h2 className="section-title">Doações Recebidas (Aprovadas)</h2>
          
          {/* Cards Informativos */}
          <div className="info-card-container">
            <div className="info-card">
              <h3 className="info-card-title">Total de Doações</h3>
              <p className="info-card-value">{loading ? '...' : totalDoacoes}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Valor Arrecadado (Bruto)</h3>
              <p className="info-card-value">{loading ? '...' : formatValor(totalBruto)}</p>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Valor Recebido (Líquido)</h3>
              <p className="info-card-value">{loading ? '...' : formatValor(totalLiquido)}</p>
            </div>
          </div>

          {/* Exibição Condicional: Carregando / Erro / Tabela */}
          {loading && <p style={{ textAlign: 'center', padding: '30px' }}>Carregando doações...</p>}
          {error && <p style={{ color: 'red', textAlign: 'center', padding: '30px' }}>{error}</p>}

          {!loading && !error && ( 
            <>
              {/* === TABELA SUBSTITUÍDA POR LISTA DE CARDS === */}
              <div className="doacao-card-list">
                {doacoes.map((doacao) => (
                  <div key={doacao.pagamentoId} className="doacao-card">
                    {/* Coluna 1: Info do Doador */}
                    <div className="doacao-card-doador">
                      <span className="doacao-card-nome">{doacao.doadorNome}</span>
                      <span className="doacao-card-email">{doacao.doadorEmail}</span>
                    </div>
                    
                    {/* Coluna 2: Info dos Valores */}
                    <div className="doacao-card-valores">
                      <span className="doacao-card-valor-bruto">{formatValor(doacao.valor)}</span>
                      <span className="doacao-card-valor-liquido">
                        Líquido: {formatValor(doacao.valorLiquido || 0)}
                      </span>
                    </div>
                    
                    {/* Coluna 3: Data */}
                    <div className="doacao-card-data">
                      <span>{formatDataExibicao(doacao.dataCriacao)}</span>
                    </div>
                  </div>
                ))}
                
                {doacoes.length === 0 && (
                  // Reutiliza o estilo de "nenhum usuário encontrado"
                  <p className="no-users-found" style={{gridColumn: '1 / -1'}}>
                    Nenhuma doação aprovada encontrada.
                  </p>
                )}
              </div>
              {/* === FIM DA LISTA DE CARDS === */}


              {/* Controles de Paginação (Sem alteração) */}
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
    </div>
  );
};

export default DoacoesDashboard;