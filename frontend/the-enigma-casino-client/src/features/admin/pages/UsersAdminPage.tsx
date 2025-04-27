import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import {
  $adminUsers,
  loadAdminUsers,
  resetAdminUsers,
  searchAdminUsers,
  changeAdminUserRole,
} from "../stores/usersAdminStore";
import { CardUser } from "../components/cardUser/CardUser";
import { SearchBarUser } from "../components/searchBar/SearchBarUser";
import Modal from "../../../components/ui/modal/Modal";
import Button from "../../../components/ui/button/Button";

export default function UsersAdminPage() {
  const users = useUnit($adminUsers);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAdminUsers();

    return () => {
      resetAdminUsers();
    };
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() !== "") {
      searchAdminUsers(term);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
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
      if (searchTerm.trim() !== "") {
        searchAdminUsers(searchTerm);
      } else {
        loadAdminUsers();
      }
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-20 gap-x-0 xl:gap-x-0 2xl:gap-x-0 justify-items-center">
          {users.map((user) => (
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelChangeRole}
        size="small"
        position="center"
      >
        <div className="flex flex-col items-center justify-center p-6 gap-8">
          <h2 className="text-white text-3xl font-bold text-center">
            ¿Cambiar el rol de este usuario?
          </h2>
          <div className="flex gap-8">
            <Button
              onClick={handleConfirmChangeRole}
              variant="short"
              color="green"
              font="bold"
            >
              Confirmar
            </Button>

            <Button
              onClick={handleCancelChangeRole}
              variant="short"
              color="red"
              font="bold"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
