import Checkbox from "../ui/Checkbox";
import Input from "../../../../components/ui/input/Input";
import classes from "./Login.module.css";
import Button from "../../../../components/ui/button/Button";



function LoginComponent() {

    return (
        <>
            <div className={classes.login}>
                <div className={classes.loginLeft}>
                    <h1 className={classes.title}>LOGIN</h1>
                    <form className={classes.loginForm}>

                        <label className={classes.label}>Correo o nombre de usuario</label>
                        <div className={classes.inputContainer}>
                            <Input
                                type="text"
                                name="identifier"
                                id="identifier"
                                placeholder="Correo o nombre de usuario"
                            />
                        </div>

                        <label className={classes.label}>Contraseña</label>
                        <div className={classes.inputContainer}>
                            <Input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Contraseña"
                            />
                        </div>

                        <div className={classes.checkboxContainer}>
                            <Checkbox labelText="Recuérdame" />
                        </div>

                        <div className={classes.buttonLogin}>
                            <Button onClick={() => alert("Di no a la muerte!")} variant="outline" color="green" font="large">
                                Iniciar Sesión
                            </Button>
                        </div>
                    </form>
                </div>

                <div className={classes.loginRight}>
                    <div className={classes.loginLogo}>
                        <img src="/img/icono.webp" alt="Logo Enigma" />
                    </div>
                    <a href="#">
                        <p>¿No tienes cuenta?</p>
                    </a>
                </div>
            </div>
        </>
    );
}

export default LoginComponent;