using Domain.Entities;
using API.DTOs.UserRep;
using Domain.Interfaces;
using Application.Interfaces;
using System.Threading.Tasks;
using System.Text.RegularExpressions; // ADICIONE ESTE USING

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

            // --- LÓGICA DE VALIDAÇÃO E LIMPEZA DO DOCUMENTO ---
            string cleanedDocumento = Regex.Replace(userDto.Documento ?? "", @"[^\d]", ""); // Remove não-dígitos

            if (userDto.TipoPessoa == TipoPessoa.Fisica && cleanedDocumento.Length != 11)
            {
                 throw new System.Exception("CPF inválido. Deve conter 11 dígitos numéricos.");
                 // Adicionar validação de dígito verificador aqui seria ideal
            }
            else if (userDto.TipoPessoa == TipoPessoa.Juridica && cleanedDocumento.Length != 14)
            {
                 throw new System.Exception("CNPJ inválido. Deve conter 14 dígitos numéricos.");
                 // Adicionar validação de dígito verificador aqui seria ideal
            }
            // --- FIM DA VALIDAÇÃO ---

            var newUser = new User
            {
                Nome = userDto.Nome,
                Email = userDto.Email,
                TipoUsuario = TipoUsuario.Doador,
                // --- MAPEAMENTO DOS NOVOS CAMPOS ---
                TipoPessoa = userDto.TipoPessoa,
                Documento = cleanedDocumento
                // --- FIM DO MAPEAMENTO ---
            };

            var createdUser = await _authRepo.Register(newUser, userDto.Senha);

            // --- ATUALIZAÇÃO DO DTO DE RETORNO ---
            return new UserDto
            {
                Id = createdUser.Id,
                Nome = createdUser.Nome,
                Email = createdUser.Email,
                TipoUsuario = createdUser.TipoUsuario.ToString(),
                TipoPessoa = createdUser.TipoPessoa?.ToString(), // Converte Enum para String
                Documento = createdUser.Documento
            };
            // --- FIM DA ATUALIZAÇÃO ---
        }

        // LoginAsync não muda
        public async Task<User> LoginAsync(UserLoginDto userDto)
        {
            var user = await _authRepo.Login(userDto.Email, userDto.Senha);
            // O objeto 'user' retornado já conterá os novos campos da entidade
            return user;
        }
    }
}