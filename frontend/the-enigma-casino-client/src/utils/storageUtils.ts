/**
 * Updates localStorage with a new item.
 *
 * @param item - The object or array to be stored in localStorage.
 * @param clave - The key under which the item will be saved.
 */
export function updateLocalStorage<T>(clave: string, item: T): void {
  localStorage.setItem(clave, JSON.stringify(item));
}

/**
 * Updates sessionStorage with a new item.
 *
 * @param item - The object or array to be stored in sessionStorage.
 * @param clave - The key under which the item will be saved.
 */
export function updateSessionStorage<T>(clave: string, item: T): void {
  sessionStorage.setItem(clave, JSON.stringify(item));
}

/**
 * Retrieves a variable from localStorage.
 *
 * @param clave - The key under which the item was saved in localStorage.
 * @returns The retrieved object or null if not found.
 */
export function getVarLS<T>(clave: string): T | null {
  const item = localStorage.getItem(clave);
  return item ? (JSON.parse(item) as T) : null;
}

/**
 * Retrieves a variable from sessionStorage.
 *
 * @param clave - The key under which the item was saved in sessionStorage.
 * @returns The retrieved object or null if not found.
 */
export function getVarSessionStorage<T>(clave: string): T | null {
  const item = sessionStorage.getItem(clave);
  return item ? (JSON.parse(item) as T) : null;
}

/**
 * Removes an item from localStorage.
 *
 * @param clave - The key of the item to be removed.
 */
export function deleteLocalStorage(clave: string): void {
  localStorage.removeItem(clave);
}

/**
 * Removes an item from sessionStorage.
 *
 * @param clave - The key of the item to be removed.
 */
export function deleteSessionStorage(clave: string): void {
  sessionStorage.removeItem(clave);
}
