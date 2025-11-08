using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces;
using API.DTOs.UserRep;
using Infrastructure.Data;
using System.Linq;
using Domain.Entities; // Required for Enums
using System; // Required for Enum.TryParse
using System.Collections.Generic; // Required for List

namespace API.Controllers.UserRep
{
    // --- DTO para Resultado Paginado ---
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
    }
    // --- FIM DO DTO ---

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly AppDbContext _context; // Inject DbContext para consulta direta

        public UsersController(IUserService userService, AppDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        /// <summary>
        /// Obtém uma lista paginada e filtrada de usuários.
        /// </summary>
        /// <param name="pageNumber">Número da página (começando em 1).</param>
        /// <param name="pageSize">Quantidade de itens por página.</param>
        /// <param name="search">Termo para buscar em Nome, Email ou ID.</param>
        /// <param name="role">Filtra pelo papel do usuário (Doador, Colaborador, Administrador).</param>
        /// <param name="tipoPessoa">Filtra pelo tipo de pessoa (Fisica, Juridica).</param>
        /// <response code="200">Retorna a lista paginada de usuários.</response>
        /// <response code="401">Usuário não autenticado.</response>
        /// <response code="403">Usuário não autorizado.</response>
        [Authorize(Roles = "Administrador, Colaborador")]
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null, // Filtro de busca
            [FromQuery] string? role = null, // Filtro de papel
            [FromQuery] string? tipoPessoa = null // Filtro de tipo pessoa
        )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100; // Limite

            // --- APLICAÇÃO DOS FILTROS ---
            var query = _context.Users.AsQueryable(); // Começa consulta

            // Filtro de Busca (Nome, Email, ID) - Case-insensitive
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTermLower = search.ToLower().Trim();
                query = query.Where(u =>
                    EF.Functions.Like(u.Nome.ToLower(), $"%{searchTermLower}%") || // Usa Like para contains
                    EF.Functions.Like(u.Email.ToLower(), $"%{searchTermLower}%") ||
                    u.Id.ToString() == searchTermLower // Compara ID como string
                );
            }

            // Filtro de Papel (Role) - Case-insensitive
            if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<TipoUsuario>(role, true, out var roleEnum))
            {
                query = query.Where(u => u.TipoUsuario == roleEnum);
            }

            // Filtro de Tipo de Pessoa - Case-insensitive
            if (!string.IsNullOrWhiteSpace(tipoPessoa) && Enum.TryParse<TipoPessoa>(tipoPessoa, true, out var tipoPessoaEnum))
            {
                // Inclui usuários onde TipoPessoa é null se o filtro não for específico
                // query = query.Where(u => u.TipoPessoa == tipoPessoaEnum); // Versão anterior
                query = query.Where(u => u.TipoPessoa.HasValue && u.TipoPessoa.Value == tipoPessoaEnum); // Garante que não seja nulo
            }
            // --- FIM DA APLICAÇÃO DOS FILTROS ---

            // Conta o total DEPOIS de aplicar os filtros
            var totalUsers = await query.CountAsync();

            // Aplica ordenação, paginação e projeção (Select para DTO)
            var users = await query
                .OrderBy(u => u.Nome) // Ordena por nome
                .Skip((pageNumber - 1) * pageSize) // Pula páginas anteriores
                .Take(pageSize) // Pega a quantidade da página atual
                .Select(user => new UserDto // Mapeia para o DTO de resposta
                {
                    Id = user.Id,
                    Nome = user.Nome,
                    Email = user.Email,
                    TipoUsuario = user.TipoUsuario.ToString(),
                    TipoPessoa = user.TipoPessoa.HasValue ? user.TipoPessoa.Value.ToString() : null, // Converte Enum? para string?
                    Documento = user.Documento // Assume que documento já está limpo no DB
                })
                .ToListAsync();

            // Monta o resultado paginado
            var result = new PagedResult<UserDto>
            {
                Items = users,
                TotalCount = totalUsers
            };

            return Ok(result); // Retorna 200 OK com os dados
        }

        // --- Outros endpoints (GetMyProfile, GetUserById, UpdateUser, UpdateUserRole, DeleteUser) ---
        // Manter os atributos [ProducesResponseType] neles como na resposta anterior

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("ID do usuário não encontrado no token.");
            }
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null) return NotFound("Usuário não encontrado.");
            return Ok(user);
        }

        [Authorize(Roles = "Administrador, Colaborador")]
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound("Usuário não encontrado.");
            return Ok(user);
        }

        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto userDto)
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userIdFromToken != id.ToString() && userRole != "Administrador")
            {
                return Forbid();
            }
            try
            {
                 var updatedUser = await _userService.UpdateUserAsync(id, userDto);
                 if (updatedUser == null) return NotFound("Usuário não encontrado.");
                 return Ok(updatedUser);
            }
            catch(Exception ex) { return BadRequest(ex.Message); }
        }

        [Authorize(Roles = "Administrador")]
        [HttpPut("{id}/role")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto request)
        {
            if (!Enum.TryParse<Domain.Entities.TipoUsuario>(request.NovoTipoUsuario, true, out var novoTipoEnum))
            {
                return BadRequest("Tipo de usuário inválido. Valores aceitos: Doador, Colaborador, Administrador.");
            }
            var success = await _userService.UpdateUserRoleAsync(id, novoTipoEnum);
            if (!success) return NotFound("Usuário não encontrado ou não foi possível atualizar o papel.");
            return Ok("Papel do usuário atualizado com sucesso.");
        }

        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id)
        {
             var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userIdFromToken == id.ToString())
            {
                return BadRequest("Não é permitido deletar a própria conta através deste endpoint.");
            }
            if (userRole != "Administrador")
            {
                return Forbid();
            }
            var success = await _userService.DeleteUserAsync(id);
            if (!success) return NotFound("Usuário não encontrado.");
            return NoContent();
        }
    }
}