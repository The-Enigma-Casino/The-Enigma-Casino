import { Outlet } from "react-router-dom";
import Footer from "../components/layouts/footer/Footer";

function RootLayout() {
  return (
    <main>
      <Outlet />
      <Footer />
    </main>
  );
}

export default RootLayout;
