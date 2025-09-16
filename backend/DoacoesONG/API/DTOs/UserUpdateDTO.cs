namespace API.DTOs
{
    /// <summary>
    /// DTO (Data Transfer Object) utilizado para atualizar os dados
    /// de um usuário existente por um administrador.
    /// </summary>
    public class UserUpdateDto
    {

        public string Nome { get; set; }

        public string Email { get; set; }

    }
}