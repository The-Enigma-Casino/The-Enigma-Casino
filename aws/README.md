# ☁️ AWS Deployment – The Enigma Casino

Este directorio contiene la documentación relacionada con la infraestructura de despliegue en **AWS** para el proyecto _The Enigma Casino_, incluyendo frontend, backend, balanceadores y conexiones internas.


## 🔗 URLs del proyecto

| Proyecto    | URL                                                                      |
| ----------- | ------------------------------------------------------------------------ |
| ♣️ Frontend | [`the-enigma-casino.duckdns.org`](https://the-enigma-casino.duckdns.org) |
| 🖥️ Backend  | [`theenigmacasino.duckdns.org`](https://theenigmacasino.duckdns.org/api) |


## 📁 Documentación disponible

- [`SSH.md`](./md/SSH.md) – Conexiones SSH internas y estructura de alias
- [`SFTP.md`](./md/SFTP.md) – Acceso seguro por SFTP para subir archivos a backend y frontend
- [`SCRIPTS.md`](./md/SCRIPTS.md) - Scripts utilizados en el proyecto
- [`WAF.md`](./md/WAF.md) - Web Application Firewall (WAF) 
- [`DEPLOY.md`](./md/DEPLOY.md) - GitHub Actions + AWS CodeDeploy
- [`SYSTEMD.md`](./md/SYSTEMD.md) - Servicios systemd usados para levantar backend y WAF automáticamente.


## 🗂 Seguimiento en Notion

Consulta el estado detallado y el progreso del despliegue en este [📋 tablero de Notion](https://aquatic-breadfruit-03f.notion.site/1fe5df69c5bd80cbbbaed2e50e75aafb?v=1fe5df69c5bd806b931c000c8d30c77d)


## 📁 Estructura del directorio /aws

```bash
/aws
│
├── auto-start-backend.sh
├── deploy-waf.sh
├── move_sftp_back_uploads.sh
├── move_sftp_front_uploads.sh
├── setup-enigma.sh
├── start-backend.sh
├── waf-watchdog.sh
├── README.md
│
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── img/
│   └── image.png
│
├── md/
│   ├── DEPLOY.md       # Despliegue con GitHub Actions + CodeDeploy
│   ├── SCRIPTS.md      # Scripts utilizados en el proyecto
│   ├── SFTP.md         # Acceso seguro por SFTP
│   ├── SSH.md          # Accesos y alias SSH
│   ├── SYSTEMD.md      # Servicios systemd del backend y WAF
│   └── WAF.md          # Configuración del Web Application Firewall
│
└── systemd/
    ├── enigma-backend.service     # Servicio para el backend .NET
    ├── waf-deploy.service         # Servicio de despliegue del WAF
    └── waf-watchdog.service       # Servicio Watchdog para el WAF

```