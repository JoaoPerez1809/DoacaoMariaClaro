using Domain.Entities;
using System;
using System.ComponentModel.DataAnnotations; // 1. ADICIONE ESTE USING

namespace Domain.Entities
{
    public class Pagamento
    {
        public int Id { get; set; }
        public decimal Valor { get; set; } // Valor bruto (Ex: 100.00)

        [MaxLength(50)] // 2. ADICIONADO
        public string Status { get; set; } // Ex: PENDING, APPROVED, REJECTED
        
        [MaxLength(100)] // 3. ADICIONADO
        public string? MercadoPagoPreferenceId { get; set; }
        
        public long? MercadoPagoPaymentId { get; set; }

        [MaxLength(100)] // 4. ADICIONADO
        public string? ExternalReference { get; set; }

        public DateTime DataCriacao { get; set; }
        public DateTime? DataAtualizacao { get; set; }

        public int? DoadorId { get; set; }
        public User? Doador { get; set; }

        [MaxLength(10)] // 5. ADICIONADO (ex: "CPF", "CNPJ")
        public string? PayerIdentificationType { get; set; }
        
        [MaxLength(20)] // 6. ADICIONADO (para garantir)
        public string? PayerIdentificationNumber { get; set; }

        // --- CAMPOS NOVOS (SOLICITADOS) ---
        
        /// <summary>
        /// Valor líquido recebido pela ONG (descontadas as taxas do Mercado Pago).
        /// </summary>
        public decimal? ValorLiquido { get; set; } // Ex: 95.00

        /// <summary>
        /// Forma de pagamento utilizada. Ex: "pix", "credit_card", "ticket" (boleto).
        /// </summary>
        [MaxLength(50)] // 7. ADICIONADO
        public string? TipoPagamento { get; set; }
    }
}