import axios from "axios";
import { createEffect } from "effector";

import {
  AUTOBAN,
  CONFIRM_EMAIL_ENDPOINT,
  LOGIN_ENDPOINT,
  REGISTER_ENDPOINT,
} from "../../../config";
import { LoginReq } from "../models/LoginReq.interface";
import { RegisterReq } from "../models/RegisterReq.interface";
import { logout } from "../store/authStore";

// LOGIN
export const loginFx = createEffect<LoginReq, string, string>(
  async (loginData) => {
    try {
      const response = await axios.post<string>(LOGIN_ENDPOINT, loginData, {
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Ocurrió un error inesperado en el login.";
      throw errorMessage;
    }
  }
);

// REGISTER
export const registerFx = createEffect<RegisterReq, string, string>(
  async (registerData) => {
    try {
      const response = await axios.post<string>(
        REGISTER_ENDPOINT,
        registerData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data ||
        "Ocurrió un error inesperado en el registro.";
      throw errorMessage;
    }
  }
);

// CONFIRM EMAIL
export const confirmEmailFx = createEffect<string, string, string>(
  async (token) => {
    try {
      const response = await axios.put<string>(CONFIRM_EMAIL_ENDPOINT, null, {
        params: { token },
        headers: { "Content-Type": "application/json" },
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Ocurrió un error inesperado en la confirmación de email.";
      throw errorMessage;
    }
  }
);

// AUTOBAN
export const autoBanFx = createEffect<void, string, string>(async () => {
  try {
    const response = await axios.post<string>(
      AUTOBAN,
      null,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Ocurrió un error inesperado al solicitar la autoexpulsión.";
    throw errorMessage;
  }
});

autoBanFx.done.watch(() => {
  logout();
});