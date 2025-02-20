import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/Input";
import classes from "./Register.module.css";
import Button from "../../../../components/ui/button/Button";



function RegisterComponent() {

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
                    <form className={classes.registerForm}>
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

                        <div className={classes.checkboxContainer}>
                            <Checkbox labelText="Soy mayor de edad" />
                            <Checkbox labelText="Acepto la política de privacidad" />
                        </div>

                        <div className={classes.passwordContainer}>
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
                        </div>

                        <div className={classes.buttonRegister}>
                            <Button onClick={() => alert("¡Matadme!")} variant="outline" color="green" font="large">
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