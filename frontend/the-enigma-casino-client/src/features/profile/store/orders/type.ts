export interface OrderDto {
  id: number;
  paidDate: string;
  image: string;
  price: number;
  coins: number;
  payMode: number;
  orderType: number;
  ethereumPrice: number;
}

export interface OrderResponse {
  orders: OrderDto[];
  totalPages: number;
  page: number;
}
