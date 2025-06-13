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

        public async Task SendEmailAsync(string to, string subject, string body, Dictionary<string, byte[]>? attachments = null)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("The Enigma Casino", "theenigmacasino@gmail.com"));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var builder = new BodyBuilder
            {
                HtmlBody = body
            };

            if (attachments != null)
            {
                foreach (var attachment in attachments)
                {
                    builder.Attachments.Add(attachment.Key, attachment.Value);
                }
            }

            message.Body = builder.ToMessageBody();

            using var stream = new MemoryStream();
            message.WriteTo(stream);
            string rawMessage = Convert.ToBase64String(stream.ToArray())
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            var gmailMessage = new Message { Raw = rawMessage };
            await _gmailService.Users.Messages.Send(gmailMessage, "me").ExecuteAsync();
        }
    }
}