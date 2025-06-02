#!/bin/bash
echo "→ Preparando entorno backend"

cd /home/ubuntu/enigma-backend || exit 1

mv /tmp/.env.production . || true
mv /tmp/credentials.json . || true
mv /tmp/tokens ./ || true

if [ -f ".env.production" ]; then
  echo "→ Cargando variables de entorno..."
  set -o allexport
  source .env.production
  set +o allexport
else
  echo "⚠️ No se encontró .env.production en /home/ubuntu/enigma-backend"
fi
