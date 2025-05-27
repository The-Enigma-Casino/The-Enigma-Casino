// components/layouts/LoginForm.tsx

import Input from "../../../../components/ui/input/CustomInput";
import Button from "../../../../components/ui/button/Button";
import Checkbox from "../ui/Checkbox";

interface LoginFormProps {
  identifier: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeToggle: () => void;
  onSubmit: () => void;
}

function LoginForm({
  identifier,
  password,
  rememberMe,
  isLoading,
  onIdentifierChange,
  onPasswordChange,
  onRememberMeToggle,
  onSubmit,
}: LoginFormProps) {
  return (
    <>
      <h1 className="text-[6rem] text-Principal text-center mb-12">LOGIN</h1>
      <form
        className="grid grid-cols-1 gap-6 p-10 w-full max-w-[480px] items-start"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label className="text-white text-xl font-bold">
          Correo o nombre de usuario
        </label>
        <div className="col-span-2 flex flex-col">
          <Input
            type="text"
            name="identifier"
            id="identifier"
            placeholder="Correo o nombre"
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
          />
        </div>

        <label className="text-white text-xl font-bold">Contraseña</label>
        <div className="col-span-2 flex flex-col gap-4">
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            showToggle
          />
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <Checkbox
            labelText="Recuérdame"
            checked={rememberMe}
            onChange={onRememberMeToggle}
          />
        </div>

        <div className="flex justify-start font-extrabold text-lg sm:text-xl col-span-2 mt-5">
          <Button
            onClick={onSubmit}
            variant="outline"
            color="green"
            font="large"
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default LoginForm;
