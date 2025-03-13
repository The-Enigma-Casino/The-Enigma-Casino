import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import MetaMaskLogo from "@metamask/logo";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import { $selectedCard } from "../../catalog/store/catalogStore";
import { fetchTransactionEthereumFx, verifyTransactionEthereumFx } from "../actions/ethereumActions";
import { $transactionData, $verifyTransactionData, $loading, $error, $transactionEnd, setLoading, setError, setTransactionEnd, $paymentStatus, $paymentError } from "../store/EthereumStore";
import { fetchLastOrderFx } from "../actions/orderActions";
import toast from "react-hot-toast";

const Ethereum: React.FC = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<string | null>(null);
  const token = useUnit($token);
  const coinCard = useUnit($selectedCard);
  const orderPackId = coinCard?.id;
  const transactionData = useUnit($transactionData);
  const verifyTransactionData = useUnit($verifyTransactionData);
  const loading = useUnit($loading);
  const error = useUnit($error);
  const transactionEnd = useUnit($transactionEnd)
  const logoRef = useRef<HTMLDivElement | null>(null);
  const paymentStatus = useUnit($paymentStatus);
  const paymentError = useUnit($paymentError);
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

  // Solicita API precio packFichas
  useEffect(() => {
    if (orderPackId && token) {
      fetchTransactionEthereumFx({ packId: orderPackId, token });
    }
  }, [orderPackId, token]);

  // Flujo completo
  const handleComplete = async () => {
    try {
      if (!window.ethereum?.isMetaMask) {
        toast.error(
          <span>
            MetaMask no está instalado en su navegador.{"  "}
            <a
              href="https://metamask.io/" //Enlace Chrome Metamask
              className="text-[var(--Principal)] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instalar MetaMask
            </a>
            <br />
            Volviendo al catálogo...
          </span>
        );
        setTimeout(() => {
          navigate("/catalog");
        }, 3000);
        return;
      }

      setLoading(true);

      // Conectar la wallet
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.requestAccounts();

      if (accounts.length === 0) {
        toast.error("No tienes cuenta en Metamask. Redirigiendo al catálogo...");
        setTimeout(() => {
          navigate("/catalog");
        }, 3000);
        return;
      }

      const connectedWallet = accounts[0];
      setWallet(connectedWallet);

      if (!transactionData) {
        toast.error("Datos de transacción no disponibles. Redirigiendo al carrito...");
        setTimeout(() => {
          navigate("/catalog");
        }, 3000);
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

      const verifyData = {
        txHash,
        wallet: connectedWallet,
        transactionData,
        packId: orderPackId,
        token,
      };

      const order = await verifyTransactionEthereumFx(verifyData);
      if (order && order.id) {
        setTransactionEnd(true);
      } else {
        setError("La transacción no es válida.");
      }

      if (paymentStatus === "paid") {
        console.log(paymentStatus);
        console.log("✅ Pago confirmado, redirigiendo...");
        fetchLastOrderFx();
        navigate("/payment-confirmation?pagado=true");
      } else if (paymentError) {
        console.log("❌ Error en el pago, redirigiendo...");
        navigate("/payment-confirmation?error=true");
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

  useEffect(() => {
    if (verifyTransactionData && verifyTransactionData.id) {
      setTransactionEnd(true);
    }
  }, [verifyTransactionData]);

  return (
    <div className="flex flex-col items-center max-w-md mx-auto mt-12 p-5 text-center text-white border-2 rounded-2xl border-Principal w-[30rem] h-[30rem] relative">

      <img src="/img/backgroundETH.webp" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-5xl font-bold">Pagar con Ethereum</h1>

        <div className="flex justify-center items-center my-5" ref={logoRef}></div>

        {loading && <p className="text-lg">Procesando pago...</p>}
        {transactionEnd && <p className="text-green-500">Transacción completada con éxito</p>}

        {transactionData ? (
          <div className="my-5 text-3xl">
            <p>{transactionData.totalEuros.toFixed(2).replace(".", ",")} €</p>
            <p className="flex items-center justify-center gap-2">
              {transactionData.equivalentEthereum} ETH
              <img src="/icon/ethereum.svg" className="w-6 h-6" alt="Ethereum logo" />
            </p>
            <button
              onClick={handleComplete}
              className="mt-4 px-6 py-2 bg-Principal hover:bg-Green-lines text-white font-semibold rounded-lg transition"
            >
              Completar pago
            </button>
          </div>
        ) : (
          <p className="text-lg">Obteniendo datos de la transacción...</p>
        )}
      </div>
    </div>
  );
};

export default Ethereum;
