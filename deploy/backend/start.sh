#!/bin/bash

LOG_FILE="/tmp/backend-start.log"
APP_ENV="/home/ubuntu/backend-code-deploy/.env.production"

echo "" >> "$LOG_FILE"
echo "🚀 Ejecutando start.sh - $(date)" | tee -a "$LOG_FILE"

# Cargar variables de entorno (por si el servicio las necesita)
if [ -f "$APP_ENV" ]; then
  echo "📦 Cargando variables de entorno ($APP_ENV)..." | tee -a "$LOG_FILE"
  set -o allexport
  source "$APP_ENV"
  set +o allexport
else
  echo "⚠️ No se encontró archivo .env.production en $APP_ENV" | tee -a "$LOG_FILE"
fi

# Asegurar que no hay procesos sueltos
echo "🧼 Deteniendo backend si estaba activo..." | tee -a "$LOG_FILE"
sudo systemctl stop enigma-backend.service

# Recargar definición del servicio (por si se actualizó el .service)
echo "🔁 Recargando systemd..." | tee -a "$LOG_FILE"
sudo systemctl daemon-reload

# Lanzar backend como servicio
echo "🚀 Iniciando backend con systemctl..." | tee -a "$LOG_FILE"
sudo systemctl start enigma-backend.service

# Verificación
sleep 2
if sudo systemctl is-active --quiet enigma-backend.service; then
  echo "🟢 Backend iniciado correctamente como servicio systemd." | tee -a "$LOG_FILE"
else
  echo "❌ Error al iniciar el backend como servicio." | tee -a "$LOG_FILE"
  exit 1
fi
