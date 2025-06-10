#!/bin/bash
echo "$(date) - SYSTEMD está intentando ejecutar este script" >> /tmp/sustemd-test.log
set -e

# Script de arranque automático del backend .NET
LOG_FILE="/tmp/startup-backend.log"
DEBUG_LOG="/tmp/debug-cron.log"
APP_DIR="/home/ubuntu/deploy-temp-backend/publish"
APP_DLL="the-enigma-casino-server.dll"
DOTNET_PATH="/usr/bin/dotnet"
ENV_TEMP="/tmp/backend-env"

echo "$(date) - 🧠 Script ejecutado desde cron o systemd" >> "$DEBUG_LOG"
echo "🚀 Iniciando backend .NET - $(date)" | tee -a "$LOG_FILE"

# Asegurar directorio válido
cd "$APP_DIR" || {
  echo "❌ No se pudo acceder a $APP_DIR" | tee -a "$LOG_FILE"
  exit 1
}

# Preparar variables de entorno
echo "📦 Exportando variables desde .env.production..." | tee -a "$LOG_FILE"
rm -f "$ENV_TEMP"
touch "$ENV_TEMP"

while IFS= read -r line || [[ -n "$line" ]]; do
  # Ignora comentarios
  if [[ "$line" =~ ^#.*$ ]]; then
    continue
  fi

  # Ignora líneas vacías o con solo espacios/tabulaciones
  if [[ -z "${line//[[:space:]]/}" ]]; then
    continue
  fi

  # Validación: debe contener un "="
  if [[ "$line" != *=* ]]; then
    echo "❌ Línea malformada en .env.production: '$line'" | tee -a "$LOG_FILE"
    exit 1
  fi

  key="${line%%=*}"
  value="${line#*=}"

  # Validación: clave no puede estar vacía
  if [[ -z "$key" ]]; then
    echo "❌ Línea con clave vacía en .env.production: '$line'" | tee -a "$LOG_FILE"
    exit 1
  fi

  # Elimina comillas dobles externas si las hay
  value=$(echo "$value" | sed -E 's/^"(.*)"$/\1/')

  if [[ -z "$key" ]]; then
    echo "❌ ERROR: Clave vacía detectada justo antes del export: '$line'" | tee -a "$LOG_FILE"
    exit 1
  fi

  echo "🔍 DEBUG → Línea válida: key='$key' | value='$value'" | tee -a "$LOG_FILE"
  echo "export $key=\"$value\"" >> "$ENV_TEMP"
  echo "   ✅ export $key=..." | tee -a "$LOG_FILE"

done < "$APP_DIR/.env.production"

# Cargar variables y lanzar el backend
echo "🧪 Cargando entorno..." | tee -a "$LOG_FILE"
set -a
source "$ENV_TEMP"
set +a

echo "🟢 Lanzando $APP_DLL con nohup..." | tee -a "$LOG_FILE"
exec "$DOTNET_PATH" "$APP_DLL" --urls "http://0.0.0.0:5000"
PID=$!
sleep 2

if ps -p $PID > /dev/null; then
  echo "✅ Backend lanzado correctamente (PID $PID)" | tee -a "$LOG_FILE"
else
  echo "❌ Error al lanzar el backend" | tee -a "$LOG_FILE"
  exit 1
fi