export const BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = `${BASE_URL}api/`;

/* ENDPOINTS DE LOGIN Y REGISTRO */
export const LOGIN_ENDPOINT = `${API_BASE_URL}auth/login`;
export const REGISTER_ENDPOINT = `${API_BASE_URL}auth/register`;
