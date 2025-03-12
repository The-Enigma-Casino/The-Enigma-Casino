import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import MetaMaskLogo from "@metamask/logo";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import { ETHEREUM_PAYMENT_CHECK, ETHEREUM_CHECK_TRANSACTION } from "../../../config";
import { $selectedCard } from "../../catalog/store/catalogStore";

interface TransactionData {
  totalEuros: number;
  equivalentEthereum: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
}

const Ethereum: React.FC = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionEnd, setTransactionEnd] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const coinCard = useUnit($selectedCard); //Contiene ID de coins
  const orderPackId = coinCard.id;

  const token = useUnit($token);


  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement | null>(null);

  const fetchTransactionData = async (orderPackId: number, token: string) => {
    try {
      const response = await fetch(ETHEREUM_CHECK_TRANSACTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coinsPackId: orderPackId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la API: ${errorText}`);
      }

      return await response.json();
    } catch (err: unknown) {
      console.error("Error al obtener datos de transacción:", err);
      throw err;
    }
  };


  const verifyTransaction = async (txHash: string, wallet: string, transactionData: TransactionData, token: string) => {
    try {
      const response = await fetch(ETHEREUM_PAYMENT_CHECK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hash: txHash,
          from: wallet,
          to: transactionData.to,
          value: transactionData.value,
          coinsPackId: orderPackId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en la API (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      if (data && data.id) {
        console.log("Respuesta de la API (OrderDto):", data);
        return data;
      } else {
        throw new Error("La transacción no es válida.");
      }
    } catch (err) {
      console.error("Error al verificar la transacción:", err);
      throw err;
    }
  };

  // Logo de MetaMask
  useEffect(() => {
    const viewer = MetaMaskLogo({
      pxNotRatio: true,
      width: 100,
      height: 100,
      followMouse: true,
      slowDrift: true,
    });

    if (logoRef.current) {
      logoRef.current.appendChild(viewer.container);
    }
    return () => {
      viewer.stopAnimation();
    };
  }, []);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        if (orderPackId && token) {
          setLoading(true);
          const data = await fetchTransactionData(orderPackId, token);
          setTransactionData(data);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [orderPackId, token]);

  const handleComplete = async () => {
    try {
      if (!window.ethereum?.isMetaMask) {
        setError("MetaMask no está instalado en tu navegador. Redirigiendo al carrito...");
        navigate("/cart");
        return;
      }

      setLoading(true);

      // Conectar la wallet
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.requestAccounts();

      if (accounts.length === 0) {
        setError("No tienes cuenta en Metamask. Redirigiendo al carrito...");
        navigate("/cart");
        return;
      }

      const connectedWallet = accounts[0];
      setWallet(connectedWallet);

      if (!transactionData) {
        setError("Datos de transacción no disponibles. Redirigiendo al carrito...");
        navigate("/cart");
        return;
      }

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: connectedWallet,
            to: transactionData.to,
            value: transactionData.value,
            gas: transactionData.gas,
            gasPrice: transactionData.gasPrice,
          },
        ],
      });

      // Verificar la transacción
      const order = await verifyTransaction(txHash, connectedWallet, transactionData, token);
      console.log("order", order)
      if (order && order.id) {
        setTransactionEnd(true);
      } else {
        setError("La transacción no es válida.");
      }
    } catch (error) {
      if (error.message.includes("MetaMask Tx Signature: User denied transaction signature")) {
        setError("La transacción fue rechazada por el usuario.");
      } else {
        setError("Hubo un error con la transacción. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-md mx-auto mt-12 p-5 text-center text-white border-4 rounded-md">
      <h1 className="text-xl font-bold">Pagar con Ethereum</h1>

      <div className="my-5" ref={logoRef}></div>

      {loading && <p className="text-lg">Procesando pago...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {transactionEnd && <p className="text-green-500">Transacción completada con éxito</p>}

      {transactionData ? (
        <div className="my-5 text-2xl">
          <p>{transactionData.totalEuros.toFixed(2).replace(".", ",")} €</p>
          <p className="flex items-center justify-center gap-2">
            {transactionData.equivalentEthereum} ETH
            <img src="/icon/ethereum.svg" className="w-6 h-6" alt="Ethereum logo" />
          </p>
          <button
            onClick={handleComplete}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            Completar pago
          </button>
        </div>
      ) : (
        <p className="text-lg">Obteniendo datos de la transacción...</p>
      )}
    </div>

  );
};

export default Ethereum;
