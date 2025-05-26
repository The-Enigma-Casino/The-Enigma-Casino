import React, { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import {
  $friends,
  $searchResults,
  $receivedRequests,
} from "../stores/friends.store";
import {
  searchUserFx,
  fetchFriendsFx,
  fetchReceivedRequestsFx,
  cancelFriendRequestFx,
} from "../stores/friends.effects";
import { FriendItem } from "../components/FriendItem";
import {
  acceptFriendRequest,
  getOnlineFriendsRequested,
  inviteFriendFromList,
  removeFriend,
  removeReceivedRequest,
  removeUserFromSearchResults,
  resetReceivedRequests,
  resetSearchResults,
  sendFriendRequestWs,
  startGameLoading,
} from "../stores/friends.events";
import { encodeId } from "../../../utils/sqidUtils";
import { useNavigate } from "react-router-dom";
import classes from "./FriendsModal.module.css";
type TabMode = "friends" | "search";

interface FriendsModalProps {
  onClose?: () => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<TabMode>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const friends = useUnit($friends);
  const searchResults = useUnit($searchResults);
  const receivedRequests = useUnit($receivedRequests);
  const navigate = useNavigate();

  // Cargar amigos y sus estados online
  useEffect(() => {
    fetchFriendsFx().finally(() => {
      getOnlineFriendsRequested();
    });
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
    const trimmedQuery = searchQuery.trim();
    if (tab !== "search") return;

    if (trimmedQuery.length === 0) {
      resetSearchResults();
      return;
    }

    const delay = setTimeout(() => {
      searchUserFx(trimmedQuery);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery, tab]);

  const filteredFriends = friends
    .filter((f) =>
      f.nickName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));


  return (
    <div className="relative bg-Background-Overlay border-2 border-Principal p-8 rounded-[3rem] w-full max-w-[450px]">

      <button
        onClick={onClose}
        className="absolute top-4 right-5 p-1 hover:opacity-70 transition-opacity"
      >
        <img src="/svg/close.svg" alt="Cerrar" className="w-12 h-12" />
      </button>

      <h2 className="text-white text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">

        {tab === "friends" ? "AMIGOS" : "AGREGAR AMIGO"}
      </h2>

      <div className="flex items-center justify-between mb-2 ml-10">

        <div className="relative w-[65%]">
          <img
            src="/svg/search_user.svg"
            alt="Buscar"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 opacity-70"
          />
          <input
            type="text"
            placeholder="Introduzca un nombre de usuario"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 text-xl pl-12 pr-3 py-1 rounded-xl bg-gray-800 text-white border border-Principal focus:outline-none"
          />
        </div>

        <button
          className="flex flex-col items-center gap-1 text-white text-xl font-semibold hover:opacity-80"
          onClick={() => setTab(tab === "friends" ? "search" : "friends")}
        >
          <img src="/svg/searchUser.svg" alt="Agregar amigo" className="w-8 h-8" />
          {tab === "friends" ? "AGREGAR AMIGO" : "AMIGOS"}
        </button>
      </div>

      {/* Línea separadora */}
      <hr className="border-t border-gray-600 mb-3 ml-10" />

      <div className={`h-[340px] overflow-y-auto flex flex-col gap-5 pr-4 ${classes.customScroll}`}>
        {tab === "friends" &&
          filteredFriends.map((friend) => (
            <FriendItem
              key={friend.id}
              id={friend.id}
              nickname={friend.nickName}
              status={friend.status as "Online" | "Playing"}
              image={friend.image}
              isFriend={true}
              isOnline={friend.isOnline}
              mode="friend-list"
              onInviteClick={(gameType) => {
                inviteFriendFromList({
                  friendId: friend.id,
                  gameType,
                });
                startGameLoading();
              }}
              onRemoveFriendClick={() => {
                removeFriend({ friendId: friend.id });
              }}
              onProfileClick={() => navigate(`/profile/${encodeId(friend.id)}`)}
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
              canSend={true}
              mode="search"
              onAddFriendClick={() => {
                sendFriendRequestWs({ receiverId: user.id });
                removeUserFromSearchResults(user.id);
              }}
              onProfileClick={() => navigate(`/profile/${encodeId(user.id)}`)}
            />
          ))}

        {tab === "search" && searchQuery && searchResults.length === 0 && (
          <p className="text-gray-400 text-2xl text-center mt-4">
            No se encontraron usuarios.
          </p>
        )}

        {receivedRequests.length > 0 && (
          <div className="mt-4 pt-3  ml-10">
            <p className="text-white text-xl mb-2">Solicitudes recibidas</p>
            {receivedRequests.map((req) => (
              <FriendItem
                key={req.senderId}
                id={req.senderId}
                nickname={req.nickName}
                image={req.image}
                isFriend={false}
                canSend={false}
                mode="search"
                onAcceptRequestClick={() => {
                  acceptFriendRequest({ senderId: req.senderId });
                  removeReceivedRequest(req.senderId);
                  setTab("friends");
                }}
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
