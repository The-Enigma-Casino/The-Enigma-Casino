
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.WebSockets;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;
using the_enigma_casino_server.Games.Shared.Services;
using the_enigma_casino_server.Middleware;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Mappers;
using the_enigma_casino_server.Models.Seeder;
using the_enigma_casino_server.Services;
using the_enigma_casino_server.Services.Blockchain;
using the_enigma_casino_server.Services.Email;
using the_enigma_casino_server.WS.BlackJack;
using the_enigma_casino_server.WS.BlackJackWS;
using the_enigma_casino_server.WS.GameMatch;
using the_enigma_casino_server.WS.GameTable;
using the_enigma_casino_server.WS.GameWS.Services;
using the_enigma_casino_server.WS.Interfaces;
using the_enigma_casino_server.WS.Resolver;


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

        // --- Servicios del dominio ---
        builder.Services.AddScoped<BaseService>();
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<EmailService>();
        builder.Services.AddScoped<CoinsPackService>();
        builder.Services.AddScoped<OrderService>();
        builder.Services.AddScoped<HistoryService>();
        builder.Services.AddScoped<TableService>();
        builder.Services.AddScoped<GachaponService>();
        builder.Services.AddScoped<BlockchainService>();

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

        builder.Services.AddSingleton<IWebSocketMessageHandler, GameTableWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, GameMatchWS>();
        builder.Services.AddSingleton<IWebSocketMessageHandler, BlackjackWS>();

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


        // --- Mappers ---
        builder.Services.AddScoped<StripeMapper>();
        builder.Services.AddScoped<OrderMapper>();
        builder.Services.AddScoped<UserMapper>();
        builder.Services.AddScoped<GameHistoryMapper>();

        // --- Otros ---
        builder.Services.AddTransient<StripeService>();

        // --- Swagger y controladores ---
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();


        // Configuración de CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("MyPolicy", policy =>
            {
                policy.WithOrigins("http://localhost:5173") 
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
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
        app.UseAuthorization();

        // Mapear rutas de controladores
        app.MapControllers();
    }


    private static void SeedDatabase(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetService<MyDbContext>();

        if (dbContext.Database.EnsureCreated())
        {
            var seeder = new SeedManager(dbContext);
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

}
