import { Toaster } from "react-hot-toast";
import "./App.css";

import router from "./routes";

import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <>
      <Toaster
        position="top-left"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "1.5rem",
            marginTop: "10rem",
          },
        }}
      />


      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
