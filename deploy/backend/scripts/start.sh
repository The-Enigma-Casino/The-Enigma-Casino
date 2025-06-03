#!/bin/bash
echo "🚀 Iniciando backend..."
cd /home/ubuntu/backend-code-deploy || exit 1
nohup dotnet the-enigma-casino-server.dll > logs.txt 2>&1 &
