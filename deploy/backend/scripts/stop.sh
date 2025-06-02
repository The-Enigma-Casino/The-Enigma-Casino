#!/bin/bash
echo "→ Guardando archivos sensibles (backend)"

cd /home/ubuntu/enigma-backend || exit 1

# Copiar los archivos que NO están en GitHub y NO deben perderse
cp .env.production /tmp/ || true
cp credentials.json /tmp/ || true
cp -r tokens /tmp/ || true

# Detener backend
pkill -f "the-enigma-casino-server.dll" || true
