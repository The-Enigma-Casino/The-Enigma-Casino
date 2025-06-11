using Google.Apis.Auth;
using System.Text.Json;

namespace the_enigma_casino_server.Application.Services;

public class GoogleAuthService
{
    private readonly string _clientId;

    public GoogleAuthService(string credentialsPath)
    {
        using var stream = new FileStream(credentialsPath, FileMode.Open, FileAccess.Read);
        using var doc = JsonDocument.Parse(stream);
        _clientId = doc.RootElement
            .GetProperty("installed")
            .GetProperty("client_id")
            .GetString()!;
    }

    public async Task<GoogleJsonWebSignature.Payload> VerifyIdTokenAsync(string idToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new List<string> { _clientId }
        };

        return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
    }
}
