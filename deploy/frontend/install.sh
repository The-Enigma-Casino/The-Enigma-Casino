#!/bin/bash

LOG_FILE="/tmp/frontend-install.log"
DEPLOY_DIR="/var/www/theenigmacasino"
EXTRACT_DIR=/home/ubuntu/frontend-code-deploy/frontend/the-enigma-casino-client
BUILD_DIR="$EXTRACT_DIR/dist"

echo "" >> "$LOG_FILE"
echo "🕐 Ejecutando install.sh - $(date)" | tee -a "$LOG_FILE"
echo "📂 Directorio actual antes de cd: $(pwd)" | tee -a "$LOG_FILE"

if [ "$(cat /etc/instance-type 2>/dev/null)" != "frontend" ]; then
  echo "⛔ Esta instancia no es de frontend. Abortando install.sh." | tee -a "$LOG_FILE"
  exit 0
fi

cd "$EXTRACT_DIR" || {
  echo "❌ ERROR: No se pudo acceder a $EXTRACT_DIR" | tee -a "$LOG_FILE"
  exit 1
}

echo "📁 Contenido de $EXTRACT_DIR:" | tee -a "$LOG_FILE"
ls -la "$EXTRACT_DIR" | tee -a "$LOG_FILE"

echo "📄 Contenido de package.json (primeras líneas):" | tee -a "$LOG_FILE"
head -n 20 "$EXTRACT_DIR/package.json" | tee -a "$LOG_FILE"

echo "✅ Entorno frontend confirmado. Ejecutando en $(pwd)" | tee -a "$LOG_FILE"

echo "📄 Copiando .env.production a la raíz del proyecto..." | tee -a "$LOG_FILE"
cp /home/ubuntu/.env.production "$EXTRACT_DIR"/

echo "📦 Instalando dependencias npm..." | tee -a "$LOG_FILE"
npm install >> "$LOG_FILE" 2>&1

echo "🧹 Limpiando build anterior..." | tee -a "$LOG_FILE"
rm -rf "$BUILD_DIR"

echo "🛠️ Ejecutando build..." | tee -a "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ ERROR: El build falló con código $BUILD_EXIT" | tee -a "$LOG_FILE"
  exit 1
fi

echo "🧹 Limpiando directorio final en $DEPLOY_DIR..." | tee -a "$LOG_FILE"
sudo rm -rf "$DEPLOY_DIR"/*

echo "🚚 Copiando build a $DEPLOY_DIR..." | tee -a "$LOG_FILE"
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR"/ 2>&1 | tee -a "$LOG_FILE"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

echo "✅ Frontend desplegado correctamente en $DEPLOY_DIR." | tee -a "$LOG_FILE"