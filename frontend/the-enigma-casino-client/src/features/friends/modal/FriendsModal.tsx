import React, { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import {
  $friends,
  $onlineFriendsIds,
  $searchResults,
  $canSendMap,
  $receivedRequests,
} from "../stores/friends.store";

import {
  searchUserFx,
  fetchFriendsFx,
  canSendFriendRequestFx,
  sendFriendRequestFx,
  fetchReceivedRequestsFx,
  acceptFriendRequestFx,
  cancelFriendRequestFx,
  removeFriendFx,
} from "../stores/friends.effects";
import { FriendItem } from "../components/FriendItem";
import {
  removeReceivedRequest,
  resetReceivedRequests,
  resetSearchResults,
  setFriends,
} from "../stores/friends.events";

type TabMode = "friends" | "search";

export const FriendsModal: React.FC = () => {
  const [tab, setTab] = useState<TabMode>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const friends = useUnit($friends);
  const onlineIds = useUnit($onlineFriendsIds);
  const canSend = useUnit($canSendMap);
  const searchResults = useUnit($searchResults);
  const receivedRequests = useUnit($receivedRequests);
  console.log(receivedRequests);
  // Cargar amigos al iniciar
  useEffect(() => {
    fetchFriendsFx();
  }, []);

  useEffect(() => {
    if (tab === "search") {
      fetchReceivedRequestsFx();
    } else {
      resetSearchResults();
      resetReceivedRequests();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "search" && searchQuery) {
      searchUserFx(searchQuery);
    }
  }, [searchQuery, tab]);

  useEffect(() => {
    if (tab === "search" && searchResults.length > 0) {
      searchResults.forEach((user) => {
        canSendFriendRequestFx({ receiverId: user.id });
      });
    }
  }, [searchResults, tab]);

  const handleSearch = () => {};
  const filteredFriends = friends.filter((f) =>
    f.nickName?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

  return (
    <div className="modal bg-Background-Overlay border-2 border-Principal p-4 rounded-xl w-[400px]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="flex text-white text-xl font-bold items-center">
          {tab === "friends" ? "AMIGOS" : "AGREGAR AMIGO"}
        </h2>
        <button
          className="text-Principal font-bold"
          onClick={() => setTab(tab === "friends" ? "search" : "friends")}
        >
          <img src="/svg/searchUser.svg" />
          {tab === "friends" ? "AGREGAR AMIGO" : "BUSCAR AMIGO"}
        </button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Introduce un nombre de usuario"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1 rounded bg-gray-800 text-white border border-green-500"
        />
      </div>

      <div className="h-[300px] overflow-y-auto flex flex-col gap-2">
        {tab === "friends" &&
          filteredFriends.map((friend) => (
            <FriendItem
              key={friend.id}
              id={friend.id}
              nickname={friend.nickName}
              image={friend.image}
              isFriend={true}
              isOnline={onlineIds.includes(friend.id)}
              mode="friend-list"
              onInviteClick={() => {
                console.log("Invitar a", friend.nickName);
              }}
              onRemoveFriendClick={async () => {
                await removeFriendFx({ friendId: friend.id });
                setFriends(friends.filter(f => f.id !== friend.id));
                fetchFriendsFx();
              }}
            />
          ))}

        {tab === "search" &&
          searchResults.map((user) => (
            <FriendItem
              key={user.id}
              id={user.id}
              nickname={user.nickName}
              image={user.image}
              isFriend={false}
              canSend={canSend[user.id]}
              mode="search"
              onAddFriendClick={() => {
                sendFriendRequestFx({ receiverId: user.id });
              }}
            />
          ))}

        {receivedRequests.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <p className="text-white text-sm mb-2">Solicitudes recibidas</p>
            {receivedRequests.map((req) => (
              <FriendItem
                key={req.senderId}
                id={req.senderId}
                nickname={req.nickName}
                image={req.image}
                isFriend={false}
                mode="search"
                onAcceptRequestClick={() =>
                  acceptFriendRequestFx({ senderId: req.senderId })
                }
                onRejectRequestClick={() => {
                  cancelFriendRequestFx({ senderId: req.senderId });
                  removeReceivedRequest(req.senderId);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
