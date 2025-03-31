
using System.Net;

namespace the_enigma_casino_server.Middleware;

public class WebsocketMiddleware : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            var token = context.Request.Query["token"].ToString();

            if (string.IsNullOrEmpty(token))
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                await context.Response.WriteAsync("Missing or invalid access token");
                return;
            }

            if (!context.Request.Headers.ContainsKey("Authorization"))
            {
                context.Request.Headers["Authorization"] = $"Bearer {token}";
            }
        }

        await next(context);
    }
}
