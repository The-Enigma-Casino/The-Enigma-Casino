#!/bin/bash
echo "→ Salvando .env.production del frontend"

cd /var/www/theenigmacasino || exit 1
cp .env.production /tmp/frontend-env.production || true