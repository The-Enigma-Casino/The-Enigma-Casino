import { IMAGE_PROFILE_URL } from "../../../../config";
import { UserAdmin } from "../../interfaces/UserAdmin.interface";

interface Props {
  user: UserAdmin;
  adminId?: number;
  onChangeRole?: (id: number) => void;
  onToggleBan?: (id: number) => void;
}

export function CardUser({ user, adminId, onChangeRole, onToggleBan }: Props) {
  const { id, nickname, image, role, isSelfBanned } = user;

  const isSelf = id === adminId;

  const mapRole = (roleValue: number | string): string => {
    if (typeof roleValue === "string") return roleValue.toUpperCase();

    switch (Number(roleValue)) {
      case 0:
        return "ADMIN";
      case 1:
        return "USER";
      case 2:
        return "BANNED";
      default:
        return "UNKNOWN";
    }
  };

  const displayRole = mapRole(role);

  const isAdmin = displayRole === "ADMIN";
  const isAdminBan = displayRole === "BANNED";
  const showUnbanButton = isAdminBan;

  const roleColor = isAdminBan
    ? "text-Color-Cancel"
    : isAdmin
    ? "text-Principal"
    : "text-white";

  const canChangeRole = !isSelf && !isAdminBan;
  const canToggleBan = !isSelf && !isAdmin;

  return (
    <div className="transform transition-transform duration-300 hover:scale-105">
      <div className="relative w-[190px] h-[190px] rounded-[20px] bg-Background-nav border-2 border-Green-lines flex flex-col justify-between items-center p-3">
        <div className="flex flex-col items-center justify-center mt-2">
          <h2 className="text-white text-lg font-reddit font-bold truncate">{nickname}</h2>

          <div className="relative mt-3">
            <img
              src={IMAGE_PROFILE_URL + image}
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
            {displayRole}
          </p>
        </div>

        {(canChangeRole || canToggleBan) && (
          <div className="flex items-center justify-center gap-5 mb-2">
            {canChangeRole && (
              <button
                onClick={() => onChangeRole?.(id)}
                className="hover:scale-125 transition-transform"
                title="Cambiar Rol"
              >
                <img src="/svg/change-rol.svg" alt="Change Role" className="w-10 h-10" />
              </button>
            )}

            {canChangeRole && canToggleBan && (
              <div className="w-px h-8 bg-Green-lines" />
            )}

            {canToggleBan && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
