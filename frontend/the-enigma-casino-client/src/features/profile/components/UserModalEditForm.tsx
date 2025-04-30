import { useState } from "react";
import toast from "react-hot-toast";
import { isValidEmail, isValidName, nicknameValidator } from "../../../utils/validatorsUser";
import { updateUserFx } from "../store/editProfile/editProfile";
import { userUpdated } from "../store/editProfile/editEvent";

interface FormData {
  nickName: string;
  fullname: string;
  email: string;
  address: string;
  country: string;
}

export function useEditForm(onSuccess: () => void) {

  const [formData, setFormData] = useState<FormData>({
    nickName: "",
    fullname: "",
    email: "",
    address: "",
    country: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountrySelect = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.dismiss();

    if (!isValidEmail(formData.email)) return toast.error("Correo no válido.");
    if (!nicknameValidator(formData.nickName)) return toast.error("Nombre de usuario inválido.");
    if (!isValidName(formData.fullname)) return toast.error("Nombre completo inválido.");

    try {
      const { ...formDataToSend } = formData;

      await toast.promise(updateUserFx(formDataToSend), {
        loading: "Modificando datos...",
        success: () => {
          setTimeout(() => {
            setFormData({
              nickName: "",
              fullname: "",
              email: "",
              address: "",
              country: "",
            });;
            toast.dismiss();
            onSuccess();
          }, 2000);
          userUpdated();
          return <b>Cambios realizados exitosamente.</b>;
        },
        error: (err) => <b>{err || "Ocurrió un error inesperado."}</b>,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    formData,
    handleChange,
    handleCountrySelect,
    handleSubmit,
  };
}



