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

// === NOVAS FUNÇÕES DE MÁSCARA ADICIONADAS ABAIXO ===

/**
 * Aplica máscara de CPF (###.###.###-##)
 */
export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o terceiro dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o sexto dígito
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca hífen antes dos dois últimos dígitos
};

/**
 * Aplica máscara de CNPJ (##.###.###/####-##)
 */
export const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{2})(\d)/, '$1.$2') // Coloca ponto após o segundo dígito
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Coloca ponto após o quinto dígito
    .replace(/\.(\d{3})(\d)/, '.$1/$2') // Coloca barra após o oitavo dígito
    .replace(/(\d{4})(\d)/, '$1-$2'); // Coloca hífen antes dos dois últimos dígitos
};

/**
 * Aplica máscara de Telefone (XX) XXXXX-XXXX
 */
export const maskTelefone = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{2})(\d)/g, '($1) $2') // Coloca parênteses em volta dos dois primeiros dígitos
    .replace(/(\d{5})(\d)/, '$1-$2'); // Coloca hífen após o quinto dígito (para celular)
};

/**
 * Aplica máscara de CEP (XXXXX-XXX)
 */
export const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{5})(\d)/, '$1-$2'); // Coloca hífen após o quinto dígito
};