/**
 * Valida um CPF brasileiro.
 * @param cpf A string do CPF (pode conter ou não máscara).
 * @returns true se o CPF for válido, false caso contrário.
 */
export function isValidCPF(cpf: string | null | undefined): boolean {
  // Se for nulo, indefinido ou vazio, considera inválido (ou você pode ajustar a lógica se vazio for permitido)
  if (!cpf) {
    return false;
  }

  const cpfLimpo = cpf.replace(/[^\d]/g, ''); // Remove caracteres não numéricos

  // Verifica se tem 11 dígitos ou se são todos repetidos
  if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  let sum = 0;
  let remainder;

  // Calcula o primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpfLimpo.substring(i - 1, i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpfLimpo.substring(9, 10), 10)) {
    return false;
  }

  sum = 0;
  // Calcula o segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpfLimpo.substring(i - 1, i), 10) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpfLimpo.substring(10, 11), 10)) {
    return false;
  }

  // Se passou por todas as verificações, o CPF é válido
  return true;
}

// Opcional: Você pode adicionar uma função de validação de CNPJ aqui também, se precisar.
export function isValidCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) {
      return false;
  }

  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

  if (cnpjLimpo.length !== 14 || /^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
  }

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
      if (pos < 2) {
          pos = 9;
      }
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) {
      return false;
  }

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
      if (pos < 2) {
          pos = 9;
      }
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1), 10)) {
      return false;
  }

  return true;
}