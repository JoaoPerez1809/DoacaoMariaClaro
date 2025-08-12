using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Application.Interfaces; // Namespace da sua IUserService
using API.DTOs;             // Namespace dos seus DTOs

namespace API.Controllers // Ajuste para o seu namespace
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Administrador")] // Apenas Admins podem acessar estes endpoints (Atualizar isso depois!!!!)
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
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Obtém os detalhes de um usuário específico pelo seu ID.
        /// </summary>
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
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto userDto)
        {
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
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var success = await _userService.DeleteUserAsync(id);
            if (!success)
            {
                return NotFound("Usuário não encontrado.");
            }
            return NoContent(); // 204 No Content é a resposta padrão para um delete bem-sucedido.
        }
    }
}
