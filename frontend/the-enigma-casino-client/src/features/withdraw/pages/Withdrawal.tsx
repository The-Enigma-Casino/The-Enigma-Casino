import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import MetaMaskLogo from "@metamask/logo";
import { useUnit } from "effector-react";
import { $token } from "../../auth/store/authStore";
import toast from "react-hot-toast";
import Button from "../../../components/ui/button/Button";
import { $loading, $error, $transactionEnd, setTransactionEnd, setLoading } from "../store/WithdrawalStore";
import { fetchWithrawalFx } from "../actions/withdrawalActions";

const Withdrawal: React.FC = () => {
  const navigate = useNavigate();
  const token = useUnit($token);
  const logoRef = useRef<HTMLDivElement | null>(null);

  const loading = useUnit($loading);
  const error = useUnit($error);
  const transactionEnd = useUnit($transactionEnd);
  const [wallet, setWallet] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);


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

  const handleWithdrawal = async () => {
    console.log("handleWithdrawal llamado");
    try {
      if (!window.ethereum?.isMetaMask) {
        toast.error("MetaMask no está instalado.");
        return;
      }

      if (amount <= 0) {
        toast.error("Ingresa una cantidad válida para retirar.");
        return;
      }

      setLoading(true);
      console.log("Cargando...");

      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      if (accounts.length === 0) {
        toast.error("No tienes cuenta en MetaMask.");
        return;
      }

      const connectedWallet = accounts[0];
      setWallet(connectedWallet);
      console.log("AMOOOOOOUNT", amount)
      const withdrawalParams = {
        token,
        to: connectedWallet,
        coinsWithdrawal: amount,
      };

      await fetchWithrawalFx(withdrawalParams);
      toast.success("Retiro exitoso.");
      setTransactionEnd(true);
      console.log("SET TRANSACTION", setTransactionEnd)
    } catch (error: any) {
      toast.error(`Error en la transacción: ${error.message || "Desconocido"}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col items-center max-w-md mx-auto mt-12 p-5 text-center gap-7 text-white border-2 rounded-2xl border-Principal w-[30rem] h-[50rem] relative bg-Background-Overlay">
      <h1 className="text-4xl font-bold">Retirar Ethereum</h1>
      <div className="flex justify-center items-center my-5" ref={logoRef}></div>

      <input
        type="number"
        placeholder="Cantidad a retirar"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="p-3 text-black w-full text-center rounded-lg border-2 border-gray-300"
      />
      {loading && <p className="text-3xl">Procesando retiro...</p>}
      {transactionEnd && <p className="text-green-500 text-3xl">Retiro completado</p>}
      {error && <p className="text-red-500 text-3xl">{error}</p>}
      <Button onClick={handleWithdrawal} variant="default" color="red" font="large" className="mt-6 px-6 py-2">
        Retirar ETH
      </Button>
    </div>
  );
};

export default Withdrawal;
