import { createEffect } from "effector";
import axios from "axios";
import { BigWin } from "../interfaces/bigWin.interface";
import { LAST_BIG_WIN } from "../../../config";

export const fetchBigWinsFx = createEffect(async (): Promise<BigWin[]> => {
  const response = await axios.get<BigWin[]>(LAST_BIG_WIN);
  return response.data;
});
