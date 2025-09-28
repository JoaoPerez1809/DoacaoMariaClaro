using Domain.Entities;
using API.DTOs.UserRep;
using Domain.Interfaces; // Onde IAuthRepository está
using Application.Interfaces; // Onde IAuthService está
using System.Threading.Tasks;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepo;

        public AuthService(IAuthRepository authRepo)
        {
            _authRepo = authRepo;
        }

        public async Task<UserDto> RegisterAsync(UserRegisterDto userDto)
        {
            if (await _authRepo.UserExists(userDto.Email))
            {
                throw new System.Exception("O email informado já está cadastrado.");
            }

            var newUser = new User
            {
                Nome = userDto.Nome,
                Email = userDto.Email,
                TipoUsuario = TipoUsuario.Doador
            };

            var createdUser = await _authRepo.Register(newUser, userDto.Senha);

            return new UserDto
            {
                Id = createdUser.Id,
                Nome = createdUser.Nome,
                Email = createdUser.Email,
                TipoUsuario = createdUser.TipoUsuario.ToString()
            };
        }

        public async Task<User> LoginAsync(UserLoginDto userDto)
        {
            var user = await _authRepo.Login(userDto.Email, userDto.Senha);
            return user;
        }
    }
}