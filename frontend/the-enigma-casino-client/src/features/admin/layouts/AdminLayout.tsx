import { useUnit } from "effector-react";
import { Navigate, Outlet } from "react-router-dom";
import { $role } from "../../auth/store/authStore";
import Header from "../../../components/layouts/header/Header";

function AdminLayout() {

  const role = useUnit($role);

  if (role.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export default AdminLayout;
