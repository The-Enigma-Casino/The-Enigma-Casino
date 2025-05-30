import { useState } from "react";

import { Bell } from "../ui/Bell";
import { NotificationDropdown } from "./NotificationDropdown";

export const BellWithDropdown = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}>
        <Bell />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-[40rem] z-[1000]">
          <NotificationDropdown />
        </div>
      )}
    </div>
  );
};
