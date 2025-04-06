using Microsoft.AspNetCore.Mvc;

namespace the_enigma_casino_server.Games.Shared.Controllers;

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

    [HttpGet("back/{version}")]
    public IActionResult GetCardBackImage(int version)
    {
        string fileName = version == 1 ? "enigma_back1.webp" : "enigma_back2.webp";
        string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "cards", fileName);

        if (System.IO.File.Exists(filePath))
        {
            byte[] imageData = System.IO.File.ReadAllBytes(filePath);
            return File(imageData, "image/webp");  
        }

        return NotFound();
    }
}