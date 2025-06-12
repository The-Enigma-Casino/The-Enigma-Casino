#!/bin/bash

LOG_FILE="/tmp/backend-install.log"
DEPLOY_DIR="/home/ubuntu/backend-code-deploy"
PUBLISH_TEMP_DIR="/home/ubuntu/deploy-temp-backend"

echo "" >> "$LOG_FILE"
echo "🕐 Ejecutando install.sh - $(date)" | tee -a "$LOG_FILE"
echo "📂 Directorio actual: $(pwd)" | tee -a "$LOG_FILE"
echo "📁 Archivos en la ruta actual:" | tee -a "$LOG_FILE"
ls -la | tee -a "$LOG_FILE"

if [ "$(cat /etc/instance-type 2>/dev/null)" != "backend" ]; then
  echo "⛔ Esta instancia no es de backend. Abortando install.sh." | tee -a "$LOG_FILE"
  exit 0
fi

echo "✅ Detectado entorno backend. Continuando..." | tee -a "$LOG_FILE"

mkdir -p "$DEPLOY_DIR"
mkdir -p "$PUBLISH_TEMP_DIR"

echo "🧹 Limpiando publicación temporal anterior..." | tee -a "$LOG_FILE"
rm -rf "$PUBLISH_TEMP_DIR"/*

echo "📦 Compilando backend con dotnet publish..." | tee -a "$LOG_FILE"
dotnet publish backend/the-enigma-casino-server -c Release -o "$PUBLISH_TEMP_DIR" 2>&1 | tee -a "$LOG_FILE"

PUBLISH_EXIT_CODE=$?
if [ $PUBLISH_EXIT_CODE -ne 0 ]; then
  echo "❌ Error durante dotnet publish (código $PUBLISH_EXIT_CODE)" | tee -a "$LOG_FILE"
  exit 1
fi

echo "📁 Contenido generado:" | tee -a "$LOG_FILE"
ls -la "$PUBLISH_TEMP_DIR" | tee -a "$LOG_FILE"

echo "🔄 Sincronizando archivos (sin borrar archivos sensibles)..." | tee -a "$LOG_FILE"
rsync -av --exclude='.env.production' \
          --exclude='credentials.json' \
          --exclude='tokens' \
          "$PUBLISH_TEMP_DIR/" "$DEPLOY_DIR/" 2>&1 | tee -a "$LOG_FILE"

echo "✅ Backend actualizado correctamente en $DEPLOY_DIR." | tee -a "$LOG_FILE"

echo "🔁 Recargando systemd para asegurar visibilidad del servicio..." | tee -a "$LOG_FILE"
sudo systemctl daemon-reload

echo "🔐 Habilitando servicio si no lo está..." | tee -a "$LOG_FILE"
sudo systemctl enable enigma-backend.service || {
  echo "⚠️ El servicio no pudo habilitarse. Verifica si existe correctamente en /etc/systemd/system." | tee -a "$LOG_FILE"
}
