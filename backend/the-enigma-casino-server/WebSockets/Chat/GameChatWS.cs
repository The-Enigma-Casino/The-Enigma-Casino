using System.Text.Json;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Utilities;
using the_enigma_casino_server.Websockets.Chat;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.GameTable.Store;
using the_enigma_casino_server.WebSockets.Interfaces;

namespace the_enigma_casino_server.WebSockets.Chat;

public class GameChatWS : BaseWebSocketHandler, IWebSocketMessageHandler
{
    public string Type => "chat";

    private readonly ValidationService _validationService;


    public GameChatWS(
        ConnectionManagerWS connectionManager,
        IServiceProvider serviceProvider,
        ValidationService validationService
    ) : base(connectionManager, serviceProvider)
    {
        _validationService = validationService;
    }


    public async Task HandleAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("action", out var actionProp)) return;

        var action = actionProp.GetString();

        _ = action switch
        {
            ChatMessageType.NewMessage => HandleNewMessageAsync(userId, message),
            _ => Task.CompletedTask
        };
    }


    private async Task HandleNewMessageAsync(string userId, JsonElement message)
    {
        if (!message.TryGetProperty("tableId", out var tableIdProp) ||
            !int.TryParse(tableIdProp.GetString(), out int tableId))
        {
            await SendErrorAsync(userId, "Invalid tableId.");
            return;
        }

        if (!message.TryGetProperty("text", out var textProp))
        {
            await SendErrorAsync(userId, "Missing message text.");
            return;
        }

        string rawText = textProp.GetString()!.Trim();

        if (string.IsNullOrWhiteSpace(rawText))
        {
            await SendErrorAsync(userId, "Message is empty.");
            return;
        }

        if (!ActiveGameSessionStore.TryGet(tableId, out var session))
        {
            await SendErrorAsync(userId, "No active session for this table.");
            return;
        }

        Player player = session.Table.Players.FirstOrDefault(p => p.UserId.ToString() == userId);
        if (player == null)
        {
            await SendErrorAsync(userId, "You are not part of the table.");
            return;
        }

        string cleanText = _validationService.CensorWords(rawText);
        string avatarUrl = player.User.Image ?? "";

        var chatMessage = new ChatMessage
        {
            UserId = player.UserId,
            Nickname = player.User.NickName,
            AvatarUrl = avatarUrl,
            Text = cleanText,
            Timestamp = DateTime.UtcNow
        };

        session.ChatMessages.Insert(0, chatMessage);
        if (session.ChatMessages.Count > 50)
            session.ChatMessages.RemoveAt(session.ChatMessages.Count - 1);

        var response = new
        {
            type = Type,
            action = ChatMessageType.NewMessage,
            tableId,
            userId = chatMessage.UserId,
            nickname = chatMessage.Nickname,
            avatarUrl = chatMessage.AvatarUrl,
            text = chatMessage.Text,
            timestamp = chatMessage.Timestamp
        };

        await ((IWebSocketSender)this).BroadcastToUsersAsync(session.GetConnectedUserIds(), response);
    }


}