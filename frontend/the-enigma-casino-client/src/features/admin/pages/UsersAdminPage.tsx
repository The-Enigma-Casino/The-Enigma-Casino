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
  { id: 1, nickname: "JMOLME", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 2, nickname: "RALOWL", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 3, nickname: "Ale-BR", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 4, nickname: "VEGETA", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 5, nickname: "USER1", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 6, nickname: "USER2", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
  { id: 7, nickname: "USER3", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 8, nickname: "USER4", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
  { id: 1, nickname: "JMOLME", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 2, nickname: "RALOWL", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 3, nickname: "Ale-BR", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 4, nickname: "VEGETA", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 5, nickname: "USER1", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 6, nickname: "USER2", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
  { id: 7, nickname: "USER3", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 8, nickname: "USER4", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
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
    <div className="min-h-[calc(100vh-10rem)] bg-Background-Page py-8 flex justify-center">
      <div className="w-full max-w-[1600px] px-4">
        <h1 className="text-Principal text-5xl font-reddit font-bold text-center mb-20 ">
          GESTIÓN DE USUARIOS
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-20 gap-x-0 xl:gap-x-0 2xl:gap-x-0 justify-items-center">
          {mockUsers.map(user => (
            <div
              key={user.id}
              className="transform transition-transform duration-300 hover:scale-105"
            >
              <CardUser user={user} adminId={1}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



