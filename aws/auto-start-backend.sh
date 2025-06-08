#!/bin/bash

# Script de arranque solo del backend .NET
# cp /home/ubuntu/The-Enigma-Casino/aws/auto-start-backend.sh /home/ubuntu/auto-start-backend.sh
# chmod +x auto-start-backend.sh
# crontab -e
# @reboot /home/ubuntu/auto-start-backend.sh

LOG_FILE="/tmp/startup-backend.log"
APP_DIR="/home/ubuntu/backend-code-deploy"
APP_DLL="the-enigma-casino-server.dll"

echo "🚀 Iniciando backend .NET - $(date)" | tee -a "$LOG_FILE"

# Ir al directorio del backend
cd "$APP_DIR" || {
  echo "❌ No se pudo acceder a $APP_DIR" | tee -a "$LOG_FILE"
  exit 1
}

# Cargar variables de entorno
echo "📦 Cargando .env.production..." | tee -a "$LOG_FILE"
set -o allexport
source "$APP_DIR/.env.production"
set +o allexport

# Lanzar el backend en segundo plano
echo "🟢 Lanzando $APP_DLL..." | tee -a "$LOG_FILE"
nohup dotnet "$APP_DLL" >> "$APP_DIR/logs.txt" 2>&1 &
PID=$!
sleep 1

if ps -p $PID > /dev/null; then
  echo "✅ Backend lanzado correctamente (PID $PID)" | tee -a "$LOG_FILE"
else
  echo "❌ Error al lanzar el backend" | tee -a "$LOG_FILE"
  exit 1
fi
