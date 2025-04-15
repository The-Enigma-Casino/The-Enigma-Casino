import {
  gameStateReceived,
  setPlayers,
  setCroupier,
  setGameState,
  setCurrentTurnUserId,
  resetCroupierRoundHand,
  resetRoundResults
} from "../store/bjEvents";
import { Player, Croupier } from "../../shared/types";

gameStateReceived.watch((game) => {
  console.log("[Mapper] game_state recibido:", game);

  const mappedPlayers: Player[] = game.players?.map((p: any) => ({
    id: p.userId,
    name: p.nickname,
    hand: p.hand ?? [],
    bet: p.bet ?? 0,
    state: p.state ?? "Playing", // Parche temporal
  })) ?? [];

  const mappedCroupier: Croupier = {
    hand:
      game.croupier?.fullHand && game.croupier.fullHand.length > 0
        ? [...game.croupier.fullHand]
        : game.croupier?.visibleCard
          ? [game.croupier.visibleCard]
          : [],
  };


  setPlayers(mappedPlayers);
  setCroupier(mappedCroupier);

  if (typeof game.currentTurnUserId === "number") {
    setCurrentTurnUserId(game.currentTurnUserId);
  }

  const state = game.state ?? "InProgress";
  console.log("Estado del juego:", state);

  if (state === "Waiting") {
    resetCroupierRoundHand(); // Limpia la ronda anterior
    resetRoundResults();      // Limpia resultados anteriores
  }

  // Nueva ronda
  if (state === "InProgress" && game.croupier?.visibleCard) {
    resetCroupierRoundHand();
  }

  setGameState(state);
});
