import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import MetaMaskLogo from "@metamask/logo";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import { $selectedCard } from "../../catalog/store/catalogStore";
import {
  fetchTransactionEthereumFx,
  verifyTransactionEthereumFx,
} from "../actions/ethereumActions";
import {
  $transactionData,
  $loading,
  $error,
  $transactionEnd,
  setLoading,
  setTransactionEnd,
  resetTransactionData,
  resetError,
} from "../store/EthereumStore";
import { fetchLastOrderFx } from "../actions/orderActions";
import toast from "react-hot-toast";
import Button from "../../../components/ui/button/Button";
import { useMediaQuery } from "../../../utils/useMediaQuery";

const Ethereum: React.FC = () => {
  const navigate = useNavigate();
  const [, setWallet] = useState<string | null>(null);
  const token = useUnit($token);
  const coinCard = useUnit($selectedCard);
  const orderPackId = coinCard?.id;
  const transactionData = useUnit($transactionData);
  const loading = useUnit($loading);
  const error = useUnit($error);
  const transactionEnd = useUnit($transactionEnd);
  const logoRef = useRef<HTMLDivElement | null>(null);

  const isSmallScreen = useMediaQuery("(max-width: 1023px)");

  // Logo de MetaMask
  useEffect(() => {
    if (isSmallScreen) return;

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
      resetTransactionData();
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
            MetaMask no está instalado en su navegador.{" "}
            <a
              href="https://metamask.io/"
              className="text-[var(--Principal)] underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instalar MetaMask
            </a>
            <br />
            Volviendo al catálogo...
          </span>,
          {
            id: "metamask_not_installed",
          }
        );
        redirectToCatalog();
        return;
      }

      setLoading(true);

      // Conectar la wallet
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.requestAccounts();

      if (accounts.length === 0) {
        toast.error(
          "No tienes cuenta en Metamask. Redirigiendo al catálogo...",
          {
            id: "metamask_no_account",
          }
        );
        redirectToCatalog();
        return;
      }

      const connectedWallet = accounts[0];
      setWallet(connectedWallet);

      if (!transactionData) {
        toast.error(
          "Datos de transacción no disponibles. Redirigiendo al carrito...",
          {
            id: "transaction_data_missing",
          }
        );

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
          toast.success("Pago confirmado, redirigiendo...", {
            id: "payment_success",
          });
          fetchLastOrderFx();
          setTimeout(() => {
            navigate("/payment-confirmation?pagado=true");
          }, 3000);
        } else {
          toast.error("Error en el pago, redirigiendo...", {
            id: "payment_failed",
          });
          setTimeout(() => {
            navigate("/payment-confirmation?error=true");
          }, 3000);
        }
      } else {
        toast.error("La transacción no es válida, volviendo a catálogo.", {
          id: "invalid_transaction",
        });
        redirectToCatalog();
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes(
          "MetaMask Tx Signature: User denied transaction signature"
        )
      ) {
        toast.error("La transacción fue rechazada por el usuario.", {
          id: "tx_user_rejected",
        });

        redirectToCatalog();
      } else {
        toast.error("Hubo un error con la transacción. Intenta nuevamente.", {
          id: "transaction_generic_error",
        });

        redirectToCatalog();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-[90vw] sm:w-[32rem] md:w-[40rem] lg:w-[50rem] min-h-[30rem] sm:min-h-[34rem] md:min-h-[36rem] lg:min-h-[40rem] bg-Background-Overlay border-2 border-Principal rounded-2xl p-6 text-white text-center shadow-lg gap-6">
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold">Pagar con Ethereum</h1>

        {isSmallScreen ? (
          <img
            src="/img/metamask_static.webp"
            alt="MetaMask Logo"
            className="w-[10rem] sm:w-[11rem] md:w-[12rem] lg:w-[13rem] my-5"
          />
        ) : (
          <div
            className="flex justify-center items-center my-5"
            ref={logoRef}
          ></div>
        )}

        {transactionEnd && (
          <p className="text-green-500 text-3xl">
            Transacción completada con éxito
          </p>
        )}

        {transactionData ? (
          <div className="flex flex-col items-center justify-center my-5 text-3xl">
            <div className="flex">
              <p>{transactionData.totalEuros.toFixed(2).replace(".", ",")}</p>
              <img
                src="/svg/euro.svg"
                className="w-10 h-10"
                alt="Ethereum logo"
              />
            </div>
            <p className="flex items-center justify-center gap-2 mt-2 mb-3">
              {transactionData.equivalentEthereum} ETH
              <img
                src="/svg/ethereum.svg"
                className="w-10 h-10"
                alt="Ethereum logo"
              />
            </p>
            <Button
              onClick={handleComplete}
              variant="default"
              color="green"
              font="large"
              className="mt-6 px-6 py-2 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <>Procesando Pago</> : "Completar pago"}
            </Button>
          </div>
        ) : error ? (
          <>
            <p className="text-3xl text-red-600 p-4 rounded-lg">{error}</p>
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
