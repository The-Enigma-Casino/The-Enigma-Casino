using Microsoft.AspNetCore.Mvc;

namespace the_enigma_casino_server.Controllers;

[Route("api/cards")]
[ApiController]
public class CardController : ControllerBase
{
    [HttpGet("card/{suit}/{rank}")]
    public IActionResult GetCardImage(string suit, string rank)
    {
        string fileName = $"{rank.ToLower()}_{suit.ToLower()}.webp";
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "cards", fileName);

        if (System.IO.File.Exists(filePath))
        {
            byte[] imageData = System.IO.File.ReadAllBytes(filePath);
            return File(imageData, "image/webp");
        }

        return NotFound();
    }
}