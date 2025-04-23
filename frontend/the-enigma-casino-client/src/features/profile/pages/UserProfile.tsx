import UserInfo from "../components/UserInfo";
import UserHistory from "../components/UserHistory";

const mockUser = {
  name: "Alejandro Barrionuevo",
  email: "theenigmacasino@gmail.com",
  nickname: "admin",
  address: "Calle Fin del Mundo Nº777",
  country: "ESP",
  coins: 50460,
  image: "/img/poker.webp",
  role: "Admin",
};

const mockGames = [
  {
    id: 22,
    joinedAt: "2025-04-20T13:12:54.5648862",
    gameType: 1,
    chipResult: 3970,
  },
  {
    id: 10,
    joinedAt: "2025-04-20T13:09:54.5648796",
    gameType: 1,
    chipResult: 4158,
  },
  {
    id: 11,
    joinedAt: "2025-04-20T13:07:54.5648801",
    gameType: 2,
    chipResult: 3260,
  },
  {
    id: 21,
    joinedAt: "2025-04-20T13:05:54.5648856",
    gameType: 2,
    chipResult: 3692,
  },
  {
    id: 18,
    joinedAt: "2025-04-20T13:02:54.564884",
    gameType: 2,
    chipResult: 2711,
  },
];

const UserProfile = () => {

  return (
    <>
      <UserInfo user={mockUser} relation="self" />
      <UserHistory
        games={mockGames}
        page={1}
        totalPages={5}
        onPageChange={(page) => console.log("Cambiar a página", page)}
      />

    </>
  );
};

export default UserProfile;
