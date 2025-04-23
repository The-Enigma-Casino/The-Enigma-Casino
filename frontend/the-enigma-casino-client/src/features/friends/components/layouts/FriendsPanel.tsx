import classes from "./FriendsPanel.module.css";

function FriendsPanel() {
  const friends = [
    { id: 1, name: "Jose", imgSrc: "https://avatars.githubusercontent.com/u/146203038?v=4" },
    { id: 2, name: "Raquel", imgSrc: "https://avatars.githubusercontent.com/u/148492169?v=4" },
    { id: 3, name: "Alejandro", imgSrc: "https://avatars.githubusercontent.com/u/146462406?v=4" },
    { id: 4, name: "Vegetta", imgSrc: "https://i1.sndcdn.com/artworks-H9rh5FQGHtqUX1yy-XT0gtg-t500x500.jpg" }
  ];

  return (
    <div className={classes.friendsPanel}>
      <div className={classes.friendsPanelContainer}>
        <div className={classes.friends}>
          {friends.map(friend => (
            <div key={friend.id} className={classes.friend}>
              <img src={friend.imgSrc} alt={`Imagen de ${friend.name}`} />
              <h3>{friend.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendsPanel;
