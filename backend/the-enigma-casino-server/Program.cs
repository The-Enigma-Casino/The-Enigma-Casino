
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;
using the_enigma_casino_server.Games.BlackJack.Services;
using the_enigma_casino_server.Models.Database;
using the_enigma_casino_server.Models.Mappers;
using the_enigma_casino_server.Models.Seeder;
using the_enigma_casino_server.Services;
using the_enigma_casino_server.Services.Blockchain;
using the_enigma_casino_server.Services.Email;

namespace the_enigma_casino_server;

public class Program
{
    public static void Main(string[] args)
    {
        Directory.SetCurrentDirectory(AppContext.BaseDirectory);

        var builder = WebApplication.CreateBuilder(args);

        // Configuración de servicios
        ConfigureServices(builder);

        // Crear la aplicación web utilizando la configuración del builder
        var app = builder.Build();

        // Configuración del middleware de la aplicación
        ConfigureMiddleware(app);

        // Configura stripe
        ConfigureStripe(app.Services);

        // Endpoint saludo
        app.MapGet("/api/", () => "The Enigma Casino!");

        // Ejecutar la aplicación web y escuchar las solicitudes entrantes
        app.Run();
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        // Habilitar el uso de controladores y Swagger para la documentación de API
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Configuración de base de datos y repositorios
        builder.Services.AddScoped<MyDbContext>();
        builder.Services.AddScoped<UnitOfWork>();

        // Inyección de servicios
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<EmailService>();
        builder.Services.AddScoped<CoinsPackService>();
        builder.Services.AddScoped<OrderService>();
        // BlackJack
        builder.Services.AddScoped<DeckService>();

        // Blockhain
        builder.Services.AddScoped<BlockchainService>();

        // Inyeccion Hosted Services

        //Inyección de mappers
        builder.Services.AddScoped<StripeMapper>();
        builder.Services.AddScoped<OrderMapper>();

        // Stripe
        builder.Services.AddTransient<StripeService>();

        // Configuración de CORS

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("MyPolicy", policy =>
            {
                policy.WithOrigins("http://localhost:5173") // Cambia esto según la URL de tu frontend
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials(); // Esto permite el uso de credenciales
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
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(
                    Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
        });

        // Creación de la base de datos y el Seeder
        SeedDatabase(app.Services);

        // Middleware de desarrollo (Swagger y CORS)
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();

        }
        app.UseRouting();

        app.UseCors("MyPolicy");

        // Redirigir HTTP a HTTPS
        app.UseHttpsRedirection();

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
