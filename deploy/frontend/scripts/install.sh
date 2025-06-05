#!/bin/bash

echo "📦 Instalando frontend en /var/www/theenigmacasino..."

# Respeta configuraciones, solo actualiza el contenido
sudo mkdir -p /var/www/theenigmacasino
sudo cp -r dist/* /var/www/theenigmacasino/
sudo chown -R www-data:www-data /var/www/theenigmacasino

echo "✅ Frontend copiado correctamente."
