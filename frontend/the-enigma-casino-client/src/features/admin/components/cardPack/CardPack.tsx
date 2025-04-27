import { useState } from "react";
import Button from "../../../../components/ui/button/Button";
import { CoinsPack } from "../../../catalog/models/CoinsPack.interface";
import { convertCentsToEuros, formatPriceWithCurrency } from "../../../../utils/priceUtils";
import { updateAdminPack } from "../../stores/packsAdminStore";
import { BASE_URL } from "../../../../config";

interface Props {
  pack: CoinsPack;
}

export const CardPack = ({ pack }: Props) => {
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(pack.quantity);
  const [price, setPrice] = useState(convertCentsToEuros(pack.price));
  const [offer, setOffer] = useState(convertCentsToEuros(pack.offer));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSave = () => {
    const formData = {
      id: pack.id,
      quantity,
      price: Math.round(Number(price.replace(',', '.')) * 100),
      offer: Math.round(Number(offer.replace(',', '.')) * 100),
      imageFile,
    };
    updateAdminPack(formData);
    setEditing(false);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setEditing(false);
    setQuantity(pack.quantity);
    setPrice(convertCentsToEuros(pack.price));
    setOffer(convertCentsToEuros(pack.offer));
    setImageFile(null);
    setImagePreview(null);
  };

  const displayImage = imagePreview || `${BASE_URL}${pack.image}`;

  return (
    <div className="w-[320px] h-[250px] rounded-[20px] bg-Background-nav border-2 border-Green-lines flex flex-col items-center justify-between p-5 transition-transform duration-300 hover:scale-102">

      {editing ? (
        <div className="flex items-start justify-center gap-6 w-full">
          <div className="relative">
            <img
              src={displayImage}
              alt="Pack"
              className="w-[80px] aspect-square rounded-lg object-contain"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col">
              <label className="text-white text-sm font-semibold mb-1">Cantidad</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Cantidad"
                className="bg-Background-Overlay text-white border border-Green-lines rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-Principal transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-sm font-semibold mb-1">Precio (€)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio (€)"
                className="bg-Background-Overlay text-white border border-Green-lines rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-Principal transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-sm font-semibold mb-1">Oferta (€)</label>
              <input
                type="text"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Oferta (€)"
                className="bg-Background-Overlay text-white border border-Green-lines rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-Principal transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-sm font-semibold mb-1">Imagen</label>
              <input
                type="file"
                onChange={handleImageChange}
                className="text-white text-sm mt-1"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
          <div className="relative">
            <img
              src={displayImage}
              alt="Pack"
              className="w-[100px] h-[100px] rounded-lg object-cover"
            />
            {pack.offer > 0 && (
              <div className="absolute top-[-0.5rem] left-[-1rem] bg-Color-Cancel text-white text-xs font-bold px-2 py-1 rounded-full">
                % OFERTA
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-Coins font-bold text-lg">{quantity} fichas</p>

            <div className="flex items-center gap-2 mt-2">
              {pack.offer > 0 && (
                <div className="border border-Principal text-Color-Cancel px-3 py-1 rounded-full line-through">
                  <p className="text-base font-bold">{formatPriceWithCurrency(pack.price)}</p>
                </div>
              )}
              <div className="border border-Principal text-white px-3 py-1 rounded-full">
                <p className="text-base font-bold">
                  {pack.offer > 0 ? formatPriceWithCurrency(pack.offer) : formatPriceWithCurrency(pack.price)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!editing ? (
        <Button
          onClick={() => setEditing(true)}
          variant="small"
          color="yellow"
          font="bold"
          className="mt-4"
        >
          Editar
        </Button>
      ) : (
        <div className="flex gap-4 mt-4">
          <Button
            onClick={handleSave}
            variant="small"
            color="green"
            font="bold"
          >
            Guardar
          </Button>
          <Button
            onClick={handleCancel}
            variant="small"
            color="red"
            font="bold"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};
