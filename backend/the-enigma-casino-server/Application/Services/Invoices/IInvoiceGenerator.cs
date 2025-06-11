using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Application.Services.Invoices;

public interface IInvoiceGenerator
{
    byte[] GeneratePurchaseInvoice(Order order);
}
