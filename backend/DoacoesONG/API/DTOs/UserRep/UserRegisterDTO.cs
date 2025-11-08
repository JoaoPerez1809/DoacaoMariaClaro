using System.ComponentModel.DataAnnotations; // Adicione este using
using Domain.Entities;

namespace API.DTOs.UserRep
{
    public class UserRegisterDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "O nome deve ter entre 3 e 100 caracteres.")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "O formato do e-mail é inválido.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "A senha é obrigatória.")]
        [StringLength(50, MinimumLength = 8, ErrorMessage = "A senha deve ter entre 8 e 50 caracteres.")]
        public string Senha { get; set; }
        [Required(ErrorMessage = "O tipo de pessoa (Fisica ou Juridica) é obrigatório.")]
        [EnumDataType(typeof(TipoPessoa), ErrorMessage = "Tipo de pessoa inválido.")]
        public TipoPessoa TipoPessoa { get; set; }

        [Required(ErrorMessage = "O CPF/CNPJ é obrigatório.")]
        public string Documento { get; set; }
    }
}