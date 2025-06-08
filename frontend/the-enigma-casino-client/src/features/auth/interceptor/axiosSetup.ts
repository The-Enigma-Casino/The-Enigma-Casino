import axios from "axios";
import { logoutWithReason } from "../store/authStore";
import { loginFx } from "../actions/authActions";

axios.interceptors.response.use(
  response => response,
  
  error => {
    console.log("Error response",error.response)
    if (error.response?.status === 401) {
            if (!isLoggingIn) {
        logoutWithReason("Token expirado");
      }
    }
    return Promise.reject(error);
  }
);

let isLoggingIn = false;
loginFx.watch(() => {
  isLoggingIn = true; 
});

loginFx.finally.watch(() => {
  isLoggingIn = false; 
});