import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/datepicker-theme.css";

import "./init/appLogic.ts";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('✅ Service Worker registrado:', reg))
      .catch(err => console.error('❌ Error al registrar el SW:', err));
  });
}
