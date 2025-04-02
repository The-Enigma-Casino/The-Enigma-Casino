using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Games.Shared.Entities;

namespace the_enigma_casino_server.Models.Database.Config;

public class GameHistoryConfig : IEntityTypeConfiguration<GameHistory>
{
    public void Configure(EntityTypeBuilder<GameHistory> entity)
    {
        entity.ToTable("game_histories");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.Id)
            .HasColumnName("id")
            .IsRequired()
            .ValueGeneratedOnAdd();

        entity.Property(e => e.GameTableId)
            .HasColumnName("game_table_id")
            .IsRequired();

        entity.Property(e => e.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(e => e.GameType)
            .HasColumnName("game_type")
            .IsRequired();

        entity.Property(e => e.TotalMatchesPlayed)
            .HasColumnName("total_matches_played")
            .IsRequired();

        entity.Property(e => e.TotalBetAmount)
            .HasColumnName("total_bet_amount")
            .IsRequired();

        entity.Property(e => e.ChipResult)
            .HasColumnName("chip_result")
            .IsRequired();

        entity.Property(e => e.JoinedAt)
            .HasColumnName("joined_at")
            .IsRequired();

        entity.Property(e => e.LeftAt)
            .HasColumnName("left_at");

        entity.HasOne(e => e.GameTable)
            .WithMany()
            .HasForeignKey(e => e.GameTableId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(e => e.User)
            .WithMany(u => u.GameHistories)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
