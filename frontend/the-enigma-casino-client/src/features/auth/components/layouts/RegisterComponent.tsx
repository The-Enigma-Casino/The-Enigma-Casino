import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/Input";
import classes from "./Register.module.css";
import Button from "../../../../components/ui/button/Button";
import { useState } from "react";
import { registerFx } from "../../actions/authActions";
import InputDebounce from "../ui/InputDebounce";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  isValidDNI,
  isValidEmail,
  isValidName,
  nicknameValidator,
  isValidPassword,
} from "../../../../utils/validatorsUser";

interface FormData {
  nickName: string;
  fullname: string;
  email: string;
  dni: string;
  address: string;
  country: string;
  password: string;
  confirmPassword: string;
}

function RegisterComponent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nickName: "",
    fullname: "",
    email: "",
    dni: "",
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

  const handleCountrySelect = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
    }));
    console.log("Selected country:", countryCode);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    toast.dismiss();

    if (!isAdult) {
      toast.error("Debes ser mayor de edad para registrarte.");
      return;
    }

    if (!acceptPrivacy) {
      toast.error("Debes aceptar la política de privacidad.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error("El correo electrónico no es válido.");
      return;
    }

    if (!nicknameValidator(formData.nickName)) {
      toast.error("El nombre de usuario debe tener entre 3 y 20 caracteres.");
      return;
    }

    if (!isValidDNI(formData.dni)) {
      toast.error("El DNI no es válido. Necesita 8 números y 1 letra");
      return;
    }

    if (!isValidPassword(formData.password)) {
      toast.error(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
      );
      return;
    }

    if (!isValidName(formData.fullname)) {
      toast.error("El nombre completo debe tener entre 3 y 100 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      const { confirmPassword, ...formDataToSend } = formData;

      await toast.promise(registerFx(formDataToSend), {
        loading: "Registrando...",
        success: (response) => {
          setTimeout(() => {
            setFormData({
              nickName: "",
              fullname: "",
              email: "",
              dni: "",
              address: "",
              country: "",
              password: "",
              confirmPassword: "",
            });
            setIsAdult(false);
            setAcceptPrivacy(false);

            navigate("/auth/login", { replace: true });

            toast.dismiss();
          }, 6000);

          return <b>{response} Navegando al login...</b>;
        },
        error: (error) => <b>{error || "Ocurrió un error inesperado."}</b>,
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className={classes.register}>
      <div className={classes.registerLeft}>
        <h1 className={classes.title}>REGISTRO</h1>
        <div className={classes.registerLogo}>
          <img src="/img/icono.webp" alt="Logo Enigma" onClick={() => navigate("/")}/>
        </div>
        <a href="" onClick={() => navigate("/auth/login")}>
          <p>¿Tienes cuenta?</p>
        </a>
      </div>

      <div className={classes.registerRight}>
        <form onSubmit={handleSubmit} className={classes.registerForm}>
          <Input
            type="text"
            name="nickName"
            id="nickName"
            placeholder="Nombre de usuario"
            value={formData.nickName}
            onChange={handleChange}
          />

          <Input
            type="text"
            name="fullname"
            id="fullname"
            placeholder="Nombre completo"
            value={formData.fullname}
            onChange={handleChange}
          />

          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            type="text"
            name="dni"
            id="dni"
            placeholder="DNI"
            value={formData.dni}
            onChange={handleChange}
          />

          <Input
            type="text"
            name="address"
            id="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
          />

          <InputDebounce
            placeholder="Nacionalidad"
            onSelect={handleCountrySelect}
          />

          <div className={classes.checkboxContainer}>
            <Checkbox
              labelText="Soy mayor de edad"
              checked={isAdult}
              onChange={() => setIsAdult(!isAdult)}
            />
            <Checkbox
              labelText="Acepto la política de privacidad"
              checked={acceptPrivacy}
              onChange={() => setAcceptPrivacy(!acceptPrivacy)}
            />
          </div>

          <div className={classes.passwordContainer}>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />

            <Input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirme la contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className={classes.buttonRegister}>
            <Button type="submit" variant="outline" color="green" font="large">
              Registrarse
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterComponent;
