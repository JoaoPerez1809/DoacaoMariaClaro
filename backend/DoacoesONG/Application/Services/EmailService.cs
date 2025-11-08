using Application.Interfaces;
using Microsoft.Extensions.Configuration; // Para ler o appsettings.json
using SendGrid; // Pacote que instalamos
using SendGrid.Helpers.Mail; // Pacote que instalamos
using System;
using System.Threading.Tasks;

namespace Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string plainTextContent, string htmlContent)
        {
            // 1. Pega a API Key do appsettings.json
            var apiKey = _config.GetValue<string>("SendGrid:ApiKey");
            if (string.IsNullOrEmpty(apiKey))
            {
                // Loga um erro, mas não quebra a aplicação
                Console.WriteLine("[ERRO SendGrid] API Key do SendGrid não está configurada no appsettings.json.");
                return; // Para a execução
            }

            var client = new SendGridClient(apiKey);

            // 2. Define o REMETENTE (DEVE ser o e-mail que você verificou!)
            // Coloque aqui o e-mail que você acabou de verificar no SendGrid
            var from = new EmailAddress("joaoperez1809@gmail.com", "Instituto Maria Claro");
            
            // 3. Define o Destinatário (quem receberá o e-mail)
            var to = new EmailAddress(toEmail, toName);

            // 4. Cria a mensagem
            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);

            // 5. Envia o e-mail
            var response = await client.SendEmailAsync(msg);

            // 6. Loga o resultado (você pode ver isso no seu terminal do backend)
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[SendGrid] E-mail de '{subject}' enviado com sucesso para {toEmail}.");
            }
            else
            {
                // Loga a falha
                Console.WriteLine($"[ERRO SendGrid] Falha ao enviar e-mail para {toEmail}: {response.StatusCode} - {await response.Body.ReadAsStringAsync()}");
            }
        }
    }
}