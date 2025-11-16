// src/utils/pdfGenerator.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// 1. IMPORTE OS TIPOS
import type { PagamentoDto, UserDto, RelatorioArrecadacaoDto } from '@/types/user';
import { formatDataExibicao, formatValor } from './formatters';
import { RelatorioFilters } from '@/services/userService';

/**
 * Gera um PDF com o histórico de doações de UM usuário.
 * (Para o Modal de Detalhes do Admin)
 */
export const generateDonationPDF = (user: UserDto, donations: PagamentoDto[]) => {
  if (!user || !donations) {
    alert("Não foi possível gerar o PDF: dados ausentes.");
    return;
  }
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Histórico de Doações`, 14, 22);
  doc.setFontSize(12);
  doc.text(`Doador: ${user.nome}`, 14, 30);
  doc.text(`Email: ${user.email}`, 14, 36);
  
  const tableHead = [['Data', 'Valor (BRL)', 'Status']];
  const tableBody = donations.map(doacao => [
    formatDataExibicao(doacao.dataCriacao),
    formatValor(doacao.valor),
    'Aprovado'
  ]);
  
  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 45,
    theme: 'striped',
    headStyles: {
      fillColor: [42, 77, 155]
    }
  });
  
  const safeName = user.nome.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`historico_doacoes_${safeName}.pdf`);
};


// === 2. FUNÇÃO DE RELATÓRIO (SEM TABELA) ===
/**
 * Gera um PDF de Relatório de Arrecadação (Sumário).
 * @param relatorio O objeto RelatorioArrecadacaoDto
 * @param filters Os filtros usados para gerar este relatório
 * @param filterText O texto descritivo (ex: "Trimestre 1 de 2025")
 */
export const generateArrecadacaoPDF = (
  relatorio: RelatorioArrecadacaoDto, 
  filters: RelatorioFilters, 
  filterText: string // O texto descritivo
) => {
  
  const doc = new jsPDF();
  const dataGeracao = new Date();

  // --- Título e Data ---
  doc.setFontSize(18);
  doc.text(`Relatório de Arrecadação - Mercado Pago`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100); // Cor cinza
  doc.text(`Gerado em: ${formatDataExibicao(dataGeracao.toISOString())}`, 14, 30);

  // --- Filtro Aplicado ---
  doc.setFontSize(12);
  doc.setTextColor(0); // Cor preta
  doc.setFont('helvetica', 'bold'); // <--- CORRIGIDO (não usa 'undefined')
  doc.text(`Período do Relatório: ${filterText}`, 14, 38);

  
  // --- Sumário (O corpo principal) ---
  const valorX = 80; // Posição X dos valores
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal'); // <--- CORRIGIDO
  doc.text(`Total Arrecadado (Bruto):`, 14, 50);
  doc.setFont('helvetica', 'bold'); // <--- CORRIGIDO
  doc.text(formatValor(relatorio.totalArrecadado), valorX, 50);

  doc.setFont('helvetica', 'normal'); // <--- CORRIGIDO
  doc.text(`Total Recebido (Líquido):`, 14, 60);
  doc.setFont('helvetica', 'bold'); // <--- CORRIGIDO
  doc.text(formatValor(relatorio.totalLiquido), valorX, 60);

  doc.setFont('helvetica', 'normal'); // <--- CORRIGIDO
  doc.text(`Total de Doações Aprovadas:`, 14, 70);
  doc.setFont('helvetica', 'bold'); // <--- CORRIGIDO
  doc.text(relatorio.totalDoacoesAprovadas.toString(), valorX, 70);
  
  // Salva o ficheiro
  const safeFilter = filterText.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`relatorio_arrecadacao_${safeFilter}.pdf`);
};