"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
// --- 1. IMPORTE O NOVO ÍCONE ---
import { 
  FaThLarge, FaUsers, FaFileAlt, FaUser, FaSignOutAlt, 
  FaDownload, FaHandHoldingHeart 
} from "react-icons/fa";
import "./Relatorios.css"; 
import "./Dashboard.css"; 
import { getRelatorioArrecadacaoRequest, getAnosDisponiveisRequest, RelatorioFilters } from "@/services/userService";
import type { RelatorioArrecadacaoDto } from "@/types/user";
import { generateArrecadacaoPDF } from "@/utils/pdfGenerator";
import { formatValor } from "@/utils/formatters";
import { useAuth } from "@/contexts/AuthContext";
import { ActionBar } from '@/components/layout/ActionBar';

// --- (Helpers para os Dropdowns: meses, trimestres, semestres) ---
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
  
  // ... (Estados existentes: tipoRelatorio, ano, mes, etc.) ...
  const [tipoRelatorio, setTipoRelatorio] = useState<'mensal' | 'trimestral' | 'semestral'>('mensal');
  const [anosOptions, setAnosOptions] = useState<number[]>([]);
  const [ano, setAno] = useState<number>(new Date().getFullYear()); 
  const [anosLoading, setAnosLoading] = useState(true); 
  const [mes, setMes] = useState(new Date().getMonth() + 1); 
  const [trimestre, setTrimestre] = useState(1);
  const [semestre, setSemestre] = useState(1);
  const [relatorio, setRelatorio] = useState<RelatorioArrecadacaoDto | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  
  // ... (useEffect fetchAnos existente) ...
  useEffect(() => {
    const fetchAnos = async () => {
        try {
            setAnosLoading(true);
            const anosData = await getAnosDisponiveisRequest();
            if (anosData.length > 0) {
                setAnosOptions(anosData);
                setAno(anosData[0]); 
            } else {
                const anoAtual = new Date().getFullYear();
                setAnosOptions([anoAtual]);
                setAno(anoAtual);
            }
        } catch (e) {
            console.error("Erro ao buscar anos disponíveis:", e);
            setError("Não foi possível carregar os anos para o filtro.");
            const anoAtual = new Date().getFullYear();
            setAnosOptions([anoAtual]);
            setAno(anoAtual);
        } finally {
            setAnosLoading(false);
        }
    };
    fetchAnos();
  }, []); 

  // ... (Função handleGenerateReport existente) ...
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    setRelatorio(null); 
    
    let periodo = 1;
    let filterText = ""; 

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
      const relatorioData = await getRelatorioArrecadacaoRequest(filters);
      
      if (relatorioData.totalDoacoesAprovadas === 0) {
        setError(`Nenhuma doação (aprovada) encontrada para ${filterText}.`);
        setRelatorio(null);
      } else {
        setRelatorio(relatorioData);
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
      {/* --- 2. SIDEBAR ATUALIZADA --- */}
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
           {/* NOVO LINK PARA DOAÇÕES */}
           <li>
             <Link href="/admin/doacoes" title="Doações Recebidas">
               <FaHandHoldingHeart />
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
        <header className="dashboard-header">Dashboard</header>
        <ActionBar />
        <main className="dashboard-main">
          <h2 className="section-title">Relatórios de Arrecadação</h2>
          
          <div className="relatorio-container">
            <h3>Gerar Relatório de Arrecadação (Mercado Pago)</h3>
            <p>
              Selecione o período desejado para gerar um sumário em PDF de todas as doações 
              aprovadas (Valor Bruto vs. Valor Líquido).
            </p>
            
            {/* ... (Filtros existentes) ... */}
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

            {/* ... (Botão e Feedback existentes) ... */}
            <button 
              className="report-button-main"
              onClick={handleGenerateReport}
              disabled={isLoading || anosLoading}
            >
              <FaDownload />
              {isLoading ? 'Gerando...' : 'Gerar e Baixar Relatório PDF'}
            </button>
            {error && (
              <p className="relatorio-feedback error">{error}</p>
            )}
            {!isLoading && !error && relatorio && (
              <div className="relatorio-feedback success">
                <h4>Relatório Gerado com Sucesso!</h4>
                <p>O seu download deve começar em breve. Caso não comece, clique no botão novamente.</p>
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