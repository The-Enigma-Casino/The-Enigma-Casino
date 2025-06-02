#!/bin/bash
echo "→ Iniciando backend..."

cd /home/ubuntu/enigma-backend || exit 1

nohup dotnet the-enigma-casino-server.dll > backend.log 2>&1 &
