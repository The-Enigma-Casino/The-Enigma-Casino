import { useUnit } from "effector-react";
import classes from "./FriendsPanel.module.css";
import { Link } from "react-router-dom";
import { encodeId } from "../../../../utils/sqidUtils";
import { $friends } from "../../stores/friends.store";
import { useEffect } from "react";
import { fetchFriendsFx, getOnlineFriendsRequested } from "../../stores";
import { IMAGE_PROFILE_URL } from "../../../../config";

function FriendsPanel() {
  const friends = useUnit($friends);

  useEffect(() => {
    fetchFriendsFx().then(() => {
      getOnlineFriendsRequested();
    });
  }, []);

  const onlineFriends = friends.filter(f => f.isOnline).slice(0, 4);
  return (
    <div className={classes.friendsPanel}>
      <div className={classes.friendsPanelContainer}>
        <div className={classes.friends}>
          {onlineFriends.map(friend => {
            const encoded = encodeId(friend.id);
            return (
              <div key={friend.id} className={classes.friend}>
                <Link to={`/profile/${encoded}`}>
                  <img src={`${IMAGE_PROFILE_URL}${friend.image}`} alt={`Imagen de ${friend.nickName}`} />
                </Link>
                <h3>{friend.nickName}</h3>
              </div>
            );
          })}
          {onlineFriends.length === 0 && (
            <p className="text-gray-400 text-xl">No hay amigos conectados.</p>
          )}
        </div>
      </div>
    </div >
  );
}

export default FriendsPanel;

