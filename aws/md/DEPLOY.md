# 🚀 Backend Deployment Guide

Este documento detalla el proceso de despliegue del backend de **The Enigma Casino** en una instancia EC2 de AWS, usando **GitHub Actions + AWS CodeDeploy**, con ejecución gestionada mediante `systemd`.


## 📂 Estructura general

```
/deploy/backend/
├── install.sh         # Compila y sincroniza el backend
├── start.sh           # Arranca el servicio enigma-backend.service
├── stop.sh            # Detiene el backend si está corriendo
├── appspec.yml        # Script de hooks usado por CodeDeploy
└── .env.production    # Variables de entorno privadas (no se sube al repo)
```


## ⚙️ Servicio systemd

El backend se gestiona como un servicio de Linux:

### 📍 Ruta del archivo:

`/etc/systemd/system/enigma-backend.service`

### 📄 Contenido del archivo:

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

### 🛠️ Activación (solo una vez):

```bash
sudo systemctl daemon-reload
sudo systemctl enable enigma-backend.service
```


## 🔁 Flujo de despliegue CodeDeploy

1. **`stop.sh`**:

   * Detiene el servicio si está corriendo
   * Verifica que el puerto 5000 esté libre

2. **`install.sh`**:

   * Verifica que la instancia sea de tipo "backend"
   * Compila el proyecto con `dotnet publish`
   * Sincroniza la publicación al directorio `/home/ubuntu/backend-code-deploy`
   * Ejecuta `systemctl daemon-reload` y `systemctl enable` para asegurar el servicio

3. **`start.sh`**:

   * Carga las variables desde `.env.production`
   * Hace `systemctl stop` y `start` del servicio
   * Verifica que se haya iniciado correctamente



## 📄 Logs útiles

### 🔍 Logs generales de CodeDeploy:

```bash
/opt/codedeploy-agent/deployment-root/deployment-logs/
```

### 🗒️ Log personalizado de instalación:

```bash
/tmp/backend-install.log
```

### 🟢 Log del start:

```bash
/tmp/backend-start.log
```

### 📡 Log del servicio:

```bash
sudo journalctl -u enigma-backend.service
```


## 🧪 Comprobaciones rápidas

### Ver estado del servicio:

```bash
sudo systemctl status enigma-backend.service
```

### Ver si escucha en el puerto 5000:

```bash
sudo lsof -i :5000
```

### Ver últimos errores en despliegue:

```bash
sudo tail -n 100 /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deployments.log
```


## ☝️ Notas finales

* Asegúrate de que `.env.production` está presente en `/home/ubuntu/backend-code-deploy/`
* Este flujo asume que el servicio ya ha sido creado manualmente
* Los scripts están preparados para ser ejecutados varias veces sin causar conflictos

