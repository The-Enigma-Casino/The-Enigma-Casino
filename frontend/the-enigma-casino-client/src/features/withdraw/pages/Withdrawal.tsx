import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import MetaMaskLogo from "@metamask/logo";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import toast from "react-hot-toast";
import Button from "../../../components/ui/button/Button";
import {
  $loading,
  $error,
  $transactionEnd,
  setTransactionEnd,
  setLoading,
  resetWithdrawalData,
  resetError,
} from "../store/WithdrawalStore";
import {
  fetchWithrawalFx,
  fetchConvertWithdrawalFx,
  fetchLastOrderWithdrawalFx,
} from "../actions/withdrawalActions";
import classes from "./Withdrawal.module.css";
import { useMediaQuery } from "../../../utils/useMediaQuery";

const Withdrawal: React.FC = () => {
  const navigate = useNavigate();
  const token = useUnit($token);
  const logoRef = useRef<HTMLDivElement | null>(null);

  const loading = useUnit($loading);
  const error = useUnit($error);
  const transactionEnd = useUnit($transactionEnd);
  const [, setWallet] = useState<string | null>(null);
  const [coins, setcoins] = useState<number | null>();
  const [isConverted, setIsConverted] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<{
    euros: number;
    eth: number;
  } | null>(null);

  const isSmallScreen = useMediaQuery("(max-width: 1023px)");

  useEffect(() => {
    if (isSmallScreen) return;

    const viewer = MetaMaskLogo({
      pxNotRatio: true,
      width: 160,
      height: 160,
      followMouse: true,
      slowDrift: true,
    });

    if (logoRef.current) {
      logoRef.current.appendChild(viewer.container);
    }
    return () => {
      viewer.stopAnimation();
    };
  }, [isSmallScreen]);

  useEffect(() => {
    setTransactionEnd(false);
    resetWithdrawalData();
    resetError();
    setcoins(null);
  }, [transactionEnd, navigate, error]);

  const handleConversion = async () => {
    if (!coins || coins <= 0) {
      toast.error("Ingresa una cantidad válida para la conversión.");
      return;
    }
    const converWithdrawalParams = {
      token,
      Withdrawalcoins: Number(coins),
    };
    try {
      setIsConverting(true);
      const result = await fetchConvertWithdrawalFx(converWithdrawalParams);
      setConversionResult({
        euros: result.totalEuros,
        eth: result.totalEthereum,
      });
      setIsConverted(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ha ocurrido un error inesperado.");
      }
    } finally {
      setIsConverting(false);
    }
  };

  const redirectToCatalog = () => {
    setTimeout(() => {
      navigate("/catalog");
    }, 3000);
  };

  const handleWithdrawal = async () => {
    try {
      if (!coins || coins <= 0) {
        toast.error("Ingresa una cantidad válida para retirar.");
        return;
      }

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
          </span>
        );
        redirectToCatalog();
        return;
      }

      setLoading(true);

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      if (accounts.length === 0) {
        toast.error("No tienes cuenta en MetaMask.");
        return;
      }

      const connectedWallet = accounts[0];
      setWallet(connectedWallet);
      const withdrawalParams = {
        token,
        to: connectedWallet,
        coinsWithdrawal: coins || 0,
      };

      await fetchWithrawalFx(withdrawalParams);
      await fetchLastOrderWithdrawalFx({ token });
      toast.success("Retiro exitoso. Redirigiendo...");
      setTransactionEnd(true);
      setTimeout(() => {
        navigate("/withdraw-confirmation");
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ha ocurrido un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-Background-Page flex flex-col m-0 pt-6">
      <h2
        className="text-8xl font-bold text-center mb-6 text-white inline-block"
        style={{ textShadow: "0px 4px 8px rgba(255, 255, 255, 0.4)" }}
      >
        RETIRADA DE FICHAS
      </h2>

      <div className="flex flex-col items-center mx-auto mt-12 p-5 text-center gap-7 text-white border-2 rounded-2xl border-Principal w-[34rem] h-[50rem] bg-Background-Overlay mb-10 md:mb-0">
        <h1 className="text-3xl font-semibold text-gray-300 tracking-wide drop-shadow-md">
          Cambia fichas por Ethereum
        </h1>

        {isSmallScreen ? (
          <img
            src="/img/metamask_static.webp"
            alt="MetaMask Logo"
            className="w-[13rem] my-5"
          />
        ) : (
          <div
            className="flex justify-center items-center my-5"
            ref={logoRef}
          ></div>
        )}

        <label htmlFor="inp" className={classes.inp}>
          <input
            type="number"
            id="inp"
            value={coins ?? ""}
            onChange={(e) => setcoins(Number(e.target.value))}
            disabled={isConverted}
            placeholder=""
            className={`peer w-full py-4 pl-3 pr-3 text-lg border-2 rounded-md transition-all
              ${isConverted
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-100 text-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-gray-50"
              }`}
          />
          <span className={classes.label}>Cantidad de Fichas</span>
          <span className={classes.focusbg}></span>
        </label>

        <div className="flex flex-col items-center gap-2 mt-4">
          {conversionResult && (
            <>
              <div className="flex justify-center items-center gap-2">
                <p className="text-4xl font-bold text-white">
                  {conversionResult.euros.toFixed(2).replace(".", ",")}
                </p>
                <img
                  src="/svg/euro.svg"
                  alt="Euro Icon"
                  className="w-10 h-10"
                />
              </div>

              <div className="flex justify-center items-center gap-2">
                <p className="text-4xl font-bold text-white">
                  {conversionResult.eth.toFixed(6).replace(".", ",")} ETH
                </p>
                <img
                  src="/svg/ethereum.svg"
                  alt="Ethereum Icon"
                  className="w-10 h-10"
                />
              </div>
            </>
          )}
        </div>

        {error && <p className="text-red-500 text-3xl">{error}</p>}

        <Button
          onClick={isConverted ? handleWithdrawal : handleConversion}
          disabled={isConverting || loading}
          variant="big"
          color="green"
          font="bold"
          className="mt-6 px-6 py-2"
        >
          {isConverting
            ? "Convirtiendo..."
            : loading
              ? "Procesando Retiro..."
              : isConverted
                ? "Realizar Retirada"
                : "Realizar Conversión"}
        </Button>
      </div>
    </div>
  );
};

export default Withdrawal;
