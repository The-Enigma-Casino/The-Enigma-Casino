import { useEffect, useRef, useState } from "react";
import { getOnlineFriendsRequested } from "../stores/friends.events";
import { fetchFriendsFx } from "../stores/friends.effects";
import { IMAGE_PROFILE_URL } from "../../../config";

interface Friend {
  id: number;
  nickName: string;
  image: string;
}

interface Props {
  onlineFriends: Friend[];
  onInvite: (friendId: number) => void;
}

export const InviteFriendButton = ({ onlineFriends, onInvite }: Props) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFriendsFx().finally(() => {
      getOnlineFriendsRequested();
    });
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-1 rounded hover:bg-gray-700 transition"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src="/svg/invite_friend_table.svg"
          alt="Invitar"
          className="w-16 h-16"
        />
      </button>

      {open && (
        <div className="absolute bottom-10 right-0 bg-zinc-800 border border-gray-700 rounded-lg shadow-lg w-44 max-h-40 overflow-y-auto z-50">
          {onlineFriends.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">Sin amigos online</p>
          ) : (
            onlineFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => {
                  onInvite(friend.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-700 transition text-white text-sm"
              >
                <img
                  src={`${IMAGE_PROFILE_URL}${friend.image}`}
                  alt={friend.nickName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                {friend.nickName}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
