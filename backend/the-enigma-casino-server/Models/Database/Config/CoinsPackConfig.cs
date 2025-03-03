using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Database.Config;

public class CoinsPackConfig : IEntityTypeConfiguration<CoinsPack>
{
    public void Configure(EntityTypeBuilder<CoinsPack> entity)
    {
        entity.ToTable("coins_pack");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.Price)
              .HasColumnName("price")
              .IsRequired();

        entity.Property(e => e.Quantity)
              .HasColumnName("quantity")
              .IsRequired();

        entity.Property(e => e.Offer)
              .HasColumnName("offer")
              .IsRequired();

        entity.Property(e => e.Image)
              .HasColumnName("image")
              .HasMaxLength(200)
              .IsRequired();
    }
}
