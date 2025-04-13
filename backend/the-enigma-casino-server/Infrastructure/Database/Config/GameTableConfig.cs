namespace the_enigma_casino_server.Infrastructure.Database.Config;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Games.Shared.Entities;

public class GameTableConfig : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> entity)
    {
        entity.ToTable("game_tables");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.Name)
              .HasColumnName("name")
              .HasMaxLength(50)
              .IsRequired();

        entity.Property(e => e.GameType)
              .HasColumnName("game_type")
              .IsRequired();

        entity.Property(e => e.MaxPlayer)
              .HasColumnName("max_player")
              .IsRequired();

        entity.Property(e => e.MinPlayer)
              .HasColumnName("min_player")
              .IsRequired();

        entity.Property(e => e.TableState)
              .HasColumnName("table_state")
              .IsRequired();
    }
}

