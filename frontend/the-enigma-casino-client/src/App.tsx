import { Toaster } from "react-hot-toast";
import "./App.css";

import router from "./routes";
import { RouterProvider } from "react-router-dom";

import "./features/gameTables/store/tableHandler";
import "./features/friends/stores/friends.handler";
import "./features/friends/stores/friends.watchers";
import "./features/friends/stores/friends.samples";
import { useEffect } from "react";
import { connectSocket } from "./websocket/store/wsIndex";
import { initAuth } from "./features/auth/utils/initAuth";

function App() {
  useEffect(() => {
    initAuth(); 
    connectSocket();
  }, []);

  return (
    <>
      <Toaster
        position="top-left"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "1.5rem",
            marginTop: "10rem",
            touchAction: "manipulation",
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
