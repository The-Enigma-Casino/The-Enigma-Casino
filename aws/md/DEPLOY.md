# 🧭 Guía de Despliegue Automático

Este documento describe el proceso de despliegue automatizado del sistema completo de The Enigma Casino, que incluye tanto el backend (servicio .NET) como el frontend (React + Vite).

El flujo de despliegue está gestionado mediante:

- GitHub Actions: Detecta cambios en el repositorio y lanza el proceso.

- AWS CodeDeploy: Ejecuta scripts personalizados en la instancia EC2 para instalar, configurar y activar cada componente.

- appspec.yml: Archivo central que define los hooks (`install.sh`, `start.sh`, `stop.sh`) para ambos entornos.


```bash
/.github/
└── workflows/
    └── deploy.yml           # GitHub Action principal de despliegue

/appspec.yml                 # Archivo usado por CodeDeploy para ambos entornos
/deploy/
├── backend/                 # Scripts específicos para el backend
│   ├── install.sh
│   ├── start.sh
│   └── stop.sh
├── frontend/                # Scripts específicos para el frontend
│   ├── install.sh
│   ├── start.sh
│   └── stop.sh
```

---

<br>

# 🚀 Backend

Esta sección  detalla el proceso de despliegue del backend de **The Enigma Casino** en una instancia EC2 de AWS, usando **GitHub Actions + AWS CodeDeploy**, con ejecución gestionada mediante `systemd`.

## 📂 Estructura general

```bash
/deploy/backend/
├── install.sh         # Compila y sincroniza el backend
├── start.sh           # Arranca el servicio enigma-backend.service
└── stop.sh            # Detiene el backend si está corriendo
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

   - Detiene el servicio si está corriendo
   - Verifica que el puerto 5000 esté libre

2. **`install.sh`**:

   - Verifica que la instancia sea de tipo "backend"
   - Compila el proyecto con `dotnet publish`
   - Sincroniza la publicación al directorio `/home/ubuntu/backend-code-deploy`
   - Ejecuta `systemctl daemon-reload` y `systemctl enable` para asegurar el servicio

3. **`start.sh`**:

   - Carga las variables desde `.env.production`
   - Hace `systemctl stop` y `start` del servicio
   - Verifica que se haya iniciado correctamente

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

- Asegúrate de que `.env.production` está presente en `/home/ubuntu/backend-code-deploy/`
- Este flujo asume que el servicio ya ha sido creado manualmente
- Los scripts están preparados para ser ejecutados varias veces sin causar conflictos

---

<br>

# 🌐 Frontend

Esta sección describe el proceso de despliegue del frontend de **The Enigma Casino**, desarrollado en **React + Vite**, y desplegado como contenido estático en una instancia EC2 de AWS. El proceso está automatizado con **GitHub Actions + AWS CodeDeploy**.

---

## 📁 Estructura del despliegue

```bash
/deploy/frontend/
├── install.sh # Instala dependencias, genera el build y copia a /var/www
├── start.sh # No realiza acción (contenido estático)
└── stop.sh # No realiza acción (contenido estático)
```

El contenido se despliega finalmente en: /var/www/theenigmacasino/

---

## 🚀 Flujo de despliegue (CodeDeploy)

1. **`stop.sh`**

   - No realiza ninguna acción. El frontend es contenido estático.

2. **`install.sh`**

   - Verifica que la instancia corresponde al entorno frontend.
   - Copia el `.env.production` al proyecto.
   - Instala dependencias con `npm install`.
   - Genera el build con `npm run build`.
   - Copia el contenido de `dist/` a `/var/www/theenigmacasino`.
   - Asigna los permisos correctos al usuario `www-data`.

3. **`start.sh`**
   - No realiza ninguna acción. No es necesario iniciar procesos para contenido estático.

---

## 🔍 Logs útiles

```bash
/tmp/frontend-install.log
```
