using Domain.Entities;
using API.DTOs.UserRep;
using Application.Interfaces;
using Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthRepository _authRepo;

        public UserService(IAuthRepository authRepo)
        {
            _authRepo = authRepo;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                TipoUsuario = user.TipoUsuario.ToString(),
            };
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _authRepo.GetAllAsync();
            return users.Select(user => new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                TipoUsuario = user.TipoUsuario.ToString(),
            }).ToList();
        }

        public async Task<UserDto?> UpdateUserAsync(int id, UserUpdateDto userDto)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return null;

            user.Nome = userDto.Nome;
            user.Email = userDto.Email;

            await _authRepo.UpdateUser(user);
            return await GetUserByIdAsync(id);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return false;
            
            return await _authRepo.DeleteUser(user);
        }

        public async Task<bool> UpdateUserRoleAsync(int userId, TipoUsuario novoTipo)
        {
            var user = await _authRepo.GetUserById(userId);
            if (user == null) return false;

            user.TipoUsuario = novoTipo;
            return await _authRepo.UpdateUser(user);
        }
    }
}