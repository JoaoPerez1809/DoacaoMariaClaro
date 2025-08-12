using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoacoesONG.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nome = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "BLOB", nullable: false),
                    PasswordSalt = table.Column<byte[]>(type: "BLOB", nullable: false),
                    TipoUsuario = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "Nome", "PasswordHash", "PasswordSalt", "TipoUsuario" },
                values: new object[] { 1, "admin@gmail.com", "Admin Principal", new byte[] { 167, 77, 30, 12, 52, 195, 215, 134, 19, 44, 196, 98, 77, 57, 22, 183, 2, 174, 8, 111, 112, 70, 163, 109, 76, 79, 78, 93, 122, 41, 205, 196, 231, 12, 4, 32, 137, 123, 28, 58, 187, 253, 79, 228, 117, 245, 50, 94, 26, 249, 60, 126, 24, 153, 181, 146, 42, 82, 95, 241, 15, 173, 113, 28 }, new byte[] { 117, 109, 95, 115, 97, 108, 116, 95, 102, 105, 120, 111, 95, 112, 97, 114, 97, 95, 111, 95, 97, 100, 109, 105, 110 }, 2 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
