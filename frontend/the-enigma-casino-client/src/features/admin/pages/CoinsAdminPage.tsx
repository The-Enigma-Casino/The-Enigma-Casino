import { useEffect } from "react";
import { useUnit } from "effector-react";
import {
  $adminPacks,
  loadAdminPacks,
  resetAdminPacks,
} from "../stores/packsAdminStore";
import { CardPack } from "../components/cardPack/CardPack";


export default function PacksAdminPage() {
  const packs = useUnit($adminPacks);

  useEffect(() => {
    loadAdminPacks();
    return () => {
      resetAdminPacks();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-Background-Page py-8 flex flex-col items-center">
      <h1 className="text-Principal text-5xl font-bold text-center mb-20">
        GESTIÓN DE FICHAS
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packs.map((pack) => (
          <CardPack key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  );
}
