![banner](https://github.com/The-Enigma-Casino/.github/blob/main/img/Portada.png?raw=true)

# The Enigma Casino – Backend

Este directorio contiene el código fuente del backend de **The Enigma Casino**, una plataforma online multijugador con juegos de casino como **Póker**, **Blackjack**, **Ruleta** y otros minijuegos. ¡Toda la lógica del juego, comunicación en tiempo real y acceso a base de datos se gestiona desde aquí!

---

## 🛠 Tecnologías principales

* **Lenguaje:** C# (.NET 8)
* **Framework Web:** ASP.NET Core
* **WebSockets:** Comunicación bidireccional en tiempo real
* **ORM:** Entity Framework Core (EF Core)
* **Base de datos:** MySQL (producción), SQLite (desarrollo/test)
* **Autenticación:** JWT

---

## 📦 Dependencias completas (`.csproj`)

```xml
<PackageReference Include="F23.StringSimilarity" Version="6.0.0" />
<PackageReference Include="Google.Apis.Auth" Version="1.69.0" />
<PackageReference Include="Google.Apis.Gmail.v1" Version="1.69.0.3742" />
<PackageReference Include="Microsoft.AspNet.WebApi.Core" Version="5.3.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.13" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Relational" Version="8.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="8.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.2">
  <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
<PackageReference Include="Microsoft.Extensions.ML" Version="4.0.1" />
<PackageReference Include="MimeKit" Version="4.12.0" />
<PackageReference Include="Nethereum.Web3" Version="4.29.0" />
<PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.2" />
<PackageReference Include="SixLabors.ImageSharp" Version="3.1.7" />
<PackageReference Include="SixLabors.ImageSharp.Web" Version="3.1.4" />
<PackageReference Include="Sqids" Version="3.1.0" />
<PackageReference Include="Stripe.net" Version="47.3.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="7.2.0" />
<PackageReference Include="Swashbuckle.AspNetCore.Filters" Version="8.0.2" />
```

---

## 🚀 Cómo ejecutar el proyecto localmente

### 1. Clona el repositorio

#### En Linux / macOS:

```bash
git clone https://github.com/The-Enigma-Casino/The-Enigma-Casino.git
cd The-Enigma-Casino/backend/the-enigma-casino-server
```

#### En Windows (cmd o PowerShell):

```cmd
git clone https://github.com/The-Enigma-Casino/The-Enigma-Casino.git
cd The-Enigma-Casino\backend\the-enigma-casino-server
```

### 2. Configura el entorno

En modo desarrollo, no es necesario configurar manualmente las variables de entorno.

En producción, asegúrate de tener un archivo `.env.production` y ejecuta primero el script `set-env.sh` o simplemente llama directamente a `start-backend.sh`, que lo hace automáticamente todos los pasos.


### 3. Ejecuta la aplicación

En Linux / macOS:

```bash
dotnet build
DOTNET_ENVIRONMENT=Development dotnet run
```

En Windows (cmd):

```cmd
dotnet build
set DOTNET_ENVIRONMENT=Development
dotnet run
```

💡 También puedes usar Visual Studio directamente con el perfil Development activado.

---

## 📂 Estructura de carpetas

```bash
├── wwwroot/                     # Archivos estáticos (emails, filtros, logos...)
├── Application/               
│   ├── Dtos/                    # Objetos de transferencia de datos (DTOs)
│   ├── Mappers/                 # Conversores entre entidades y DTOs
│   └── Services/                # Servicios de lógica de negocio reutilizable
├── Core/                        # Entidades base y enums
├── Games/                       # Módulos de juego: Poker, Blackjack, Ruleta...
├── Infrastructure/              # Configuración de base de datos y repositorios
├── Middleware/                  # Middlewares personalizados
├── Utilities/                   # Utilidades comunes (filtrado, generadores, helpers)
├── WebSockets/                  # Canal WS: eventos, interfaces, resolvers...
├── Controllers/                 # Endpoints REST
├── Program.cs                   # Entry point de la app
└── appsettings*.json            # Configuraciones por entorno
```

---

## 📄 Base de datos

* MySQL en producción
* SQLite para pruebas automáticas

---

## 🔍 Swagger en desarrollo

Al ejecutar el backend en modo Development, se activa automáticamente la documentación interactiva de la API REST mediante Swagger:

```url
https://localhost:7186/swagger/index.html
```

Desde ahí puedes explorar y probar todos los endpoints disponibles sin necesidad de herramientas externas como Postman.

Para pruebas con WebSockets, puedes utilizar plataformas como:
- [WebSocket King](https://websocketking.com/)
- [Postman](https://www.postman.com/)

Ideal para verificar eventos en tiempo real y validar respuestas en los distintos canales del juego.

---

## 📩 Servicios externos

| Servicio  | Uso principal                              |
| --------- | ------------------------------------------ |
| Stripe    | Compra de monedas                          |
| Gmail API | OAuth2 para envío de correos en producción |
| MetaMask  | Visualización y NFT                        |

---

## 🌐 Entornos de despliegue

| Entorno        | URL                                                                            |
| -------------- | ------------------------------------------------------------------------------ |
| MonsterASP.net | [`https://theenigmacasino.runasp.net`](https://theenigmacasino.runasp.net/api) |
| AWS            | [`https://theenigmacasino.duckdns.org`](https://theenigmacasino.duckdns.org/api)   |
