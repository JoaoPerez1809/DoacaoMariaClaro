using System.Security.Cryptography;
using System.Text;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminUser(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.CreateScope())
            {
                var context = serviceScope.ServiceProvider.GetService<AppDbContext>();
                var config = serviceScope.ServiceProvider.GetService<IConfiguration>();

                // Aplica as atualizações do banco automaticamente
                await context.Database.MigrateAsync();

                // Verifica se já existe algum admin
                if (!await context.Users.AnyAsync(u => u.TipoUsuario == TipoUsuario.Administrador))
                {
                    var email = config["AdminSettings:Email"];
                    var password = config["AdminSettings:Password"];

                    if (!string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(password))
                    {
                        using var hmac = new HMACSHA512();
                        var admin = new User
                        {
                            Nome = "Administrador Principal",
                            Email = email,
                            TipoUsuario = TipoUsuario.Administrador,
                            TipoPessoa = TipoPessoa.Fisica,
                            Documento = "00000000000",
                            DataCadastro = DateTime.UtcNow,
                            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                            PasswordSalt = hmac.Key
                        };

                        context.Users.Add(admin);
                        await context.SaveChangesAsync();
                        Console.WriteLine("Admin criado com sucesso via Seeder.");
                    }
                }
            }
        }
    }
}