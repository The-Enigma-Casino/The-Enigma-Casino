export const BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = `${BASE_URL}api/`;

/* ENDPOINTS DE LOGIN Y REGISTRO */
export const LOGIN_ENDPOINT = `${API_BASE_URL}Auth/login`;
export const REGISTER_ENDPOINT = `${API_BASE_URL}Auth/register`;
export const CONFIRM_EMAIL_ENDPOINT = `${API_BASE_URL}Auth/confirm-email`;

/* ENDPOINTS DE COINSPACK */
export const COINS_PACK = `${API_BASE_URL}CoinsPack/coins-packs`;
export const COINS_PACK_ID = `${API_BASE_URL}CoinsPack/coins-packs-by-id`;

/* ENDPOINTS DE PAYMENT */
export const PAYMENT_STATUS = `${API_BASE_URL}Stripe/status`;
export const EMBBEDED_CHECKOUT = `${API_BASE_URL}Stripe/embedded-checkout`;

/* ENDPOINTS DE ETHEREUM */
export const ETHEREUM_PAYMENT_CHECK = `${API_BASE_URL}Blockchain/check`;
export const ETHEREUM_CHECK_TRANSACTION = `${API_BASE_URL}Blockchain/transaction`;
export const ETHEREUM_WITHDRAWAL = `${API_BASE_URL}Blockchain/withdrawal`;

/* ENDPOINTS DE ORDER */
export const LAST_ORDER = `${API_BASE_URL}Order/last-order`
export const LAST_ORDER_ID = `${API_BASE_URL}Order/last-order-id`

/* ENDPOINTS DE USER */
export const USER_COINS = `${API_BASE_URL}User/coins`;

/* ENDPOINTS DE GAME TABLES */
export const GAMETABLES_ENDPOINT = `${API_BASE_URL}GameTable/tables`;
