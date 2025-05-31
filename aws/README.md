# ☁️ AWS Deployment – The Enigma Casino

Este directorio contiene la documentación relacionada con la infraestructura de despliegue en **AWS** para el proyecto _The Enigma Casino_, incluyendo frontend, backend, balanceadores y conexiones internas.

> [!IMPORTANT]
> En proceso de desarrollo...

---

## 🔗 URLs del proyecto

| Proyecto    | URL                                                                      |
| ----------- | ------------------------------------------------------------------------ |
| ♣️ Frontend | [`the-enigma-casino.duckdns.org`](https://the-enigma-casino.duckdns.org) |
| 🖥️ Backend  | [`theenigmacasino.duckdns.org`](https://theenigmacasino.duckdns.org/api) |

---

## 📁 Documentación disponible

- [`SSH.md`](./SSH.md) – Conexiones SSH internas y estructura de alias

---

## 🗂 Seguimiento en Notion

Consulta el estado detallado y el progreso del despliegue en este [📋 tablero de Notion](https://aquatic-breadfruit-03f.notion.site/1fe5df69c5bd80cbbbaed2e50e75aafb?v=1fe5df69c5bd806b931c000c8d30c77d)

## 🗃️ Scripts disponibles

**setup-enigma.sh**  
 🛠️ _Instala herramientas básicas en una instancia nueva._  
 Instala: `curl`, `git`, `unzip`, `tree`, y actualiza el sistema.

**start-backend.sh**  
 🚀 _Compila y ejecuta el backend._

- Carga las variables de entorno desde `.env.production`.
- Compila el proyecto en modo `Release` con `dotnet publish`.
- Ejecuta el `.dll` resultante con `dotnet`.

Para hacerlo ejecutable:

```bash
chmod +x start-backend.sh
```

Para lanzarlo cualquiera de estas dos opciones:

```bash
./start-backend.sh
```

```bash
source start-backend.sh
```

O dejarlo corriendo en segundo plano:

```bash
nohup ./start-backend.sh &
```
