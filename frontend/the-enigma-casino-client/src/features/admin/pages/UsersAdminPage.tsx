import { useEffect } from "react";
import { useUnit } from "effector-react";
import { $adminUsers, loadAdminUsers, resetAdminUsers, searchAdminUsers } from "../stores/usersAdminStore";
import { CardUser } from "../components/cardUser/CardUser";
import { SearchBarUser } from "../components/searchBar/SearchBarUser";
import { loadAdminUsersFx } from "../actions/loadUsersActions";

export default function UsersAdminPage() {
  const users = useUnit($adminUsers);
  const isLoading = useUnit(loadAdminUsersFx.pending);

  useEffect(() => {
    loadAdminUsers();

    return () => {
      resetAdminUsers();
    };
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim() !== "") {
      searchAdminUsers(searchTerm);
    }
  };

  const handleReset = () => {
    loadAdminUsers();
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-Background-Page py-8 flex justify-center">
      <div className="w-full max-w-[1600px] px-4">
        <h1 className="text-Principal text-5xl font-reddit font-bold text-center mb-20">
          GESTIÓN DE USUARIOS
        </h1>

        <SearchBarUser onSearch={handleSearch} onReset={handleReset} />

        {isLoading ? (
          <div className="text-white text-2xl font-bold flex justify-center items-center h-40">
            Cargando usuarios...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-20 gap-x-0 xl:gap-x-0 2xl:gap-x-0 justify-items-center">
            {users.map(user => (
              <div
                key={user.id}
                className="transform transition-transform duration-300 hover:scale-105"
              >
                <CardUser user={user} adminId={1} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
