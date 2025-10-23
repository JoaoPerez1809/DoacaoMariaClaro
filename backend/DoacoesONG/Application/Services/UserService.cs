using Domain.Entities;
using API.DTOs.UserRep;
using Application.Interfaces;
using Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions; // ADICIONE ESTE USING

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthRepository _authRepo; // Note: Usando IAuthRepository aqui

        public UserService(IAuthRepository authRepo) // Ajuste a injeção se necessário
        {
            _authRepo = authRepo;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return null;

            // --- ATUALIZAÇÃO DO MAPEAMENTO ---
            return new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                TipoUsuario = user.TipoUsuario.ToString(),
                TipoPessoa = user.TipoPessoa?.ToString(),
                Documento = user.Documento
            };
            // --- FIM DA ATUALIZAÇÃO ---
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _authRepo.GetAllAsync();
            // --- ATUALIZAÇÃO DO MAPEAMENTO ---
            return users.Select(user => new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                TipoUsuario = user.TipoUsuario.ToString(),
                TipoPessoa = user.TipoPessoa?.ToString(),
                Documento = user.Documento
            }).ToList();
            // --- FIM DA ATUALIZAÇÃO ---
        }

        public async Task<UserDto?> UpdateUserAsync(int id, UserUpdateDto userDto)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return null;

            user.Nome = userDto.Nome;
            user.Email = userDto.Email;

            // --- LÓGICA PARA ATUALIZAR TIPO E DOCUMENTO (SE FORNECIDOS) ---
            bool documentoAlterado = false;
            if (userDto.TipoPessoa.HasValue)
            {
                user.TipoPessoa = userDto.TipoPessoa.Value;
                documentoAlterado = true; // Se mudou o tipo, revalidar/limpar documento é bom
            }

            if (!string.IsNullOrWhiteSpace(userDto.Documento))
            {
                user.Documento = Regex.Replace(userDto.Documento, @"[^\d]", ""); // Limpa
                documentoAlterado = true;
            }
            else if (userDto.Documento == "") // Permite limpar o documento
            {
                user.Documento = null;
                documentoAlterado = true;
            }

            // Revalida se o documento foi alterado ou se o tipo foi alterado
            if (documentoAlterado && user.TipoPessoa.HasValue && !string.IsNullOrEmpty(user.Documento))
            {
                 if (user.TipoPessoa == TipoPessoa.Fisica && user.Documento.Length != 11)
                 {
                     throw new System.Exception("CPF inválido para atualização. Deve conter 11 dígitos numéricos.");
                 }
                 else if (user.TipoPessoa == TipoPessoa.Juridica && user.Documento.Length != 14)
                 {
                     throw new System.Exception("CNPJ inválido para atualização. Deve conter 14 dígitos numéricos.");
                 }
            }
            // --- FIM DA LÓGICA DE ATUALIZAÇÃO ---

            await _authRepo.UpdateUser(user);
            return await GetUserByIdAsync(id); // Retorna DTO atualizado
        }

        // DeleteUserAsync e UpdateUserRoleAsync não precisam de alteração direta aqui
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