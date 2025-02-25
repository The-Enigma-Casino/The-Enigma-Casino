import { Toaster } from "react-hot-toast";
import "./App.css";

import router from "./routes";

import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <>
      <Toaster position="bottom-left" reverseOrder={false} />
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
