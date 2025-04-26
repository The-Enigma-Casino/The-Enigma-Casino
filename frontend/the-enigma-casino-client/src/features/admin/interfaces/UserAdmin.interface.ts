export type Role = "User" | "Admin" | "Banned";

export interface UserAdmin {
  id: number;
  nickname: string;
  image: string;
  role: Role;
  isSelfBanned: boolean;
}

