/**
 * convertCentsToEuros
 * 
 * Convierte un precio de centimos a euros con dos decimales y formatea el resultado.
 * 
 * Ejemplo:
 * convertCentsToEuros(1500) => "15,00"
 * 
 * @param cents El precio en centimos.
 * @returns El precio formateado en euros (con una coma como separador decimal).
 */
export function convertCentsToEuros(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

/**
 * formatPriceWithCurrency
 * 
 * Convierte un precio de centimos a euros y agrega el simbolo de euro.
 * 
 * Ejemplo:
 * formatPriceWithCurrency(1500) => "15,00 €"
 * 
 * @param cents El precio en centimos.
 * @returns El precio formateado en euros con el simbolo de euro.
 */
export function formatPriceWithCurrency(cents: number): string {
  return `${convertCentsToEuros(cents)} €`;
}

/**
 * calculateTotalPrice
 * 
 * Calcula el precio total en centimos para un arreglo de articulos dado.
 * Cada articulo debe tener un `price` en centimos y una `quantity`.
 * 
 * Ejemplo:
 * const data = [
 *   { price: 1000, quantity: 5 },
 *   { price: 3000, quantity: 2 }
 * ];
 * calculateTotalPrice(data) => 20000
 * 
 * @param items Arreglo de articulos, cada uno con las propiedades `price` y `quantity`.
 * @returns El precio total en centimos.
 */
export function calculateTotalPrice(items: { price: number, quantity: number }[]): number {
  let totalPrice = 0;

  items.forEach(item => {
    totalPrice += item.price * item.quantity;
  });

  return totalPrice;
}

/**
 * applyDiscount
 * 
 * Aplica un descuento porcentual a un precio en centimos.
 * 
 * Ejemplo:
 * 
 * applyDiscount(1000, 10) => 9000
 * 
 * @param price 
 * @param discount 
 * @returns 
 */
export function applyDiscount(price: number, discount: number): number {
  return Math.round(price * (1 - discount / 100));
}
