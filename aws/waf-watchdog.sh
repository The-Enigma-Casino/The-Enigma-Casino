#!/bin/bash

# Este script monitorea dos servidores backend y reinicia el servicio waf-deploy.service en caso del backend principal caiga.

ACTIVE_BACKEND=""

while true; do
  NEW_BACKEND=""
  if curl -s --connect-timeout 2 "http://172.31.90.254:5000/api" | grep -q "The Enigma Casino"; then
    NEW_BACKEND="172.31.90.254"
  elif curl -s --connect-timeout 2 "http://172.31.30.93:5000/api" | grep -q "The Enigma Casino"; then
    NEW_BACKEND="172.31.30.93"
  fi

  if [ "$NEW_BACKEND" != "$ACTIVE_BACKEND" ] && [ -n "$NEW_BACKEND" ]; then
    echo "[WATCHDOG] Detected backend change. Switching to $NEW_BACKEND"
    echo "[WATCHDOG] Reiniciando servicio waf-deploy.service..."
    systemctl restart waf-deploy.service
    ACTIVE_BACKEND="$NEW_BACKEND"
  fi

  sleep 15
done