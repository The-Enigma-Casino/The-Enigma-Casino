﻿using the_enigma_casino_server.Games.Poker;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Enum;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Poker.Interfaces;

namespace the_enigma_casino_server.Websockets.Poker;

public class PokerNotifier : IPokerNotifier
{
    private readonly IWebSocketSender _sender;

    public PokerNotifier(IWebSocketSender sender)
    {
        _sender = sender;
    }

    public async Task NotifyBlindsAsync(Match match, PokerGame pokerGame)
    {
        var dealer = pokerGame.GetDealer();
        var smallBlind = pokerGame.GetSmallBlind();
        var bigBlind = pokerGame.GetBigBlind();

        var blindInfo = new
        {
            type = "poker",
            action = "blinds_assigned",
            dealer = new { userId = dealer.UserId },
            smallBlind = new { userId = smallBlind.UserId, amount = smallBlind.CurrentBet },
            bigBlind = new { userId = bigBlind.UserId, amount = bigBlind.CurrentBet }
        };

        List<string> playerIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();
        await _sender.BroadcastToUsersAsync(playerIds, blindInfo);
    }

    public async Task SendInitialHandsAsync(Match match)
    {
        foreach (var player in match.Players.Where(p => p.PlayerState == PlayerState.Playing))
        {
            var handData = player.Hand.Cards.Select(c => new
            {
                rank = c.Rank.ToString(),
                suit = c.Suit.ToString(),
                value = c.Value
            });

            var response = new
            {
                type = "poker",
                action = "initial_hand",
                userId = player.UserId,
                cards = handData
            };

            await _sender.SendToUserAsync(player.UserId.ToString(), response);
        }
    }

    public async Task NotifyStartBettingAsync(Match match)
    {
        var message = new
        {
            type = "poker",
            action = "start_betting",
            phase = "preflop"
        };

        List<string> playerIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();
        await _sender.BroadcastToUsersAsync(playerIds, message);
    }

    public async Task NotifyPlayerTurnAsync(Match match, Player player, PokerGame pokerGame)
    {
        int currentMaxBet = pokerGame.GetHighestCurrentBet();
        int playerBet = pokerGame.GetCurrentBetForPlayer(player.UserId);

        int toCall = currentMaxBet - playerBet;


        List<string> validMoves = new List<string>();

        if (toCall <= 0)
            validMoves.Add("check");
        else if (toCall <= player.User.Coins)
            validMoves.Add("call");

        if (player.User.Coins > toCall)
            validMoves.Add("raise");

        if (player.User.Coins > 0)
            validMoves.Add("all-in");

        validMoves.Add("fold");

        var response = new
        {
            type = "poker",
            action = "your_turn",
            validMoves,
            callAmount = toCall,
            canRaise = player.User.Coins > toCall,
            canAllIn = player.User.Coins > 0,
            maxRaise = player.User.Coins - toCall
        };

        await _sender.SendToUserAsync(player.UserId.ToString(), response);

        var connectedUserIds = match.Players
        .Where(p => p.PlayerState == PlayerState.Playing || p.PlayerState == PlayerState.AllIn || p.PlayerState == PlayerState.Fold)
        .Select(p => p.UserId.ToString())
        .ToList();

        await _sender.BroadcastToUsersAsync(connectedUserIds, new
        {
            type = "poker",
            action = "turn_started",
            tableId = match.GameTableId,
            currentTurnUserId = player.UserId,
            turnDuration = 20,
        });
    }

    public async Task NotifyPlayerActionAsync(Player player, string move)
    {

        var totalBet = PokerBetTracker.GetTotalBet(player.GameTableId, player.UserId);

        var response = new
        {
            type = "poker",
            action = "player_action",
            userId = player.UserId,
            move,
            amount = player.CurrentBet,
            totalBet
        };

        var userIds = player.GameMatch!.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString());
        await _sender.BroadcastToUsersAsync(userIds, response);
    }

    public async Task NotifyBetConfirmedAsync(Player player)
    {
        int totalBet = PokerBetTracker.GetTotalBet(player.GameTableId, player.UserId);

        var response = new
        {
            type = "poker",
            action = "bet_confirmed",
            userId = player.UserId,
            nickname = player.User.NickName,
            remainingCoins = player.User.Coins,
            bet = player.CurrentBet,
            totalBet
        };

        await _sender.SendToUserAsync(player.UserId.ToString(), response);
    }

    public async Task NotifyPlayersInitializedAsync(Match match)
    {
        var message = new
        {
            type = "poker",
            action = "players_initialized",
            players = match.Players.Select(p => new
            {
                id = p.UserId,
                nickname = p.User.NickName,
                coins = p.User.Coins
            }).ToList()
        };

        var userIds = match.Players
            .Where(p => p.PlayerState != PlayerState.Spectating && !p.HasAbandoned)
            .Select(p => p.UserId.ToString())
            .ToList();

        await _sender.BroadcastToUsersAsync(userIds, message);
    }
}


