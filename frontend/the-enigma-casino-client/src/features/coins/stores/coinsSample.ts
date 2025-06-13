import { sample } from "effector";
import { $token, $userId } from "../../auth/store/authStore";
import { loadCoins } from "./coinsStore";
import { getCoinsByUserFx } from "../actions/coinsActions";


sample({
  source: $token,
  clock: loadCoins,
  filter: (token) => !!token,
  target: getCoinsByUserFx,
});

$userId.watch((id) => console.log("🪪 userId actualizado:", id));
loadCoins.watch(() => console.log("🚀 loadCoins lanzado"));
getCoinsByUserFx.done.watch(({ result }) => console.log("💰 Coins recibidas:", result));
getCoinsByUserFx.fail.watch(({ error }) => console.error("❌ Error coins:", error));

