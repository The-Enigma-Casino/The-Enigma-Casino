import { createEffect } from "effector";
import { NavigateFunction } from "react-router-dom";

let _navigate: NavigateFunction;

export const setNavigate = (navFn: NavigateFunction) => {
  _navigate = navFn;
};

export const navigateTo = createEffect<string, void>((path) => {
  if (_navigate) _navigate(path);
});
