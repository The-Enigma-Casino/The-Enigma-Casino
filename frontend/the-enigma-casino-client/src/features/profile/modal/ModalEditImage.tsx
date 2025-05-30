import React, { useState } from "react";
import Button from "../../../components/ui/button/Button";
import { updateUserImageFx, UpdateUserImageDefaultFx } from "../store/editProfile/editProfile";
import { IMAGE_PROFILE_URL } from "../../../config";
import { imageUpdated } from "../store/editProfile/editEvent";
import toast from "react-hot-toast";

interface Props {
  image: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ModalEditImage: React.FC<Props> = ({ onCancel, onConfirm, image }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string>("");
  const [isDefaultSelected, setIsDefaultSelected] = useState(false);
  const DEFAULT_IMAGE_PATH = "/img/user_default.webp";


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageURL(URL.createObjectURL(file));
      setIsDefaultSelected(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await toast.promise(
        isDefaultSelected
          ? UpdateUserImageDefaultFx()
          : imageFile
            ? updateUserImageFx(imageFile)
            : Promise.reject("No se seleccionó ninguna imagen."),
        {
          loading: "Actualizando imagen...",
          success: () => {
            imageUpdated();
            onConfirm();
            return <b>Imagen actualizada correctamente.</b>;
          },
          error: (err) => <b>{err || "Error al actualizar la imagen"}</b>,
        }
      );
    } catch (error) {
      console.error("Error al actualizar la imagen", error);
    }
  };

  const handleSetDefaultImage = () => {
    setImageFile(null);
    setImageURL(DEFAULT_IMAGE_PATH);
    setIsDefaultSelected(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 px-2">
      <div className="bg-Background-Overlay rounded-3xl px-6 py-10 w-full max-w-[700px] border border-Principal">
        <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">

          {/* Imagen user */}
          <img
            src={
              imageURL
                ? imageURL
                : `${IMAGE_PROFILE_URL}${image}?cb=${Date.now()}`
            }
            alt="Usuario"
            className="w-60 h-60 object-cover rounded-full aspect-square"
          />


          {/* Botones y selector */}
          <div className="flex flex-col gap-6 items-center w-full">
            <Button
              type="button"
              variant="large"
              color="green"
              font="bold"
              onClick={handleSetDefaultImage}
            >
              Imagen por defecto
            </Button>

            <label className="bg-white text-black px-4 py-4 rounded-full cursor-pointer text-center text-2xl w-[20rem] h-[4rem] overflow-hidden text-ellipsis whitespace-nowrap">
              {imageFile ? imageFile.name : isDefaultSelected ? "user_default.webp" : "Seleccionar imagen"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Botones */}
          <div className="flex flex-row lg:flex-col gap-4 mt-4 lg:mt-0">
            <Button
              variant="short"
              color="green"
              font="bold"
              onClick={handleConfirm}
            >
              Aceptar
            </Button>
            <Button
              variant="short"
              color="red"
              font="bold"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ModalEditImage;
