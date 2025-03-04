using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Database.Config;

public class OrderConfig : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> entity)
    {
        entity.ToTable("orders");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.Id)
            .HasColumnName("id")
            .IsRequired()
            .ValueGeneratedOnAdd();

        entity.Property(e => e.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        entity.Property(e => e.CoinsPackId)
            .HasColumnName("coins_pack_id")
            .IsRequired();

        entity.Property(e => e.StripeSessionId)
            .HasColumnName("stripe_session_id");

        entity.Property(e => e.IsPaid)
            .HasColumnName("is_paid")
            .IsRequired();

        entity.Property(e => e.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        entity.Property(e => e.PaidDate)
              .HasColumnName("paid_date");

        entity.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId);

        entity.HasOne(o => o.CoinsPack)
            .WithMany()
            .HasForeignKey(o => o.CoinsPackId);
    }


}
