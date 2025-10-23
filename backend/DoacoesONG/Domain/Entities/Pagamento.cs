using Domain.Entities;

namespace Domain.Entities
{
    public class Pagamento
    {
        public int Id { get; set; } // Chave primária
        public decimal Valor { get; set; }
        public string Status { get; set; } // Ex: PENDING, APPROVED, REJECTED
        
        // --- Campos do Mercado Pago ---
        public string? MercadoPagoPreferenceId { get; set; }
        public long? MercadoPagoPaymentId { get; set; }


        public string? ExternalReference { get; set; }

        // --- Timestamps ---
        public DateTime DataCriacao { get; set; }
        public DateTime? DataAtualizacao { get; set; }

        // --- Relacionamento com o Doador (opcional) ---
        public int? DoadorId { get; set; }
        public User? Doador { get; set; }

        // --- NOVOS CAMPOS ADICIONADOS ---
        public string? PayerIdentificationType { get; set; } // Tipo de documento (CPF, CNPJ)
        public string? PayerIdentificationNumber { get; set; } // Número do documento (apenas números)
    }
}