![portada](https://github.com/The-Enigma-Casino/.github/blob/main/img/Portada.png?raw=true)
# The Enigma Casino

**Enigma Casino** es una plataforma online multijugador donde los usuarios pueden disfrutar de juegos clásicos de casino como **Blackjack**, **Póker** y **Ruleta** y otros mini juegos. El sistema está diseñado para ofrecer partidas en tiempo real entre varios jugadores, con interacción directa a través de WebSockets, un diseño moderno y una experiencia inmersiva.
 
## 📚 Índice

- [⭐ The Enigma Casino](#the-enigma-casino)
- [👨‍💻 Autores del proyecto](#-autores-del-proyecto)
- [🛠️ Tecnologías utilizadas](#-tecnologías-utilizadas)
   * [Backend](#backend)
   * [Frontend](#frontend)
   * [Despliegue](#despliegue)
- [🎨 Diseño en Figma](#-diseño-en-figma)
- [📗Documentación](#-documentación)
- [✨ Vista previa](#-vista-previa)
- [📁 Arquitectura de sistemas](#-arquitectura-de-sistemas)
- [💰 Pagos y Retirada](#-pagos-y-retirada)
- [📄 Licencia](#-licencia)
- [☁️ Readme AWS](/aws/README.md)
- [🌐 Readme Front](/frontend/README.md)
- [🌐 Readme Back](/backend/README.md)
- [🧩 Readme Base de Datos](/backend/db/README.md)

## 👨‍💻 Autores del proyecto
- Alejandro Barrionuevo Rosado 
- Raquel López Bermúdez 
- José Molina Meléndez
 
## 🛠️ Tecnologías utilizadas
 
### Backend
- **Lenguaje:** C#  
- **Framework:** .NET 8   
- **Comunicación en tiempo real:** WebSockets  
- **Base de datos:** MySQL y SQLite  
 
### Frontend
- **Lenguaje:** TS 
- **Framework:** React  
- **Gestión de estado:** Effector  
- **Estilos:** Tailwind CSS y CSS 

### Despliegue
- **AWS**
- **Vercel**
- **MonsterASP**

## 🎨 Diseño en Figma

Todo el diseño visual y flujo de pantallas ha sido creado en Figma para garantizar coherencia estética y usabilidad en todos los dispositivos.

- 🔗 Accede al prototipo visual desde aquí:
[Diseño en Figma](https://www.figma.com/design/LQaWzVCNxme6H3MrJEloKP/The-Enigma-Casino?m=auto&t=3nB4QIu4BKzvmWC7-1)

- [Documento PDF](/document/Figma%20-%20The%20Enigma%20Casino.pdf)
 
## 📗 Documentación

- [📙 Documento TFG](/document/The%20Enigma%20Casino.pdf)

- [📘 Notion](https://aquatic-breadfruit-03f.notion.site/1ba5df69c5bd80b49b87d9999c427090?v=1ba5df69c5bd8043a150000c22dd6466)

- [📹 Checkpoint](https://youtu.be/3HNNEJo4mmw)

- [📹 Video final del proyecto](https://youtu.be/GevVd0DPXsU)

- [👁️ Presentación](/document/Autores%20Raqué%20Lopez%20Bermudez%20Alejandro%20Barrionuevo%20Rosado%20José%20Molina%20Meléndez.pdf)

## ✨ Vista previa

![landing](/document/img/landing.png)

![home](/document/img/home.png)

![ruleta](/document/img/ruleta.png)

![blackjack](/document/img/blackjack.png)

![poker](/document/img/poker.png)

## 📁 Arquitectura de sistemas

![Diagrama](/aws/img/AWS.png)

## 💰 Pagos y Retirada

La plataforma **The Enigma Casino** ofrece dos métodos de pago: en **euros** y en **Ethereum**. La retirada de fichas se realiza a través de la red de prueba **Ephemery** con criptomonedas. Todos los sistemas de pago están actualmente en **modo de prueba**, por lo que es necesario utilizar credenciales y entornos de prueba para realizar las transacciones.

### 💳 Pago en Euros

Para los pagos en euros se utiliza **Stripe**, una plataforma segura y ampliamente adoptada para procesar pagos con tarjeta. Stripe permite realizar transacciones mediante tarjetas de crédito y débito, y está integrado directamente en nuestra interfaz.

Actualmente, solo se pueden realizar **pagos de prueba** con tarjetas proporcionadas por Stripe.

- 👉 [Tarjetas para pagos exitosos](https://docs.stripe.com/testing?locale=es-ES&testing-method=card-numbers#cards)

### 🪙 Pago en Ethereum

![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=fff&style=for-the-badge)

También es posible realizar pagos utilizando **Ethereum**, mediante la extensión **MetaMask**, conectada a la red de prueba [Ephemery](https://ephemery.dev/). Esta funcionalidad permite simular pagos con criptomonedas de forma segura y sin utilizar fondos reales.

#### 🔧 Configuración de la red Ephemery (testnet)

1. Accede a la web oficial: [Ephemery.dev](https://ephemery.dev/)
2. Haz clic en el botón **"Add network to MetaMask"**.
3. MetaMask se abrirá automáticamente y te pedirá confirmar.
4. Una vez añadida, podrás obtener ETH de prueba desde el **Faucet** disponible en la misma página.

Este entorno de prueba permite experimentar con pagos en Ethereum sin riesgo, ideal para fines de desarrollo y demostración del sistema.

📌 **Importante:** La red **Ephemery** se reinicia aproximadamente cada **28 días**, por lo que es necesario actualizar la red y volver a obtener ETH de prueba periódicamente.

### 🏦 Retirada de fondos

La retirada de fichas se realiza a través de **MetaMask**, por lo que es necesario tener la extensión previamente configurada con la red [Ephemery](https://ephemery.dev/) y conectada a la red de prueba correspondiente.

- Las retiradas en Ethereum se procesan mediante transacciones simuladas en la red de prueba **Ephemery**, sin movimiento de fondos reales.

⚠️ **Nota:** Ninguna transacción representa dinero real.

## 📄 Licencia

Este proyecto está protegido por derechos de autor. No se permite su uso, copia, modificación, distribución ni creación de obras derivadas sin autorización expresa de los autores.

© 2025 Alejandro-BR, Rlopber, Jmolmel. Todos los derechos reservados.  
Para consultas o permisos especiales, contactar a: [theenigmacasino@gmail.com](mailto:theenigmacasino@gmail.com)