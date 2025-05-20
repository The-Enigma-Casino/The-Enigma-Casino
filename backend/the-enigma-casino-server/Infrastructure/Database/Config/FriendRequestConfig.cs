using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Infrastructure.Database.Config;

public class FriendRequestConfig : IEntityTypeConfiguration<FriendRequest>
{
    public void Configure(EntityTypeBuilder<FriendRequest> builder)
    {
        builder.ToTable("friendRequests");

        builder.HasKey(fr => fr.Id);

        builder.Property(fr => fr.SenderId)
               .IsRequired();

        builder.Property(fr => fr.ReceiverId)
               .IsRequired();

        builder.Property(fr => fr.SentAt)
               .IsRequired();

        builder.Property(fr => fr.Status)
               .IsRequired();

        builder.HasOne(fr => fr.Sender)
       .WithMany()
       .HasForeignKey(fr => fr.SenderId)
       .OnDelete(DeleteBehavior.Restrict);

    }
}