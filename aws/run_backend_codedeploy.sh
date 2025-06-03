#!/bin/bash

ZIP_PATH="/home/user-deploy/zips/backend-deploy.zip"
DEPLOY_DIR="/home/ubuntu/deploy-temp-backend"
TARGET_DIR="/home/ubuntu/backend-code-deploy"

echo "Preparando despliegue backend con CodeDeploy manual..."

# 1. Limpiar y descomprimir en carpeta temporal
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
unzip "$ZIP_PATH" -d "$DEPLOY_DIR"

cd "$DEPLOY_DIR" || { echo "No se pudo acceder a $DEPLOY_DIR"; exit 1; }

# 2. Ejecutar hook BeforeInstall
echo "BeforeInstall: Detener y guardar estado actual"
bash scripts/stop.sh

# 3. Copiar contenido de /publish al destino
echo "Copiando nueva build a $TARGET_DIR"
mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR"/*
cp -r publish/* "$TARGET_DIR"

# 4. Ejecutar hook AfterInstall
echo "AfterInstall: Restaurar archivos persistentes"
bash scripts/install.sh

# 5. Ejecutar hook ApplicationStart
echo "ApplicationStart: Lanzando backend"
nohup bash scripts/start.sh > /dev/null 2>&1 &

echo "Backend desplegado correctamente."