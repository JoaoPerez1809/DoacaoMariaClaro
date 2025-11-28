using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;
using Infrastructure.Data;
using Domain.Interfaces;
using Infrastructure.Repositories;
using Application.Interfaces;
using Application.Services;
// --- ADICIONE ESTE USING ---
using System.Text.Json.Serialization;
using Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// --- Adicionar serviços ao contêiner ---

// 1. Configuração do DbContext
// if (builder.Environment.IsDevelopment())
// {
//     Console.WriteLine("Ambiente de Desenvolvimento: Usando banco de dados SQLite.");
//     builder.Services.AddDbContext<AppDbContext>(options =>
//         options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection")));
// }
// else
// {
    Console.WriteLine("Ambiente de Produção/Docker: Usando banco de dados PostgreSQL.");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));
// }

// 2. Injeção de Dependência
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
// Adicione o IUserRepository se ainda não estiver aqui (necessário pelo UserService)
builder.Services.AddScoped<IUserRepository, UserRepository>(); 
builder.Services.AddScoped<IEmailService, EmailService>();

// 3. Configuração do CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://doacao-maria-claro.vercel.app", "https://main.d2y2snun4xtyx8.amplifyapp.com") // Permite apenas o seu frontend
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- CORREÇÃO APLICADA AQUI ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Adiciona o conversor para que Enums sejam tratados como Strings
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); 
        // Opcional: Garante que a desserialização não seja case-sensitive (geralmente padrão)
        // options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; 
    });
// --- FIM DA CORREÇÃO ---

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();

// 4. Configuração da Autenticação JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var tokenKey = builder.Configuration.GetSection("AppSettings:Token").Value;
    if (string.IsNullOrEmpty(tokenKey))
    {
        throw new InvalidOperationException("A chave do token não está configurada em appsettings.json");
    }

    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        RoleClaimType = ClaimTypes.Role
    };
});

// 5. Configuração do Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "API Doação - Instituto Maria Claro",
        Version = "v1",
        Description = "API para o sistema de doações e gerenciamento de usuários.",
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer",
        Description = "Insira 'Bearer' [espaço] e o seu token JWT."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

await DbSeeder.SeedAdminUser(app);
// --- Configuração do pipeline de requisições HTTP ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API Doação v1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
