import React from "react";
import InputDebounce from "../../auth/components/ui/InputDebounce";
import Input from "../../../components/ui/input/CustomInput";
import Button from "../../../components/ui/button/Button";
import { useEditForm } from "../components/UserModalEditForm";
interface ModalEditUserProps {
  onCancel: () => void;
  onSave: () => void;
}

const ModalEditUser: React.FC<ModalEditUserProps> = ({ onCancel, onSave }) => {

  const {
    formData,
    handleChange,
    handleCountrySelect,
    handleSubmit,
  } = useEditForm(onCancel);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-Background-Overlay rounded-3xl p-10 w-[90%] max-w-md border border-Principal">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-white text-xl">
          <label className="text-white">
            <strong>Nickname:</strong>
            <Input type="text"
              name="nickName"
              id="nickName"
              placeholder="Nombre de usuario"
              value={formData.nickName}
              onChange={handleChange}
              paddingLeft="20px"
            />
          </label>

          <label>
            <strong>Nombre de Usuario:</strong>
            <Input type="text"
              name="fullname"
              id="fullname"
              placeholder="Nombre completo"
              value={formData.fullName}
              onChange={handleChange}
              paddingLeft="20px"
            />
          </label>

          <label>
            <strong>Correo electrónico:</strong>
            <Input type="email"
              name="email"
              id="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              paddingLeft="20px"

            />
          </label>

          <label>
            <strong>Dirección:</strong>
            <Input type="text"
              name="address"
              id="address"
              placeholder="Dirección"
              value={formData.address}
              onChange={handleChange}
              paddingLeft="20px"
            />
          </label>

          <label>
            <strong>Nacionalidad:</strong>
            <InputDebounce
              placeholder="Nacionalidad"
              countryCode={formData.country}
              onSelect={handleCountrySelect}
              inputPaddingLeft="55px"
              flagLeft="20px"
            />
          </label>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="shortPlus"
              color="red"
              font="bold"
              onClick={onCancel}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="shortPlus"
              color="green"
              font="bold"
            >
              Aceptar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditUser;
