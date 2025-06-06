#!/bin/bash

LOG_FILE="/tmp/backend-start.log"
APP_DIR="/home/ubuntu/backend-code-deploy/publish"
APP_DLL="the-enigma-casino-server.dll"

echo "" >> "$LOG_FILE"
echo "🚀 Ejecutando start.sh - $(date)" | tee -a "$LOG_FILE"

cd "$APP_DIR" || {
  echo "❌ ERROR: No se pudo acceder a $APP_DIR" | tee -a "$LOG_FILE"
  exit 1
}

echo "🟢 Lanzando backend con dotnet $APP_DLL..." | tee -a "$LOG_FILE"
nohup dotnet "$APP_DLL" > "$APP_DIR/logs.txt" 2>&1 &

PID=$!
sleep 1

if ps -p $PID > /dev/null; then
  echo "✅ Backend iniciado correctamente (PID $PID)" | tee -a "$LOG_FILE"
else
  echo "❌ Error al iniciar el backend." | tee -a "$LOG_FILE"
  exit 1
fi
