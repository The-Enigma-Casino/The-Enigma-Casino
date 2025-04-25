
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.WebSockets;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;
using the_enigma_casino_server.Application.Mappers;
using the_enigma_casino_server.Application.Services;
using the_enigma_casino_server.Application.Services.Blockchain;
using the_enigma_casino_server.Application.Services.Email;
using the_enigma_casino_server.Infrastructure.Database;
using the_enigma_casino_server.Infrastructure.Database.Seeder;
using the_enigma_casino_server.Middleware;
using the_enigma_casino_server.Utilities;
using the_enigma_casino_server.Websockets.Roulette;
using the_enigma_casino_server.WebSockets.Base;
using the_enigma_casino_server.WebSockets.BlackJack;
using the_enigma_casino_server.WebSockets.Chat;
using the_enigma_casino_server.WebSockets.GameMatch;
using the_enigma_casino_server.WebSockets.GameTable;
using the_enigma_casino_server.WebSockets.Interfaces;
using the_enigma_casino_server.WebSockets.Poker;
using the_enigma_casino_server.WebSockets.Resolvers;


namespace the_enigma_casino_server;

public class Program
{
    public static void Main(string[] args)
    {
        Directory.SetCurrentDirectory(AppContext.BaseDirectory);

        var builder = WebApplication.CreateBuilder(args);

        ConfigureServices(builder);

        var app = builder.Build();

        ConfigureMiddleware(app);

        ConfigureStripe(app.Services);

        app.MapGet("/api/", () => "The Enigma Casino!");

        app.Run();
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        // --- Infraestructura y persistencia ---
        builder.Services.AddScoped<MyDbContext>();
        builder.Services.AddScoped<UnitOfWork>();

        // --- Servicios ---
        builder.Services.AddScoped<BaseService>();
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<EmailService>();
        builder.Services.AddScoped<CoinsPackService>();
        builder.Services.AddScoped<OrderService>();
        builder.Services.AddScoped<HistoryService>();
        builder.Services.AddScoped<TableService>();
        builder.Services.AddScoped<GachaponService>();
        builder.Services.AddScoped<BlockchainService>();
        builder.Services.AddScoped<AdminUserService>();

        // --- Validaciones ---
        builder.Services.AddSingleton<ValidationService>();

        // --- WebSocket: infraestructura base ---
        builder.Services.AddTransient<WebsocketMiddleware>();
        builder.Services.AddSingleton<WebSocketService>();
        builder.Services.AddSingleton<ConnectionManagerWS>();
        builder.Services.AddSingleton<WebSocketHandlerResolver>();

        // --- WebSocket: handlers (SIEMPRE singleton) ---
        builder.Services.AddSingleton<GameTableWS>();
        builder.Services.AddSingleton<GameMatchWS>();
        builder.Services.AddSingleton<BlackjackWS>();
        builder.Services.AddSingleton<PokerWS>();
        builder.Services.AddSingleton<RouletteWS>();
        builder.Services.AddSingleton<GameChatWS>();

        builder.Services.AddSingleton<IWebSocketMessageHandler, GameTableWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, GameMatchWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, BlackjackWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, PokerWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, RouletteWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, GameChatWS>();

        // --- WebSocket: servicios específicos del juego ---
        builder.Services.AddScoped<GameTableManager>();
        builder.Services.AddScoped<GameMatchManager>();

        // --- Resolver de servicios por tipo de juego ---
        builder.Services.AddScoped<GameBetInfoProviderResolver>();
        builder.Services.AddScoped<GameTurnServiceResolver>();
        builder.Services.AddScoped<GameSessionCleanerResolver>();

        // --- Servicios concretos de Blackjack ---
        builder.Services.AddScoped<BlackjackBetInfoProvider>();
        builder.Services.AddScoped<BlackjackSessionCleaner>();
        builder.Services.AddScoped<BlackjackTurnService>();

        builder.Services.AddScoped<IGameBetInfoProvider, BlackjackBetInfoProvider>();
        builder.Services.AddScoped<IGameTurnService, BlackjackTurnService>();
        builder.Services.AddScoped<IGameSessionCleaner, BlackjackSessionCleaner>();

        // --- Servicios concretos de Poker ---
        builder.Services.AddScoped<PokerBetInfoProvider>();
        builder.Services.AddScoped<PokerSessionCleaner>();
        builder.Services.AddScoped<PokerTurnService>();

        builder.Services.AddScoped<IGameBetInfoProvider, PokerBetInfoProvider>();
        builder.Services.AddScoped<IGameTurnService, PokerTurnService>();
        builder.Services.AddScoped<IGameSessionCleaner, PokerSessionCleaner>();

        // --- Servicios concretos de Ruleta ---
        builder.Services.AddScoped<RouletteBetInfoProvider>();
        builder.Services.AddScoped<RouletteSessionCleaner>();

        builder.Services.AddScoped<IGameBetInfoProvider, RouletteBetInfoProvider>();
        builder.Services.AddScoped<IGameSessionCleaner, RouletteSessionCleaner>();




        // --- Mappers ---
        builder.Services.AddScoped<StripeMapper>();
        builder.Services.AddScoped<OrderMapper>();
        builder.Services.AddScoped<UserMapper>();
        builder.Services.AddScoped<GameHistoryMapper>();

        // --- Stripe ---
        builder.Services.AddTransient<StripeService>();

        // --- Swagger y controladores ---
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Configuración de CORS
        string clientUrl = Environment.GetEnvironmentVariable("CLIENT_URL");

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("MyPolicy", policy =>
            {
                if (!string.IsNullOrEmpty(clientUrl))
                {
                    policy.WithOrigins(clientUrl)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                }
            });
        });

        // Configuración de autenticación JWT
        string key = Environment.GetEnvironmentVariable("JWT_KEY");
        if (string.IsNullOrEmpty(key))
        {
            throw new InvalidOperationException("JWT_KEY is not configured in environment variables.");
        }

        builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                BearerFormat = "JWT",
                Name = "Authorization",
                Description = "Escribe SOLO tu token JWT",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme
            });

            // Establecer los requisitos de seguridad para las operaciones de la API
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = JwtBearerDefaults.AuthenticationScheme
                }
            },
            new string[] { }
        }
    });
        });

    }

    private static void ConfigureMiddleware(WebApplication app)
    {
        // Redirigir HTTP a HTTPS
        app.UseHttpsRedirection();

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
        });

        // Creación de la base de datos y el Seeder
        SeedDatabase(app.Services);

        app.UseRouting();

        // Middleware de desarrollo (Swagger y CORS)
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();

        }

        app.UseCors("MyPolicy");

        app.UseWebSockets();
        app.UseMiddleware<WebSocketMiddleware>();


        // Middleware de autenticación y autorización
        app.UseAuthentication();

        UseBlockBannedUsersMiddleware(app);

        app.UseAuthorization();

        // Mapear rutas de controladores
        app.MapControllers();
    }


    private static void SeedDatabase(IServiceProvider serviceProvider)
    {
        using IServiceScope scope = serviceProvider.CreateScope();
        MyDbContext dbContext = scope.ServiceProvider.GetService<MyDbContext>();
        UserService userService = scope.ServiceProvider.GetService<UserService>();

        if (dbContext.Database.EnsureCreated())
        {
            SeedManager seeder = new SeedManager(dbContext, userService);
            seeder.SeedAll();
        }
    }

    private static void ConfigureStripe(IServiceProvider serviceProvider)
    {

        using IServiceScope scope = serviceProvider.CreateScope();

        string key = Environment.GetEnvironmentVariable("STRIPE_KEY");

        if (string.IsNullOrEmpty(key))
        {
            throw new InvalidOperationException("STRIPE_KEY is not configured in environment variables.");
        }

        StripeConfiguration.ApiKey = key;

    }

    private static void UseBlockBannedUsersMiddleware(WebApplication app)
    {
        app.Use(async (context, next) =>
        {
            string path = context.Request.Path.Value?.ToLower();
            if (path != null && (path.StartsWith("/api/auth") || path.StartsWith("/swagger")))
            {
                await next();
                return;
            }

            var user = context.User;
            if (user.Identity?.IsAuthenticated == true)
            {
                var roleClaim = user.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role);
                if (roleClaim?.Value == "Banned")
                {
                    context.Response.StatusCode = 403;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = "Tu cuenta ha sido baneada. Contacta con soporte si crees que es un error."
                    });
                    return;
                }
            }

            await next();
        });
    }


}
