import axios from "axios";
import { createEffect } from "effector";

import {
  CONFIRM_EMAIL_ENDPOINT,
  GOOGLE_LOGIN,
  GOOGLE_REGISTER,
  LOGIN_ENDPOINT,
  REGISTER_ENDPOINT,
} from "../../../config";
import { LoginReq } from "../models/LoginReq.interface";
import { RegisterReq } from "../models/RegisterReq.interface";
import { setGoogleIdToken, setToken } from "../store/authStore";
import { connectSocket } from "../../../websocket/store/wsEvents";

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

export const loginWithGoogleFx = createEffect(async ({ idToken }: { idToken: string }) => {
  try {
    const response = await axios.post(GOOGLE_LOGIN, { idToken });

    const { jwt } = response.data;
    setToken({ token: jwt, rememberMe: true });
    connectSocket();
    window.location.href = "/";
  } catch (error: any) {
    if (error.response?.status === 404) {
      setGoogleIdToken(idToken);
      window.location.href = "/auth/google-register";
    } else {
      console.error("Error al hacer login con Google");
    }
  }
});


export const registerWithGoogleFx = createEffect(async (data: {
  idToken: string;
  dateOfBirth: string;
  country?: string;
  address?: string;
}) => {
  const response = await axios.post(GOOGLE_REGISTER, data);
  const { jwt } = response.data;

  setToken({ token: jwt, rememberMe: true });
  connectSocket();
});
