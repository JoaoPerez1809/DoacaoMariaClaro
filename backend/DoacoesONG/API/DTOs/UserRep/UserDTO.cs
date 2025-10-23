using Domain.Entities;
namespace API.DTOs.UserRep
{

    public class UserDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string TipoUsuario { get; set; }

        public string? TipoPessoa { get; set; } // Retornará "Fisica" ou "Juridica"
        public string? Documento { get; set; }
    }
}