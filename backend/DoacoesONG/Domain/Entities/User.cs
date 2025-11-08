using System;
using System.ComponentModel.DataAnnotations; // 1. ADICIONE ESTE USING

namespace Domain.Entities
{
    public enum TipoPessoa
    {
        Fisica,
        Juridica
    }
    public enum TipoUsuario
    {
        Doador,
        Colaborador,
        Administrador
    }

    public class User
    {
        public int Id { get; set; }

        [MaxLength(100)] // 2. ADICIONADO
        public string Nome { get; set; }

        [MaxLength(100)] // 3. ADICIONADO
        public string Email { get; set; }
        
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public TipoUsuario TipoUsuario { get; set; } 
        public TipoPessoa? TipoPessoa { get; set; }

        [MaxLength(14)] // 4. ADICIONADO (14 para CNPJ)
        public string? Documento { get; set; } 

        // --- CAMPOS NOVOS ADICIONADOS ---
        [MaxLength(15)]
        public string? Telefone { get; set; }
        
        [MaxLength(9)] // Ex: 12345-678
        public string? Cep { get; set; }
        
        [MaxLength(200)]
        public string? Endereco { get; set; } // Rua, Número, Complemento
        
        [MaxLength(100)]
        public string? Bairro { get; set; }
        
        [MaxLength(100)]
        public string? Cidade { get; set; }
        
        [MaxLength(2)] // Ex: SP, RJ
        public string? Estado { get; set; }
        
        [MaxLength(50)]
        public string? Genero { get; set; }
        
        [MaxLength(200)]
        public string? ComercioEndereco { get; set; } // Endereço comercial

        public DateTime? DataNascimento { get; set; } // SEU NOVO CAMPO (nullable)

        public DateTime DataCadastro { get; set; } // Data que o usuário se registrou
    }
}