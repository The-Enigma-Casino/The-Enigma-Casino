using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Infrastructure.Database.Config;

public class UserFriendConfig : IEntityTypeConfiguration<UserFriend>
{
    public void Configure(EntityTypeBuilder<UserFriend> builder)
    {
        builder.ToTable("user_friends");

        builder.HasKey(uf => uf.Id);

        builder.Property(uf => uf.Id)
               .HasColumnName("id")
               .IsRequired()
               .ValueGeneratedOnAdd();

        builder.Property(uf => uf.UserId)
               .HasColumnName("user_id")
               .IsRequired();

        builder.Property(uf => uf.FriendId)
               .HasColumnName("friend_id")
               .IsRequired();

        builder.Property(uf => uf.CreatedAt)
               .HasColumnName("created_at")
               .IsRequired();

        builder.HasOne<User>()
               .WithMany()
               .HasForeignKey(uf => uf.FriendId)
               .OnDelete(DeleteBehavior.Restrict);


        builder.HasIndex(uf => new { uf.UserId, uf.FriendId }).IsUnique();
    }
}