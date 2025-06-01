# 📁 Transferencia de archivos por SFTP – The Enigma Casino

Durante el despliegue y mantenimiento de _The Enigma Casino_, se ha habilitado acceso seguro mediante **SFTP (SSH File Transfer Protocol)** para subir archivos a las instancias.


## 🛡 Usuarios SFTP habilitados

| Usuario       | Rol         | Carpeta asignada   |
|---------------|-------------|--------------------|
| `sftp-back`   | Backend     | `/sftp/back`       | 
| `sftp-front`  | Frontends 1 y 2 | `/sftp/front` | 


## 📋 Configuración básica (Windows)

Puedes acceder por SFTP fácilmente desde Windows usando WinSCP o FileZilla.

| Campo         | Valor                                       |
|---------------|---------------------------------------------|
| Protocolo     | SFTP (SSH File Transfer Protocol)           |
| Host / IP     | Dirección pública de la instancia EC2       |
| Usuario       | `sftp-back` o `sftp-front`                  |
| Contraseña    | La definida al crear el usuario             |
| Puerto        | `22`                                        |


## ⚠️ Notas

- Cada usuario está enjaulado en su carpeta correspondiente.
- No tienen acceso SSH, solo transferencia segura de archivos.
- Se usan los scripts para mover los archivos cargados al proyecto.
