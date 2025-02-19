import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/Input";
import classes from "./Register.module.css";



function RegisterComponent() {

    return (
        <>
            <div className={classes.register}>
                <Input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Nombre de usuario"
                />

                <Input
                    type="text"
                    name="fullname"
                    id="fullname"
                    placeholder="Nombre completo"
                />

                <Input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Correo electrónico"
                />

                <Input
                    type="text"
                    name="dni"
                    id="dni"
                    placeholder="DNI"
                />

                <Input
                    type="text"
                    name="address"
                    id="address"
                    placeholder="Dirección"
                />

                <Input
                    type="text"
                    name="nationality"
                    id="nationality"
                    placeholder="Nacionalidad"
                />

                <Input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Contraseña"
                />

                <Input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirme la contraseña"
                />

                <Checkbox labelText="Soy mayor de edad" />
                <Checkbox labelText="Acepto la política de privacidad" />
            </div>
        </>
    );
}

export default RegisterComponent;