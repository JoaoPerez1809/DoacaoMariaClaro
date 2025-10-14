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

var builder = WebApplication.CreateBuilder(args);

// --- Adicionar serviços ao contêiner ---

// 1. Configuração do DbContext com PostgreSQL
if (builder.Environment.IsDevelopment())
{
    // Se estiver a rodar localmente (dotnet run), usa o SQLite.
    Console.WriteLine("Ambiente de Desenvolvimento: Usando banco de dados SQLite.");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection")));
}
else
{
    // Para qualquer outro ambiente (como Docker), usa o PostgreSQL.
    Console.WriteLine("Ambiente de Produção/Docker: Usando banco de dados PostgreSQL.");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));
}

// 2. Injeção de Dependência (do nosso projeto)
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 3. Configuração do CORS (adaptado do outro projeto)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Permite apenas o seu frontend
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddAuthorization(); // Adicionado do outro projeto
builder.Services.AddEndpointsApiExplorer();

// 4. Configuração da Autenticação JWT (combinação de ambos)
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
        RoleClaimType = ClaimTypes.Role // A correção crucial para a autorização
    };
});

// 5. Configuração do Swagger (do outro projeto, mais detalhado)
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

// builder.Services.AddRouting(options => options.LowercaseUrls = true);

var app = builder.Build();

// --- Configuração do pipeline de requisições HTTP ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        // Mostra a UI do Swagger na raiz da aplicação (http://localhost:porta/)
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API Doação v1");
        options.RoutePrefix = string.Empty;
    });
}

// app.UseHttpsRedirection(); // Mantemos comentado para desenvolvimento local

// Ordem correta e final do pipeline
app.UseCors("AllowFrontend"); // Ativa a política de CORS
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
