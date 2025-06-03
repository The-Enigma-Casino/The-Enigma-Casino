#!/bin/bash
echo "🛑 Deteniendo backend..."
pkill -f 'dotnet the-enigma-casino-server.dll' || true
