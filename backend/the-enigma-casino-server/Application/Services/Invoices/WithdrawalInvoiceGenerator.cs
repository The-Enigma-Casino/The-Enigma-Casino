using Spire.Doc;
using System.Globalization;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Services.Invoices;
using the_enigma_casino_server.Core.Entities;

public class WithdrawalInvoiceGenerator : IWithdrawalInvoiceGenerator
{
    private readonly IWebHostEnvironment _env;

    public WithdrawalInvoiceGenerator(IWebHostEnvironment env)
    {
        _env = env;
    }

    public byte[] GenerateWithdrawalInvoice(OrderWithdrawalDto dto, User user)
    {
        string templatePath = Path.Combine(_env.ContentRootPath, "Templates", "factura_retirada_enigma.docx");

        var doc = new Document();
        doc.LoadFromFile(templatePath);

        string formattedDate = dto.PaidDate.ToString("dd-MM-yyyy");
        string sanitizedUser = user.FullName
            .Replace(" ", "_")
            .Replace("á", "a").Replace("é", "e").Replace("í", "i")
            .Replace("ó", "o").Replace("ú", "u").Replace("ñ", "n");

        string[] fields = new[]
        {
            "FullName",
            "PaidDate",
            "Id",
            "Coins",
            "Price",
            "PayMode",
            "EthereumPrice",
            "EthereumTransactionHash"
        };

        string[] values = new[]
        {
            user.FullName,
            dto.PaidDate.ToString("dd/MM/yyyy"),
            dto.Id.ToString(),
            dto.Coins.ToString(),
            (dto.Price / 100.0m).ToString("0.00", CultureInfo.InvariantCulture),
            "Ethereum",
            dto.EthereumPrice.ToString("0.000000", CultureInfo.InvariantCulture),
            dto.EthereumTransactionHash
        };

        doc.MailMerge.Execute(fields, values);

        using var ms = new MemoryStream();
        doc.SaveToStream(ms, FileFormat.PDF);
        return ms.ToArray();
    }
}
