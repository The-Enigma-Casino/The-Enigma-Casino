![banner](https://github.com/The-Enigma-Casino/.github/blob/main/img/Portada.png?raw=true)

# 🌐 Frontend

Este directorio contiene el código fuente del frontend principal de **The Enigma Casino**, una plataforma multijugador online con juegos de casino en tiempo real: **Blackjack**, **Póker**, **Ruleta**, y más.

---

## 🛠️ Tecnologías principales

* **Lenguaje:** TypeScript
* **Framework:** [React 19](https://react.dev/)
* **Estado global:** [Effector 23](https://effector.dev/)
* **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/)

---

## 📦 Dependencias (`package.json`)

```ts
"@metamask/logo": "^4.0.0",             // Logo oficial de MetaMask para UI
"@stripe/react-stripe-js": "^3.3.0",    // Integración de Stripe en React
"@stripe/stripe-js": "^5.10.0",         // SDK de Stripe para navegadores
"axios": "^1.7.9",                      // Cliente HTTP para llamadas API
"canvas-confetti": "^1.9.3",            // Efectos de confeti en canvas
"date-fns": "^4.1.0",                   // Utilidades para manejo de fechas
"effector": "^23.3.0",                  // Gestión de estado reactivo
"effector-react": "^23.3.0",            // Hooks para integrar Effector con React
"embla-carousel-react": "^8.6.0",       // Carrusel
"gsap": "^3.13.0",                      // Animaciones complejas y precisas
"history": "^5.3.0",                    // Control del historial para navegación
"jwt-decode": "^4.0.0",                 // Decodificador de tokens JWT
"react": "^19.0.0",                     // Librería base de interfaz
"react-datepicker": "^8.2.1",           // Selector de fechas
"react-dom": "^19.0.0",                 // Renderizado de componentes React
"react-hot-toast": "^2.5.2",            // Notificaciones y toasts
"react-router-dom": "^7.1.5",           // Navegación entre rutas
"sqids": "^0.3.0",                      // Generación de IDs cortos y únicos
"use-debounce": "^10.0.4",              // Hook para debounce en inputs/eventos
"web3": "^4.16.0"                       // Conexión con blockchain y MetaMask
```

---

## 🚀 Cómo ejecutar el proyecto

### 1. Clona el repositorio

#### En Linux / macOS:

```bash
git clone https://github.com/The-Enigma-Casino/The-Enigma-Casino.git
cd The-Enigma-Casino/frontend/the-enigma-casino-client
```

#### En Windows (cmd o PowerShell):

```cmd
git clone https://github.com/The-Enigma-Casino/The-Enigma-Casino.git
cd The-Enigma-Casino\frontend\the-enigma-casino-client
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Inicia la app

```bash
npm run dev
```

---

## 📂 Estructura de carpetas

```bash
├── public/
│   ├── img/                  # Imágenes estáticas
│   ├── music/                # Música y sonidos
│   └── svg/                  # Recursos SVG
├── src/
│   ├── components/           # Componentes visuales reutilizables
│   ├── features/             # Features específicas
│   ├── guards/               # Guardias de ruta
│   ├── init/                 # Inicialización global (Effector, listeners)
│   ├── layouts/              # Layouts generales
│   ├── styles/               # Archivos CSS globales
│   ├── types/                # Tipos globales y definiciones TS para librerías no tipadas
│   ├── utils/                # Funciones auxiliares reutilizables
│   ├── websocket/            # Handlers WebSocket y conexión
│   └── store/                # Stores de estado global (Effector)
├── App.tsx                   # Componente raíz
├── main.tsx                  # Entrada de la app
├── config.ts                 # Variables globales
├── routes.tsx                # Definición de rutas
├── vite-env.d.ts             # Tipado de variables env
├── .env.development          # Variables de entorno (dev)
├── tailwind.config.js        # Configuración Tailwind
├── tsconfig.json             # Configuración TypeScript
└── vite.config.ts            # Configuración Vite
```

---

## 🌍 API externa utilizada

Este proyecto utiliza la API pública [REST Countries v3.1](https://restcountries.com/) para obtener información de los países, como nombres oficiales, códigos y banderas. Esto permite mostrar de forma visual la nacionalidad de los jugadores en distintas partes de la interfaz.

---

## 🧪 Comandos útiles

```bash
npm run dev        # Desarrollo local
npm run build      # Build optimizado para producción
npm run preview    # Vista previa del build
npm run lint       # Linting de código con ESLint
```

---

## 🌐 Entornos de despliegue

| Entorno | URL                                                                              |
| ------- | -------------------------------------------------------------------------------- |
| Vercel  | [`https://the-enigma-casino.vercel.app`](https://the-enigma-casino.vercel.app)   |
| AWS     | [`https://the-enigma-casino.duckdns.org`](https://the-enigma-casino.duckdns.org) |
