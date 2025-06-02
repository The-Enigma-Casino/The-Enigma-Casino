#!/bin/bash
echo "→ Deteniendo backend"
pkill -f "the-enigma-casino-server.dll" || true
