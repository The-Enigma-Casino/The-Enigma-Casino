﻿using System.Globalization;
using System.Numerics;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;
using Stripe.Climate;
using the_enigma_casino_server.Application.Dtos.BlockchainDtos;


namespace the_enigma_casino_server.Application.Services.Blockchain;

public class BlockchainService
{
    public async Task<EthereumTransaction> GetEthereumInfoAsync(CreateTransactionRequest data)
    {
        CryptoCompareApi cryptoCompareApi = new CryptoCompareApi();
        EthereumService ethereumService = new EthereumService(data.NetworkUrl);

        decimal ethEurPrice = await cryptoCompareApi.GetEthereumPriceAsync();
        BigInteger value = ethereumService.ToWei(data.Euros / ethEurPrice);
        HexBigInteger gas = ethereumService.GetGas();
        HexBigInteger gasPrice = await ethereumService.GetGasPriceAsync();

        if (string.IsNullOrEmpty(data.NetworkUrl))
        {
            throw new ArgumentNullException(nameof(data.NetworkUrl), "La URL de la red es nula o está vacía.");
        }

        string walletAddress = Environment.GetEnvironmentVariable("METAMASK_WALLET");
        if (string.IsNullOrEmpty(walletAddress))
        {
            throw new InvalidOperationException("La variable de entorno 'METAMASK_WALLET' no está configurada.");
        }

        Web3 web3 = new Web3(data.NetworkUrl);
        return new EthereumTransaction
        {
            To = walletAddress,
            Value = new HexBigInteger(value).HexValue,
            Gas = gas.HexValue,
            GasPrice = gasPrice.HexValue,
        };
    }
    public async Task<decimal> GetEthereumPriceInEurosAsync()
    {
        CryptoCompareApi cryptoCompareApi = new CryptoCompareApi();

        return await cryptoCompareApi.GetEthereumPriceAsync();
    }

    public Task<bool> CheckTransactionAsync(CheckTransactionRequest data)
    {

        string ethNetworkUrl = Environment.GetEnvironmentVariable("NETWORKURL");
        if (string.IsNullOrEmpty(ethNetworkUrl))
        {
            throw new InvalidOperationException("La variable de entorno 'NetworkUrl' no está configurada.");
        }

        string walletAddress = Environment.GetEnvironmentVariable("METAMASK_WALLET");
        if (string.IsNullOrEmpty(walletAddress))
        {
            throw new InvalidOperationException("La variable de entorno 'METAMASK_WALLET' no está configurada.");
        }
        data.To = walletAddress;

        EthereumService ethereumService = new EthereumService(ethNetworkUrl);

        return ethereumService.CheckTransactionAsync(data.Hash, data.From, data.To, data.Value);
    }

    //RETIRADA
    public async Task<(TransactionDto transaction, decimal ethereums)> CreateTransactionAsync(WithdrawalCreateTransactionRequest data, int userId)
    {

        string networkUrl = Environment.GetEnvironmentVariable("NETWORKURL");
        if (string.IsNullOrEmpty(networkUrl))
        {
            throw new InvalidOperationException("La variable de entorno 'NETWORKURL' no está configurada.");
        }

        string fromPrivateKey = Environment.GetEnvironmentVariable("METAMASK_PRIVATE_WALLET");

        if (string.IsNullOrEmpty(fromPrivateKey))
        {
            throw new InvalidOperationException("La variable de entorno 'METAMASK_PRIVATE_WALLET' no está configurada.");
        }

        if (data.CoinsWithdrawal <= 0)
        {
            throw new ArgumentException("El número de fichas a retirar debe ser mayor que 0.", nameof(data.CoinsWithdrawal));
        }

        EthereumService ethereumService = new EthereumService(networkUrl);
        decimal ethereums = await ConvertCoinsToEthereumAsync(data.CoinsWithdrawal);

        try
        {
            TransactionReceipt txReceipt = await ethereumService.CreateTransactionAsync(fromPrivateKey, data.To, ethereums);

            var transactionDto = new TransactionDto
            {
                Hash = txReceipt.TransactionHash,
                Success = txReceipt.Succeeded()
            };

            return (transactionDto, ethereums);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Error al procesar la transacción en la blockchain.", ex);
        }
    }

    public decimal ConvertCoinsToEuros(int coins)
    {
        string coinValueStr = Environment.GetEnvironmentVariable("COIN_VALUE_IN_EUROS");

        if (string.IsNullOrEmpty(coinValueStr) ||
            !decimal.TryParse(coinValueStr, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal coinValueInEuros))
        {
            throw new InvalidOperationException("La variable de entorno 'COIN_VALUE_IN_EUROS' no está configurada correctamente.");
        }

        decimal euros = coins * coinValueInEuros;
        return euros;
    }


    public async Task<decimal> ConvertCoinsToEthereumAsync(int coins)
    {
        string coinValueStr = Environment.GetEnvironmentVariable("COIN_VALUE_IN_EUROS");

        if (string.IsNullOrEmpty(coinValueStr) ||
            !decimal.TryParse(coinValueStr, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal coinValueInEuros))
        {
            throw new InvalidOperationException("La variable de entorno 'COIN_VALUE_IN_EUROS' no está configurada correctamente.");
        }

        decimal euros = ConvertCoinsToEuros(coins);

        decimal ethEurPrice = await GetEthereumPriceAsync();

        decimal ethereums = euros / ethEurPrice;

        return ethereums;
    }

    public async Task<ConvertWithdrawalDto> ConvertWithdrawal(int coins)
    {
        decimal totalEthereum = await ConvertCoinsToEthereumAsync(coins);
        decimal totalEuros = ConvertCoinsToEuros(coins);

        return new ConvertWithdrawalDto
        {
            TotalEthereum = totalEthereum,
            TotalEuros = totalEuros
        };
    }

    private Task<decimal> GetEthereumPriceAsync()
    {
        CryptoCompareApi cryptoCompareApi = new CryptoCompareApi();

        return cryptoCompareApi.GetEthereumPriceAsync();
    }
}

