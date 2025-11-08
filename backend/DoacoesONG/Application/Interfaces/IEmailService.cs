using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IEmailService
    {
        /// <summary>
        /// Envia um e-mail usando o SendGrid.
        /// </summary>
        /// <param name="toEmail">E-mail do destinatário.</param>
        /// <param name="toName">Nome do destinatário.</param>
        /// <param name="subject">Assunto do e-mail.</param>
        /// <param name="plainTextContent">Conteúdo em texto puro (para compatibilidade).</param>
        /// <param name="htmlContent">Conteúdo em HTML (o e-mail bonito).</param>
        Task SendEmailAsync(string toEmail, string toName, string subject, string plainTextContent, string htmlContent);
    }
}