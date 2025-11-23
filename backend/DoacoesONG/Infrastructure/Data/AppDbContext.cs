using System.Security.Cryptography;
using System.Text;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Documento)
                .IsUnique();
        }
    }
}


// Versão com Email CPF CNPJ Unicos

// using System.Security.Cryptography;
// using System.Text;
// using Domain.Entities;
// using Microsoft.EntityFrameworkCore;
// namespace Infrastructure.Data
// {
//     public class AppDbContext : DbContext
//     {
//         public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

//         public DbSet<User> Users { get; set; }
//         public DbSet<Pagamento> Pagamentos { get; set; }

//         protected override void OnModelCreating(ModelBuilder modelBuilder)
//         {
//             // === ADICIONADO: ÍNDICES ÚNICOS ===
            
//             // Garante que o Email seja único em toda a tabela
//             modelBuilder.Entity<User>()
//                 .HasIndex(u => u.Email)
//                 .IsUnique();

//             // Garante que o Documento (CPF/CNPJ) seja único.
//             // O SQLite (dev) e o Postgres (prod) permitem múltiplos valores NULOS
//             // neste tipo de índice, o que é o comportamento correto.
//             modelBuilder.Entity<User>()
//                 .HasIndex(u => u.Documento)
//                 .IsUnique();
                
//             // === FIM DAS ADIÇÕES ===
                
//             byte[] passwordSalt = Encoding.UTF8.GetBytes("um_salt_fixo_para_o_admin");

//             // 2. Usamos o salt fixo para criar o hash da senha "senha1234567890"
//             using (var hmac = new HMACSHA512(passwordSalt))
//             {
//                 var passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("senha1234567890"));

//                 modelBuilder.Entity<User>().HasData(
//                     new User
//                     {
//                         Id = 1,
//                         Nome = "Admin Principal",
//                         Email = "admin@gmail.com",
//                         PasswordHash = passwordHash,
//                         PasswordSalt = passwordSalt,
//                         TipoUsuario = TipoUsuario.Administrador,
//                         // Adiciona a DataCadastro ao Admin seed
//                         DataCadastro = DateTime.UtcNow 
//                     }
//                 );
//             }
//         }
//     }
// }