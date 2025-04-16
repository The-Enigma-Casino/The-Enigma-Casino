import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";

function ProfileLayout() {
  return (
    <div>
      <Header />  
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}

export default ProfileLayout;