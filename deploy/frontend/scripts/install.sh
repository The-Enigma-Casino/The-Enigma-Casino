#!/bin/bash

LOG_FILE="/tmp/enigma-frontend-install.log"
DEPLOY_DIR="/var/www/theenigmacasino"
EXTRACT_DIR="/home/ubuntu/frontend-code-deploy"
SOURCE_DIR="$EXTRACT_DIR/dist"

echo "" >> $LOG_FILE
echo "🕐 Ejecutando install.sh - $(date)" | tee -a $LOG_FILE
echo "📂 Directorio actual: $(pwd)" | tee -a $LOG_FILE
echo "📁 Contenido del directorio de extracción ($EXTRACT_DIR):" | tee -a $LOG_FILE
ls -la "$EXTRACT_DIR" | tee -a $LOG_FILE

if [ -d "$SOURCE_DIR" ]; then
  echo "✅ Carpeta '$SOURCE_DIR' encontrada." | tee -a $LOG_FILE
else
  echo "❌ ERROR: Carpeta '$SOURCE_DIR' no encontrada." | tee -a $LOG_FILE
  exit 1
fi

echo "📦 Instalando frontend en $DEPLOY_DIR..." | tee -a $LOG_FILE
sudo mkdir -p "$DEPLOY_DIR"

echo "📥 Copiando archivos..." | tee -a $LOG_FILE
sudo cp -r "$SOURCE_DIR"/* "$DEPLOY_DIR"/ 2>&1 | tee -a $LOG_FILE

echo "🔐 Cambiando permisos..." | tee -a $LOG_FILE
sudo chown -R www-data:www-data "$DEPLOY_DIR"

echo "✅ Frontend copiado correctamente a $DEPLOY_DIR." | tee -a $LOG_FILE
