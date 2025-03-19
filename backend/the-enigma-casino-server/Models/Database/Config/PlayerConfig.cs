using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Games.Entities;

namespace the_enigma_casino_server.Models.Database.Config;

//public class PlayerConfig : IEntityTypeConfiguration<Player>
//{
//    public void Configure(EntityTypeBuilder<Player> entity)
//    {
//        entity.ToTable("players");

//        entity.HasKey(e => e.Id);

//        entity.Property(e => e.Id)
//              .HasColumnName("id")
//              .IsRequired()
//              .ValueGeneratedOnAdd();

//        entity.Property(e => e.UserId)
//            .HasColumnName("user_id")
//                .IsRequired();
        
//        entity.Property(e => e.BetCoins)
//            .HasColumnName("bet_coins")
//            .IsRequired();

//        entity.Property(e => e.GameId)
//            .HasColumnName("game_id")
//            .IsRequired();

//        entity.Property(e => e.GameType)
//            .HasColumnName("game_type")
//            .IsRequired();

//        entity.Property(e => e.PlayerState)
//            .HasColumnName("player_state")
//            .IsRequired();

//        entity.Property(e => e.AdditionalInfo)
//            .HasColumnName("additional_info");
//    }
//}
