using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Games.Shared.Entities;
using the_enigma_casino_server.Games.Shared.Entities.Enum;

namespace the_enigma_casino_server.Models.Database.Config;

public class CardConfig : IEntityTypeConfiguration<Card>
{
    public void Configure(EntityTypeBuilder<Card> entity)
    {
        entity.ToTable("cards");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.CardRank)
                .HasColumnName("card_rank")
                .IsRequired()
                .HasConversion(
                    v => v.ToString(),
                    v => (CardRank)Enum.Parse(typeof(CardRank), v)
        );

        entity.Property(e => e.Suit)
            .HasColumnName("suit")
            .IsRequired();

        entity.Property(e => e.ImageUrl)
            .HasColumnName("image")
            .HasMaxLength(200)
            .IsRequired();
    }
}
