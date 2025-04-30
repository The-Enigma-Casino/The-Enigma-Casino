import React, { useState } from "react";
import Input from "../../../components/ui/input/CustomInput";
import Button from "../../../components/ui/button/Button";
import { isValidPassword } from "../../../utils/validatorsUser";
import toast from "react-hot-toast";
import { updatePasswordFx } from "../store/editProfile/editProfile";

interface Props {
  onCancel: () => void;
  onConfirm: (newPassword: string) => void;
}

const ModalEditPassword: React.FC<Props> = ({ onCancel, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    if (!isValidPassword(password)) {
      toast.error("La contraseña no cumple con los requisitos.");
      return;
    }

    try {
      await toast.promise(
        updatePasswordFx({ password, confirmPassword }),
        {
          loading: "Actualizando contraseña...",
          success: () => {
            onConfirm(password);
            return <b>Contraseña modificada correctamente.</b>;
          },
          error: (err) => <b>{err || "Error al actualizar la contraseña."}</b>,
        }
      );
    } catch (err) {
      console.error("Error al actualizar la contraseña", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-2 ">
      <div className="bg-Background-Overlay rounded-3xl px-6 py-8 w-[600px] max-w-full border border-Principal flex flex-col lg:flex-row gap-10 lg:gap-20 items-center lg:items-start text-center lg:text-left">

        {/* Inputs */}
        <div className="flex flex-col gap-6 w-full max-w-md text-white text-xl">
          <label className="flex flex-col text-left w-full">
            <strong>Contraseña:</strong>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="flex flex-col text-left w-full">
            <strong>Confirmar Contraseña:</strong>
            <Input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirme la contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>
        </div>

        {/* Requisitos + Botones */}
        <div className="flex flex-col justify-between w-full max-w-md text-white text-xl items-center lg:items-start">
          <div>
            <p className="mb-2 font-semibold">La contraseña debe incluir:</p>
            <ul className="list-disc pl-6 text-left">
              <li>Al menos 8 caracteres.</li>
              <li>Al menos una letra mayúscula.</li>
              <li>Al menos una letra minúscula.</li>
              <li>Al menos un número.</li>
              <li>Al menos un carácter especial.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 w-full items-center">
            <Button
              type="button"
              variant="short"
              color="red"
              font="bold"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="short"
              color="green"
              font="bold"
              onClick={handleSubmit}
            >
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default ModalEditPassword;
