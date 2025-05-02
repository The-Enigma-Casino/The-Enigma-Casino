import React from "react";
import styles from "./Chip.module.css";

interface ChipProps {
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({ children }) => {
  return  <div className={styles.dashedCircle}>{children}</div>;



};
