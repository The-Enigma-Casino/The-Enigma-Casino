import { useUnit } from "effector-react";
import { $simpleAlerts } from "../stores/friends.store";
import {
  acceptFriendRequest,
  acceptGameInvite,
  acceptTableInvite,
  rejectFriendRequest,
  rejectGameInvite,
  removeSimpleAlert,
  startGameLoading
} from "../stores/friends.events";
import { IMAGE_PROFILE_URL } from "../../../config";
import toast from "react-hot-toast";

export const NotificationDropdown = () => {
  const alerts = useUnit($simpleAlerts);

  return (
    <div className="bg-Background-Overlay shadow-sm shadow-black rounded-xl overflow-hidden w-[28rem]">
      <div className="p-4 border-b border-Grey-color">
        <h3 className="text-2xl font-bold">Notificaciones</h3>
      </div>
      <ul>
        {alerts.length === 0 && (
          <li className="p-4 text-2xl text-gray-500 text-center">
            No hay notificaciones
          </li>
        )}
        {alerts.map((alert) => {
          if (alert.type === "friend_request") {
            const meta = alert.meta as { senderId: number };
            return (
              <li key={alert.id} className="flex flex-col gap-2 p-4 border-b border-Grey-color">
                <div className="flex items-center gap-3">
                  <img
                    src={`${IMAGE_PROFILE_URL}${alert.image}`}
                    alt=""
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1 text-2xl">
                    <p>
                      <strong>{alert.nickname}</strong> te envió una solicitud
                      de amistad.
                    </p>
                  </div>
                  <button
                    className="text-2xl text-gray-500 hover:text-red-500"
                    onClick={() => removeSimpleAlert(alert.id)}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-end gap-2 text-xl">
                  <button
                    className="text-Principal hover:text-green-600"
                    onClick={() => {
                      acceptFriendRequest({ senderId: meta.senderId });
                      removeSimpleAlert(alert.id);
                    }}
                  >
                    Aceptar
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      rejectFriendRequest({ senderId: meta.senderId });
                      removeSimpleAlert(alert.id);
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            );
          }

          if (alert.type === "game_invite") {
            const meta = alert.meta as {
              inviterId: number;
              tableId: number;
              mode?: "table" | "friendsList";
              toastId?: string;
            };
            return (
              <li key={alert.id} className="flex flex-col gap-2 p-4 border-b border-Grey-color">
                <div className="flex items-center gap-3">
                  <img
                    src={`${IMAGE_PROFILE_URL}${alert.image}`}
                    alt=""
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1 text-2xl">
                    <p>
                      <strong>{alert.nickname}</strong> te invitó a una mesa.
                    </p>
                  </div>
                  <button
                    className="text-2xl text-gray-500 hover:text-red-500"
                    onClick={() => removeSimpleAlert(alert.id)}
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-end gap-5 text-xl">
                  <button
                    className="text-Principal hover:text-green-800"
                    onClick={() => {
                      if (meta.mode === "table") {
                        acceptTableInvite({
                          inviterId: meta.inviterId,
                          tableId: meta.tableId,
                        });
                      } else {
                        acceptGameInvite({
                          inviterId: meta.inviterId,
                          tableId: meta.tableId,
                        });
                      }
                      startGameLoading();
                      if (meta.toastId) toast.dismiss(meta.toastId);
                      removeSimpleAlert(alert.id);
                    }}

                  >
                    Unirse
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      rejectGameInvite({ inviterId: meta.inviterId });
                      if (meta.toastId) toast.dismiss(meta.toastId);
                      removeSimpleAlert(alert.id);
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            );
          }

          return null;
        })}
      </ul>
    </div>
  );
};
