import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classes from "../Register/RegisterForm.module.css";

import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUnit } from "effector-react";
import { $googleIdToken, clearGoogleIdToken } from "../store/authStore";
import { registerWithGoogleFx } from "../actions/authActions";
import CustomDatePickerHeader from "../../../components/ui/datePicker/CustomDatePickerHeader";
import InputDebounce from "../components/ui/InputDebounce";
import Checkbox from "../components/ui/Checkbox";
import Button from "../../../components/ui/button/Button";
import Input from "../components/ui/input/CustomInput";

function GoogleRegisterPage() {
  const idToken = useUnit($googleIdToken);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    dateOfBirth: null as Date | null,
    country: "",
    address: "",
  });

  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  registerLocale("es", es);

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (country: string) => {
    setFormData((prev) => ({ ...prev, country }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idToken) {
      toast.error("Token de Google inválido.");
      return;
    }

    if (!formData.dateOfBirth) {
      toast.error("Debes seleccionar tu fecha de nacimiento.");
      return;
    }

    if (!acceptPrivacy) {
      toast.error("Debes aceptar la política de privacidad.");
      return;
    }

    try {
      await registerWithGoogleFx({
        idToken,
        dateOfBirth: formData.dateOfBirth.toISOString(),
        country: formData.country,
        address: formData.address,
      });
      clearGoogleIdToken();
      navigate("/");
    } catch {
      toast.error("No se pudo completar el registro con Google.");
    }
  };

  return (
    <>
      <h1 className="text-[6rem] text-Principal text-center mb-12">REGISTRO</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-6 px-4
          sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:items-start max-w-4xl"
      >
        <div className="w-full contents">
          <div className={`${classes.datePickerContainer} w-full max-w-[380px] mx-auto sm:col-span-2`}>
            <label htmlFor="dateOfBirth" className="text-white text-xl font-bold mb-2">
              Fecha de nacimiento
            </label>
            <DatePicker
              selected={formData.dateOfBirth}
              onChange={handleDateChange}
              maxDate={new Date()}
              minDate={new Date("1920-01-01")}
              dateFormat="dd-MM-yyyy"
              placeholderText="Selecciona tu fecha"
              className="w-full max-w-[380px] h-[60px] bg-white text-black rounded-[20px] border border-black box-border placeholder-gray-400 focus:outline-none focus:border-grey-color
                pl-10 text-[1.5rem] max-md:pl-5 max-md:text-[1.2rem] max-sm:h-[50px] max-sm:text-[1rem] max-sm:pl-4"
              locale="es"
              renderCustomHeader={(props) => <CustomDatePickerHeader {...props} />}
            />
          </div>

          <div className="flex flex-col w-full max-w-[380px] mx-auto">
            <label htmlFor="address" className="text-white text-xl font-bold mb-2">
              Dirección (opcional)
            </label>
            <Input
              type="text"
              name="address"
              id="address"
              placeholder="Dirección"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col w-full max-w-[380px] mx-auto">
            <label className="text-white text-xl font-bold mb-2">Nacionalidad (opcional)</label>
            <InputDebounce placeholder="Nacionalidad" onSelect={handleCountrySelect} />
          </div>

          <div className="flex flex-col col-span-2 mt-4">
            <Checkbox
              labelText="Acepto la política de privacidad"
              checked={acceptPrivacy}
              linkHref="/policies"
              onChange={() => setAcceptPrivacy(!acceptPrivacy)}
            />
          </div>

          <div className="flex justify-center col-span-2 mt-4 mb-8 sm:mb-4">
            <Button type="submit" variant="outline" color="green" font="short">
              Registrarse con Google
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

export default GoogleRegisterPage;
