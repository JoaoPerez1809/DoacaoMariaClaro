using Domain.Entities;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IAuthRepository
    {
        Task<User> Register(User user, string password);
        Task<User> Login(string email, string password);
        Task<bool> UserExists(string email);
        Task<User?> GetUserById(int id); // Retorna nulo se não encontrar
        Task<IEnumerable<User>> GetAllAsync();
        Task<bool> UpdateUser(User user);
        Task<bool> DeleteUser(User user);
    }
}