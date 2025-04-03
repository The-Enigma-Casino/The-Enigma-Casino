using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;


namespace the_enigma_casino_server.Services.Blockchain;

public class EthereumService
{
    private const int POLLY_INTERVAL_MS = 1000;
    private const int GAS = 30_000;
    private const int TRANSACTION_SUCCESS_STATUS = 1;

    private readonly string _networkUrl;
    private readonly Web3 _web3;

    public EthereumService(string networkUrl)
    {
        _networkUrl = networkUrl;
        _web3 = new Web3(networkUrl);
        _web3.TransactionReceiptPolling.SetPollingRetryIntervalInMilliseconds(POLLY_INTERVAL_MS);
    }

    public BigInteger ToWei(decimal amount)
    {
        return Web3.Convert.ToWei(amount);
    }

    public HexBigInteger GetGas()
    {
        return new HexBigInteger(GAS);
    }

    public async Task<HexBigInteger> GetGasPriceAsync()
    {
        return await _web3.Eth.GasPrice.SendRequestAsync();
    }

    public async Task<bool> CheckTransactionAsync(string txHash, string from, string to, string value)
    {
        bool result;

        string ethNetworkUrl = Environment.GetEnvironmentVariable("NETWORKURL");
        if (string.IsNullOrEmpty(ethNetworkUrl))
        {
            throw new InvalidOperationException("La variable de entorno 'NETWORKURL' no está configurada.");
        }
        try
        {
            Transaction transaction = await _web3.Eth.Transactions.GetTransactionByHash.SendRequestAsync(txHash);
            TransactionReceipt txReceipt = await _web3.TransactionReceiptPolling.PollForReceiptAsync(txHash);

            result = txReceipt.Status.Value == TRANSACTION_SUCCESS_STATUS
                && Equals(transaction.From, from)
                && Equals(transaction.To, to)
                && Equals(transaction.Value.HexValue, value);
        }
        catch (Exception ex)
        {
            result = false;
        }

        return result;
    }

    private bool Equals(string hex1, string hex2)
    {
        return hex1.Equals(hex2, StringComparison.OrdinalIgnoreCase);
    }


    public Task<TransactionReceipt> CreateTransactionAsync(string fromPrivateKey, string to, decimal ethereums)
    {
        Account account = new Account(fromPrivateKey);
        Web3 web3 = new Web3(account, _networkUrl);

        return web3.Eth.GetEtherTransferService().TransferEtherAndWaitForReceiptAsync(to, ethereums, gas: GetGas());
    }

}
