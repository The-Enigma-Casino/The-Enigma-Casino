import { CardUser } from "../components/cardUser/CardUser";
import { SearchBarUser } from "../components/searchBar/SearchBarUser";
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

  { id: 9, nickname: "JMOLME 2", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 10, nickname: "RALOWL 2", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 11, nickname: "Ale-BR 2", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 12, nickname: "VEGETA 2", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 13, nickname: "USER5", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 14, nickname: "USER6", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
  { id: 15, nickname: "USER7", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 16, nickname: "USER8", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },

  { id: 17, nickname: "JMOLME 3", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 18, nickname: "RALOWL 3", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 19, nickname: "Ale-BR 3", image: "https://localhost:7186/images/profile/user_default.png", role: "Admin", isSelfBanned: false },
  { id: 20, nickname: "VEGETA 3", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 21, nickname: "USER9", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 22, nickname: "USER10", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
  { id: 23, nickname: "USER11", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: false },
  { id: 24, nickname: "USER12", image: "https://localhost:7186/images/profile/user_default.png", role: "User", isSelfBanned: true },
];


export default function UsersAdminPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] bg-Background-Page py-8 flex justify-center">
      <div className="w-full max-w-[1600px] px-4">
        <h1 className="text-Principal text-5xl font-reddit font-bold text-center mb-20 ">
          GESTIÓN DE USUARIOS
        </h1>

        <SearchBarUser onSearch={() => {} }  onReset={() => {}}></SearchBarUser>

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



