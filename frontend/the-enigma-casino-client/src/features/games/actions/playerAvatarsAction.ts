import axios from "axios";
import { createEffect } from "effector";
import { PLAYER_AVATARS } from "../../../config";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { PlayerDto } from "../shared/interfaces/playerDto.interface";

export const getPlayerAvatarsFx = createEffect(async (nickNames: string[]) => {
  const params = new URLSearchParams();
  nickNames.forEach(nick => params.append('nickNames', nick));

  const response = await axios.get(PLAYER_AVATARS + `?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  return response.data as PlayerDto[];
});
