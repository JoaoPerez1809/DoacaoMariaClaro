// src/utils/formatters.ts

/**
 * Formata uma string de data ISO para "dd/mm/aaaa"
 */
export const formatDataExibicao = (dateString: string | null | undefined) => {
  if (!dateString) return 'Não informado';
  try {
    const data = new Date(dateString);
    const dataUtc = new Date(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(dataUtc);
  } catch (e) {
    return 'Data inválida';
  }
};

/**
 * Formata um número para a moeda BRL (R$ xx,xx)
 */
export const formatValor = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

/**
 * Traduz o status do pagamento
 */
export const formatStatus = (status: string) => {
  if (status.toLowerCase() === 'approved') return 'Aprovado';
  if (status.toLowerCase() === 'pending') return 'Pendente';
  if (status.toLowerCase() === 'rejected') return 'Recusado';
  return status;
};

/**
 * Formata uma string de data ISO para "YYYY-MM-DD" (para <input type="date" />)
 */
export const formatDataParaInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const data = new Date(dateString);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toISOString().split('T')[0];
  } catch (e) {
    return "";
  }
};