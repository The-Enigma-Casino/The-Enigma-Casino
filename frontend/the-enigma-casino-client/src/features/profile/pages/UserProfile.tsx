import UserInfo from "../components/UserInfo";
import UserHistory from "../components/UserHistory";
import { useEffect } from "react";
import { loadUserProfile } from "../store/profile/profileEvents";
import { $userProfile } from "../store/profile/profileStores";
import { $historyGames, $historyPage, $historyTotalPages } from "../store/history/historyStores";
import { $orders, $ordersPage, $ordersTotalPages } from "../store/orders/orderStore";
import { useUnit } from "effector-react";
import { loadHistory } from "../store/history/historyEvents";
import { loadOrders } from "../store/orders/orderEvents";
import UserOrders from "../components/UserOrders";





const UserProfile = () => {
  const profile = useUnit($userProfile);
  const games = useUnit($historyGames);
  const currentPage = useUnit($historyPage);
  const totalPages = useUnit($historyTotalPages);
  const orders = useUnit($orders);
  const currentOrderPage = useUnit($ordersPage);
  const totalOrderPages = useUnit($ordersTotalPages);

  console.log(games)
  useEffect(() => {
    loadUserProfile();
    loadHistory(1);
    loadOrders(1);
  }, []);

  if (!profile) return <div>Cargando perfil...</div>;
  return (
    <>
      <UserInfo user={profile} relation="self" />
      <UserHistory
        games={games}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => loadHistory(page)}
      />
      <UserOrders
        orders={orders}
        page={currentOrderPage}
        totalPages={totalOrderPages}
        onPageChange={loadOrders}
      />


    </>
  );
};

export default UserProfile;
