﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : BaseController
{
    public UserService _userService;
    public AuthController(UserService userService)
    {
        _userService = userService;
    }


    [HttpPost("register")]
    public async Task<ActionResult<string>> Register([FromBody] RegisterReq request)
    {
        try
        {
            string validationMessage = _userService.ValidateRequestFields(request);
            if (!string.IsNullOrEmpty(validationMessage))
                return BadRequest(validationMessage);

            (bool exists, string message) = await _userService.CheckUser(request.NickName, request.Email);
            if (exists)
                return BadRequest(message);


            User newUser = await _userService.GenerateNewUser(request);

            await _userService.SendEmailConfirmation(newUser);

            return Ok("Registro exitoso. Revisa tu email para confirmar tu cuenta.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }


    [HttpPut("confirm-email")]
    public async Task<ActionResult<string>> ConfirmEmailAndLogin([FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("El token de confirmación es obligatorio.");

            User user = await _userService.ConfirmEmailAndGetUserAsync(token);

            if (user == null)
                return NotFound("Token de confirmación no válido o expirado.");

            string generatedToken = _userService.GenerateToken(user);

            return Ok(generatedToken);

        }
        catch (Exception ex)
        {
            return StatusCode(500, "Un error ha ocurrido al enviar su petición.");
        }
    }


    [HttpPost("login")]
    public async Task<ActionResult<string>> Login([FromBody] LoginReq request)
    {
        try
        {
            User user = await _userService.UserLogin(request);

            string token = _userService.GenerateToken(user);

            return Ok(token);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Un error ha ocurrido al procesar tu solicitud." });
        }
    }
}