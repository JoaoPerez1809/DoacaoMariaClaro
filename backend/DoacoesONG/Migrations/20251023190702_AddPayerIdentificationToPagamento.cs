using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoacoesONG.Migrations
{
    /// <inheritdoc />
    public partial class AddPayerIdentificationToPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PayerIdentificationNumber",
                table: "Pagamentos",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayerIdentificationType",
                table: "Pagamentos",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PayerIdentificationNumber",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "PayerIdentificationType",
                table: "Pagamentos");
        }
    }
}
