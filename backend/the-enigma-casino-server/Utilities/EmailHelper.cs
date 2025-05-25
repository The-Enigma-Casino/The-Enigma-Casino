using System.Net.Mail;
using System.Net;

namespace the_enigma_casino_server.Utilities;

public class EmailHelper
{
    private const string SMTP_HOST = "smtp.gmail.com";
    private const int SMTP_PORT = 587;
    private const string EMAIL_FROM = "theenigmacasino@gmail.com";
    private const string PASSWORD_EMAIL_FROM = "EMAIL_KEY";

    public static async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
    {
        string key = Environment.GetEnvironmentVariable(PASSWORD_EMAIL_FROM);

        if (string.IsNullOrWhiteSpace(key))
        {
            Console.WriteLine("❌ EMAIL_KEY is not configured.");
            throw new InvalidOperationException("EMAIL_KEY is not configured in environment variables.");
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

            await client.SendMailAsync(mail);

        }
        catch (SmtpException smtpEx)
        {
            Console.WriteLine($"  StatusCode: {smtpEx.StatusCode}");
            Console.WriteLine($"  Message: {smtpEx.Message}");
            Console.WriteLine($"  InnerException: {smtpEx.InnerException?.Message}");
            throw new Exception("Error al enviar el correo electrónico. Verifique las credenciales y la conexión.", smtpEx);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  Type: {ex.GetType()}");
            Console.WriteLine($"  Message: {ex.Message}");
            Console.WriteLine($"  StackTrace: {ex.StackTrace}");
            throw new Exception("Error al enviar el correo electrónico.", ex);
        }
    }
}
