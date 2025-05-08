namespace the_enigma_casino_server.WebSockets.Friends;

public static class FriendsMessageType
{
    // Client to server
    public const string Send = "send";
    public const string Accept = "accept";
    public const string Cancel = "cancel";
    public const string Remove = "remove";
    public const string InviteFriendToGame = "inviteFriendToGame";

    // Server to client
    public const string FriendRequestReceived = "friendRequestReceived";
    public const string FriendRequestAccepted = "friendRequestAccepted";
    public const string FriendRequestCanceled = "friendRequestCanceled";
    public const string FriendRemoved = "friendRemoved";
    public const string FriendInvitedToGame = "friendInvitedToGame";


    // Server to client 
    public const string RequestSent = "requestSent";
    public const string RequestAccepted = "requestAccepted";
    public const string RequestCanceled = "requestCanceled";

    // Friends
    public const string GetOnlineFriends = "getOnlineFriends";
    public const string OnlineFriends = "onlineFriends";

}
