import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./navigateFx"; 

export const NavigationInit = () => {
  const nav = useNavigate();

  useEffect(() => {
    setNavigate(nav);
  }, [nav]);

  return null;
};
