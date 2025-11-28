using Domain.Entities;
using API.DTOs.UserRep;
using Application.Interfaces;
using Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions; 

namespace Application.Services
{
    public class UserService : IUserService
    {
        // NOTA: Você está injetando IAuthRepository aqui. Isso funciona, mas idealmente
        // você criaria um IUserRepository para separar as responsabilidades de
        // autenticação (login/register) das de CRUD (get/update/delete).
        // Por enquanto, manteremos o IAuthRepository.
        private readonly IAuthRepository _authRepo; 

        public UserService(IAuthRepository authRepo) 
        {
            _authRepo = authRepo;
        }

        // Mapeamento completo para GetUserByIdAsync
        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return null;

            // Mapeia TODOS os campos da Entidade para o DTO
            return new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                TipoUsuario = user.TipoUsuario.ToString(),
                TipoPessoa = user.TipoPessoa?.ToString(),
                Documento = user.Documento,
                
                // Mapeamento dos novos campos
                Telefone = user.Telefone,
                Cep = user.Cep,
                Endereco = user.Endereco,
                Bairro = user.Bairro,
                Cidade = user.Cidade,
                Estado = user.Estado,
                Genero = user.Genero,
                ComercioEndereco = user.ComercioEndereco,
                DataNascimento = user.DataNascimento,
                DataCadastro = user.DataCadastro
            };
        }

        // Mapeamento completo para GetAllUsersAsync
        // NOTA: O seu UserController não usa este método, ele consulta o _context diretamente.
        // Mas se usasse, este seria o mapeamento correto.
        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _authRepo.GetAllAsync();
            return users.Select(user => new UserDto
            {
                Id = user.Id,
                Nome = user.Nome,
                Email = user.Email,
                TipoUsuario = user.TipoUsuario.ToString(),
                TipoPessoa = user.TipoPessoa?.ToString(),
                Documento = user.Documento,
                
                // Mapeamento dos novos campos
                Telefone = user.Telefone,
                Cep = user.Cep,
                Endereco = user.Endereco,
                Bairro = user.Bairro,
                Cidade = user.Cidade,
                Estado = user.Estado,
                Genero = user.Genero,
                ComercioEndereco = user.ComercioEndereco,
                DataNascimento = user.DataNascimento,
                DataCadastro = user.DataCadastro
            }).ToList();
        }

        // Mapeamento completo para UpdateUserAsync
        public async Task<UserDto?> UpdateUserAsync(int id, UserUpdateDto userDto)
        {
            var user = await _authRepo.GetUserById(id);
            if (user == null) return null;

            // Campos principais
            user.Nome = userDto.Nome;
            user.Email = userDto.Email;
            
            // Lógica do Documento (existente)
            bool documentoAlterado = false;
            if (userDto.TipoPessoa.HasValue)
            {
                user.TipoPessoa = userDto.TipoPessoa.Value;
                documentoAlterado = true;
            }

            if (!string.IsNullOrWhiteSpace(userDto.Documento))
            {
                user.Documento = Regex.Replace(userDto.Documento, @"[^\d]", "");
                documentoAlterado = true;
            }
            else if (userDto.Documento == "") // Permite limpar o documento
            {
                user.Documento = null;
                documentoAlterado = true;
            }

            // Revalida se o documento foi alterado
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
            
            // --- CORREÇÃO: ATUALIZAÇÃO DOS NOVOS CAMPOS ---
            // Atribui os valores do DTO para a entidade
            user.Telefone = userDto.Telefone;
            user.Cep = userDto.Cep;
            user.Endereco = userDto.Endereco;
            user.Bairro = userDto.Bairro;
            user.Cidade = userDto.Cidade;
            user.Estado = userDto.Estado;
            user.Genero = userDto.Genero;
            user.ComercioEndereco = userDto.ComercioEndereco;
            if (!string.IsNullOrEmpty(userDto.DataNascimento))
            {
                if (DateTime.TryParse(userDto.DataNascimento, out var dataParsed))
                {
                    // Converte para UTC para o Postgres aceitar sem reclamar
                    user.DataNascimento = DateTime.SpecifyKind(dataParsed, DateTimeKind.Utc);
                }
                else
                {
                    // Se a data for inválida, você pode lançar erro ou apenas ignorar
                    // throw new Exception("Data de nascimento inválida.");
                    Console.WriteLine($"[UpdateUser] Formato de data inválido recebido: {userDto.DataNascimento}");
                }
            }
            // user.DataNascimento = userDto.DataNascimento;
            // DataCadastro não é atualizada aqui
            // --- FIM DA CORREÇÃO ---

            await _authRepo.UpdateUser(user);
            return await GetUserByIdAsync(id); // Retorna DTO atualizado
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