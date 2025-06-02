#!/bin/bash
echo "→ Restaurando .env.production del frontend"

cd /var/www/theenigmacasino || exit 1
mv /tmp/frontend-env.production .env.production || true