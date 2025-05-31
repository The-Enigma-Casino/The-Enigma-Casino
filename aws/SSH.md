## 🔐 Conexiones SSH para el despliegue en AWS

Durante el desarrollo del proyecto, se utilizaron diferentes instancias EC2 en AWS, organizadas por roles funcionales:

| Alias SSH  | Rol                    | Descripción                                                 |
|------------|------------------------|-------------------------------------------------------------|
| `balancer` | Balanceador de carga   | Encargado de distribuir el tráfico entre los frontends      |
| `front`    | Frontend principal     | Instancia que sirve la aplicación React                     |
| `front2`   | Frontend réplica       | Segunda instancia idéntica al frontend para balanceo        |
| `back`     | Backend (API)          | Instancia que ejecuta el servidor backend desarrollado en C#|

### 🧭 Configuración local sugerida

Para facilitar la conexión vía SSH durante el desarrollo, se puede definir un archivo `~/.ssh/config` con la siguiente estructura:

```sshconfig
Host balancer
  HostName <ip-del-balanceador>
  User ubuntu
  IdentityFile <ruta-a-tu-clave.pem>

Host front
  HostName <ip-del-frontend-1>
  User ubuntu
  IdentityFile <ruta-a-tu-clave.pem>

Host front2
  HostName <ip-del-frontend-2>
  User ubuntu
  IdentityFile <ruta-a-tu-clave.pem>

Host back
  HostName <ip-del-backend>
  User ubuntu
  IdentityFile <ruta-a-tu-clave.pem>
