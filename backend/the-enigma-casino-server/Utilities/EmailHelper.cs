using System.Net.Mail;
using System.Net;

namespace the_enigma_casino_server.Utilities;

public class EmailHelper
{
    private const string SMTP_HOST = "smtp.gmail.com";
    private const int SMTP_PORT = 587;
    private const string EMAIL_FROM = "theenigmacasino@gmail.com";
    private const string PASSWORD_EMAIL_FROM = "EMAIL_KEY";
    private const string USE_GMAIL_API = "USE_GMAIL_API";

    public static async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false, Dictionary<string, byte[]>? attachments = null)
    {
        string useGmail = Environment.GetEnvironmentVariable(USE_GMAIL_API)?.Trim().ToLower();
        if (useGmail == "true")
        {
            try
            {
                GmailApiHelper gmail = new GmailApiHelper("credentials.json", "tokens");
                await gmail.SendEmailAsync(to, subject, body, attachments);
                return;
            }
            catch (Exception ex)
            {
                Console.WriteLine("⚠️ Error con Gmail API. Intentando con SMTP...");
                Console.WriteLine($"  Error: {ex.Message}");
            }
        }

        string key = Environment.GetEnvironmentVariable(PASSWORD_EMAIL_FROM);

        if (string.IsNullOrWhiteSpace(key))
        {
            Console.WriteLine("❌ EMAIL_KEY no está configurado.");
            throw new InvalidOperationException("EMAIL_KEY no está configurado en variables de entorno.");
        }

        System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

        try
        {
            using SmtpClient client = new SmtpClient(SMTP_HOST, SMTP_PORT)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(EMAIL_FROM, key)
            };

            MailMessage mail = new MailMessage(EMAIL_FROM, to, subject, body)
            {
                IsBodyHtml = isHtml
            };

            if (attachments != null)
            {
                foreach (var kvp in attachments)
                {
                    var stream = new MemoryStream(kvp.Value);
                    var attachment = new Attachment(stream, kvp.Key);
                    mail.Attachments.Add(attachment);
                }
            }

            await client.SendMailAsync(mail);
            Console.WriteLine($"📧 Enviado por SMTP a {to}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Falló también por SMTP: {ex.Message}");
            throw;
        }
    }
}
