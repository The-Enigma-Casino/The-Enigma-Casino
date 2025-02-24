import { LOGIN_ENDPOINT, REGISTER_ENDPOINT } from "../../../config";
import { LoginReq } from "../models/LoginReq.interface";
import { RegisterReq } from "../models/RegisterReq.interface";
import axios from 'axios';

export const login = async (loginData: LoginReq): Promise<string> => {
  try {
    const response = await axios.post(LOGIN_ENDPOINT, loginData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error('Identificador o contraseña inválidos.');
    } else {
      throw new Error('Hubo un error con la solicitud.');
    }
  }
};

export const register = async (registerReq: RegisterReq): Promise<string> => {
  try {
    const response = await axios.post(REGISTER_ENDPOINT, registerReq, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error('No se ha podido realizar el registro.');
    } else {
      throw new Error('Hubo un error con la solicitud.');
    }
  }
};
