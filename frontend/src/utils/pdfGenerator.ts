// src/utils/pdfGenerator.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PagamentoDto, UserDto, RelatorioArrecadacaoDto } from '@/types/user';
import { formatDataExibicao, formatValor } from './formatters';
import { RelatorioFilters } from '@/services/userService';

// --- 1. IMPORTE O TOAST ---
import toast from 'react-hot-toast';

/**
 * Gera um PDF com o histórico de doações de UM usuário.
 */
export const generateDonationPDF = (user: UserDto, donations: PagamentoDto[]) => {
  if (!user || !donations) {
    // --- 2. SUBSTITUA O 'alert' ---
    toast.error("Não foi possível gerar o PDF: dados do usuário ou doações ausentes.");
    return;
  }
  
  if (donations.length === 0) {
    toast.error("Este usuário não possui doações aprovadas para gerar um PDF.");
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


/**
 * Gera um PDF de Relatório de Arrecadação (Sumário).
 */
export const generateArrecadacaoPDF = (
  relatorio: RelatorioArrecadacaoDto, 
  filters: RelatorioFilters, 
  filterText: string
) => {
  
  const doc = new jsPDF();
  const dataGeracao = new Date();

  doc.setFontSize(18);
  doc.text(`Relatório de Arrecadação - Mercado Pago`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100); 
  doc.text(`Gerado em: ${formatDataExibicao(dataGeracao.toISOString())}`, 14, 30);

  doc.setFontSize(12);
  doc.setTextColor(0); 
  doc.setFont('helvetica', 'bold'); 
  doc.text(`Período do Relatório: ${filterText}`, 14, 38);

  
  const valorX = 80; 
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal'); 
  doc.text(`Total Arrecadado (Bruto):`, 14, 50);
  doc.setFont('helvetica', 'bold'); 
  doc.text(formatValor(relatorio.totalArrecadado), valorX, 50);

  doc.setFont('helvetica', 'normal'); 
  doc.text(`Total Recebido (Líquido):`, 14, 60);
  doc.setFont('helvetica', 'bold'); 
  doc.text(formatValor(relatorio.totalLiquido), valorX, 60);

  doc.setFont('helvetica', 'normal'); 
  doc.text(`Total de Doações Aprovadas:`, 14, 70);
  doc.setFont('helvetica', 'bold'); 
  doc.text(relatorio.totalDoacoesAprovadas.toString(), valorX, 70);
  
  const safeFilter = filterText.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`relatorio_arrecadacao_${safeFilter}.pdf`);
};