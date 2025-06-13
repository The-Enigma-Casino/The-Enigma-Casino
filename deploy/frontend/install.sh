#!/bin/bash

LOG_FILE="/tmp/frontend-install.log"
DEPLOY_DIR="/var/www/theenigmacasino"
EXTRACT_DIR="/home/ubuntu/frontend-code-deploy/the-enigma-casino-client"
BUILD_DIR="$EXTRACT_DIR/dist"

echo "" >> "$LOG_FILE"
echo "🕐 Ejecutando install.sh - $(date)" | tee -a "$LOG_FILE"

# Verifica tipo de instancia
if [ "$(cat /etc/instance-type 2>/dev/null)" != "frontend" ]; then
  echo "⛔ Esta instancia no es de frontend. Abortando install.sh." | tee -a "$LOG_FILE"
  exit 0
fi

# Acceso al proyecto
echo "📂 Accediendo a $EXTRACT_DIR..." | tee -a "$LOG_FILE"
cd "$EXTRACT_DIR" || {
  echo "❌ ERROR: No se pudo acceder a $EXTRACT_DIR" | tee -a "$LOG_FILE"
  exit 1
}

# Verifica contenido base
echo "📁 Contenido de la carpeta actual:" | tee -a "$LOG_FILE"
ls -la | tee -a "$LOG_FILE"
echo "📄 Primeras líneas de package.json:" | tee -a "$LOG_FILE"
head -n 20 package.json | tee -a "$LOG_FILE"

echo "✅ Entorno frontend confirmado." | tee -a "$LOG_FILE"

# Copia .env.production
echo "📄 Copiando .env.production..." | tee -a "$LOG_FILE"
cp /home/ubuntu/.env.production . || {
  echo "❌ ERROR: No se pudo copiar .env.production" | tee -a "$LOG_FILE"
  exit 1
}

# Instala dependencias
echo "📦 Instalando dependencias npm..." | tee -a "$LOG_FILE"
npm install >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
  echo "❌ ERROR: npm install falló" | tee -a "$LOG_FILE"
  exit 1
fi

# Limpia el build anterior
echo "🧹 Eliminando build anterior..." | tee -a "$LOG_FILE"
rm -rf "$BUILD_DIR"

# Ejecuta el build
echo "🛠️ Ejecutando npm run build..." | tee -a "$LOG_FILE"
timeout 300s npm run build >> "$LOG_FILE" 2>&1
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ ERROR: El build falló con código $BUILD_EXIT" | tee -a "$LOG_FILE"
  exit 1
fi

# Verifica que se generó el build
if [ ! -d "$BUILD_DIR" ] || [ ! -f "$BUILD_DIR/index.html" ]; then
  echo "❌ ERROR: Build no generado correctamente. Falta /dist/index.html" | tee -a "$LOG_FILE"
  exit 1
fi

# Copia al destino final
echo "🧹 Limpiando $DEPLOY_DIR..." | tee -a "$LOG_FILE"
sudo rm -rf "$DEPLOY_DIR"/* || {
  echo "❌ ERROR al limpiar $DEPLOY_DIR" | tee -a "$LOG_FILE"
  exit 1
}

echo "🚚 Copiando build al directorio público..." | tee -a "$LOG_FILE"
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -r "$BUILD_DIR"/* "$DEPLOY_DIR"/ >> "$LOG_FILE" 2>&1 || {
  echo "❌ ERROR al copiar archivos" | tee -a "$LOG_FILE"
  exit 1
}

echo "🔐 Asignando permisos a www-data..." | tee -a "$LOG_FILE"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

echo "✅ Frontend desplegado correctamente en $DEPLOY_DIR." | tee -a "$LOG_FILE"
exit 0