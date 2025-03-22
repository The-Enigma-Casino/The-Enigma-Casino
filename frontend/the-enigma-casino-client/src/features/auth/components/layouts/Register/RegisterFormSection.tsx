import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import classes from "./Register.module.css";
import { useRegisterForm } from "./UseRegisterForm";
import Input from "../../../../../components/ui/input/CustomInput";
import InputDebounce from "../../ui/InputDebounce";
import Checkbox from "../../ui/Checkbox";
import Button from "../../../../../components/ui/button/Button";
import CustomDatePickerHeader from "../../../../../components/ui/datePicker/CustomDatePickerHeader";
import { registerLocale } from "react-datepicker";
import {es} from "date-fns/locale/es";



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

      <div className={classes.datePickerContainer}>
        <DatePicker
          selected={
            formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
          }
          onChange={handleDateChange}
          maxDate={new Date()}
          minDate={new Date("1920-01-01")}
          dateFormat="yyyy-MM-dd"
          placeholderText="Selecciona tu fecha"
          className={classes.datePickerInput}
          locale="es"
          renderCustomHeader={(props) => <CustomDatePickerHeader {...props} />}
        />
      </div>

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
          placeholder="Confirma la contraseña"
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
  );
}

export default RegisterFormSection;
