using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;
    private readonly TokenValidationParameters _tokenParameters;

    public UserService(UnitOfWork unitOfWork, TokenValidationParameters tokenParameters)
    {
        _unitOfWork = unitOfWork;
        _tokenParameters = tokenParameters;
    }

    public async Task<(bool, string)> ExistsUser(string nickName, string email, string Dni)
    {
        bool existEmail = await _unitOfWork.UserRepository.ExistEmail(email);
        bool existNickname = await _unitOfWork.UserRepository.ExistNickName(nickName);
        bool existDni = await _unitOfWork.UserRepository.ExistHashDNI(HashHelper.Hash(Dni));

        if (existEmail)
            return (true, "El email ya está registrado.");

        if (existNickname)
            return (true, "El nickname ya está en uso.");

        if (existDni)
            return (true, "El DNI ya está registrado.");

        return (false, "Usuario no encontrado.");
    }

    private string GenerateToken(string userId, string userName, string userImage, string userRole)
    {
        SecurityTokenDescriptor securityTokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                { "id", userId },
                { "name", userName },
                { "image", userImage },
                {ClaimTypes.Role, userRole }
            },

            //Cambiar tiempo a 10 minutos al acabar proyecto
            Expires = DateTime.UtcNow.AddDays(1),
            SigningCredentials = new SigningCredentials(_tokenParameters.IssuerSigningKey, SecurityAlgorithms.HmacSha256Signature)
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        SecurityToken token = tokenHandler.CreateToken(securityTokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
