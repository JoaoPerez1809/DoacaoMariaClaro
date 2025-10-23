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
        public string Nome { get; set; }
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public TipoUsuario TipoUsuario { get; set; } // "Doador" ou "Colaborador" ou "Administrador"
        public TipoPessoa? TipoPessoa { get; set; } // Indica se é Física ou Jurídica
        public string? Documento { get; set; } // Armazena CPF ou CNPJ (só números)

    }
}