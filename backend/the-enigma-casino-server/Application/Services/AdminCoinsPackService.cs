using SixLabors.ImageSharp.Formats.Webp;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Infrastructure.Database;

namespace the_enigma_casino_server.Application.Services;

public class AdminCoinsPackService : BaseService
{
    public AdminCoinsPackService(UnitOfWork unitOfWork) : base(unitOfWork)
    {
    }

    public async Task UpdateCoinsPack(UpdateCoinsPackRequest updateCoinsPackRequest)
    {
        if (updateCoinsPackRequest == null)
            throw new ArgumentNullException(nameof(updateCoinsPackRequest));

        var existingCoinsPack = await _unitOfWork.CoinsPackRepository.GetByIdAsync(updateCoinsPackRequest.Id);
        if (existingCoinsPack == null)
            throw new KeyNotFoundException("CoinsPack no encontrado.");

        if (existingCoinsPack.Price != updateCoinsPackRequest.Price && updateCoinsPackRequest.Price > 0)
            existingCoinsPack.Price = updateCoinsPackRequest.Price;

        if (existingCoinsPack.Quantity != updateCoinsPackRequest.Quantity && updateCoinsPackRequest.Quantity > 0)
            existingCoinsPack.Quantity = updateCoinsPackRequest.Quantity;

        if (existingCoinsPack.Offer != updateCoinsPackRequest.Offer)
            existingCoinsPack.Offer = updateCoinsPackRequest.Offer;

        if (updateCoinsPackRequest.ImageFile != null && updateCoinsPackRequest.ImageFile.Length > 0)
        {
            string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "coins");

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            string fileName = $"pack{existingCoinsPack.Id}.webp";
            string filePath = Path.Combine(folderPath, fileName);

            using (var stream = updateCoinsPackRequest.ImageFile.OpenReadStream())
            using (var image = await Image.LoadAsync(stream))
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(150, 150),
                    Mode = ResizeMode.Crop,
                    Position = AnchorPositionMode.Center
                }));

                var encoder = new WebpEncoder { Quality = 80 };
                await image.SaveAsync(filePath, encoder);
            }

            existingCoinsPack.Image = "images/coins/" + fileName;
        }

        _unitOfWork.CoinsPackRepository.Update(existingCoinsPack);
        await _unitOfWork.SaveAsync();
    }


}
