using System.ComponentModel.DataAnnotations; // Adicione este using

namespace API.DTOs.UserRep
{
    public class UpdateUserRoleDto
    {
        [Required(ErrorMessage = "O novo tipo de usuário é obrigatório.")]
        // Esta validação garante que o valor seja exatamente uma das três opções.
        [RegularExpression("^(Doador|Colaborador|Administrador)$", ErrorMessage = "O tipo de usuário deve ser 'Doador', 'Colaborador' ou 'Administrador'.")]
        public string NovoTipoUsuario { get; set; }
    }
}