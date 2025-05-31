import { useState } from "react";
import { Bell } from "../ui/Bell";
import { NotificationDropdown } from "./NotificationDropdown";
import classes from "./BellWithDropdown.module.css";

type BellWithDropdownProps = {
  direction?: "mobile" | "desktop";
};

export const BellWithDropdown = ({ direction = "desktop" }: BellWithDropdownProps) => {
  const [open, setOpen] = useState(false);

  const dropdownClass =
    direction === "mobile"
      ? classes.dropdownMobile
      : classes.dropdownDesktop;

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}>
        <Bell />
      </button>
      {open && (
        <div className={dropdownClass}>
          <NotificationDropdown />
        </div>
      )}
    </div>
  );
};
