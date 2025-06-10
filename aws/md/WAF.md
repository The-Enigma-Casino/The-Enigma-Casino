# 🔐 Web Application Firewall (WAF)

Este sistema protege el frontend del casino mediante un **Web Application Firewall (WAF)** basado en:

* Docker
* Nginx
* ModSecurity + OWASP CRS
* Scripts personalizados en bash
* Supervisión automática y failover entre backends


## 📂 Estructura de archivos

```
/home/ubuntu/enigma-waf/
├── deploy-waf.sh                      # Script principal de despliegue
├── waf-watchdog.sh                    # Script que supervisa el backend
├── nginx/
│   ├── conf.d/default.conf.template   # Plantilla de configuración base
│   ├── includes/proxy_backend.conf    # Configuración dinámica de proxy_pass
│   └── templates/...                  # Plantillas originales de configuración
└── docker-compose.yml                 # Define el contenedor enigma-waf
```

## ⚙️ Servicios systemd

Ejecutan `deploy-waf.sh` al iniciar la instancia y verifican qué backend está disponible y relanza el `waf-deploy` si hay cambios.

Ver estado:

```bash
systemctl status waf-deploy.service
systemctl status waf-watchdog.service
```

### waf-deploy.service

Ejecuta `deploy-waf.sh` al iniciar la instancia.

```bash
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

### waf-watchdog.service

Verifica qué backend está disponible y relanza el `waf-deploy` si hay cambios

```bash
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

## 🧠 Cómo funciona

### 🚀 Al iniciar la instancia:

1. `waf-deploy.service` detecta el backend disponible (`172.31.X.X`)
2. Genera y modifica los archivos Nginx (`default.conf`, `proxy_backend.conf`)
3. Lanza el contenedor `enigma-waf`
4. Recarga Nginx internamente
5. WAF escucha en HTTPS (`:443`) y enruta al backend

### 🔁 Si un backend falla:

* `waf-watchdog.service` detecta el fallo (via `curl`)
* Llama a `systemctl restart waf-deploy.service`
* Nginx se actualiza con la nueva IP backend

## 🧪 Prueba de ataques (desde consola del navegador)

```js
// XSS Simulado
fetch("https://theenigmacasino.duckdns.org/?q=<script>alert(1)</script>")
  .then(res => res.text())
  .then(html => console.log("Respuesta:", html))
  .catch(err => console.error("Bloqueado:", err));
```

Esperado: `403 Forbidden` — WAF bloquea el ataque.

![403](/aws/img/image.png)


## 🚨 Recuperación manual

1. Forzar redeploy:

```bash
sudo systemctl restart waf-deploy.service
```

2. Ver logs de ModSecurity:

```bash
docker exec enigma-waf tail -n 50 /var/log/modsec_audit.log
```

3. Ver error log de Nginx:

```bash
docker exec enigma-waf tail -n 50 /var/log/nginx/error.log
```

