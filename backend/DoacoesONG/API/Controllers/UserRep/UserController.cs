using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Interfaces; // Namespace da sua IUserService
using API.DTOs.UserRep;             // Namespace dos seus DTOs

namespace API.Controllers.UserRep // Ajuste para o seu namespace
{
    [ApiController]
    [Route("api/[controller]")]
    // Apenas Admins podem acessar estes endpoints (Atualizar isso depois!!!!)
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Obtém uma lista de todos os usuários cadastrados.
        /// </summary>
        [Authorize(Roles = "Administrador, Colaborador")]
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [Authorize]
        [HttpGet("me")] // Rota especial: GET /api/user/me
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMyProfile()
        {
            // 1. Pega o ID do usuário que está no token JWT.
            // O '?' é para segurança, caso a claim não exista.
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 2. Se por algum motivo o ID não estiver no token, retorna um erro.
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized("ID do usuário não encontrado no token.");
            }

            // Converte o ID de string para int
            var userId = int.Parse(userIdString);

            // 3. Reutiliza o serviço que você já tem para buscar o usuário pelo ID.
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound("Usuário não encontrado.");
            }

            return Ok(user);
        }
        /// <summary>
        /// Obtém os detalhes de um usuário específico pelo seu ID.
        /// </summary>
        [Authorize(Roles = "Administrador, Colaborador")]
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound("Usuário não encontrado.");
            }
            return Ok(user);
        }

        /// <summary>
        /// Atualiza as informações de um usuário (nome, email).
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto userDto)
        {

            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 4. Pega a role do usuário que está no token JWT
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Validação de segurança
            // Se o ID da rota é diferente do ID do token E o usuário não é um Administrador...
            if (userIdFromToken != id.ToString() && userRole != "Administrador")
            {
                // Retorna 403 Forbidden, pois o usuário não tem permissão para alterar este recurso.
                return Forbid(); 
            }
            var updatedUser = await _userService.UpdateUserAsync(id, userDto);
            if (updatedUser == null)
            {
                return NotFound("Usuário não encontrado.");
            }
            return Ok(updatedUser);
        }

        /// <summary>
        /// Atualiza o papel (role) de um usuário (ex: promove para Colaborador).
        /// </summary>
        [Authorize(Roles = "Administrador")]
        [HttpPut("{id}/role")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto request)
        {
            if (!Enum.TryParse<Domain.Entities.TipoUsuario>(request.NovoTipoUsuario, true, out var novoTipoEnum))
            {
                return BadRequest("Tipo de usuário inválido. Valores aceitos: Doador, Colaborador, Administrador.");
            }

            var success = await _userService.UpdateUserRoleAsync(id, novoTipoEnum);
            if (!success)
            {
                return NotFound("Usuário não encontrado ou não foi possível atualizar o papel.");
            }

            return Ok("Papel do usuário atualizado com sucesso.");
        }

        /// <summary>
        /// Deleta um usuário do sistema.
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)] // Adiciona o possível retorno de erro
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Adiciona o possível retorno de erro
        public async Task<IActionResult> DeleteUser(int id)
        {

            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Regra de segurança 1: Um usuário não pode deletar a si mesmo.
            if (userIdFromToken == id.ToString())
            {
                return BadRequest("Não é permitido deletar a própria conta através deste endpoint.");
            }

            // Regra de segurança 2: Apenas administradores podem deletar outros usuários.
            if (userRole != "Administrador")
            {
                // Se não for admin, não tem permissão.
                return Forbid();
            }

            var success = await _userService.DeleteUserAsync(id);
            if (!success)
            {
                return NotFound("Usuário não encontrado.");
            }
            return NoContent(); // 204 No Content é a resposta padrão para um delete bem-sucedido.
        }
    }
}
