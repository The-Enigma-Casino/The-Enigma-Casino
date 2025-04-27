import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import { $adminUsers, loadAdminUsers, resetAdminUsers, searchAdminUsers, changeAdminUserRole } from "../stores/usersAdminStore";
import { loadAdminUsersFx } from "../actions/loadUsersActions";
import { CardUser } from "../components/cardUser/CardUser";
import { SearchBarUser } from "../components/searchBar/SearchBarUser";
import Modal from "../../../components/ui/modal/Modal";

export default function UsersAdminPage() {
  const users = useUnit($adminUsers);
  const isLoading = useUnit(loadAdminUsersFx.pending);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

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

  const handleOpenChangeRoleModal = (userId: number) => {
    setSelectedUserId(userId);
    setModalOpen(true);
  };

  const handleConfirmChangeRole = () => {
    if (selectedUserId !== null) {
      changeAdminUserRole(selectedUserId);
    }
    setModalOpen(false);
    setSelectedUserId(null);

    setTimeout(() => {
      loadAdminUsers();
    }, 500);
  };

  const handleCancelChangeRole = () => {
    setModalOpen(false);
    setSelectedUserId(null);
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
                <CardUser
                  user={user}
                  adminId={1}
                  onChangeRole={() => handleOpenChangeRoleModal(user.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCancelChangeRole} size="small" position="center">
        <div className="flex flex-col items-center justify-center p-4 gap-6">
          <h2 className="text-white text-2xl font-bold text-center">¿Cambiar el rol de este usuario?</h2>
          <div className="flex gap-6">
            <button
              onClick={handleConfirmChangeRole}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Confirmar
            </button>
            <button
              onClick={handleCancelChangeRole}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
