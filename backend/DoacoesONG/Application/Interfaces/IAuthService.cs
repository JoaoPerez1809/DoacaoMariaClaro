using API.DTOs.UserRep; // Namespace onde seus DTOs estão
using Domain.Entities; // Namespace onde a entidade User está
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task<UserDto> RegisterAsync(UserRegisterDto userDto);
        Task<User> LoginAsync(UserLoginDto userDto);
    }
}