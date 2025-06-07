#!/bin/bash

LOG_FILE="/tmp/frontend-install.log"
DEPLOY_DIR="/var/www/theenigmacasino"
EXTRACT_DIR="/home/ubuntu/frontend-code-deploy/frontend/the-enigma-casino-client"
BUILD_DIR="$EXTRACT_DIR/dist"

echo "" >> "$LOG_FILE"
echo "🕐 Ejecutando install.sh - $(date)" | tee -a "$LOG_FILE"
echo "📂 Directorio actual: $(pwd)" | tee -a "$LOG_FILE"

if [ "$(cat /etc/instance-type 2>/dev/null)" != "frontend" ]; then
  echo "⛔ Esta instancia no es de backend. Abortando install.sh." | tee -a "$LOG_FILE"
  exit 0
fi

echo "✅ Detectado entorno frontend. Continuando..." | tee -a "$LOG_FILE"

cd "$EXTRACT_DIR" || {
  echo "❌ ERROR: No se pudo acceder a $EXTRACT_DIR" | tee -a "$LOG_FILE"
  exit 1
}

echo "📄 Copiando .env.production a la raíz del proyecto..." | tee -a "$LOG_FILE"
cp /home/ubuntu/.env.production "$EXTRACT_DIR"/

echo "📦 Instalando dependencias npm..." | tee -a "$LOG_FILE"
npm install >> "$LOG_FILE" 2>&1

echo "🛠️ Construyendo frontend con npm run build..." | tee -a "$LOG_FILE"
npm run build >> "$LOG_FILE" 2>&1

if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ ERROR: Carpeta 'dist' no generada correctamente." | tee -a "$LOG_FILE"
  exit 1
fi

echo "✅ Build generado correctamente. Copiando a $DEPLOY_DIR..." | tee -a "$LOG_FILE"
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR"/ 2>&1 | tee -a "$LOG_FILE"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

echo "✅ Frontend desplegado correctamente en $DEPLOY_DIR." | tee -a "$LOG_FILE"