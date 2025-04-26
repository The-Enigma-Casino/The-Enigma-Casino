import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import Button from "../../../components/ui/button/Button";
import UserInfo from "../components/UserInfo";
import UserHistory from "../components/UserHistory";
import UserOrders from "../components/UserOrders";

import { loadUserProfile } from "../store/profile/profileEvents";
import { loadHistory } from "../store/history/historyEvents";
import { loadOrders } from "../store/orders/orderEvents";

import { $userProfile } from "../store/profile/profileStores";
import { $historyGames, $historyPage, $historyTotalPages } from "../store/history/historyStores";
import { $orders, $ordersPage, $ordersTotalPages } from "../store/orders/orderStore";
import { $imageEdit } from "../store/editProfile/editEvent";


const UserProfile = () => {


  const games = useUnit($historyGames);
  const currentPage = useUnit($historyPage);
  const totalPages = useUnit($historyTotalPages);

  const orders = useUnit($orders);
  const currentOrderPage = useUnit($ordersPage);
  const totalOrderPages = useUnit($ordersTotalPages);
  const imageEdit = useUnit($imageEdit);
  const [activeTab, setActiveTab] = useState<"history" | "orders">("history");

  useEffect(() => {
    loadUserProfile();
    loadHistory(1);
    loadOrders(1);
  }, []);
  const profile = useUnit($userProfile);

  useEffect(() => {
    loadUserProfile();
  }, [imageEdit]);

  if (!profile) return <div>Cargando perfil...</div>;

  return (
    <>
      <div className=" bg-Background-Page">
        <UserInfo user={profile} relations="self" />

        {/* Botones para alternar vistas */}
        <div className="flex flex-wrap justify-center gap-6 my-10 ">
          <Button
            variant="bigPlus"
            color={activeTab === "history" ? "green" : "selectedProfile"}
            font="bold"
            onClick={() => setActiveTab("history")}
          >
            Historial de Partidas
          </Button>

          <Button
            variant="bigPlus"
            color={activeTab === "orders" ? "green" : "selectedProfile"}
            font="bold"
            onClick={() => setActiveTab("orders")}
          >
            Historial de Pedidos
          </Button>
        </div>

        {/* Mostrar tablas */}
        {activeTab === "history" ? (
          <UserHistory
            games={games}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={loadHistory}
          />
        ) : (
          <UserOrders
            orders={orders}
            page={currentOrderPage}
            totalPages={totalOrderPages}
            onPageChange={loadOrders}
          />
        )}
      </div>
    </>
  );
};

export default UserProfile;
