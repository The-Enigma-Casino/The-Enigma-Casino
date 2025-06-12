#!/bin/bash

LOG_FILE="/tmp/startup-backend.log"
APP_DLL="the-enigma-casino-server.dll"
DEPLOY_DIR="/home/ubuntu/backend-runtime"
ENV_FILE="/home/ubuntu/backend-code-deploy/.env.production"
TEMP_ENV="/tmp/backend-env"

echo "" >> "$LOG_FILE"
echo "🚀 Lanzando backend - $(date)" | tee -a "$LOG_FILE"

# Comprobación básica
if [ ! -f "$DEPLOY_DIR/$APP_DLL" ]; then
  echo "❌ ERROR: No se encontró $APP_DLL en $DEPLOY_DIR" | tee -a "$LOG_FILE"
  exit 1
fi

# Exportar variables
echo "📦 Cargando variables de entorno ($ENV_FILE)..." | tee -a "$LOG_FILE"
rm -f "$TEMP_ENV"
touch "$TEMP_ENV"

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^#.*$ || -z "${line//[[:space:]]/}" ]] && continue
  [[ "$line" != *=* ]] && echo "❌ Línea inválida: $line" && exit 1

  key="${line%%=*}"
  value="${line#*=}"
  value=$(echo "$value" | sed -E 's/^"(.*)"$/\1/')

  [[ -z "$key" ]] && echo "❌ Clave vacía detectada: $line" && exit 1

  echo "export $key=\"$value\"" >> "$TEMP_ENV"
done < "$ENV_FILE"

echo "✅ Variables cargadas desde $ENV_FILE" | tee -a "$LOG_FILE"

# Parar backend si ya estuviera corriendo
echo "🧼 Deteniendo backend si estaba activo..." | tee -a "$LOG_FILE"
sudo pkill -f "$APP_DLL" || true
sleep 2

# Recargar systemd (por si ha cambiado algo)
echo "🔁 Recargando systemd..." | tee -a "$LOG_FILE"
sudo systemctl daemon-reexec
sudo systemctl daemon-reload

# Cargar entorno y lanzar
echo "🟢 Ejecutando $APP_DLL" | tee -a "$LOG_FILE"
set -a
source "$TEMP_ENV"
set +a

exec /usr/bin/dotnet "$DEPLOY_DIR/$APP_DLL" --urls "http://0.0.0.0:5000"