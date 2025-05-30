using System.Text;
using the_enigma_casino_server.Application.Services.Blockchain;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Application.Services.Email;

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
        emailContent = emailContent.Replace("{ConfirmationLink}", $"{url.TrimEnd('/')}/auth/email-confirmation/{user.ConfirmationToken}");

        await EmailHelper.SendEmailAsync(user.Email, "Confirma tu cuenta", emailContent, true);
    }


    public async Task SendInvoiceAsync(Order order, User user)
    {
        string url = Environment.GetEnvironmentVariable("SERVER_URL");

        string emailContent = await GetEmailTemplateAsync("invoice.html");

        emailContent = emailContent.Replace("{UserName}", user.NickName);
        emailContent = emailContent.Replace("{OrderPack}", $"Pack de {order.Coins} fichas");
        emailContent = emailContent.Replace("{OrderPrice}", (order.Price / 100.0).ToString("0.00"));
        emailContent = emailContent.Replace("{OrderCoins}", order.Coins.ToString());

        if (order.PayMode == PayMode.Ethereum)
        {
            decimal ethPriceEuros = await _blockchainService.GetEthereumPriceInEurosAsync();
            decimal equivalentEth = Math.Round((decimal)(order.Price / 100.0) / ethPriceEuros, 6);

            emailContent = emailContent.Replace("{PaymentMethod}", "Ethereum");
            emailContent = emailContent.Replace("{PaymentMethodSpecificInfo}", $"Precio total Ethereum: {equivalentEth:0.000000} ETH");
        }
        else
        {
            emailContent = emailContent.Replace("{PaymentMethod}", "Tarjeta de Crédito");
            emailContent = emailContent.Replace("{PaymentMethodSpecificInfo}", "");
        }

        await EmailHelper.SendEmailAsync(user.Email, "Confirmación de compra", emailContent, true);
    }


    public async Task SendWithdrawalAsync(Order order, User user)
    {
        string url = Environment.GetEnvironmentVariable("SERVER_URL");

        string emailContent = await GetEmailTemplateAsync("withdrawal.html");

        decimal ethPriceEuros = await _blockchainService.GetEthereumPriceInEurosAsync();
        decimal equivalentEth = Math.Round((decimal)(order.Price / 100.0) / ethPriceEuros, 6);

        emailContent = emailContent.Replace("{UserName}", user.NickName);
        emailContent = emailContent.Replace("{OrderPrice}", (order.Price / 100.0).ToString("0.00"));
        emailContent = emailContent.Replace("{OrderCoins}", order.Coins.ToString());
        emailContent = emailContent.Replace("{PaymentMethod}", "Ethereum");
        emailContent = emailContent.Replace("{EthereumPrice}", $"{equivalentEth.ToString("0.000000")} ETH");

        await EmailHelper.SendEmailAsync(user.Email, "Confirmación de retirada", emailContent, true);

    }

    public async Task SendBannedEmailAsync(User user)
    {
        string emailContent = await GetEmailTemplateAsync("banned.html");

        emailContent = emailContent.Replace("{UserName}", user.NickName);

        string clientUrl = Environment.GetEnvironmentVariable("CLIENT_URL");
        string policyUrl = $"{clientUrl.TrimEnd('/')}/policies";

        emailContent = emailContent.Replace("{PolicyUrl}", policyUrl);

        await EmailHelper.SendEmailAsync(user.Email, "Cuenta suspendida", emailContent, true);
    }


    public async Task SendUnbannedEmailAsync(User user)
    {
        string emailContent = await GetEmailTemplateAsync("unban_notification.html");

        emailContent = emailContent.Replace("{UserName}", user.NickName);

        await EmailHelper.SendEmailAsync(user.Email, "Tu cuenta ha sido restaurada", emailContent, true);
    }


    public async Task SendAutoBanEmailAsync(User user)
    {
        string emailContent = await GetEmailTemplateAsync("autoban_notification.html");

        emailContent = emailContent.Replace("{UserName}", user.NickName);

        DateTime unbanDate = DateTime.UtcNow.AddDays(15);
        string formattedDate = unbanDate.ToString("dd/MM/yyyy");

        emailContent = emailContent.Replace("{UnbanDate}", formattedDate);

        await EmailHelper.SendEmailAsync(user.Email, "Autoexclusión activada", emailContent, true);
    }


}

