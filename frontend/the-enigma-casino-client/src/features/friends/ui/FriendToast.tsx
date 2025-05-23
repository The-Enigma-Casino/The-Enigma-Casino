import React from "react";
import toast from "react-hot-toast";

interface FriendToastProps {
  id: string;
  image: string;
  nickname: string;
  message: React.ReactNode;
  onAccept?: () => void;
  onReject?: () => void;
  onClose?: () => void;
}

export const FriendToast: React.FC<FriendToastProps> = ({
  id,
  image,
  nickname,
  message,
  onAccept,
  onReject,
  onClose,
}) => {
  return (
    <div className="max-w-lg w-full bg-gray-100 shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black border-2 border-Background-Overlay ring-opacity-5 overflow-hidden">
      {/* Imagen a la derecha */}
      <div className="flex-shrink-0 sm:ml-4 self-start sm:self-center">
        <img
          className="h-10 w-10 rounded-full object-cover"
          src={image}
          alt={nickname}
        />
      </div>
      <div className="flex-1 w-0 p-4">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          {/* Texto a la izquierda */}
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900">{nickname}</p>
            <div className="mt-1 text-xl text-gray-500">{message}</div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col border-l border-gray-200">
        {onAccept && (
          <button
            onClick={() => {
              onAccept();
              toast.dismiss(id);
            }}
            className="w-full border border-transparent p-2 flex items-center justify-center text-lg font-medium text-green-600 hover:text-green-800"
          >
            Aceptar
          </button>
        )}
        {onReject && (
          <button
            onClick={() => {
              onReject();
              toast.dismiss(id);
            }}
            className="w-full border-t border-gray-300 p-2 flex items-center justify-center text-lg font-medium text-red-500 hover:text-red-700"
          >
            Rechazar
          </button>
        )}
        <button
          onClick={() => {
            if (onClose) onClose();
            toast.dismiss(id);
          }}
          className="w-full border-t border-gray-300 p-2 flex items-center justify-center text-lg text-gray-500 hover:text-gray-800"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
