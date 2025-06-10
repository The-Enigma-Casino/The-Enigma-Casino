FROM owasp/modsecurity-crs:nginx

USER root

# 🔥 Elimina la plantilla que da error de permisos
RUN rm -f /etc/nginx/templates/modsecurity.d/modsecurity-override.conf.template

# 🔧 Ajusta los puertos al estándar 80 y 443 para Nginx
RUN sed -i 's/listen 8080 default_server;/listen 80 default_server;/' /etc/nginx/templates/conf.d/default.conf.template && \
    sed -i 's/listen 8443 ssl;/listen 443 ssl;/' /etc/nginx/templates/conf.d/default.conf.template

# ⚡ Lo importante: modificar directamente el archivo real
RUN sed -i 's/listen 8080 default_server;/listen 80 default_server;/' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen 8443 ssl;/listen 443 ssl;/' /etc/nginx/conf.d/default.conf

USER nginx