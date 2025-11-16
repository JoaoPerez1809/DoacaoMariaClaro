"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
// Ícones
import { FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt, FaDownload } from "react-icons/fa";
// CSS
import "./Relatorios.css"; // (Vamos criar este)
import "./Dashboard.css"; // (Reutiliza a sidebar)
// Serviços da API e Tipos
import { getRelatorioArrecadacaoRequest, getAnosDisponiveisRequest, RelatorioFilters } from "@/services/userService";
import type { RelatorioArrecadacaoDto } from "@/types/user";
import { generateArrecadacaoPDF } from "@/utils/pdfGenerator";
import { formatValor } from "@/utils/formatters";
// Contexto de Autenticação
import { useAuth } from "@/contexts/AuthContext";

// --- Helpers para os Dropdowns ---
// (Esta função foi REMOVIDA, pois agora buscamos da API)
// const getAnosOptions = () => { ... }; 

// Constantes para os filtros
const meses = [
  { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" }, { value: 4, label: "Abril" },
  { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
  { value: 7, label: "Julho" }, { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" }, { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" }
];
const trimestres = [
  { value: 1, label: "1º Trimestre (Jan-Mar)" },
  { value: 2, label: "2º Trimestre (Abr-Jun)" },
  { value: 3, label: "3º Trimestre (Jul-Set)" },
  { value: 4, label: "4º Trimestre (Out-Dez)" }
];
const semestres = [
  { value: 1, label: "1º Semestre (Jan-Jun)" },
  { value: 2, label: "2º Semestre (Jul-Dez)" }
];
// --- Fim dos Helpers ---

const Relatorios: React.FC = () => {
  const { signOut } = useAuth();
  
  // --- Estados dos Filtros ---
  const [tipoRelatorio, setTipoRelatorio] = useState<'mensal' | 'trimestral' | 'semestral'>('mensal');
  
  // Estados para o Ano (agora carregados da API)
  const [anosOptions, setAnosOptions] = useState<number[]>([]);
  const [ano, setAno] = useState<number>(new Date().getFullYear()); // Inicia com o ano atual
  const [anosLoading, setAnosLoading] = useState(true); // Estado de loading para os anos
  
  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mês atual
  const [trimestre, setTrimestre] = useState(1);
  const [semestre, setSemestre] = useState(1);

  // --- Estados de UI ---
  const [relatorio, setRelatorio] = useState<RelatorioArrecadacaoDto | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading para o *relatório*
  const [error, setError] = useState<string | null>(null);
  
  // --- UseEffect para buscar os anos disponíveis ---
  useEffect(() => {
    const fetchAnos = async () => {
        try {
            setAnosLoading(true);
            const anosData = await getAnosDisponiveisRequest();
            if (anosData.length > 0) {
                setAnosOptions(anosData);
                setAno(anosData[0]); // Define o ano mais recente (já vem ordenado)
            } else {
                // Se não houver doações, usa o ano atual como fallback
                const anoAtual = new Date().getFullYear();
                setAnosOptions([anoAtual]);
                setAno(anoAtual);
            }
        } catch (e) {
            console.error("Erro ao buscar anos disponíveis:", e);
            setError("Não foi possível carregar os anos para o filtro.");
            // Fallback em caso de erro
            const anoAtual = new Date().getFullYear();
            setAnosOptions([anoAtual]);
            setAno(anoAtual);
        } finally {
            setAnosLoading(false);
        }
    };
    fetchAnos();
  }, []); // Roda apenas uma vez quando o componente é montado

  // Função para buscar e gerar o relatório
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setRelatorio(null); // Limpa o relatório anterior
    
    let periodo = 1;
    let filterText = ""; // Texto para o PDF

    // Correção do Bug de 'undefined' (adiciona fallback '??')
    if (tipoRelatorio === 'mensal') {
      periodo = mes;
      filterText = `${meses.find(m => m.value === mes)?.label ?? 'Mês'} de ${ano}`;
    } else if (tipoRelatorio === 'trimestral') {
      periodo = trimestre;
      filterText = `${trimestres.find(t => t.value === trimestre)?.label ?? 'Trimestre'} de ${ano}`;
    } else {
      periodo = semestre;
      filterText = `${semestres.find(s => s.value === semestre)?.label ?? 'Semestre'} de ${ano}`;
    }

    const filters: RelatorioFilters = {
      ano: ano,
      tipo: tipoRelatorio,
      periodo: periodo
    };

    try {
      // 1. Busca os dados do sumário da API
      const relatorioData = await getRelatorioArrecadacaoRequest(filters);
      
      // 2. Verifica se há doações
      if (relatorioData.totalDoacoesAprovadas === 0) {
        setError(`Nenhuma doação (aprovada) encontrada para ${filterText}.`);
        setRelatorio(null);
      } else {
        // 3. Armazena os dados no estado para exibir na tela
        setRelatorio(relatorioData);
        // 4. Gera o PDF
        generateArrecadacaoPDF(relatorioData, filters, filterText);
      }
    } catch (err) {
      console.error("Erro ao gerar relatório:", err);
      setError("Não foi possível gerar o relatório. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Área Principal abaixo do Header */}
        <main className="dashboard-main">
          {/* Título da Seção */}
          <h2 className="section-title">Relatórios de Arrecadação</h2>
          
          <div className="relatorio-container">
            <h3>Gerar Relatório de Arrecadação (Mercado Pago)</h3>
            <p>
              Selecione o período desejado para gerar um sumário em PDF de todas as doações 
              aprovadas (Valor Bruto vs. Valor Líquido).
            </p>
            
            {/* --- ÁREA DE FILTROS --- */}
            <div className="relatorio-filtros">
              <div className="filtro-item">
                <label htmlFor="tipo">Tipo de Relatório:</label>
                <select id="tipo" value={tipoRelatorio} onChange={(e) => setTipoRelatorio(e.target.value as any)} disabled={anosLoading}>
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                </select>
              </div>

              <div className="filtro-item">
                <label htmlFor="ano">Ano:</label>
                <select id="ano" value={ano} onChange={(e) => setAno(parseInt(e.target.value))} disabled={anosLoading}>
                  {anosLoading ? (
                    <option>Carregando...</option>
                  ) : (
                    anosOptions.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Dropdown de Período (Condicional) */}
              <div className="filtro-item">
                {tipoRelatorio === 'mensal' && (
                  <>
                    <label htmlFor="periodo">Mês:</label>
                    <select id="periodo" value={mes} onChange={(e) => setMes(parseInt(e.target.value))} disabled={anosLoading}>
                      {meses.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </>
                )}
                {tipoRelatorio === 'trimestral' && (
                  <>
                    <label htmlFor="periodo">Trimestre:</label>
                    <select id="periodo" value={trimestre} onChange={(e) => setTrimestre(parseInt(e.target.value))} disabled={anosLoading}>
                      {trimestres.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </>
                )}
                {tipoRelatorio === 'semestral' && (
                  <>
                    <label htmlFor="periodo">Semestre:</label>
                    <select id="periodo" value={semestre} onChange={(e) => setSemestre(parseInt(e.target.value))} disabled={anosLoading}>
                      {semestres.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            <button 
              className="report-button-main"
              onClick={handleGenerateReport}
              disabled={isLoading || anosLoading} // Desabilita se estiver carregando anos OU o relatório
            >
              <FaDownload />
              {isLoading ? 'Gerando...' : 'Gerar e Baixar Relatório PDF'}
            </button>
            
            {/* Área de Feedback (Erros) */}
            {error && (
              <p className="relatorio-feedback error">{error}</p>
            )}
            
            {/* Área de Feedback (Sucesso e Pré-visualização) */}
            {!isLoading && !error && relatorio && (
              <div className="relatorio-feedback success">
                <h4>Relatório Gerado com Sucesso!</h4>
                <p>O seu download deve começar em breve. Caso não comece, clique no botão novamente.</p>
                
                {/* Pré-visualização dos totais na tela */}
                <div className="relatorio-preview">
                  <div className="preview-item">
                    <span>Total Arrecadado (Bruto)</span>
                    <strong>{formatValor(relatorio.totalArrecadado)}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Total Recebido (Líquido)</span>
                    <strong>{formatValor(relatorio.totalLiquido)}</strong>
                  </div>
                  <div className="preview-item">
                    <span>Total de Doações</span>
                    <strong>{relatorio.totalDoacoesAprovadas}</strong>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default Relatorios;