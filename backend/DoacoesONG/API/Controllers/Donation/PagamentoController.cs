using MercadoPago.Config;
using MercadoPago.Client.Common;
using MercadoPago.Client.Payment;
using MercadoPago.Client.Preference;
using MercadoPago.Resource.Payment; // Importante ter este
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
using System.Collections.Generic; // Para List

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
                
                // --- BLOCO 'PaymentMethods' REMOVIDO DAQUI ---
                // Por padrão, o Mercado Pago incluirá todos os meios de
                // pagamento ativos na sua conta, incluindo PIX.

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
                // ValorLiquido e TipoPagamento serão preenchidos pelo Webhook
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
        if (notification?.Topic == "payment" && !string.IsNullOrEmpty(notification.ResourceUrl))
        {
            try
            {
                var paymentIdString = notification.ResourceUrl.Split('/').LastOrDefault();
                if (long.TryParse(paymentIdString, out long paymentId))
                {
                    var client = new PaymentClient();
                    Payment payment = await client.GetAsync(paymentId); // Busca o pagamento completo

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

                        // --- Esta lógica está correta e vai funcionar ---
                        
                        // Captura o tipo de pagamento (ex: "pix", "credit_card", "ticket")
                        pagamentoEmNossoDB.TipoPagamento = payment.PaymentTypeId;

                        // Captura o valor líquido (quanto a ONG realmente recebeu)
                        if (payment.TransactionDetails != null)
                        {
                            pagamentoEmNossoDB.ValorLiquido = payment.TransactionDetails.NetReceivedAmount;
                        }
                        // --- Fim da lógica ---

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