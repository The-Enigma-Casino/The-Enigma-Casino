# 📄 Scripts disponibles

Este repositorio contiene varios scripts útiles para configurar y gestionar un entorno de desarrollo y producción para The Enigma Casino. Cada script está diseñado para automatizar tareas específicas relacionadas con el  proyecto. A continuación se detallan los scripts disponibles:

---

### setup-enigma.sh
🛠️ Script utilizado durante la inicialización de nuevas instancias EC2. Instala herramientas esenciales como `curl`, `git`, `unzip`, `tree` y realiza una actualización completa del sistema.

---

### start-backend.sh 
 🚀 _Compila y ejecuta manualmente el backend._

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

---

### auto-start-backend.sh

🔄 _Script de arranque automático para el backend .NET de The Enigma Casino._

Este script se ejecuta como servicio del sistema mediante `systemd` y permite iniciar el backend en segundo plano al arrancar la instancia EC2.

Está vinculado al servicio: `Enigma Backend .NET Service`

- Valida y carga las variables de entorno desde .env.production.
- Mata cualquier proceso anterior que esté ocupando el puerto 5000.
- Lanza el backend con dotnet usando el archivo the-enigma-casino-server.dll.
- Registra actividad en /tmp/startup-backend.log y debug en /tmp/debug-cron.log.

---

### move_sftp_back_uploads.sh
 📦 _Mueve archivos subidos mediante SFTP (usuario sftp-back) a la carpeta del backend._

- Mueve todos los archivos desde `/sftp/back` a `/home/ubuntu/The-Enigma-Casino/backend/`.
- Cambia el propietario de los archivos a `ubuntu` para evitar problemas de permisos.
- Útil para incorporar configuraciones u otros archivos.

Para hacerlo ejecutable:

```bash
chmod +x move_sftp_back_uploads.sh
```

Ejecutarlo:

```bash
sudo ./move_sftp_back_uploads.sh
```

---

### move_sftp_front_uploads.sh
 📦 _Mueve archivos subidos mediante SFTP (usuario sftp-front) a la carpeta del frontend._

- Mueve todos los archivos desde `/sftp/front` a `/home/ubuntu/The-Enigma-Casino/frontend/`.
- Cambia el propietario de los archivos a `ubuntu` para evitar problemas de permisos.
- Útil para incorporar configuraciones u otros archivos.

Para hacerlo ejecutable:

```bash
chmod +x move_sftp_front_uploads.sh
```

Ejecutarlo:

```bash
sudo ./move_sftp_front_uploads.sh
```

---

### deploy-waf.sh

🐋 _Script de despliegue automático para el contenedor WAF (enigma-waf) de The Enigma Casino._

Este script detecta automáticamente el backend activo y ajusta la configuración de Nginx para enrutar el tráfico correctamente. Luego reinicia el contenedor Docker del WAF aplicando los cambios.

- Detecta cuál de los dos backends configurados está en línea.
- Genera los archivos de configuración de Nginx (default.conf, proxy_backend.conf) desde plantillas.
- Sustituye puertos internos (8080/8443 → 80/443) en la configuración de Nginx.
- Actualiza la IP del backend activo en la directiva proxy_pass.
- Reinicia el contenedor Docker `enigma-waf` y recarga Nginx para aplicar cambios.

---

### waf-watchdog.sh

👁️ _Script watchdog que monitorea continuamente los backends y reinicia automáticamente el WAF si el backend principal deja de responder._

Este script corre en segundo plano como servicio systemd y supervisa la salud de los backends para garantizar la disponibilidad del WAF.

- Comprueba cada 15 segundos cuál backend está activo.
- Detecta cambios en el backend activo.
- Reinicia el servicio `waf-deploy.service` al detectar un cambio para actualizar la configuración y mantener el enrutamiento correcto.








