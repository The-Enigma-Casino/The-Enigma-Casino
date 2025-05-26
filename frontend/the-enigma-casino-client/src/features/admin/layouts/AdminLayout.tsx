import { useUnit } from "effector-react";
import { Navigate, Outlet } from "react-router-dom";
import { $role } from "../../auth/store/authStore";
import Header from "../../../components/layouts/header/Header";
import HeaderMobile from "../../../components/layouts/header/HeaderMobile";
import { useMediaQuery } from "../../../utils/useMediaQuery";

function AdminLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const role = useUnit($role);

  if (role.toLowerCase() !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div>{isMobile ? <HeaderMobile /> : <Header />}</div>
      <Outlet />
    </>
  );
}

export default AdminLayout;
