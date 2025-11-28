using Domain.Entities;
using API.DTOs.UserRep;
using Domain.Interfaces;
using Application.Interfaces;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System; // ADICIONE ESTE USING PARA DATETIME

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepo;
        // private readonly IEmailService _emailService; // Você vai descomentar isso depois

        // public AuthService(IAuthRepository authRepo, IEmailService emailService)
        public AuthService(IAuthRepository authRepo) // Por enquanto, mantenha assim
        {
            _authRepo = authRepo;
            // _emailService = emailService;
        }

        public async Task<UserDto> RegisterAsync(UserRegisterDto userDto)
        {
            if (await _authRepo.UserExists(userDto.Email))
            {
                throw new System.Exception("O email informado já está cadastrado.");
            }
            
            string cleanedDocumento = Regex.Replace(userDto.Documento ?? "", @"[^\d]", ""); 

            if (!string.IsNullOrEmpty(userDto.Documento))
            {
                cleanedDocumento = Regex.Replace(userDto.Documento, @"[^\d]", ""); 

                if (userDto.TipoPessoa == TipoPessoa.Fisica && cleanedDocumento.Length != 11)
                {
                    throw new System.Exception("CPF inválido. Deve conter 11 dígitos numéricos.");
                }
                else if (userDto.TipoPessoa == TipoPessoa.Juridica && cleanedDocumento.Length != 14)
                {
                    throw new System.Exception("CNPJ inválido. Deve conter 14 dígitos numéricos.");
                }
            }

            var newUser = new User
            {
                Nome = userDto.Nome,
                Email = userDto.Email,
                TipoUsuario = TipoUsuario.Doador,
                TipoPessoa = userDto.TipoPessoa,
                Documento = cleanedDocumento,
                
                // --- CAMPO ADICIONADO ---
                DataCadastro = DateTime.UtcNow // Define a data de cadastro
                // DataNascimento e outros campos ficam nulos por padrão
            };

            var createdUser = await _authRepo.Register(newUser, userDto.Senha);

            // --- Lógica de E-mail (Quando você reativar) ---
            // try { ... await _emailService.SendEmailAsync(...) ... } catch { ... }

            // Retorna o DTO atualizado
            return new UserDto
            {
                Id = createdUser.Id,
                Nome = createdUser.Nome,
                Email = createdUser.Email,
                TipoUsuario = createdUser.TipoUsuario.ToString(),
                TipoPessoa = createdUser.TipoPessoa?.ToString(), 
                Documento = createdUser.Documento,
                DataCadastro = createdUser.DataCadastro, // Retorna a data de cadastro
                // Os outros campos (Telefone, Endereco, DataNascimento, etc)
                // serão nulos, o que está correto.
            };
        }

        public async Task<User> LoginAsync(UserLoginDto userDto)
        {
            var user = await _authRepo.Login(userDto.Email, userDto.Senha);
            return user;
        }
    }
}