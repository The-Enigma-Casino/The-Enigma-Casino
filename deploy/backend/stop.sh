#!/bin/bash

LOG_FILE="/tmp/backend-stop.log"
APP_NAME="the-enigma-casino-server.dll"

echo "" >> "$LOG_FILE"
echo "🛑 Ejecutando stop.sh - $(date)" | tee -a "$LOG_FILE"

echo "🧨 Parando servicio enigma-backend.service..." | tee -a "$LOG_FILE"
sudo systemctl stop enigma-backend.service

echo "🔍 Verificando si hay procesos .NET en puerto 5000..." | tee -a "$LOG_FILE"
sleep 5

PID=$(sudo lsof -t -i:5000)
if [ -n "$PID" ]; then
  echo "⚠️ Proceso aún activo en el puerto 5000 (PID $PID). Matando..." | tee -a "$LOG_FILE"
  sudo kill -9 $PID
else
  echo "✅ Puerto 5000 libre." | tee -a "$LOG_FILE"
fi
