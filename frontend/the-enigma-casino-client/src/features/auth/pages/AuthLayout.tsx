import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}

export default AuthLayout;
