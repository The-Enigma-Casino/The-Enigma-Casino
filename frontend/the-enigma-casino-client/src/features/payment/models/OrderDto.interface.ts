import { CoinsPack } from "../../catalog/models/CoinsPack.interface";
import { PayMode } from "./PayMode.enum";

export interface OrderDto {
  id: number;
  coinsPack: CoinsPack;
  isPaid: boolean;
  paidDate: Date;
  coins: number;
  payMode: PayMode;
  ehtereum?: number;
}
