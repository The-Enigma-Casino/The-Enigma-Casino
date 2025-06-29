#!/bin/bash

# === DEFINICIÓN DE BACKENDS ===
BACKEND1="172.31.90.254"
BACKEND2="172.31.30.93"

# === DETECCIÓN ROBUSTA DE BACKEND ACTIVO ===
echo "🔍 Buscando backend activo..."
for i in {1..10}; do
  echo "🔁 Intento $i: probando $BACKEND1..."
  if curl -s --connect-timeout 2 "http://$BACKEND1:5000/api" | grep -q "The Enigma Casino"; then
    ACTIVE_BACKEND=$BACKEND1
    break
  fi

  echo "🔁 Intento $i: probando $BACKEND2..."
  if curl -s --connect-timeout 2 "http://$BACKEND2:5000/api" | grep -q "The Enigma Casino"; then
    ACTIVE_BACKEND=$BACKEND2
    break
  fi

  sleep 3
done

if [ -z "$ACTIVE_BACKEND" ]; then
  echo "❌ Ningún backend respondió tras varios intentos."
  exit 1
fi

echo "📡 Backend activo detectado: $ACTIVE_BACKEND"
export ACTIVE_BACKEND

# === RUTAS DE PLANTILLAS Y ARCHIVOS DESTINO ===
DEFAULT_TEMPLATE="/home/ubuntu/enigma-waf/nginx/templates/conf.d/default.conf.template"
PROXY_TEMPLATE="/home/ubuntu/enigma-waf/nginx/templates/includes/proxy_backend.conf.template"

DEFAULT_CONF="/home/ubuntu/enigma-waf/nginx/templates/conf.d/default.conf"
PROXY_CONF="/home/ubuntu/enigma-waf/nginx/templates/includes/proxy_backend.conf"

# === VALIDACIÓN DE PLANTILLAS ===
for f in "$DEFAULT_TEMPLATE" "$PROXY_TEMPLATE"; do
  if [ ! -f "$f" ]; then
    echo "❌ Falta plantilla: $f"
    exit 1
  fi
done

# === GENERACIÓN DE ARCHIVOS DE CONFIGURACIÓN ===
echo "🛠 Generando archivos desde plantillas..."
cp "$DEFAULT_TEMPLATE" "$DEFAULT_CONF"
cp "$PROXY_TEMPLATE" "$PROXY_CONF"

# === REINICIAR CONTENEDOR ===
echo "🧹 Deteniendo contenedor anterior..."
docker compose down

echo "🚀 Lanzando contenedor..."
docker compose up -d

# === POST-UP: APLICAR CAMBIOS INTERNOS ===
echo "⏳ Esperando a que el contenedor esté activo..."
sleep 5

# --- Corregir puertos 8080/8443 por 80/443 en default.conf ---
echo "🔧 Corrigiendo puertos en default.conf..."
docker exec enigma-waf sed -i -e 's/listen 8080 default_server;/listen 80 default_server;/g' \
                              -e 's/listen 8443 ssl;/listen 443 ssl;/g' \
                              /etc/nginx/conf.d/default.conf

# --- Corregir proxy_pass en proxy_backend.conf ---
echo "🔧 Corrigiendo IP en proxy_backend.conf..."
docker exec enigma-waf sed -i "s|proxy_pass http://localhost:80;|proxy_pass http://$ACTIVE_BACKEND:5000;|" \
  /etc/nginx/includes/proxy_backend.conf
docker exec enigma-waf sed -i "s|proxy_pass http://.*:5000;|proxy_pass http://$ACTIVE_BACKEND:5000;|" \
  /etc/nginx/includes/proxy_backend.conf

# --- Corregir CORS en cors.conf ---
echo "🔧 Corrigiendo CORS en cors.conf..."
docker exec enigma-waf sed -i \
  "s|Access-Control-Allow-Origin: \*|Access-Control-Allow-Origin: https://the-enigma-casino.duckdns.org|g" \
  /etc/nginx/includes/cors.conf

docker exec enigma-waf sed -i \
  "s|Access-Control-Allow-Headers: \*|Access-Control-Allow-Headers: Authorization, Content-Type|g" \
  /etc/nginx/includes/cors.conf

# --- Recargar Nginx para aplicar todo ---
echo "🔁 Recargando Nginx..."
docker exec enigma-waf nginx -s reload || docker exec enigma-waf nginx

echo "✅ ¡Despliegue completado con éxito usando backend $ACTIVE_BACKEND!"