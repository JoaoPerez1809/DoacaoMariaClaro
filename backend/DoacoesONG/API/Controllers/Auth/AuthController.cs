using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using API.DTOs.UserRep;
using Domain.Interfaces; // Ajuste para o seu namespace

namespace API.Controllers.Auth // Ajuste para o seu namespace
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepo;
        private readonly IConfiguration _config;

        public AuthController(IAuthRepository authRepo, IConfiguration config)
        {
            _authRepo = authRepo;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
        {
            if (await _authRepo.UserExists(request.Email))
                return BadRequest("O email informado já está cadastrado.");

            var newUser = new User
            {
                Nome = request.Nome,
                Email = request.Email,
                TipoUsuario = TipoUsuario.Doador // Todo novo registro é um Doador
            };

            await _authRepo.Register(newUser, request.Senha);
            
            return StatusCode(201, "Usuário criado com sucesso.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            var userFromRepo = await _authRepo.Login(request.Email, request.Senha);

            if (userFromRepo == null)
                return Unauthorized("Credenciais inválidas.");

            var token = CreateToken(userFromRepo);

            return Ok(new { token });
        }

        private string CreateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Nome),
                new Claim(ClaimTypes.Role, user.TipoUsuario.ToString()) // Adiciona o papel ao token
            };

            var appSettingsToken = _config.GetSection("AppSettings:Token").Value;
            if (string.IsNullOrEmpty(appSettingsToken))
            {
                throw new Exception("A chave do token não está configurada no appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettingsToken));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}