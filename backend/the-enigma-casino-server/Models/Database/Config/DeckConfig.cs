using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using the_enigma_casino_server.Games.Entities;

namespace the_enigma_casino_server.Models.Database.Config;

//public class DeckConfig : IEntityTypeConfiguration<Deck>
//{
//    public void Configure(EntityTypeBuilder<Deck> entity)
//    {
//        entity.ToTable("decks");

//        entity.HasKey(e => e.Id);

//        entity.Property(e => e.Id)
//              .HasColumnName("id")
//              .IsRequired()
//              .ValueGeneratedOnAdd();
//    }
//}
