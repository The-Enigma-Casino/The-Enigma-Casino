import { CardUser } from "../components/cardUser/CardUser";
import { UserAdmin } from "../interfaces/UserAdmin.interface";

const mockUsers: UserAdmin[] = [
  { id: 1, nickname: "JMOLME", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 2, nickname: "RALOWL", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 3, nickname: "Ale-BR", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 4, nickname: "VEGETA", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 5, nickname: "USER1", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 6, nickname: "USER2", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
  { id: 7, nickname: "USER3", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 8, nickname: "USER4", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
];

export default function UsersAdminPage() {
  return (
    <div className="min-h-screen bg-Background-Page p-8">
      <h1 className="text-white text-3xl font-reddit font-bold mb-8">GESTIÓN DE USUARIOS:</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
        {mockUsers.map(user => (
          <CardUser key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}






