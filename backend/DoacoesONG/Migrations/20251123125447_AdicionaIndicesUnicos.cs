using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoacoesONG.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaIndicesUnicos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Bairro", "Cep", "Cidade", "ComercioEndereco", "DataCadastro", "DataNascimento", "Documento", "Email", "Endereco", "Estado", "Genero", "Nome", "PasswordHash", "PasswordSalt", "Telefone", "TipoPessoa", "TipoUsuario" },
                values: new object[] { 1, null, null, null, null, new DateTime(2025, 11, 18, 2, 0, 13, 519, DateTimeKind.Utc).AddTicks(1898), null, null, "admin@gmail.com", null, null, null, "Admin Principal", new byte[] { 167, 77, 30, 12, 52, 195, 215, 134, 19, 44, 196, 98, 77, 57, 22, 183, 2, 174, 8, 111, 112, 70, 163, 109, 76, 79, 78, 93, 122, 41, 205, 196, 231, 12, 4, 32, 137, 123, 28, 58, 187, 253, 79, 228, 117, 245, 50, 94, 26, 249, 60, 126, 24, 153, 181, 146, 42, 82, 95, 241, 15, 173, 113, 28 }, new byte[] { 117, 109, 95, 115, 97, 108, 116, 95, 102, 105, 120, 111, 95, 112, 97, 114, 97, 95, 111, 95, 97, 100, 109, 105, 110 }, null, null, 2 });
        }
    }
}
