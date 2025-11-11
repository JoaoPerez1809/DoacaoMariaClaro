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

    // ... (Seu método [HttpPost("criar-preferencia")] existente fica aqui) ...
    [Authorize]
    [HttpPost("criar-preferencia")]
    public async Task<IActionResult> CriarPreferencia([FromBody] DoacaoRequestDto request)
    {
        // ... (código existente) ...
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
                    // Email = User.FindFirst(ClaimTypes.Email)?.Value,
                    // Name = User.FindFirst(ClaimTypes.Name)?.Value,
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


    // ... (Seu método [HttpPost("webhook")] existente fica aqui) ...
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] MercadoPagoNotification notification)
    {
        // ... (código existente) ...
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

    /// <summary>
    /// Busca o histórico de doações aprovadas do usuário logado (self).
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(List<PagamentoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyDonations()
    {
        // 1. Pega o ID do usuário a partir do token JWT
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var doadorId))
        {
            return Unauthorized("Não foi possível identificar o usuário logado.");
        }

        // 2. Busca no banco de dados (igual ao seu código anterior)
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

    // === ADICIONE ESTE NOVO MÉTODO ===
    /// <summary>
    /// (Admin) Busca o histórico de doações de um usuário específico.
    /// </summary>
    [Authorize(Roles = "Administrador, Colaborador")] // Protegido para Admin/Colaborador
    [HttpGet("{userId}")] // Nova rota: api/Pagamento/{userId}
    [ProducesResponseType(typeof(List<PagamentoDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDonationsByUserId(int userId)
    {
        // 1. Verifica se o usuário (doador) existe
        var doadorExiste = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!doadorExiste)
        {
            return NotFound("Doador não encontrado.");
        }

        // 2. Busca as doações aprovadas para esse DoadorId
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

        return Ok(doacoes); // Retorna a lista (pode estar vazia)
    }
    // === FIM DO NOVO MÉTODO ===
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