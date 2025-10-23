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
// 1. Adicionar using para Claims
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization; // Para [Authorize]

[ApiController]
[Route("api/[controller]")]
public class PagamentoController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDbContext _context;

    public PagamentoController(IConfiguration config, AppDbContext context)
    {
        _config = config;
        _context = context;
        MercadoPagoConfig.AccessToken = _config.GetValue<string>("MercadoPago:AccessToken");
    }

    // 2. Adicionar [Authorize] para garantir que apenas usuários logados chamem este método
    [Authorize]
    [HttpPost("criar-preferencia")]
    public async Task<IActionResult> CriarPreferencia([FromBody] DoacaoRequestDto request)
    {
        try
        {
            // --- 3. Obter o ID do usuário logado a partir do token JWT ---
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var doadorId))
            {
                // Se não conseguir obter o ID do token (inesperado se [Authorize] estiver ativo)
                return Unauthorized("Não foi possível identificar o usuário logado.");
            }
            // --- Fim da obtenção do ID ---

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
                Payer = new PreferencePayerRequest // Opcional: Pré-preencher dados do pagador
                {
                    // Você pode buscar o email/nome/documento do usuário 'doadorId' no banco
                    // e pré-preenchê-los aqui, se desejar. Ex:
                    // Email = User.FindFirst(ClaimTypes.Email)?.Value, // Se o email estiver no token
                    // Name = User.FindFirst(ClaimTypes.Name)?.Value, // Se o nome estiver no token
                },
                BackUrls = new PreferenceBackUrlsRequest
                {
                    Success = "http://localhost:3000/doacao/sucesso", // Lembre-se do ngrok para testes
                    Failure = "http://localhost:3000/doacao/falha",   // Lembre-se do ngrok para testes
                },
                NotificationUrl = _config.GetValue<string>("MercadoPago:WebhookUrl"), // URL pública
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
                // --- 4. Associar o ID do doador ao pagamento ---
                DoadorId = doadorId
                // --- Fim da associação ---
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

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] MercadoPagoNotification notification)
    {
        // ... (lógica do webhook permanece a mesma) ...
        // Agora, quando o webhook for executado, o 'pagamentoEmNossoDB'
        // já terá o DoadorId correto preenchido desde a criação.
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
                        .FirstOrDefaultAsync(p => p.ExternalReference == payment.ExternalReference);

                    if (pagamentoEmNossoDB != null)
                    {
                        pagamentoEmNossoDB.Status = payment.Status;
                        pagamentoEmNossoDB.MercadoPagoPaymentId = payment.Id;
                        pagamentoEmNossoDB.DataAtualizacao = DateTime.UtcNow;

                        if (payment.Payer?.Identification != null)
                        {
                            pagamentoEmNossoDB.PayerIdentificationType = payment.Payer.Identification.Type;
                            pagamentoEmNossoDB.PayerIdentificationNumber = payment.Payer.Identification.Number?.Replace(".", "").Replace("-", "");
                        }

                        await _context.SaveChangesAsync();

                        // A lógica opcional de atualizar User agora funcionará, pois DoadorId estará presente
                        // if (pagamentoEmNossoDB.Status == "approved" && pagamentoEmNossoDB.DoadorId.HasValue && ...) { ... }
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