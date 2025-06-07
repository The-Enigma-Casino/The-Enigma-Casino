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

### start-backend-and-waf.sh

🔧 *Lanza el WAF (ModSecurity) y el backend en orden correcto.*

* Levanta el contenedor Docker del WAF con `docker compose`.
* Espera a que el WAF esté activo (escuchando en el puerto 8080).
* Lanza el backend usando `dotnet` con `nohup`, dejando logs en `logs.txt`.
* Se recomienda configurar este script con `@reboot` en `crontab` para que se inicie automáticamente al arrancar la máquina:

```bash
crontab -e
```

Y añadir:

```bash
@reboot /home/ubuntu/start-backend-and-waf.sh
```

Para hacerlo ejecutable:

```bash
chmod +x start-backend-and-waf.sh
```

Ejecutarlo manualmente:

```bash
./start-backend-and-waf.sh
```

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