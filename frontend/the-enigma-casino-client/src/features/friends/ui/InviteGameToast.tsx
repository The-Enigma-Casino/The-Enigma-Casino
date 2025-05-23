import toast from "react-hot-toast";
import { acceptTableInvite, rejectGameInvite } from "../stores/friends.events";
import { IMAGE_PROFILE_URL } from "../../../config";

type GameInviteToastProps = {
  inviterId: number;
  nickname: string;
  image: string;
  tableId: number;
  expiresIn: number;
  mode: "table";
};

export const showGameInviteToast = ({
  inviterId,
  nickname,
  image,
  tableId,
  expiresIn,
}: GameInviteToastProps) => {
  toast.custom((t) => (
    <div className="bg-gray-900 border border-green-600 text-white p-4 rounded-xl shadow-lg w-[300px]">
      <div className="flex items-center gap-3">
        <img
          src={`${IMAGE_PROFILE_URL}${image}`}
          alt={nickname}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-bold">{nickname}</p>
          <p className="text-sm text-gray-300">te ha invitado a una partida</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            rejectGameInvite({ inviterId });
          }}
          className="px-3 py-1 text-sm text-red-400 border border-red-400 rounded hover:bg-red-800"
        >
          Rechazar
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            acceptTableInvite({ inviterId, tableId });
          }}
          className="px-3 py-1 text-sm text-green-400 border border-green-400 rounded hover:bg-green-800"
        >
          Aceptar
        </button>
      </div>
    </div>
  ), {
    duration: expiresIn * 1000,
    position: "top-left",
  });
};
