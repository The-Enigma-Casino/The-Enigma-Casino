using Spire.Doc;
using System.Globalization;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;

namespace the_enigma_casino_server.Application.Services.Invoices;

public class InvoiceGenerator : IInvoiceGenerator
{
    private readonly IWebHostEnvironment _env;

    public InvoiceGenerator(IWebHostEnvironment env)
    {
        _env = env;
    }

    public byte[] GeneratePurchaseInvoice(Order order)
    {
        string templatePath = Path.Combine(_env.ContentRootPath, "Templates", "factura_compra_enigma.docx");

        var doc = new Document();
        doc.LoadFromFile(templatePath);

        string[] fields = new[]
        {
            "User.FullName", 
            "PaidDate", 
            "Id",
            "Coins", 
            "PricePerChip", 
            "Price", 
            "PayMode",
            "EthereumTransactionHash"
        };

        string payModeChange = order.PayMode switch
        {
            PayMode.CreditCard => "Tarjeta de Crédito",
            PayMode.Ethereum => "Ethereum",
            _ => order.PayMode.ToString()
        };

        string[] values = new[]
        {
            order.User.FullName,
            order.PaidDate.ToString("dd/MM/yyyy"),
            order.Id.ToString(),
            order.Coins.ToString(),
            (order.Price / 100.0m / order.Coins).ToString("0.00", CultureInfo.InvariantCulture), 
            (order.Price / 100.0m).ToString("0.00", CultureInfo.InvariantCulture),               
            payModeChange,
            order.PayMode == PayMode.Ethereum ? order.EthereumTransactionHash : ""
        };

        doc.MailMerge.Execute(fields, values);

        using var ms = new MemoryStream();
        doc.SaveToStream(ms, FileFormat.PDF);
        return ms.ToArray();
    }
}
