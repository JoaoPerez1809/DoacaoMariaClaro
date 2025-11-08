using Domain.Entities;
using System; // Para DateTime

namespace API.DTOs.UserRep
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string TipoUsuario { get; set; }
        public string? TipoPessoa { get; set; }
        public string? Documento { get; set; }
        
        // --- CAMPOS NOVOS ADICIONADOS ---
        public string? Telefone { get; set; }
        public string? Cep { get; set; }
        public string? Endereco { get; set; }
        public string? Bairro { get; set; }
        public string? Cidade { get; set; }
        public string? Estado { get; set; }
        public string? Genero { get; set; }
        public string? ComercioEndereco { get; set; }
        public DateTime? DataNascimento { get; set; }
        public DateTime DataCadastro { get; set; }
    }
}