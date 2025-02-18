import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}

export default RootLayout;
