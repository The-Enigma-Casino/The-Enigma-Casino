#!/bin/bash

LOG_FILE="/tmp/backend-install.log"
DEPLOY_DIR="/home/ubuntu/backend-code-deploy"
DEPLOY_RUNTIME_DIR="/home/ubuntu/backend-runtime"
PUBLISH_TEMP_DIR="/home/ubuntu/deploy-temp-backend"

echo "" >> "$LOG_FILE"
echo "🕐 Ejecutando install.sh - $(date)" | tee -a "$LOG_FILE"
echo "📂 Directorio actual: $(pwd)" | tee -a "$LOG_FILE"
echo "📁 Archivos en la ruta actual:" | tee -a "$LOG_FILE"
ls -la | tee -a "$LOG_FILE"

# Validación de entorno backend
if [ "$(cat /etc/instance-type 2>/dev/null)" != "backend" ]; then
  echo "⛔ Esta instancia no es de backend. Abortando." | tee -a "$LOG_FILE"
  exit 0
fi

echo "✅ Entorno backend confirmado." | tee -a "$LOG_FILE"

# Crear carpetas necesarias
mkdir -p "$DEPLOY_DIR" "$DEPLOY_RUNTIME_DIR" "$PUBLISH_TEMP_DIR"

# Limpiar publicación temporal
echo "🧹 Limpiando $PUBLISH_TEMP_DIR..." | tee -a "$LOG_FILE"
rm -rf "$PUBLISH_TEMP_DIR"/*

# Compilar el proyecto
echo "📦 Compilando backend..." | tee -a "$LOG_FILE"
dotnet publish backend/the-enigma-casino-server -c Release -o "$PUBLISH_TEMP_DIR" 2>&1 | tee -a "$LOG_FILE"
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "❌ Error al compilar (exit code $EXIT_CODE)" | tee -a "$LOG_FILE"
  exit 1
fi

# Limpiar runtime antes de copiar
echo "🧹 Limpiando runtime..." | tee -a "$LOG_FILE"
rm -rf "$DEPLOY_RUNTIME_DIR"/*

# Copiar build a runtime
echo "🚚 Copiando a $DEPLOY_RUNTIME_DIR..." | tee -a "$LOG_FILE"
rsync -av "$PUBLISH_TEMP_DIR/" "$DEPLOY_RUNTIME_DIR/" | tee -a "$LOG_FILE"

echo "✅ Build actualizado correctamente." | tee -a "$LOG_FILE"