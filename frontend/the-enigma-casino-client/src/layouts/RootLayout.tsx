import Footer from "../components/layouts/footer/Footer";
import Header from "../components/layouts/header/Header";

import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <main>
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
}

export default RootLayout;
