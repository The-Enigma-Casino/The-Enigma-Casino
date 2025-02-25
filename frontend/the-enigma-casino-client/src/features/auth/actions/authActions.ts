import axios from "axios";
import { createEffect } from "effector";

import { LOGIN_ENDPOINT, REGISTER_ENDPOINT } from "../../../config";
import { LoginReq } from "../models/LoginReq.interface";
import { RegisterReq } from "../models/RegisterReq.interface";


export const loginFx = createEffect<LoginReq, string, Error>(async (loginData) => {
  const response = await axios.post<string>(LOGIN_ENDPOINT, loginData, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
});

export const registerFx = createEffect<RegisterReq, string, Error>(async (registerData) => {
  const response = await axios.post<string>(REGISTER_ENDPOINT, registerData, {
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
});
