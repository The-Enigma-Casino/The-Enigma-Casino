import { useUnit } from "effector-react";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { $token } from "../features/auth/store/authStore";


interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const token = useUnit($token);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};
