export const BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = `${BASE_URL}api/`;

/* ENDPOINTS DE LOGIN Y REGISTRO */
export const LOGIN_ENDPOINT = `${API_BASE_URL}Auth/login`;
export const REGISTER_ENDPOINT = `${API_BASE_URL}Auth/register`;
export const CONFIRM_EMAIL_ENDPOINT = `${API_BASE_URL}Auth/confirm-email`;

/* ENDPOINTS DE COINSPACK */
export const COINS_PACK = `${API_BASE_URL}Catalog/coins-packs`;
export const COINS_PACK_ID = `${API_BASE_URL}Catalog/coins-packs-by-id`;

/* ENDPOINTS DE PAYMENT */
export const PAYMENT_STATUS = `${API_BASE_URL}Stripe/status/`;
export const EMBBEDED_CHECKOUT = `${API_BASE_URL}Stripe/embedded-checkout/`;
