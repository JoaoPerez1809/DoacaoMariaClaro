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
        // Configura o Access Token em um lugar central
        MercadoPagoConfig.AccessToken = _config.GetValue<string>("MercadoPago:AccessToken");
    }

    [HttpPost("criar-preferencia")]
    public async Task<IActionResult> CriarPreferencia([FromBody] DoacaoRequestDto request)
    {
        try
        {
            // --- ALTERAÇÃO 1: Gerar um ID único para nossa referência ---
            var externalReference = Guid.NewGuid().ToString();

            var preferenceRequest = new PreferenceRequest
            {
                // --- ALTERAÇÃO 2: Enviar nossa referência para o Mercado Pago ---
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
                // --- ALTERAÇÃO 3: Salvar nossa referência no banco de dados ---
                ExternalReference = externalReference
            };
            _context.Pagamentos.Add(novoPagamento);
            await _context.SaveChangesAsync();

            return Ok(new { InitPoint = preference.InitPoint });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erro ao criar preferência de pagamento.", error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] MercadoPagoNotification notification)
    {
        if (notification?.Action == "payment.updated")
        {
            try
            {
                var client = new PaymentClient();
                Payment payment = await client.GetAsync(long.Parse(notification.Data.Id));

                // --- CORREÇÃO PRINCIPAL: Buscar usando a ExternalReference ---
                var pagamentoEmNossoDB = await _context.Pagamentos
                    .FirstOrDefaultAsync(p => p.ExternalReference == payment.ExternalReference);

                if (pagamentoEmNossoDB != null && pagamentoEmNossoDB.Status != "approved")
                {
                    pagamentoEmNossoDB.Status = payment.Status;
                    pagamentoEmNossoDB.MercadoPagoPaymentId = payment.Id;
                    pagamentoEmNossoDB.DataAtualizacao = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao processar webhook: {ex.Message}");
                return BadRequest();
            }
        }
        return Ok();
    }
}

// DTOs (podem ficar no mesmo arquivo ou separados)
public class DoacaoRequestDto { public decimal Valor { get; set; } }

public class MercadoPagoNotification
{
    [JsonPropertyName("action")] public string Action { get; set; }
    [JsonPropertyName("data")] public NotificationData Data { get; set; }
}

public class NotificationData { [JsonPropertyName("id")] public string Id { get; set; } }