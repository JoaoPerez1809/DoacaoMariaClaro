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

    // ... (O seu método [HttpPost("criar-preferencia")] existentdae. Não precisa de o alterar.) ...
    [Authorize]
    [HttpPost("criar-preferencia")]
    public async Task<IActionResult> CriarPreferencia([FromBody] DoacaoRequestDto request)
    {
        try
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var frontendUrl = _config.GetValue<string>("FrontendUrl");
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
                Success = $"{frontendUrl}/doacao/sucesso",
                Failure = $"{frontendUrl}/doacao/falha",
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


    // ... (O seu método [HttpPost("webhook")] existente. Não precisa de o alterar.) ...
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

    // ... (O seu método [HttpGet("me")] existente. Não precisa de o alterar.) ...
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

    // ... (O seu método [HttpGet("{userId}")] existente. Não precisa de o alterar.) ...
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

    // ... (O seu método [HttpGet("relatorio-arrecadacao")] existente. Não precisa de o alterar.) ...
    [Authorize(Roles = "Administrador, Colaborador")]
    [HttpGet("relatorio-arrecadacao")]
    [ProducesResponseType(typeof(RelatorioArrecadacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRelatorioArrecadacao(
        [FromQuery] int ano, 
        [FromQuery] string tipo, 
        [FromQuery] int periodo 
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
                    int startMonthTrimestre = (periodo - 1) * 3 + 1; 
                    startDate = new DateTime(ano, startMonthTrimestre, 1);
                    endDate = startDate.AddMonths(3);
                    break;

                case "semestral":
                    if (periodo < 1 || periodo > 2) return BadRequest("Semestre inválido. Use 1-2.");
                    int startMonthSemestre = (periodo - 1) * 6 + 1; 
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
        
        var doacoesAprovadas = await _context.Pagamentos
            .Where(p => p.Status == "approved" && 
                        p.DataCriacao >= startDate.ToUniversalTime() && 
                        p.DataCriacao < endDate.ToUniversalTime())
            .ToListAsync();

        var relatorio = new RelatorioArrecadacaoDto
        {
            TotalArrecadado = doacoesAprovadas.Sum(p => p.Valor),
            TotalLiquido = doacoesAprovadas.Sum(p => p.ValorLiquido ?? 0), 
            TotalDoacoesAprovadas = doacoesAprovadas.Count 
        };

        return Ok(relatorio);
    }

    // ... (O seu método [HttpGet("anos-disponiveis")] existente. Não precisa de o alterar.) ...
    [Authorize(Roles = "Administrador, Colaborador")]
    [HttpGet("anos-disponiveis")]
    [ProducesResponseType(typeof(List<int>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAnosDisponiveis()
    {
        var anos = await _context.Pagamentos
            .Where(p => p.Status == "approved") 
            .Select(p => p.DataCriacao.Year) 
            .Distinct() 
            .OrderByDescending(ano => ano) 
            .ToListAsync();

        return Ok(anos);
    }

    // === MÉTODO ATUALIZADO (LISTA DE DOAÇÕES) ===
    /// <summary>
    /// (Admin) Lista todas as doações aprovadas de forma paginada E retorna os totais.
    /// </summary>
    [Authorize(Roles = "Administrador, Colaborador")]
    [HttpGet("lista-doacoes")]
    [ProducesResponseType(typeof(PagedDonationsResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetListaDoacoes(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10 
    )
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = _context.Pagamentos
            .Where(p => p.Status == "approved")
            .Include(p => p.Doador);

        // --- CORREÇÃO (LINQ TO OBJECTS) ---
        // 1. Trazemos todos os dados aprovados para a memória ANTES de sumarizar
        var todasDoacoesAprovadas = await query.ToListAsync();

        // 2. Agora calculamos os totais na memória (LINQ to Objects)
        var totalCount = todasDoacoesAprovadas.Count;
        var totalBruto = todasDoacoesAprovadas.Sum(p => p.Valor);
        var totalLiquido = todasDoacoesAprovadas.Sum(p => p.ValorLiquido ?? 0);
        // --- FIM DA CORREÇÃO ---

        // 3. Aplicamos a paginação e o Select na lista em memória
        var doacoes = todasDoacoesAprovadas
            .OrderByDescending(p => p.DataCriacao) 
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new DoacaoDetalhadaDto 
            {
                PagamentoId = p.Id,
                Valor = p.Valor,
                ValorLiquido = p.ValorLiquido, 
                Status = p.Status,
                DataCriacao = p.DataCriacao,
                DoadorId = p.DoadorId ?? 0,
                DoadorNome = p.Doador != null ? p.Doador.Nome : "Doador Anônimo/Excluído",
                DoadorEmail = p.Doador != null ? p.Doador.Email : "N/A"
            })
            .ToList(); // Note: .ToList() síncrono, não .ToListAsync()

        // 4. Monta o resultado com os totais
        var result = new PagedDonationsResult
        {
            Items = doacoes,
            TotalCount = totalCount,
            TotalArrecadadoBruto = totalBruto, 
            TotalArrecadadoLiquido = totalLiquido 
        };
        
        return Ok(result);
    }
}

// === DTOs (EXISTENTES) ===
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

public class RelatorioArrecadacaoDto
{
    public decimal TotalArrecadado { get; set; }
    public decimal TotalLiquido { get; set; } 
    public int TotalDoacoesAprovadas { get; set; } 
}


// === DTOs ATUALIZADOS (PARA LISTA DE DOAÇÕES) ===
public class DoacaoDetalhadaDto
{
    public int PagamentoId { get; set; }
    public decimal Valor { get; set; }
    public decimal? ValorLiquido { get; set; } 
    public string Status { get; set; }
    public DateTime DataCriacao { get; set; }
    public int DoadorId { get; set; }
    public string DoadorNome { get; set; }
    public string DoadorEmail { get; set; }
}

public class PagedDonationsResult
{
    public List<DoacaoDetalhadaDto> Items { get; set; } = new List<DoacaoDetalhadaDto>();
    public int TotalCount { get; set; }
    public decimal TotalArrecadadoBruto { get; set; }
    public decimal TotalArrecadadoLiquido { get; set; }
}