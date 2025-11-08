using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data; // Namespace do seu DataContext
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Infrastructure.Repositories // Ajuste para o seu namespace
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context; // Renomeado para AppDbContext como no seu código

        public AuthRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> Register(User user, string password)
        {
            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> Login(string email, string password)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            if (user == null)
            {
                // LOG DE DEBUG 1: Usuário não encontrado
                System.Console.WriteLine($"[DEBUG] Login falhou: Usuário com email '{email}' não encontrado no banco de dados.");
                return null;
            }

            // LOG DE DEBUG 2: Verifica a senha
            if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
            {
                System.Console.WriteLine($"[DEBUG] Login falhou: A senha fornecida para o usuário '{email}' está incorreta.");
                return null;
            }

            // LOG DE DEBUG 3: Sucesso
            System.Console.WriteLine($"[DEBUG] Login bem-sucedido para o usuário '{email}'.");
            return user;
        }

        public async Task<bool> UserExists(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<User?> GetUserById(int id)
        {
            // FindAsync já retorna nulo se não encontrar, então o '?' é correto.
            return await _context.Users.FindAsync(id);
        }

        public async Task<bool> UpdateUser(User user)
        {
            _context.Users.Update(user);
            return await _context.SaveChangesAsync() > 0;
        }

        // --- MÉTODOS FALTANTES ADICIONADOS ABAIXO ---

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<bool> DeleteUser(User user)
        {
            _context.Users.Remove(user);
            return await _context.SaveChangesAsync() > 0;
        }

        // --- MÉTODOS PRIVADOS DE CRIPTOGRAFIA ---

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(passwordHash);
            }
        }
    }
}
