import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/datepicker-theme.css";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
