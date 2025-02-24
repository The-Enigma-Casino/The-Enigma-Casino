import "./App.css";

import router from "./routes";

import {
  RouterProvider,
} from "react-router-dom";


function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
