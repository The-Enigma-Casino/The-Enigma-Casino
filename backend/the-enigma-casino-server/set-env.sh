#!/bin/bash

#scp .env.production back:~/The-Enigma-Casino/backend/the-enigma-casino-server/

echo "Cargando variables de entorno para el backend Enigma..."

# Exportar todas las variables del archivo .env.production
set -o allexport
source .env.production
set +o allexport

echo "Variables cargadas:"
env | grep -E 'ASPNETCORE|JWT_KEY|EMAIL_KEY|STRIPE_KEY|SERVER_URL|CLIENT_URL|NETWORKURL'
