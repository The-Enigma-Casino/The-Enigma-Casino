import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { isValidEmail, isValidName, isValidPassword, nicknameValidator } from "../../../../../utils/validatorsUser";
import { registerFx } from "../../../actions/authActions";


interface FormData {
  nickName: string;
  fullname: string;
  email: string;
  dateOfBirth: string;
  address: string;
  country: string;
  password: string;
  confirmPassword: string;
}

export function useRegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    nickName: "",
    fullname: "",
    email: "",
    dateOfBirth: "",
    address: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  const [isAdult, setIsAdult] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, dateOfBirth: iso }));
  };

  const handleCountrySelect = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
    }));
  };

  useEffect(() => {
    const birth = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    setIsAdult(age >= 18);
  }, [formData.dateOfBirth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.dismiss();

    if (!isAdult) return toast.error("Debes ser mayor de edad.");
    if (!acceptPrivacy) return toast.error("Debes aceptar la política de privacidad.");
    if (!isValidEmail(formData.email)) return toast.error("Correo no válido.");
    if (!nicknameValidator(formData.nickName)) return toast.error("Nombre de usuario inválido.");
    if (!isValidPassword(formData.password)) return toast.error("Contraseña débil.");
    if (!isValidName(formData.fullname)) return toast.error("Nombre completo inválido.");
    if (formData.password !== formData.confirmPassword) return toast.error("Contraseñas no coinciden.");

    try {
      const { confirmPassword, ...formDataToSend } = formData;

      await toast.promise(registerFx(formDataToSend), {
        loading: "Registrando...",
        success: () => {
          setTimeout(() => {
            setFormData({
              nickName: "",
              fullname: "",
              email: "",
              dateOfBirth: "",
              address: "",
              country: "",
              password: "",
              confirmPassword: "",
            });
            setAcceptPrivacy(false);
            navigate("/auth/login", { replace: true });
            toast.dismiss();
          }, 6000);

          return <b>Registro exitoso. Redirigiendo...</b>;
        },
        error: (err) => <b>{err || "Ocurrió un error inesperado."}</b>,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    formData,
    isAdult,
    acceptPrivacy,
    handleChange,
    handleDateChange,
    handleCountrySelect,
    handleSubmit,
    setAcceptPrivacy,
  };
}
