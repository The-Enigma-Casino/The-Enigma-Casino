#!/bin/bash

LOG_FILE="/tmp/backend-install.log"
SOURCE_DIR="/home/ubuntu/backend-code-deploy/the-enigma-casino-server"
PUBLISH_TEMP_DIR="/home/ubuntu/deploy-temp-backend"
DEPLOY_DIR="/home/ubuntu/backend-runtime"

echo "" >> "$LOG_FILE"
echo "🕐 Ejecutando install.sh - $(date)" | tee -a "$LOG_FILE"
echo "📂 Directorio actual: $(pwd)" | tee -a "$LOG_FILE"
echo "📁 Archivos en la ruta actual:" | tee -a "$LOG_FILE"
ls -la | tee -a "$LOG_FILE"

if [ "$(cat /etc/instance-type 2>/dev/null)" != "backend" ]; then
  echo "⛔ Esta instancia no es de backend. Abortando install.sh." | tee -a "$LOG_FILE"
  exit 0
fi

echo "✅ Entorno backend confirmado." | tee -a "$LOG_FILE"

mkdir -p "$PUBLISH_TEMP_DIR"
mkdir -p "$DEPLOY_DIR"

echo "🧹 Limpiando publicación temporal anterior en $PUBLISH_TEMP_DIR..." | tee -a "$LOG_FILE"
rm -rf "$PUBLISH_TEMP_DIR"/*

echo "📦 Compilando backend desde $SOURCE_DIR..." | tee -a "$LOG_FILE"
dotnet publish "$SOURCE_DIR/the-enigma-casino-server.csproj" -c Release -o "$PUBLISH_TEMP_DIR" 2>&1 | tee -a "$LOG_FILE"
PUBLISH_EXIT_CODE=$?
if [ $PUBLISH_EXIT_CODE -ne 0 ]; then
  echo "❌ Error durante dotnet publish (código $PUBLISH_EXIT_CODE)" | tee -a "$LOG_FILE"
  exit 1
fi

echo "📁 Contenido generado en $PUBLISH_TEMP_DIR:" | tee -a "$LOG_FILE"
ls -la "$PUBLISH_TEMP_DIR" | tee -a "$LOG_FILE"

echo "🧹 Limpiando directorio final en $DEPLOY_DIR..." | tee -a "$LOG_FILE"
rm -rf "$DEPLOY_DIR"/*

echo "🚚 Copiando binarios a $DEPLOY_DIR..." | tee -a "$LOG_FILE"
rsync -av "$PUBLISH_TEMP_DIR/" "$DEPLOY_DIR/" 2>&1 | tee -a "$LOG_FILE"

echo "✅ Backend desplegado correctamente en $DEPLOY_DIR." | tee -a "$LOG_FILE"