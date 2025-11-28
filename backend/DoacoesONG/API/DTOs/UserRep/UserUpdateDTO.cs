using System.ComponentModel.DataAnnotations;
using Domain.Entities;
using System; // Para DateTime

namespace API.DTOs.UserRep
{
    public class UserUpdateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres.")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "O formato do e-mail é inválido.")]
        [MaxLength(100)] // Consistente com a Entidade
        public string Email { get; set; }
        
        [EnumDataType(typeof(TipoPessoa), ErrorMessage = "Tipo de pessoa inválido.")]
        public TipoPessoa? TipoPessoa { get; set; } // Nullable
        
        [MaxLength(14)] // Consistente com a Entidade
        public string? Documento { get; set; }

        // --- CAMPOS NOVOS ADICIONADOS ---
        // Todos são opcionais (nullable)
        
        [MaxLength(15)]
        public string? Telefone { get; set; }
        
        [MaxLength(9)]
        public string? Cep { get; set; }
        
        [MaxLength(200)]
        public string? Endereco { get; set; }
        
        [MaxLength(100)]
        public string? Bairro { get; set; }
        
        [MaxLength(100)]
        public string? Cidade { get; set; }
        
        [MaxLength(2)]
        public string? Estado { get; set; }
        
        [MaxLength(50)]
        public string? Genero { get; set; }
        
        [MaxLength(200)]
        public string? ComercioEndereco { get; set; }

        public string? DataNascimento { get; set; }
    }
}