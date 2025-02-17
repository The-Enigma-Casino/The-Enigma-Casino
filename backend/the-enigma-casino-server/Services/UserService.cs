using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Dtos.Request;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;
    private readonly TokenValidationParameters _tokenParameters;

    public UserService(UnitOfWork unitOfWork, IOptionsMonitor<JwtBearerOptions> jwtOptions)
    {
        _unitOfWork = unitOfWork;
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
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

    public string GenerateToken(User user)
    {
        SecurityTokenDescriptor securityTokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                { "id", user.Id },
                { "name", user.NickName },
                { "image", user.Image },
                {ClaimTypes.Role, user.Role.ToString() }
            },

            //Cambiar tiempo a 3 minutos al acabar proyecto --> 3000 segundos
            Expires = DateTime.UtcNow.AddDays(1),
            SigningCredentials = new SigningCredentials(_tokenParameters.IssuerSigningKey, SecurityAlgorithms.HmacSha256Signature)
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();

        SecurityToken token = tokenHandler.CreateToken(securityTokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
    
    public async Task<User> GenerateNewUser(RegisterReq request)
    {
        User user = new User
        {
            NickName = request.NickName,
            FullName = request.FullName,
            Email = request.Email,
            HashPassword = HashHelper.Hash(request.Password),
            HashDNI = HashHelper.Hash(request.Dni),
            Country = request.Country,
            Address = request.Address
        };

        await _unitOfWork.UserRepository.InsertAsync(user);
        await _unitOfWork.SaveAsync();

        return user;
    }
}
