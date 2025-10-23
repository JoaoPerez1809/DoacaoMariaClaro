using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoacoesONG.Migrations
{
    /// <inheritdoc />
    public partial class AddTipoPessoaDocumentoToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Documento",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoPessoa",
                table: "Users",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Documento", "TipoPessoa" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Documento",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TipoPessoa",
                table: "Users");
        }
    }
}
