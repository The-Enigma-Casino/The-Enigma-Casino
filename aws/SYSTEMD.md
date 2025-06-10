# 🛠️ enigma-backend.service

Archivo de configuración para `systemd` que permite arrancar automáticamente el backend .NET de **The Enigma Casino** como servicio en segundo plano.

Este servicio se ejecuta con el usuario `ubuntu`, reinicia automáticamente si falla y se asegura de iniciar tras tener conectividad de red.

---

## 📄 Contenido del archivo

```ini
[Unit]
Description=Enigma Backend .NET Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/bin/bash /home/ubuntu/auto-start-backend.sh
ExecStop=/bin/bash /home/ubuntu/stop-backend.sh
KillSignal=SIGINT
TimeoutStopSec=10
StandardOutput=journal
StandardError=journal
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target