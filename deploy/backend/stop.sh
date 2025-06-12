#!/bin/bash

LOG_FILE="/tmp/backend-stop.log"
APP_NAME="the-enigma-casino-server.dll"
PORT=5000
SERVICE_NAME="enigma-backend.service"

echo "" >> "$LOG_FILE"
echo "🛑 Ejecutando stop.sh - $(date)" | tee -a "$LOG_FILE"

# 1. Parar el servicio systemd
echo "🧨 Parando servicio $SERVICE_NAME..." | tee -a "$LOG_FILE"
if systemctl is-active --quiet "$SERVICE_NAME"; then
  sudo systemctl stop "$SERVICE_NAME"
  echo "✅ Servicio detenido." | tee -a "$LOG_FILE"
else
  echo "ℹ️ Servicio ya estaba inactivo." | tee -a "$LOG_FILE"
fi

# 2. Intentar matar procesos por nombre si el servicio falló
echo "🧹 Matando procesos residuales de $APP_NAME si quedan..." | tee -a "$LOG_FILE"
sudo pkill -f "$APP_NAME" || echo "ℹ️ No se encontró proceso $APP_NAME" | tee -a "$LOG_FILE"
sleep 2

# 3. Comprobar si el puerto sigue ocupado
echo "🔍 Verificando si hay procesos .NET en puerto $PORT..." | tee -a "$LOG_FILE"
PID=$(sudo lsof -t -i:$PORT)

if [ -n "$PID" ]; then
  echo "⚠️ Proceso aún activo en el puerto $PORT (PID $PID). Matando..." | tee -a "$LOG_FILE"
  sudo kill -9 "$PID"
  sleep 1
else
  echo "✅ Puerto $PORT libre." | tee -a "$LOG_FILE"
fi