using System.ComponentModel.DataAnnotations; // Adicione este using
using Domain.Entities;

namespace API.DTOs.UserRep
{
    /// <summary>
    /// DTO (Data Transfer Object) utilizado para atualizar os dados
    /// de um usuário existente por um administrador.
    /// </summary>
    public class UserUpdateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres.")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "O formato do e-mail é inválido.")]
        public string Email { get; set; }
        [EnumDataType(typeof(TipoPessoa), ErrorMessage = "Tipo de pessoa inválido.")]
        public TipoPessoa? TipoPessoa { get; set; } // Nullable

        public string? Documento { get; set; }
    }
}