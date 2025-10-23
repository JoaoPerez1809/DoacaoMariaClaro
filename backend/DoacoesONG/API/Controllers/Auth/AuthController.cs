using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using API.DTOs.UserRep; // Namespace dos DTOs
using Domain.Interfaces; // Namespace do IAuthRepository
// 1. ADICIONE O USING PARA O SERVIÇO DE AUTENTICAÇÃO
using Application.Interfaces; // Namespace do IAuthService
using System; // Namespace para Exception

namespace API.Controllers.Auth // Seu namespace
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // 2. INJETE IAuthService junto com os outros
        private readonly IAuthRepository _authRepo;
        private readonly IAuthService _authService; // Adicionado
        private readonly IConfiguration _config;

        // Atualize o construtor para receber IAuthService
        public AuthController(IAuthRepository authRepo, IAuthService authService, IConfiguration config)
        {
            _authRepo = authRepo;
            _authService = authService; // Atribuído
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request) // Recebe o DTO atualizado
        {
            try
            {
                // 3. DELEGUE A LÓGICA DE REGISTRO PARA O AuthService
                // O AuthService agora cuidará de:
                // - Verificar se o email já existe.
                // - Validar CPF/CNPJ.
                // - Limpar o documento.
                // - Criar o hash da senha.
                // - Salvar o novo usuário no banco de dados.
                var createdUserDto = await _authService.RegisterAsync(request); //

                // Retorna 200 OK com os dados básicos do usuário criado (sem senha)
                // Se preferir retornar 201 Created, você pode usar:
                // return StatusCode(201, createdUserDto);
                // Ou para retornar o link do usuário criado (requer um endpoint GetUserById neste controller):
                // return CreatedAtAction(nameof(GetUserByIdControllerMethodName), new { id = createdUserDto.Id }, createdUserDto);
                return Ok(createdUserDto); //
            }
            // Captura exceções lançadas pelo AuthService (ex: email duplicado, documento inválido)
            catch (Exception ex)
            {
                // Retorna 400 Bad Request com a mensagem de erro específica vinda do serviço
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request) //
        {
            // A lógica de login pode permanecer usando o repositório diretamente,
            // ou ser movida para o AuthService para maior consistência.
            // Mantendo o uso direto do repositório por enquanto:
            var userFromRepo = await _authRepo.Login(request.Email, request.Senha); //

            if (userFromRepo == null)
                return Unauthorized("Credenciais inválidas."); // Retorna 401 Unauthorized

            // Cria o token JWT se o login for bem-sucedido
            var token = CreateToken(userFromRepo);

            // Retorna o token no corpo da resposta
            return Ok(new { token });
        }

        // Método privado para criar o token JWT (sem alterações)
        private string CreateToken(User user) //
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Nome),
                // Inclui o TipoUsuario como uma 'role' no token
                new Claim(ClaimTypes.Role, user.TipoUsuario.ToString())
            };

            var appSettingsToken = _config.GetSection("AppSettings:Token").Value;
            if (string.IsNullOrEmpty(appSettingsToken))
            {
                // É crucial ter essa chave configurada no appsettings.json
                throw new Exception("A chave JWT ('AppSettings:Token') não está configurada.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettingsToken));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1), // Token expira em 1 dia
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}