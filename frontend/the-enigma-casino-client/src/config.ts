export const BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

export const WS_BASE_URL: string = import.meta.env.VITE_WS_BASE_URL;
export const API_BASE_URL: string = `${BASE_URL}api/`;

/* URL IMAGEN PERFIL */
export const IMAGE_PROFILE_URL: string = `${BASE_URL}images/profile/`;

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
export const ETHEREUM_CONVERTION_WITHDRAWAL = `${API_BASE_URL}Blockchain/convertWithdrawal`;

/* ENDPOINTS DE ORDER */
export const LAST_ORDER = `${API_BASE_URL}Order/last-order`;
export const LAST_ORDER_ID = `${API_BASE_URL}Order/last-order-id`;
export const LAST_ORDER_WITHDRAWAL = `${API_BASE_URL}Order/last-order-withdrawal`;

/* ENDPOINTS DE USER */
export const USER_COINS = `${API_BASE_URL}User/coins`;

/* ENDPOINTS DE GAME TABLES */
export const GAMETABLES_ENDPOINT = `${API_BASE_URL}GameTable/tables`;

/* ENDPOINTS DE IMAGENES */
export const CARD_IMAGE = `${API_BASE_URL}cards/card`;
export const CARD_IMAGE_BACK = `${API_BASE_URL}cards/back`;

/* ENDPOINTS DE GACHAPON */
export const GACHAPON_PLAY = `${API_BASE_URL}Gachapon/play`;
export const GACHAPON_PRICE = `${API_BASE_URL}Gachapon/price`;

/* ENDPOINTS DE PROFILE */
export const USER_PROFILE = `${API_BASE_URL}User/profile`;
export const OTHER_USER_PROFILE = `${API_BASE_URL}User/profile/`;

/* ENDPOINTS DE PROFILE UPDATE*/
export const USER_IMAGE_UPDATE = `${API_BASE_URL}User/profile/image`;
export const USER_DEFAULT_IMAGE_UPDATE = `${API_BASE_URL}User/profile/image/default`;
export const USER_UPDATE = `${API_BASE_URL}User/update-user`;
export const USER_UPDATE_PASSWORD = `${API_BASE_URL}User/set-password`;
export const USER_GET_PROFILE = `${API_BASE_URL}User/get-profile`;


/* ENDPOINTS PARA LAS IMAGENES */
export const USER_IMAGES = `${BASE_URL}images/profile`;

/* ENDPOINTS DE HISTORY USER */
export const USER_HISTORY = `${API_BASE_URL}History`;
export const USER_HISTORY_BY_ID = `${API_BASE_URL}History/by-user-id`;

/* ENDPOINTS DE HISTORY GAMES */
export const USER_HISTORY_ORDERS = `${API_BASE_URL}Order/orders`;

/* ENDPOINTS DE PANEL DE USER EN ADMIN */
export const USERS_ADMIN = `${API_BASE_URL}AdminUser/users`;
export const search_USERS_ADMIN = `${API_BASE_URL}AdminUser/search-users`;
export const UPDATE_ROLE_ADMIN = `${API_BASE_URL}AdminUser/update-role`;
export const BAN_USER_ADMIN = `${API_BASE_URL}AdminUser/ban-user`;

/* ENDPOINTS DE PANEL DE PACK EN ADMIN */
export const PACKS_ADMIN = `${API_BASE_URL}AdminCoinsPack/coins-packs`;
export const PACKS_ADMIN_ID = `${API_BASE_URL}AdminCoinsPack/coins-pack`;
export const UPDATE_PACK_ADMIN = `${API_BASE_URL}AdminCoinsPack/coins-pack`;
