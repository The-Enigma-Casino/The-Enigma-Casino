using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Services;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HistoryController: BaseController
{
    private readonly HistoryService historyService;

    public HistoryController(HistoryService historyService)
    {
        this.historyService = historyService;
    }

    [HttpGet]
    public async Task<ActionResult> GetHistory(int page)
    {
        try
        {
            int userId = GetUserId();

            HistoryDto history = await historyService.GetHistory(userId, page);
            return Ok(history);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message); 
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno del servidor: {ex.Message}"); 
        }
    }

    [HttpGet("by-user-id")]
    public async Task<ActionResult> GetHistoryByUserId(int userId, int page)
    {
        try
        {
            HistoryDto history = await historyService.GetHistory(userId, page);
            return Ok(history);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentOutOfRangeException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno del servidor: {ex.Message}");
        }
    }




}
