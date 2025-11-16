using MercadoPago.Config;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Resource.Payment; 
using MercadoPago.Resource.Preference;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;
using Infrastructure.Data;
using System.Text.Json.Serialization;
using System.Linq;
using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic; 
using Application.Interfaces; 

[ApiController]
[Route("api/[controller]")]
public class PagamentoController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public PagamentoController(IConfiguration config, AppDbContext context, IEmailService emailService)
    {
        _config = config;
        _context = context;
        _emailService = emailService; 
        MercadoPagoConfig.AccessToken = _config.GetValue<string>("MercadoPago:AccessToken");
    }

    // ... (O seu método [HttpPost("criar-preferencia")] existente) ...
    [Authorize]
    [HttpPost("criar-preferencia")]
    public async Task<IActionResult> CriarPreferencia([FromBody] DoacaoRequestDto request)
    {
        try
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var doadorId))
            {
                return Unauthorized("Não foi possível identificar o usuário logado.");
            }
            
            var externalReference = Guid.NewGuid().ToString();

            var preferenceRequest = new PreferenceRequest
            {
                ExternalReference = externalReference,
                Items = new List<PreferenceItemRequest>
                {
                    new PreferenceItemRequest
                    {
                        Title = "Doação para o Instituto Maria Claro",
                        Description = "Sua contribuição ajuda a manter nossos projetos.",
                        Quantity = 1,
                        CurrencyId = "BRL",
                        UnitPrice = request.Valor,
                    }
                },
                
                Payer = new PreferencePayerRequest 
                {
                },
                BackUrls = new PreferenceBackUrlsRequest
                {
                    Success = "http://localhost:3000/doacao/sucesso",
                    Failure = "http://localhost:3000/doacao/falha",
                },
                NotificationUrl = _config.GetValue<string>("MercadoPago:WebhookUrl"),
            };

            var client = new PreferenceClient();
            Preference preference = await client.CreateAsync(preferenceRequest);

            var novoPagamento = new Pagamento
            {
                Valor = request.Valor,
                Status = "PENDING",
                MercadoPagoPreferenceId = preference.Id,
                DataCriacao = DateTime.UtcNow,
                ExternalReference = externalReference,
                DoadorId = doadorId
            };
            _context.Pagamentos.Add(novoPagamento);
            await _context.SaveChangesAsync();

            return Ok(new { InitPoint = preference.InitPoint });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Erro em CriarPreferencia: {ex.Message}");
            return StatusCode(500, new { message = "Erro ao criar preferência de pagamento.", error = ex.Message });
        }
    }


    // ... (O seu método [HttpPost("webhook")] existente) ...
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] MercadoPagoNotification notification)
    {
        if (notification?.Topic == "payment" && !string.IsNullOrEmpty(notification.ResourceUrl))
        {
            try
            {
                var paymentIdString = notification.ResourceUrl.Split('/').LastOrDefault();
                if (long.TryParse(paymentIdString, out long paymentId))
                {
                    var client = new PaymentClient();
                    Payment payment = await client.GetAsync(paymentId); 

                    var pagamentoEmNossoDB = await _context.Pagamentos
                        .Include(p => p.Doador) 
                        .FirstOrDefaultAsync(p => p.ExternalReference == payment.ExternalReference);

                    if (pagamentoEmNossoDB != null)
                    {
                        if(pagamentoEmNossoDB.Status == "approved")
                        {
                            return Ok("Pagamento já foi processado anteriormente.");
                        }

                        pagamentoEmNossoDB.Status = payment.Status;
                        pagamentoEmNossoDB.MercadoPagoPaymentId = payment.Id;
                        pagamentoEmNossoDB.DataAtualizacao = DateTime.UtcNow;

                        if (payment.Payer?.Identification != null)
                        {
                            pagamentoEmNossoDB.PayerIdentificationType = payment.Payer.Identification.Type;
                            pagamentoEmNossoDB.PayerIdentificationNumber = payment.Payer.Identification.Number?.Replace(".", "").Replace("-", "");
                        }

                        pagamentoEmNossoDB.TipoPagamento = payment.PaymentTypeId;
                        if (payment.TransactionDetails != null)
                        {
                            pagamentoEmNossoDB.ValorLiquido = payment.TransactionDetails.NetReceivedAmount;
                        }

                        if (pagamentoEmNossoDB.Status == "approved" && pagamentoEmNossoDB.Doador != null)
                        {
                            await _context.SaveChangesAsync();
                            try
                            {
                                var doador = pagamentoEmNossoDB.Doador;
                                var subject = "Sua doação foi recebida!";
                                var htmlContent = $"Olá {doador.Nome},<br><br>" +
                                                  $"Recebemos sua doação no valor de R$ {pagamentoEmNossoDB.Valor.ToString("F2")}. " +
                                                  "Sua contribuição é muito importante e faz toda a diferença para nós.<br><br>" +
                                                  "Muito obrigado!<br>" +
                                                  "Equipe Instituto Maria Claro";
                                                  
                                var plainTextContent = $"Olá {doador.Nome}, Recebemos sua doação no valor de R$ {pagamentoEmNossoDB.Valor.ToString("F2")}. Sua contribuição é muito importante e faz toda a diferença para nós. Muito obrigado! Equipe Instituto Maria Claro";

                                await _emailService.SendEmailAsync(doador.Email, doador.Nome, subject, plainTextContent, htmlContent);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[AVISO SendGrid] O pagamento {payment.Id} foi APROVADO, mas o e-mail de agradecimento para {pagamentoEmNossoDB.Doador.Email} FALHOU: {ex.Message}");
                            }
                            
                            return Ok(); 
                        }
                        
                        await _context.SaveChangesAsync();
                    }
                }
                else
                {
                    Console.WriteLine($"Erro em Webhook: URL de recurso inválida - {notification.ResourceUrl}");
                    return BadRequest("Formato inválido da URL do recurso.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro em Webhook: {ex.Message}\nStackTrace: {ex.StackTrace}");
                return BadRequest();
            }
        }
        return Ok();
    }

    // ... (O seu método [HttpGet("me")] existente, para o Perfil do Doador) ...
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(List<PagamentoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyDonations()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var doadorId))
        {
            return Unauthorized("Não foi possível identificar o usuário logado.");
        }
        var doacoes = await _context.Pagamentos
            .Where(p => p.DoadorId == doadorId && p.Status == "approved")
            .OrderByDescending(p => p.DataCriacao)
            .Select(p => new PagamentoDto 
            {
                DataCriacao = p.DataCriacao,
                Valor = p.Valor,
                Status = p.Status
            })
            .ToListAsync();
        return Ok(doacoes);
    }

    // ... (O seu método [HttpGet("{userId}")] existente, para o Modal do Admin) ...
    [Authorize(Roles = "Administrador, Colaborador")]
    [HttpGet("{userId}")]
    [ProducesResponseType(typeof(List<PagamentoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDonationsByUserId(int userId)
    {
        var doadorExiste = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!doadorExiste)
        {
            return NotFound("Doador não encontrado.");
        }
        var doacoes = await _context.Pagamentos
            .Where(p => p.DoadorId == userId && p.Status == "approved")
            .OrderByDescending(p => p.DataCriacao)
            .Select(p => new PagamentoDto
            {
                DataCriacao = p.DataCriacao,
                Valor = p.Valor,
                Status = p.Status
            })
            .ToListAsync();
        return Ok(doacoes);
    }

    // === NOVO MÉTODO (PARA BUSCAR OS ANOS) ===
    /// <summary>
    /// (Admin) Retorna uma lista de anos únicos que tiveram doações aprovadas.
    /// </summary>
    [Authorize(Roles = "Administrador, Colaborador")]
    [HttpGet("anos-disponiveis")]
    [ProducesResponseType(typeof(List<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAnosDisponiveis()
    {
        var anos = await _context.Pagamentos
            .Where(p => p.Status == "approved") // Apenas de doações aprovadas
            .Select(p => p.DataCriacao.Year) // Seleciona só o ano
            .Distinct() // Pega valores únicos
            .OrderByDescending(ano => ano) // Ordena do mais novo para o mais velho
            .ToListAsync();

        return Ok(anos); // Retorna ex: [2025, 2024, 2023, 2021]
    }


    // === MÉTODO DE RELATÓRIO (COM FILTROS) ===
    /// <summary>
    /// (Admin) Gera um relatório de sumário de arrecadação (Bruto vs Líquido) com base em filtros de data.
    /// </summary>
    [Authorize(Roles = "Administrador, Colaborador")]
    [HttpGet("relatorio-arrecadacao")]
    [ProducesResponseType(typeof(RelatorioArrecadacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRelatorioArrecadacao(
        [FromQuery] int ano, 
        [FromQuery] string tipo, // "mensal", "trimestral", "semestral"
        [FromQuery] int periodo // 1-12 (mês), 1-4 (trimestre), 1-2 (semestre)
    )
    {
        DateTime startDate;
        DateTime endDate;

        try
        {
            switch (tipo.ToLower())
            {
                case "mensal":
                    if (periodo < 1 || periodo > 12) return BadRequest("Mês inválido. Use 1-12.");
                    startDate = new DateTime(ano, periodo, 1);
                    endDate = startDate.AddMonths(1);
                    break;

                case "trimestral":
                    if (periodo < 1 || periodo > 4) return BadRequest("Trimestre inválido. Use 1-4.");
                    int startMonthTrimestre = (periodo - 1) * 3 + 1; // Q1=M1, Q2=M4, Q3=M7, Q4=M10
                    startDate = new DateTime(ano, startMonthTrimestre, 1);
                    endDate = startDate.AddMonths(3);
                    break;

                case "semestral":
                    if (periodo < 1 || periodo > 2) return BadRequest("Semestre inválido. Use 1-2.");
                    int startMonthSemestre = (periodo - 1) * 6 + 1; // S1=M1, S2=M7
                    startDate = new DateTime(ano, startMonthSemestre, 1);
                    endDate = startDate.AddMonths(6);
                    break;

                default:
                    return BadRequest("Tipo de relatório inválido. Use 'mensal', 'trimestral' ou 'semestral'.");
            }
        }
        catch (ArgumentOutOfRangeException)
        {
            return BadRequest("Data inválida. Verifique o ano e o período.");
        }

        // 1. Busca as doações APROVADAS dentro do range de datas (UTC)
        var doacoesAprovadas = await _context.Pagamentos
            .Where(p => p.Status == "approved" && 
                        p.DataCriacao >= startDate.ToUniversalTime() && 
                        p.DataCriacao < endDate.ToUniversalTime())
            .ToListAsync();

        // 2. Monta o DTO de Relatório apenas com os totais
        var relatorio = new RelatorioArrecadacaoDto
        {
            TotalArrecadado = doacoesAprovadas.Sum(p => p.Valor),
            TotalLiquido = doacoesAprovadas.Sum(p => p.ValorLiquido ?? 0), 
            TotalDoacoesAprovadas = doacoesAprovadas.Count 
        };

        return Ok(relatorio);
    }
}

// DTOs
public class DoacaoRequestDto { public decimal Valor { get; set; } }

public class MercadoPagoNotification
{
    [JsonPropertyName("resource")]
    public string? ResourceUrl { get; set; }

    [JsonPropertyName("topic")]
    public string? Topic { get; set; }
}

public class PagamentoDto
{
    public DateTime DataCriacao { get; set; }
    public decimal Valor { get; set; }
    public string Status { get; set; }
}

// === DTO ATUALIZADO (SIMPLIFICADO) ===

/// <summary>
/// DTO para o relatório de arrecadação (SUMÁRIO).
/// </summary>
public class RelatorioArrecadacaoDto
{
    public decimal TotalArrecadado { get; set; } // Soma de 'Valor'
    public decimal TotalLiquido { get; set; } // Soma de 'ValorLiquido'
    public int TotalDoacoesAprovadas { get; set; } // Contagem de doações
}