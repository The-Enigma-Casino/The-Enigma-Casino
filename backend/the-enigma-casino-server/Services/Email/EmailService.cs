using System.Text;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services.Blockchain;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Services.Email;

public class EmailService
{
    private readonly UnitOfWork _unitOfWork;
    private readonly BlockchainService _blockchainService;

    public EmailService(UnitOfWork unitOfWork, BlockchainService blockchainService)
    {
        _unitOfWork = unitOfWork;
        _blockchainService = blockchainService;
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

    public async Task SendInvoiceAsync(Order order, User user)
    {
        string url = Environment.GetEnvironmentVariable("SERVER_URL");

        // HTML
        StringBuilder emailContent = new StringBuilder();

        emailContent.AppendLine("<html>");
        emailContent.AppendLine("<head>");
        emailContent.AppendLine("<style>");
        emailContent.AppendLine("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        emailContent.AppendLine("* { color: #000 !important; }"); 
        emailContent.AppendLine("h2 { color: #74c410 !important; }");
        emailContent.AppendLine("table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        emailContent.AppendLine("table, th, td { border: 1px solid #ddd; }");
        emailContent.AppendLine("th, td { text-align: left; padding: 8px; }");
        emailContent.AppendLine("th { background-color: #f4f4f4; }");
        emailContent.AppendLine("tr:nth-child(even) { background-color: #f9f9f9; }");
        emailContent.AppendLine("p { margin: 10px 0; }");
        emailContent.AppendLine(".total { font-size: 1.2em; font-weight: bold; color: #333; }");
        emailContent.AppendLine("</style>");
        emailContent.AppendLine("</head>");
        emailContent.AppendLine("<body>");
        emailContent.AppendLine("<h2>¡Gracias por tu compra, " + user.NickName + "!</h2>");
        emailContent.AppendLine("<p>Confirmación de compra:</p>");

        emailContent.AppendLine("<table>");
        emailContent.AppendLine("<tr>");
        emailContent.AppendLine("<th>Imagen</th>");
        emailContent.AppendLine("<th>Nombre</th>");
        emailContent.AppendLine("<th>Precio Total</th>");
        emailContent.AppendLine("<th>Cantidad de fichas</th>");
        emailContent.AppendLine("</tr>");

        double price = (order.Price / 100.0);

        emailContent.AppendLine("<tr>");
        emailContent.AppendLine($"<td><img src='{url + order.CoinsPack.Image}' alt='Pack de fichas' style='width:100px; border-radius:5px;' /></td>");
        emailContent.AppendLine($"<td>Pack de {order.Coins} fichas</td>");
        emailContent.AppendLine($"<td>{(decimal)price}€</td>");
        emailContent.AppendLine($"<td>{order.Coins}</td>");
        emailContent.AppendLine("</tr>");

        emailContent.AppendLine("</table>");

        emailContent.AppendLine("<p class='total'><b>Total pagado:</b> " + price +  " €</p>");

        if (order.PayMode == 0)
        {
            decimal ethPriceEuros = await _blockchainService.GetEthereumPriceInEurosAsync();
            decimal equivalentEth = (decimal)price / ethPriceEuros;
            emailContent.AppendLine("<p>Pagado con: Ethereum</p>");
            emailContent.AppendLine($"<p>Precio total Ethereum: <b>{equivalentEth.ToString("0.000000")} ETH</b></p>");
        }
        else
        {
            emailContent.AppendLine("<p>Pagado con: Tarjeta de Crédito</p>");
        }

        emailContent.AppendLine("<p>Su dirección de facturación: <strong>" + user.Address + "</strong></p>");

        emailContent.AppendLine("<br/>");
        emailContent.AppendLine("<div class='footer'>");
        emailContent.AppendLine("<p>© 2024 The Enigma Casino. Todos los derechos reservados.</p>");
        emailContent.AppendLine("</div>");

        emailContent.AppendLine("</body>");
        emailContent.AppendLine("</html>");

        await EmailHelper.SendEmailAsync(user.Email, "Confirmación de compra", emailContent.ToString(), true);
    }

}
