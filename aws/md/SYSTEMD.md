# ⚙️ Servicios systemd

Servicios usados para levantar automáticamente los componentes principales del sistema: backend (.NET) y firewall (WAF con Nginx + Docker).

## 🧩 enigma-backend.service

Servicio que ejecuta el backend .NET de The Enigma Casino.

### 📄 Archivo: /etc/systemd/system/enigma-backend.service

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
```

### 🛠️ Activación

```bash
sudo systemctl daemon-reload
sudo systemctl enable enigma-backend.service
sudo systemctl start enigma-backend.service
```

## 🔐 waf-deploy.service

Despliega y arranca el contenedor enigma-waf con Nginx + ModSecurity.

### 📄 Archivo: /etc/systemd/system/waf-deploy.service

```ini
[Unit]
Description=Deploy and start Enigma WAF
After=network-online.target docker.service
Wants=network-online.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/enigma-waf
ExecStart=/bin/bash /home/ubuntu/enigma-waf/deploy-waf.sh
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

## 👀 waf-watchdog.service

Supervisa disponibilidad del backend y reinicia el WAF si hay cambios.

### 📄 Archivo: /etc/systemd/system/waf-watchdog.service

```ini
[Unit]
Description=WAF Backend Watchdog
After=network.target docker.service

[Service]
User=ubuntu
ExecStart=/bin/bash /home/ubuntu/enigma-waf/waf-watchdog.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 🧪 Comandos útiles

Ver estado de servicios:

```bash
systemctl status enigma-backend.service
systemctl status waf-deploy.service
systemctl status waf-watchdog.service
```

Habilitar todos (solo una vez):

```bash
sudo systemctl daemon-reload
sudo systemctl enable enigma-backend.service
sudo systemctl enable waf-deploy.service
sudo systemctl enable waf-watchdog.service
```
