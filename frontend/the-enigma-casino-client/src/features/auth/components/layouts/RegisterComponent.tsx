import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/Input";
import classes from "./Register.module.css";
import Button from "../../../../components/ui/button/Button";
import { useState } from "react";
import { registerFx } from "../../actions/authActions";
import axios from "axios";
import InputDebounce from "../ui/InputDebounce";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    console.log("aaaaa",countryCode);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAdult) {
      setErrorMessage("Debes ser mayor de edad para registrarte.");
      return;
    }

    if (!acceptPrivacy) {
      setErrorMessage("Debes aceptar la política de privacidad.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Enviar solo los datos necesarios, sin "confirmPassword"
      const { confirmPassword, ...formDataToSend } = formData;

      console.log("formDataToSend", formDataToSend);
      const response = await registerFx(formDataToSend);

      // Si es 200 muestra mensaje de exito
      setSuccessMessage(response);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          setErrorMessage(data || "Ocurrió un error con el registro.");
        }
      } else {
        setErrorMessage("Ocurrió un error inesperado.");
      }
    }
  };

  return (
    <>
      <div className={classes.register}>
        <div className={classes.registerLeft}>
          <h1 className={classes.title}>REGISTRO</h1>
          <div className={classes.registerLogo}>
            <img src="/img/icono.webp" alt="Logo Enigma" />
          </div>
          <a href="#">
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

            {/* ERROR */}
            {errorMessage && <p className={classes.error}>{errorMessage}</p>}

            {/* Mostrar mensaje de éxito */}
            {successMessage && (
              <p className={classes.success}>{successMessage}</p>
            )}

            <div className={classes.buttonRegister}>
              <Button
                type="submit"
                variant="outline"
                color="green"
                font="large"
              >
                Registrarse
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterComponent;
