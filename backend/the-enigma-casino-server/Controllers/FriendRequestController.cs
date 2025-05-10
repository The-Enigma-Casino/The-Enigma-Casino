using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Services.Friendship;
using the_enigma_casino_server.Core.Entities;

namespace the_enigma_casino_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FriendRequestController : BaseController
    {
        private readonly FriendRequestService _friendRequestService;
        private readonly UserFriendService _userFriendService;

        public FriendRequestController(FriendRequestService friendRequestService, UserFriendService userFriendService)
        {
            _friendRequestService = friendRequestService;
            _userFriendService = userFriendService;
        }


        [HttpPost("send")]
        public async Task<ActionResult> SendFriendRequest([FromQuery] int receiverId)
        {
            try
            {
                int senderId = GetUserId();
                await _friendRequestService.SendFriendRequestAsync(senderId, receiverId);
                return Ok("Solicitud enviada correctamente.");
            }
            catch (InvalidOperationException exception)
            {
                return BadRequest(exception.Message);
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al enviar la solicitud. {exception.Message}");
            }
        }


        [HttpPost("accept")]
        public async Task<ActionResult> AcceptFriendRequest([FromQuery] int senderId)
        {
            try
            {
                int receiverId = GetUserId();
                await _friendRequestService.AcceptFriendRequestAsync(senderId, receiverId);
                return Ok("Solicitud de amistad aceptada.");
            }
            catch (InvalidOperationException exception)
            {
                return BadRequest(exception.Message);
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al aceptar la solicitud. {exception.Message}");
            }
        }


        [HttpDelete("cancel")]
        public async Task<ActionResult> CancelFriendRequest([FromQuery] int receiverId)
        {
            try
            {
                int senderId = GetUserId();
                await _friendRequestService.CancelFriendRequestAsync(senderId, receiverId);
                return Ok("Solicitud cancelada.");
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al cancelar la solicitud. {exception.Message}");
            }
        }


        [HttpGet("can-send")]
        public async Task<ActionResult<bool>> CanSendRequest([FromQuery] int receiverId)
        {
            try
            {
                int senderId = GetUserId();
                bool canSend = await _friendRequestService.CanSendRequestAsync(senderId, receiverId);
                return Ok(canSend);
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al comprobar la solicitud. {exception.Message}");
            }
        }


        [HttpGet("received-requests")]
        public async Task<ActionResult<List<FriendRequest>>> GetReceivedRequests()
        {
            try
            {
                int userId = GetUserId();
                List<FriendRequest> requests = await _friendRequestService.GetReceivedRequestsAsync(userId);
                return Ok(requests);
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al obtener las solicitudes recibidas. {exception.Message}");
            }
        }


        [HttpGet("friends")]
        public async Task<ActionResult<List<FriendDto>>> GetFriends()
        {
            try
            {
                int userId = GetUserId();
                var friends = await _userFriendService.GetFriendsAsync(userId);
                return Ok(friends);
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al obtener los amigos. {exception.Message}");
            }
        }

        [HttpDelete("remove")]
        public async Task<ActionResult> RemoveFriend([FromQuery] int friendId)
        {
            try
            {
                int userId = GetUserId();
                await _userFriendService.RemoveFriendAsync(userId, friendId);
                return Ok("Amistad eliminada.");
            }
            catch (InvalidOperationException exception)
            {
                return BadRequest(exception.Message);
            }
            catch (Exception exception)
            {
                return StatusCode(500, $"Ocurrió un error al eliminar la amistad. {exception.Message}");
            }
        }


        [HttpGet("is-friend")]
        public async Task<ActionResult<bool>> IsFriend([FromQuery] int otherUserId)
        {
            try
            {
                int userId = GetUserId();
                bool areFriends = await _userFriendService.AreFriendsAsync(userId, otherUserId);
                return Ok(areFriends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al comprobar la amistad: {ex.Message}");
            }
        }
    }
}