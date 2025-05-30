import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classes from "../Register/RegisterForm.module.css";
import { useRegisterForm } from "../../../hooks/UseRegisterForm";
import Input from "../../../../../components/ui/input/CustomInput";
import InputDebounce from "../../ui/InputDebounce";
import Checkbox from "../../ui/Checkbox";
import Button from "../../../../../components/ui/button/Button";
import CustomDatePickerHeader from "../../../../../components/ui/datePicker/CustomDatePickerHeader";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";

function RegisterFormSection() {
  const {
    formData,
    acceptPrivacy,
    handleChange,
    handleDateChange,
    handleCountrySelect,
    handleSubmit,
    setAcceptPrivacy,
  } = useRegisterForm();

  registerLocale("es", es);

  return (
    <>
      <h1 className="text-[6rem] text-Principal text-center mb-12">REGISTRO</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center gap-6 px-4
            sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 sm:items-start
           max-w-4xl"
      >
        <div className="flex flex-col w-full max-w-[380px] mx-auto">
          {" "}
          <label
            htmlFor="nickName"
            className="text-white text-xl font-bold mb-2"
          >
            Nombre de usuario
          </label>
          <Input
            type="text"
            name="nickName"
            id="nickName"
            placeholder="Nombre de usuario"
            value={formData.nickName}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col w-full max-w-[380px] mx-auto">
          {" "}
          <label
            htmlFor="fullname"
            className="text-white text-xl font-bold mb-2"
          >
            Nombre completo
          </label>
          <Input
            type="text"
            name="fullname"
            id="fullname"
            placeholder="Nombre completo"
            value={formData.fullname}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col w-full max-w-[380px] mx-auto">
          {" "}
          <label htmlFor="email" className="text-white text-xl font-bold mb-2">
            Correo electrónico
          </label>
          <Input
            type="email"
            name="email"
            id="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div
          className={`${classes.datePickerContainer} w-full max-w-[380px] mx-auto sm:col-span-2`}
        >
          <label
            htmlFor="dateOfBirth"
            className="text-white text-xl font-bold mb-2"
          >
            Fecha de nacimiento
          </label>
          <DatePicker
            selected={
              formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
            }
            onChange={handleDateChange}
            maxDate={new Date()}
            minDate={new Date("1920-01-01")}
            dateFormat="dd-MM-yyyy"
            placeholderText="Selecciona tu fecha"
            className="w-full max-w-[380px] h-[60px] bg-white text-black rounded-[20px] border border-black box-border placeholder-gray-400 focus:outline-none focus:border-grey-color
             pl-10 text-[1.5rem] 
             max-md:pl-5 max-md:text-[1.2rem] 
             max-sm:h-[50px] max-sm:text-[1rem] max-sm:pl-4"
            locale="es"
            renderCustomHeader={(props) => (
              <CustomDatePickerHeader {...props} />
            )}
          />
        </div>

          <div className="flex flex-col w-full max-w-[380px] mx-auto">
            {" "}
            <label
              htmlFor="password"
              className="text-white text-xl font-bold mb-2"
            >
              Contraseña
            </label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              showToggle
            />
          </div>

          <div className="flex flex-col w-full max-w-[380px] mx-auto">
            <label
              htmlFor="confirmPassword"
              className="text-white text-xl font-bold mb-2"
            >
              Confirmar contraseña
            </label>
            <Input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirma la contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              showToggle
            />
          </div>
 

        <div className="flex flex-col w-full max-w-[380px] mx-auto">
          {" "}
          <label
            htmlFor="address"
            className="text-white text-xl font-bold mb-2"
          >
            Dirección
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
          <label className="text-white text-xl font-bold mb-2">
            Nacionalidad
          </label>
          <InputDebounce
            placeholder="Nacionalidad"
            onSelect={handleCountrySelect}
          />
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
          <Button type="submit" variant="outline" color="green" font="large">
            Registrarse
          </Button>
        </div>
      </form>
    </>
  );
}

export default RegisterFormSection;
