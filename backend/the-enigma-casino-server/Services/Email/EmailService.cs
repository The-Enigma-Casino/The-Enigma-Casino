using System.Text;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Services.Blockchain;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Services.Email;

public class EmailService
{
    private readonly IWebHostEnvironment _env; 
    private readonly UnitOfWork _unitOfWork;
    private readonly BlockchainService _blockchainService;

    public EmailService(UnitOfWork unitOfWork, BlockchainService blockchainService, IWebHostEnvironment env)
    {
        _unitOfWork = unitOfWork;
        _blockchainService = blockchainService;
        _env = env;  
    }

    private async Task<string> GetEmailTemplateAsync(string templateName)
    {
        string templatePath = Path.Combine(_env.WebRootPath, "email-templates", templateName); 
        return await File.ReadAllTextAsync(templatePath);
    }

    public async Task SendEmailConfirmationAsync(User user)
    {
        string url = Environment.GetEnvironmentVariable("CLIENT_URL");

        string emailContent = await GetEmailTemplateAsync("email_confirmation.html");

        emailContent = emailContent.Replace("{UserName}", user.NickName);
        emailContent = emailContent.Replace("{ConfirmationLink}", $"{url}/auth/email-confirmation/{user.ConfirmationToken}");

        await EmailHelper.SendEmailAsync(user.Email, "Confirma tu cuenta", emailContent, true);
        Console.WriteLine("Email sent to: " + user.Email);
    }

    public async Task SendInvoiceAsync(Order order, User user)
    {
        string url = Environment.GetEnvironmentVariable("SERVER_URL");

        string emailContent = await GetEmailTemplateAsync("invoice.html");

        emailContent = emailContent.Replace("{UserName}", user.NickName);
        emailContent = emailContent.Replace("{OrderImage}", url + order.CoinsPack.Image);
        emailContent = emailContent.Replace("{OrderPack}", $"Pack de {order.Coins} fichas");
        emailContent = emailContent.Replace("{OrderPrice}", (order.Price / 100.0).ToString("0.00"));
        emailContent = emailContent.Replace("{OrderCoins}", order.Coins.ToString());
        emailContent = emailContent.Replace("{BillingAddress}", user.Address);

        if (order.PayMode == 0)
        {
            decimal ethPriceEuros = await _blockchainService.GetEthereumPriceInEurosAsync();
            decimal equivalentEth = (decimal)(order.Price / 100.0) / ethPriceEuros;

            emailContent = emailContent.Replace("{PaymentMethod}", "Ethereum");
            emailContent = emailContent.Replace("{EthereumPrice}", equivalentEth.ToString("0.000000"));
            emailContent = emailContent.Replace("{PaymentMethodSpecificInfo}", $"Precio total Ethereum: {equivalentEth} ETH");
        }
        else 
        {
            emailContent = emailContent.Replace("{PaymentMethod}", "Tarjeta de Crédito");
            emailContent = emailContent.Replace("{EthereumPrice}", string.Empty);  
            emailContent = emailContent.Replace("{PaymentMethodSpecificInfo}", string.Empty);  
        }

        await EmailHelper.SendEmailAsync(user.Email, "Confirmación de compra", emailContent, true);
        Console.WriteLine("Email sent to: " + user.Email);
    }

}

