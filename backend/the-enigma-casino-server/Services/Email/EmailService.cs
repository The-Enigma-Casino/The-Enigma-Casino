using System.Text;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Services.Email;

public class EmailService
{
    private readonly UnitOfWork _unitOfWork;

    public EmailService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SendEmailConfirmationAsync(User user)
    {
        string url = Environment.GetEnvironmentVariable("CLIENT_URL");

        StringBuilder emailContent = new StringBuilder();

        emailContent.AppendLine("<html>");
        emailContent.AppendLine("<head>");
        emailContent.AppendLine("<style>");
        emailContent.AppendLine("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        emailContent.AppendLine("h2 { color: #74c410; }");
        emailContent.AppendLine("</style>");
        emailContent.AppendLine("</head>");
        emailContent.AppendLine("<body>");
        emailContent.AppendLine("<h2>¡Gracias por registrarte, " + user.NickName + "!</h2>");
        emailContent.AppendLine("<p>Haz clic en el siguiente enlace para confirmar tu dirección de correo electrónico:</p>");

        // Enlace de confirmación
        string confirmationLink = $"{url}/auth/email-confirmation/{user.ConfirmationToken}"; //Llamar al front y que acepte el endpoint

        emailContent.AppendLine($"<a href='{confirmationLink}'>Confirmar mi correo electrónico</a>");

        emailContent.AppendLine("</body>");
        emailContent.AppendLine("</html>");

        // Enviar el email
        await EmailHelper.SendEmailAsync(user.Email, "Confirma tu cuenta", emailContent.ToString(), true);
    }
}
