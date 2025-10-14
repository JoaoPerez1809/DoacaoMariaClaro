using API.DTOs.UserRep; // Namespace onde seus DTOs estão
using Domain.Entities; // Namespace onde a entidade User e o enum TipoUsuario estão
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> GetUserByIdAsync(int id);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto> UpdateUserAsync(int id, UserUpdateDto userDto);
        Task<bool> DeleteUserAsync(int id);
        Task<bool> UpdateUserRoleAsync(int userId, TipoUsuario novoTipo);
    }
}