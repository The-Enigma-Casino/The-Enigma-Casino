using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Models.Database.Entities;

namespace the_enigma_casino_server.Models.Database.Config;

public class UserConfig : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> entity)
    {
        entity.ToTable("users");

        entity.HasKey(e => e.Id);

        entity.Property(e => e.Id)
              .HasColumnName("id")
              .IsRequired()
              .ValueGeneratedOnAdd();

        entity.Property(e => e.NickName)
              .HasColumnName("name")
              .HasMaxLength(20)
              .IsRequired();

        entity.Property(e => e.FullName)
              .HasColumnName("surname")
              .HasMaxLength(100)
              .IsRequired();

        entity.Property(e => e.Email)
              .HasColumnName("email")
              .HasMaxLength(100)
              .IsRequired();

        entity.Property(e => e.HashPassword)
              .HasColumnName("hash_password")
              .HasMaxLength(40)
              .IsRequired();

        entity.Property(e => e.Role)
              .HasColumnName("role")
              .IsRequired();

        entity.Property(e => e.Address)
              .HasColumnName("address")
              .HasMaxLength(250)
              .IsRequired();

        entity.Property(e => e.Country)
            .HasColumnName("country")
                .HasMaxLength(3)
                .IsRequired();

        entity.Property(e => e.Image)
            .HasColumnName("image")
                .HasMaxLength(100)
                .IsRequired();

        entity.Property(e => e.HashDNI)
            .HasColumnName("hash_dni")
                .HasMaxLength(40)
                .IsRequired();

        entity.Property(e => e.Coins)
            .HasColumnName("coins")
                .IsRequired();

        entity.Property(e => e.IsBanned)
            .HasColumnName("is_banned")
                .IsRequired();

        // IsUnique 
        entity.HasIndex(e => e.Email)
              .IsUnique();
        entity.HasIndex(e => e.NickName)
              .IsUnique();
    }
}
