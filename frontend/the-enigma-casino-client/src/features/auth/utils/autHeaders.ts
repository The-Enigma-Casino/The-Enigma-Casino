import { getVarLS, getVarSessionStorage } from "../../../utils/storageUtils";

export const getAuthHeaders = () => {
  const token = getVarLS("token") || getVarSessionStorage("token");
  if (!token) throw new Error("No se encontró el token de autenticación");

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};
