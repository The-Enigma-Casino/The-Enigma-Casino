import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import MetaMaskLogo from "@metamask/logo";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import { $selectedCard } from "../../catalog/store/catalogStore";
import { fetchTransactionEthereumFx, verifyTransactionEthereumFx } from "../actions/ethereumActions";
import { $transactionData, $verifyTransactionData, $loading, $error, $transactionEnd, setLoading, setTransactionEnd, $paymentStatus, $paymentError, resetTransactionData, resetError } from "../store/EthereumStore";
import { fetchLastOrderFx } from "../actions/orderActions";
import toast from "react-hot-toast";
import Button from "../../../components/ui/button/Button";

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

  useEffect(() => {
    return () => {
      resetTransactionData()
      setTransactionEnd(false);
      setLoading(false);
      resetError();
    };
  }, []);

  // Solicita API precio packFichas
  useEffect(() => {
    if (orderPackId && token) {
      fetchTransactionEthereumFx({ packId: orderPackId, token });
    }
  }, [orderPackId, token]);


  // Redirección
  const redirectToCatalog = () => {
    setTimeout(() => {
      navigate("/catalog");
    }, 3000);
  };


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
        redirectToCatalog();
        return;
      }

      setLoading(true);

      // Conectar la wallet
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.requestAccounts();

      if (accounts.length === 0) {
        toast.error("No tienes cuenta en Metamask. Redirigiendo al catálogo...");
        redirectToCatalog();
        return;
      }

      const connectedWallet = accounts[0];
      setWallet(connectedWallet);

      if (!transactionData) {
        toast.error("Datos de transacción no disponibles. Redirigiendo al carrito...");
        redirectToCatalog();
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
        if (order.isPaid) {
          toast.success("Pago confirmado, redirigiendo...");
          fetchLastOrderFx();
          setTimeout(() => {
            navigate("/payment-confirmation?pagado=true");
          }, 3000);
        } else {
          toast.error("Error en el pago, redirigiendo...");
          setTimeout(() => {
            navigate("/payment-confirmation?error=true");
          }, 3000);
        }

      } else {
        toast.error("La transacción no es válida, volviendo a catálogo.");
        redirectToCatalog();
        return;
      }

    } catch (error) {
      if (error.message.includes("MetaMask Tx Signature: User denied transaction signature")) {
        toast.error("La transacción fue rechazada por el usuario.");
        redirectToCatalog();
      } else {
        toast.error("Hubo un error con la transacción. Intenta nuevamente."); //COMPROBAR ESTE ERROR AL PAGAR
        redirectToCatalog();
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col items-center max-w-md mx-auto mt-12 p-5 text-center gap-7 text-white border-2 rounded-2xl border-Principal w-[30rem] h-[50rem] relative bg-Background-Overlay">

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">Pagar con Ethereum</h1>

        <div className="flex justify-center items-center my-5" ref={logoRef}></div>

        {loading && <p className="text-3xl">Procesando pago...</p>}
        {transactionEnd && <p className="text-green-500 text-3xl">Transacción completada con éxito</p>}

        {transactionData ? (
          <div className="flex flex-col items-center justify-center my-5 text-3xl">
            <div className="flex">
              <p>{transactionData.totalEuros.toFixed(2).replace(".", ",")}</p>
              <img src="/svg/euro.svg" className="w-10 h-10" alt="Ethereum logo" />
            </div>
            <p className="flex items-center justify-center gap-2 mt-2 mb-3">
              {transactionData.equivalentEthereum} ETH
              <img src="/svg/ethereum.svg" className="w-10 h-10" alt="Ethereum logo" />
            </p>
            <Button
              onClick={handleComplete}
              variant="default"
              color="green"
              font="large"
              className="mt-6 px-6 py-2 "
            >
              Completar pago
            </Button>
          </div>
        ) : error ? (
          <>
            <p className="text-3xl text-red-600 p-4 rounded-lg">
              {error}
            </p>
            {toast.error("Volviendo al catálogo.")}
          </>
        ) : (
          <p className="text-3xl">⌛ Obteniendo datos de la transacción...</p>
        )}
      </div>
    </div>
  );
};

export default Ethereum;
