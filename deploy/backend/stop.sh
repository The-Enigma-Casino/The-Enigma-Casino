#!/bin/bash

LOG_FILE="/tmp/backend-stop.log"
APP_NAME="the-enigma-casino-server.dll"

echo "" >> "$LOG_FILE"
echo "🛑 Ejecutando stop.sh - $(date)" | tee -a "$LOG_FILE"

echo "🔍 Buscando procesos dotnet que contengan $APP_NAME..." | tee -a "$LOG_FILE"
sudo pkill -f "$APP_NAME" && echo "✅ Backend detenido." | tee -a "$LOG_FILE" || {
  echo "⚠️ No se encontró ningún proceso para detener." | tee -a "$LOG_FILE"
}