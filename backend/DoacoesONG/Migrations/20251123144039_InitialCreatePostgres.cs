using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DoacoesONG.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreatePostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "bytea", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "bytea", nullable: false),
                    TipoUsuario = table.Column<int>(type: "integer", nullable: false),
                    TipoPessoa = table.Column<int>(type: "integer", nullable: true),
                    Documento = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: true),
                    Telefone = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    Cep = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: true),
                    Endereco = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Estado = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                    Genero = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ComercioEndereco = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DataNascimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pagamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MercadoPagoPreferenceId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MercadoPagoPaymentId = table.Column<long>(type: "bigint", nullable: true),
                    ExternalReference = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DoadorId = table.Column<int>(type: "integer", nullable: true),
                    PayerIdentificationType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    PayerIdentificationNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ValorLiquido = table.Column<decimal>(type: "numeric", nullable: true),
                    TipoPagamento = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pagamentos_Users_DoadorId",
                        column: x => x.DoadorId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pagamentos_DoadorId",
                table: "Pagamentos",
                column: "DoadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Documento",
                table: "Users",
                column: "Documento",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pagamentos");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
