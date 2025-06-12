#!/bin/bash

# Este script se ejecuta desde systemd para iniciar el backend .NET  

echo "$(date) - SYSTEMD está intentando ejecutar este script" >> /tmp/sustemd-test.log
set -e

# Configuración de logs
LOG_FILE="/tmp/startup-backend.log"
DEBUG_LOG="/tmp/debug-cron.log"

# 📁 Directorios clave
APP_DIR="/home/ubuntu/backend-runtime"                            # Donde está el .dll publicado
APP_DLL="the-enigma-casino-server.dll"                            # Nombre del ejecutable
DOTNET_PATH="/usr/bin/dotnet"
ENV_SOURCE="/home/ubuntu/backend-code-deploy/.env.production"     # Ruta del archivo .env
ENV_TEMP="/tmp/backend-env"

echo "$(date) - 🧠 Script ejecutado desde systemd" >> "$DEBUG_LOG"
echo "🚀 Iniciando backend .NET - $(date)" | tee -a "$LOG_FILE"

# ✅ Verificar directorio de ejecución
cd "$APP_DIR" || {
  echo "❌ No se pudo acceder a $APP_DIR" | tee -a "$LOG_FILE"
  exit 1
}

# 🌱 Preparar variables de entorno
echo "📦 Exportando variables desde .env.production..." | tee -a "$LOG_FILE"
if [ ! -f "$ENV_SOURCE" ]; then
  echo "❌ No se encontró archivo .env.production en $ENV_SOURCE" | tee -a "$LOG_FILE"
  exit 1
fi

rm -f "$ENV_TEMP"
touch "$ENV_TEMP"

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^#.*$ || -z "${line//[[:space:]]/}" ]] && continue
  [[ "$line" != *=* ]] && echo "❌ Línea malformada: '$line'" | tee -a "$LOG_FILE" && exit 1

  key="${line%%=*}"
  value="${line#*=}"
  value=$(echo "$value" | sed -E 's/^"(.*)"$/\1/')

  [[ -z "$key" ]] && echo "❌ Clave vacía: '$line'" | tee -a "$LOG_FILE" && exit 1

  echo "🔍 DEBUG → key='$key' | value='$value'" | tee -a "$LOG_FILE"
  echo "export $key=\"$value\"" >> "$ENV_TEMP"
  echo "   ✅ export $key=..." | tee -a "$LOG_FILE"
done < "$ENV_SOURCE"

echo "🧪 Cargando entorno..." | tee -a "$LOG_FILE"
set -a
source "$ENV_TEMP"
set +a

# 🚀 Ejecutar el backend
echo "🟢 Lanzando $APP_DLL " | tee -a "$LOG_FILE"
if sudo lsof -i :5000; then
  echo "⚠️ Puerto 5000 ocupado. Matando proceso..." | tee -a "$LOG_FILE"
  sudo pkill -f "$APP_DLL" || true
  sleep 3
fi

exec "$DOTNET_PATH" "$APP_DLL" --urls "http://0.0.0.0:5000"