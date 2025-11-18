using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces;
using API.DTOs.UserRep;
using Infrastructure.Data;
using System.Linq;
using Domain.Entities; 
using System; 
using System.Collections.Generic; 

namespace API.Controllers.UserRep
{
    // --- DTO para Resultado Paginado ---
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
    }

    // === NOVO DTO PARA AS ESTATÍSTICAS ===
    public class UserStatsDto
    {
        public int TotalUsuarios { get; set; }
        public int TotalPessoaFisica { get; set; }
        public int TotalPessoaJuridica { get; set; }
        public int TotalDoadores { get; set; }
        public int TotalColaboradores { get; set; }
        public int TotalAdministradores { get; set; }
    }
    // === FIM DO NOVO DTO ===


    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly AppDbContext _context; 

        public UsersController(IUserService userService, AppDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        /// <summary>
        /// Obtém uma lista paginada e filtrada de usuários.
        /// </summary>
        // ... (atributos existentes) ...
        [Authorize(Roles = "Administrador, Colaborador")]
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllUsers(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null, 
            [FromQuery] string? role = null, 
            [FromQuery] string? tipoPessoa = null 
        )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100; 

            var query = _context.Users.AsQueryable(); 

            // Filtro de Busca (Nome, Email, ID)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchTermLower = search.ToLower().Trim();
                query = query.Where(u =>
                    EF.Functions.Like(u.Nome.ToLower(), $"%{searchTermLower}%") || 
                    EF.Functions.Like(u.Email.ToLower(), $"%{searchTermLower}%") ||
                    u.Id.ToString() == searchTermLower 
                );
            }

            // Filtro de Papel (Role)
            if (!string.IsNullOrWhiteSpace(role) && Enum.TryParse<TipoUsuario>(role, true, out var roleEnum))
            {
                query = query.Where(u => u.TipoUsuario == roleEnum);
            }

            // Filtro de Tipo de Pessoa
            if (!string.IsNullOrWhiteSpace(tipoPessoa) && Enum.TryParse<TipoPessoa>(tipoPessoa, true, out var tipoPessoaEnum))
            {
                query = query.Where(u => u.TipoPessoa.HasValue && u.TipoPessoa.Value == tipoPessoaEnum); 
            }

            var totalUsers = await query.CountAsync();

            var users = await query
                .OrderBy(u => u.Nome) 
                .Skip((pageNumber - 1) * pageSize) 
                .Take(pageSize) 
                .Select(user => new UserDto 
                {
                    Id = user.Id,
                    Nome = user.Nome,
                    Email = user.Email,
                    TipoUsuario = user.TipoUsuario.ToString(),
                    TipoPessoa = user.TipoPessoa.HasValue ? user.TipoPessoa.Value.ToString() : null, 
                    Documento = user.Documento 
                })
                .ToListAsync();

            var result = new PagedResult<UserDto>
            {
                Items = users,
                TotalCount = totalUsers
            };

            return Ok(result); 
        }

        // --- Outros endpoints (GetMyProfile, GetUserById, UpdateUser, UpdateUserRole, DeleteUser) ---
        // (Sem alterações, continuam aqui)

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

        // === NOVO ENDPOINT DE ESTATÍSTICAS ===
        /// <summary>
        /// (Admin) Obtém estatísticas rápidas sobre os usuários.
        /// </summary>
        [Authorize(Roles = "Administrador, Colaborador")]
        [HttpGet("stats")]
        [ProducesResponseType(typeof(UserStatsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUserStats()
        {
            // Usa Task.WhenAll para executar todas as contagens em paralelo
            var stats = new UserStatsDto
            {
                TotalUsuarios = await _context.Users.CountAsync(),
                TotalPessoaFisica = await _context.Users.CountAsync(u => u.TipoPessoa == TipoPessoa.Fisica),
                TotalPessoaJuridica = await _context.Users.CountAsync(u => u.TipoPessoa == TipoPessoa.Juridica),
                TotalDoadores = await _context.Users.CountAsync(u => u.TipoUsuario == TipoUsuario.Doador),
                TotalColaboradores = await _context.Users.CountAsync(u => u.TipoUsuario == TipoUsuario.Colaborador),
                TotalAdministradores = await _context.Users.CountAsync(u => u.TipoUsuario == TipoUsuario.Administrador)
            };
            
            return Ok(stats);
        }
    }
}