#!/bin/bash

ZIP_DIR="$(pwd)"
TARGET_DIR="/home/ubuntu/backend-code-deploy"

echo "📦 Instalando nueva versión del backend..."

# Solo borramos contenido generado (build), no archivos persistentes
rm -rf "$TARGET_DIR/bin" "$TARGET_DIR/obj" "$TARGET_DIR/wwwroot"
mkdir -p "$TARGET_DIR"

cp -r "$ZIP_DIR/publish/"* "$TARGET_DIR"

echo "✅ Código actualizado sin borrar variables ni configuraciones."
