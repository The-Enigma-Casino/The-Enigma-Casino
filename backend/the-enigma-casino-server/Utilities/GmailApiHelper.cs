using Google.Apis.Auth.OAuth2;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using MimeKit;

namespace the_enigma_casino_server.Utilities
{
    public class GmailApiHelper
    {
        private readonly GmailService _gmailService;

        public GmailApiHelper(string credentialsPath, string tokenPath)
        {
            UserCredential credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                GoogleClientSecrets.FromFile(credentialsPath).Secrets,
                new[] { GmailService.Scope.GmailSend },
                "user",
                CancellationToken.None,
                new FileDataStore(tokenPath, true)
            ).Result;

            _gmailService = new GmailService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "The Enigma Casino"
            });
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            MimeMessage message = new MimeMessage();
            message.From.Add(new MailboxAddress("The Enigma Casino", "theenigmacasino@gmail.com"));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = body };

            using MemoryStream stream = new MemoryStream();
            message.WriteTo(stream);
            var rawMessage = Convert.ToBase64String(stream.ToArray())
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            Message gmailMessage = new Message { Raw = rawMessage };
            await _gmailService.Users.Messages.Send(gmailMessage, "me").ExecuteAsync();

            Console.WriteLine($"📧 Correo enviado con Gmail API a {to}");
        }
    }
}
