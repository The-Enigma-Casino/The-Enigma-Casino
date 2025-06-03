#!/bin/bash
echo "📦 Instalando frontend en /var/www/theenigmacasino..."
sudo rm -rf /var/www/theenigmacasino/*
sudo cp -r build/* /var/www/theenigmacasino/
sudo chown -R www-data:www-data /var/www/theenigmacasino
