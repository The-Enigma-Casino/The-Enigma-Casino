#!/bin/bash

ACTIVE_BACKEND=""

while true; do
  NEW_BACKEND=""
  if curl -s --connect-timeout 2 "http://172.31.83.190:5000/api" | grep -q "The Enigma Casino"; then
    NEW_BACKEND="172.31.83.190"
  elif curl -s --connect-timeout 2 "http://172.31.26.208:5000/api" | grep -q "The Enigma Casino"; then
    NEW_BACKEND="172.31.26.208"
  fi

  if [ "$NEW_BACKEND" != "$ACTIVE_BACKEND" ] && [ -n "$NEW_BACKEND" ]; then
    echo "[WATCHDOG] Detected backend change. Switching to $NEW_BACKEND"
    echo "[WATCHDOG] Reiniciando servicio waf-deploy.service..."
    systemctl restart waf-deploy.service
    ACTIVE_BACKEND="$NEW_BACKEND"
  fi

  sleep 15
done
