import { LOGIN_ENDPOINT, REGISTER_ENDPOINT } from "../../../config";
import { LoginReq } from "../models/LoginReq.interface";
import { RegisterReq } from "../models/RegisterReq.interface";

export const login = async (loginData: LoginReq) => {
  const response = await fetch(LOGIN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
    },
    body: JSON.stringify(loginData),  
  });

  if (!response.ok) {
    throw new Error('Identificador o contraseña inválidos');
  }

  const data = await response.json();
  return data;  
};

export const register = async (registerReq: RegisterReq) => {
  const response = await fetch(REGISTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
    },
    body: JSON.stringify(registerReq),  
  });

  if (!response.ok) {
    throw new Error('No se que poner aqui todavia');
  }

  const data = await response.json();
  return data;  
};
