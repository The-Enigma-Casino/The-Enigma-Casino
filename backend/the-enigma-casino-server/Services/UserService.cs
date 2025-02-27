using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Database.Entities;
using the_enigma_casino_server.Models.Dtos.Request;
using the_enigma_casino_server.Services.Email;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Services;

public class UserService
{
    private UnitOfWork _unitOfWork;
    private readonly TokenValidationParameters _tokenParameters;
    private readonly EmailService _emailService;

    public UserService(UnitOfWork unitOfWork, IOptionsMonitor<JwtBearerOptions> jwtOptions, EmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        _emailService = emailService;
    }

    public async Task<(bool, string)> CheckUser(string nickName, string email, string Dni)
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

    public async Task<User> UserLogin(LoginReq request)
    {
        User user = await _unitOfWork.UserRepository.UserValidate(request.Identifier, request.Password);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Identificador o contraseña inválidos.");
        }

        if (user.Id == -1)
        {
            throw new UnauthorizedAccessException("Identificador o contraseña inválidos.");
        }

        if (!user.EmailConfirm)
        {
            throw new UnauthorizedAccessException("Debe confirmar su correo antes de iniciar sesión.");
        }

        return user;
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
        try
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
        catch (Exception ex)
        {
            Console.WriteLine($"Error al generar el usuario: {ex.Message}");
            throw;
        }
    }


    public async Task<bool> ConfirmUserEmailAsync(string token)
    {
        try
        {

            User user = await _unitOfWork.UserRepository.GetUserByConfirmationTokenAsync(token);

            if (user == null)
            {
                return false;

            }

            user.EmailConfirm = true;
            user.ConfirmationToken = null;

            _unitOfWork.UserRepository.Update(user);
            await _unitOfWork.SaveAsync();

            return true;

        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public async Task SendEmailConfirmation(User user)
    {
        string confirmationToken = Guid.NewGuid().ToString();

        user.ConfirmationToken = confirmationToken;

        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();

        await _emailService.SendEmailConfirmationAsync(user);
    }

    public string ValidateRequestFields(RegisterReq request)
    {
        if (string.IsNullOrEmpty(request.NickName) ||
            string.IsNullOrEmpty(request.Email) ||
            string.IsNullOrEmpty(request.Dni))
            return "Alguno de los campos enviados están vacíos.";

        if (!ValidationHelper.IsValidEmail(request.Email))
            return "El email ingresado no es válido.";

        if (!ValidationHelper.IsValidDNI(request.Dni))
            return "El DNI ingresado no es válido.";

        if (!ValidationHelper.IsValidName(request.NickName))
            return "El nombre de usuario contiene palabras no permitidas.";

        return string.Empty;
    }
}
