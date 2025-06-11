using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Application.Services.Invoices;

public interface IWithdrawalInvoiceGenerator
{
    byte[] GenerateWithdrawalInvoice(OrderWithdrawalDto dto, User user);
}
