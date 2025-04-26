import { UserAdmin } from "../../interfaces/UserAdmin.interface";

interface Props {
  user: UserAdmin;
  onChangeRole?: (id: number) => void;
  onToggleBan?: (id: number) => void;
}

// TEMPORAL
const LOGGED_USER_ID = 1;

export function CardUser({ user, onChangeRole, onToggleBan }: Props) {
  const { id, nickname, image, role, isSelfBanned } = user;

  const avatarUrl = image.startsWith("http") ? image : `/uploads/${image}`;

  const isAdminBan = role === "Banned";
  const showUnbanButton = isAdminBan;
  const isSelf = id === LOGGED_USER_ID;

  const displayRole = isAdminBan ? "BANNED" : role.toUpperCase();

  const roleColor = isAdminBan
    ? "text-Color-Cancel"
    : role === "Admin"
    ? "text-Principal"
    : "text-white";

  return (
    <div className="relative w-[190px] h-[190px] rounded-[20px] bg-Background-nav border-2 border-Green-lines flex flex-col justify-between items-center p-3">
      <div className="flex flex-col items-center justify-center mt-2">
        <h2 className="text-white text-lg font-reddit font-bold truncate">{nickname}</h2>

        <div className="relative mt-3">
          <img
            src={avatarUrl}
            alt={nickname}
            className={`w-[60px] h-[60px] rounded-full object-cover ${
              (isAdminBan || isSelfBanned) ? "opacity-40" : ""
            }`}
          />
          {(isAdminBan || isSelfBanned) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[65px] h-[2px] bg-Color-Cancel rotate-45" />
            </div>
          )}
        </div>

        <p className={`mt-3 font-bold text-base ${roleColor}`}>
          {isSelfBanned && !isAdminBan ? role.toUpperCase() : displayRole}
        </p>
      </div>

      {!isSelf && (
        <div className="flex items-center justify-center gap-5 mb-2">
          <button
            onClick={() => onChangeRole?.(id)}
            className="hover:scale-125 transition-transform"
            title="Cambiar Rol"
          >
            <img src="/svg/change-rol.svg" alt="Change Role" className="w-10 h-10" />
          </button>

          <div className="w-px h-8 bg-Green-lines" />

          <button
            onClick={() => onToggleBan?.(id)}
            className="hover:scale-125 transition-transform"
            title={showUnbanButton ? "Desbloquear usuario" : "Bloquear usuario"}
          >
            <img
              src={showUnbanButton ? "/svg/unbanuser.svg" : "/svg/ban-user.svg"}
              alt={showUnbanButton ? "Unban User" : "Ban User"}
              className="w-10 h-10"
            />
          </button>
        </div>
      )}
    </div>
  );
}
