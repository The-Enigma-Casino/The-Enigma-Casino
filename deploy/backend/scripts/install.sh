#!/bin/bash

ZIP_DIR="$(pwd)"
TARGET_DIR="/home/ubuntu/backend-code-deploy"

echo "📦 Instalando nueva versión del backend sin borrar archivos sensibles..."

mkdir -p "$TARGET_DIR"

rsync -av --exclude='.env.production' \
          --exclude='credentials.json' \
          --exclude='tokens' \
          "$ZIP_DIR/publish/" "$TARGET_DIR/"

echo "✅ Backend actualizado con archivos sensibles preservados."
