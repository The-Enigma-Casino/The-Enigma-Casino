using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
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
    private readonly SmartSearchService _smartSearchService;
    private const string DefaultProfileImage = "user_default.webp";


    public UserService(UnitOfWork unitOfWork, IOptionsMonitor<JwtBearerOptions> jwtOptions, EmailService emailService, ValidationService validationService, UserMapper userMapper, SmartSearchService smartSearchService) : base(unitOfWork)
    {
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme).TokenValidationParameters;
        _emailService = emailService;
        _validation = validationService;
        _userMapper = userMapper;
        _smartSearchService = smartSearchService;
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

        if (user == null || user.Id == -1)
        {
            throw new UnauthorizedAccessException("Identificador o contraseña inválidos.");
        }

        if (user.Role == Role.Banned)
        {
            throw new UnauthorizedAccessException("Tu cuenta ha sido baneada. Contacta con soporte si crees que es un error.");
        }

        if(user.IsSelfBanned)
        {
            throw new UnauthorizedAccessException("Tu cuenta fue auto baneada. Contacta con soporte si crees que es un error.");
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
                Address = request.Address,
                Coins = 1000
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

    //public async Task<OtherUserDto> GetOtherProfile(int currentUserId, int profileUserId) // NO BORRAR
    //{
    //    User user = await GetUserById(profileUserId);

    //    if (user == null)
    //        throw new KeyNotFoundException("Usuario no encontrado");

    //    string relation;

    //    if (currentUserId == profileUserId)
    //    {
    //        relation = "self";
    //    }
    //    else
    //    {
    //        bool isFriend = await _userFriendService.AreFriendsAsync(currentUserId, profileUserId); // DEJA DE FUNCIONAR
    //        relation = isFriend ? "friend" : "stranger";
    //    }

    //    return new OtherUserDto(user.NickName, user.Country, user.Image, relation);

    //}

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

    public async Task SetDefaultProfileImageAsync(int userId)
    {
        User user = await GetUserById(userId);

        user.Image = DefaultProfileImage;

        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();
    }


    public async Task<User> SetRoleByUser(User user, Role role)
    {
        if (user == null)
            throw new Exception("Usuario no existente.");

        if (user.Role != role)
        {
            user.Role = role;

            _unitOfWork.UserRepository.Update(user);
            await _unitOfWork.SaveAsync();
        }

        return user;
    }

    public async Task<List<User>> SearchUsersByNickName(string nickName)
    {
        List<User> users = await _unitOfWork.UserRepository.GetAllUserAsync();
        List<string> userNickNames = users.Select(u => u.NickName).ToList();

        IEnumerable<string> matchedNickNames = _smartSearchService.Search(nickName, userNickNames);

        if (matchedNickNames == null || !matchedNickNames.Any())
            throw new Exception("No se encontraron usuarios con ese NickName.");

        List<User> filteredUsers = users
            .Where(u => matchedNickNames.Contains(u.NickName))
            .ToList();

        return filteredUsers;
    }

    public async Task AutoBan(int id)
    {
        User user = await GetUserById(id);

        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        if (user.Role == Role.Admin)
            throw new UnauthorizedAccessException("Un usuario admin no puede auto banearse.");

        user.IsSelfBanned = true;
        user.SelfBannedAt = DateTime.Now;

        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();
    }

    private string ValidateUpdateRequest(UpdateUserReq request)
    {
        if (string.IsNullOrWhiteSpace(request.NickName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Address) ||
            string.IsNullOrWhiteSpace(request.Country))
        {
            return "Los campos obligatorios no pueden estar vacíos.";
        }

        if (!_validation.IsValidEmail(request.Email))
            return "El email ingresado no es válido.";

        if (!_validation.IsValidName(request.NickName))
            return "El nombre de usuario contiene palabras no permitidas.";

        return string.Empty;
    }

    public async Task<string> UpdateUserAsync(int userId, UpdateUserReq updateUserReq)
    {
        User user = await GetUserById(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        string validatorError = ValidateUpdateRequest(updateUserReq);
        if (!string.IsNullOrEmpty(validatorError))
        {
            return validatorError;
        }

        user.NickName = updateUserReq.NickName;
        user.FullName = updateUserReq.FullName;
        user.Email = updateUserReq.Email;
        user.Address = updateUserReq.Address;
        user.Country = updateUserReq.Country;


        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();

        return string.Empty;
    }

    public async Task<UpdateUserReq> GetUpdateUser(int userId)
    {
        User user = await GetUserById(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        return new UpdateUserReq
        {
            NickName = user.NickName,
            FullName = user.FullName,
            Email = user.Email,
            Address = user.Address,
            Country = user.Country,
        };
    }


    private string ValidateNewPassword(UpdatePasswordReq request)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.ConfirmPassword))
            return "Debes ingresar y confirmar la contraseña.";

        if (request.Password != request.ConfirmPassword)
            return "Las contraseñas no coinciden.";

        return string.Empty;
    }

    public async Task<string> SetNewPasswordAsync(int userId, UpdatePasswordReq request)
    {
        User user = await GetUserById(userId);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado");

        var validation = ValidateNewPassword(request);
        if (!string.IsNullOrEmpty(validation))
            return validation;

        user.HashPassword = HashHelper.Hash(request.Password);

        _unitOfWork.UserRepository.Update(user);
        await _unitOfWork.SaveAsync();

        return string.Empty;
    }
}