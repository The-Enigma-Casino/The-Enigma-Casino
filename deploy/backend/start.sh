#!/bin/bash

LOG_FILE="/tmp/backend-start.log"
APP_ENV="/home/ubuntu/backend-code-deploy/.env.production"
SERVICE_NAME="enigma-backend.service"

echo "" >> "$LOG_FILE"
echo "🚀 Ejecutando start.sh - $(date)" | tee -a "$LOG_FILE"

# Comprobación de tipo de instancia
if [ "$(cat /etc/instance-type 2>/dev/null)" != "backend" ]; then
  echo "⛔ Esta instancia no es de backend. Abortando start.sh." | tee -a "$LOG_FILE"
  exit 0
fi

# Cargar variables de entorno
if [ -f "$APP_ENV" ]; then
  echo "📦 Cargando variables de entorno ($APP_ENV)..." | tee -a "$LOG_FILE"
  set -o allexport
  source "$APP_ENV"
  set +o allexport
else
  echo "⚠️ No se encontró archivo .env.production en $APP_ENV" | tee -a "$LOG_FILE"
fi

# Detener si estaba activo
echo "🧼 Deteniendo backend si estaba activo..." | tee -a "$LOG_FILE"
sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true

# Recargar systemd por si ha habido cambios
echo "🔁 Recargando systemd..." | tee -a "$LOG_FILE"
sudo systemctl daemon-reload

# Lanzar servicio
echo "🚀 Iniciando backend con systemctl..." | tee -a "$LOG_FILE"
sudo systemctl start "$SERVICE_NAME"

# Verificar estado
sleep 2
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
  echo "🟢 Backend iniciado correctamente como servicio systemd." | tee -a "$LOG_FILE"
else
  echo "❌ Error al iniciar el backend como servicio." | tee -a "$LOG_FILE"
  exit 1
fi