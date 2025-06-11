#!/bin/bash
# chmod +x ~/start-backend.sh
# ./start-backend.sh
# nohup ./start-backend.sh &

cd ~/The-Enigma-Casino/backend/the-enigma-casino-server || exit 1

echo "Cargando variables de entorno (.env.production)..."
set -o allexport
source .env.production
set +o allexport

echo "Variables cargadas:"
env | grep -E 'USE_GMAIL_API|ASPNETCORE|JWT_KEY|EMAIL_KEY|STRIPE_KEY|SERVER_URL|CLIENT_URL|NETWORKURL'

echo "Compilando backend en modo Release..."
dotnet publish -c Release

# 🧠 COPIA DE IMÁGENES DE PERFIL
echo "Copiando imágenes de perfil al publish..."
mkdir -p bin/Release/net8.0/publish/wwwroot/images/profile
cp -r wwwroot/images/profile/* bin/Release/net8.0/publish/wwwroot/images/profile/ 2>/dev/null || echo "No hay imágenes que copiar."

echo "Lanzando backend..."
dotnet bin/Release/net8.0/publish/the-enigma-casino-server.dll
