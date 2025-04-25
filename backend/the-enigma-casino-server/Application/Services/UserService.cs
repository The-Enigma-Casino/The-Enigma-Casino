using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SixLabors.ImageSharp.Formats.Webp;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using the_enigma_casino_server.Application.Dtos;
using the_enigma_casino_server.Application.Dtos.Request;
using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Application.Services.Email;
using the_enigma_casino_server.Core.Entities;
using the_enigma_casino_server.Core.Entities.Enum;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Utilities;

namespace the_enigma_casino_server.Application.Services;

public class UserService : BaseService
{
    private readonly TokenValidationParameters _tokenParameters;
    private readonly EmailService _emailService;
    private readonly ValidationService _validation;
    private readonly UserMapper _userMapper;

    public UserService(UnitOfWork unitOfWork, IOptionsMonitor<JwtBearerOptions> jwtOptions, EmailService emailService, ValidationService validationService, UserMapper userMapper) : base(unitOfWork)
    {
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        _emailService = emailService;
        _validation = validationService;
        _userMapper = userMapper;
    }

    public async Task<(bool, string)> CheckUser(string nickName, string email)
    {
        bool existEmail = await _unitOfWork.UserRepository.ExistEmail(email);
        bool existNickname = await _unitOfWork.UserRepository.ExistNickName(nickName);

        if (existEmail)
            return (true, "El email ya está registrado.");

        if (existNickname)
            return (true, "El nickname ya está en uso.");


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

        if (user.IsBanned || user.Role == Role.Banned)
        {
            throw new UnauthorizedAccessException("Tu cuenta ha sido baneada. Contacta con soporte si crees que es un error.");
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
            Expires = DateTime.UtcNow.AddHours(8),
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
                DateOfBirth = request.DateOfBirth,
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
            string.IsNullOrEmpty(request.Password) ||
            string.IsNullOrEmpty(request.Country) ||
            string.IsNullOrEmpty(request.Address))
        {
            return "Alguno de los campos enviados están vacíos.";
        }

        if (!_validation.IsValidEmail(request.Email))
            return "El email ingresado no es válido.";

        if (!_validation.IsValidName(request.NickName))
            return "El nombre de usuario contiene palabras no permitidas.";

        if (!_validation.IsAdult(request.DateOfBirth))
            return "Debes ser mayor de edad para registrarte.";

        return string.Empty;
    }


    public async Task<int> GetCoins(int id)
    {
        try
        {
            User user = await GetUserById(id);

            return user.Coins;
        }
        catch (KeyNotFoundException ex)
        {
            throw new KeyNotFoundException(ex.Message);
        }
        catch (Exception ex)
        {
            throw new Exception("Hubo un error al obtener las monedas", ex);
        }
    }

    public async Task UpdateCoins(int id, int quantity)
    {
        try
        {
            User user = await GetUserById(id);

            user.Coins += quantity;

            await _unitOfWork.SaveAsync();
        }
        catch (KeyNotFoundException ex)
        {
            throw new KeyNotFoundException(ex.Message);
        }
        catch (Exception ex)
        {
            throw new Exception("Hubo un error al actualizar las monedas", ex);
        }
    }

    public async Task<UserDto> GetProfile(int id)
    {
        try
        {
            User user = await GetUserById(id);

            return _userMapper.ToUserDto(user);

        }
        catch (KeyNotFoundException ex)
        {
            throw new KeyNotFoundException(ex.Message);

        }
        catch (Exception ex)
        {
            throw new Exception("Hubo un error al traer al usuario", ex);
        }
    }

    public async Task<OtherUserDto> GetNotFriendlyProfile(int id)
    {
        try
        {
            User user = await GetUserById(id);

            if (user == null)
            {
                throw new KeyNotFoundException("Usuario no encontrado");

            }
            return _userMapper.ToUserNotFriendlyDto(user);
        }
        catch (KeyNotFoundException ex)
        {
            throw new KeyNotFoundException(ex.Message);

        }
    }

    public async Task UpdateUserImageAsync(int userId, IFormFile imageFile)
    {
        if (imageFile == null || imageFile.Length == 0)
            throw new ArgumentException("La imagen es inválida");

        string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "profile");

        if (!Directory.Exists(folderPath))
            Directory.CreateDirectory(folderPath);

        string fileName = $"user_{userId}.webp";
        string filePath = Path.Combine(folderPath, fileName);

        using (Stream stream = imageFile.OpenReadStream())
        using (Image image = await Image.LoadAsync(stream))
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(170, 170),
                Mode = ResizeMode.Crop,
                Position = AnchorPositionMode.Center
            }));

            WebpEncoder encoder = new WebpEncoder
            {
                Quality = 75 
            };

            await image.SaveAsync(filePath, encoder);
        }

        User user = await GetUserById(userId);
        user.Image = fileName;

        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();
    }
}