#!/bin/bash
set -e

# Script de arranque automático del backend .NET
LOG_FILE="/home/ubuntu/backend-run.log"
APP_DIR="/home/ubuntu/deploy-temp-backend/publish"
APP_DLL="the-enigma-casino-server.dll"
DOTNET_PATH="/usr/bin/dotnet"
ENV_TEMP="/home/ubuntu/backend-env.sh"

echo "🚀 Iniciando backend .NET - $(date)" >> "$LOG_FILE"

# Asegurar directorio válido
cd "$APP_DIR" || {
  echo "❌ No se pudo acceder a $APP_DIR" >> "$LOG_FILE"
  exit 1
}

# Preparar variables de entorno
echo "📦 Exportando variables desde .env.production..." >> "$LOG_FILE"
rm -f "$ENV_TEMP"
touch "$ENV_TEMP"

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  value=$(echo "$value" | sed -E 's/^"(.*)"$/\1/')
  echo "export $key=\"$value\"" >> "$ENV_TEMP"
  echo "   ✅ export $key=..." >> "$LOG_FILE"
done < "$APP_DIR/.env.production"

# Cargar entorno y lanzar
echo "📦 Cargando entorno..." >> "$LOG_FILE"
set -a
source "$ENV_TEMP"
set +a

echo "🟢 Lanzando $APP_DLL con nohup..." >> "$LOG_FILE"
nohup "$DOTNET_PATH" "$APP_DLL" >> "$LOG_FILE" 2>&1 &
PID=$!
sleep 2

if ps -p $PID > /dev/null; then
  echo "✅ Backend lanzado correctamente (PID $PID)" >> "$LOG_FILE"
else
  echo "❌ Error al lanzar el backend" >> "$LOG_FILE"
  exit 1
fi
