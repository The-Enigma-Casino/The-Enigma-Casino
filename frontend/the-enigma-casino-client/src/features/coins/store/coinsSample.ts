import { sample } from "effector";
import { $userId } from "../../auth/store/authStore";
import { loadCoins } from "./coinsStore";
import { getCoinsByUserFx } from "../actions/coinsActions";

sample({
  source: $userId,
  clock: loadCoins,
  filter: (userId) => !!userId,
  target: getCoinsByUserFx,
});
