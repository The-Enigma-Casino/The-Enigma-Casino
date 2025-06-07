#!/bin/bash

# cp /home/ubuntu/The-Enigma-Casino/aws/start-backend-and-waf.sh /home/ubuntu/start-backend-and-waf.sh
# chmod +x start-backend-and-waf.sh
# crontab -e
# @reboot /home/ubuntu/start-backend-and-waf.sh

LOG_FILE="/tmp/startup.log"
APP_DIR="/home/ubuntu/backend-code-deploy"
APP_DLL="the-enigma-casino-server.dll"
DOCKER_COMPOSE_DIR="/home/ubuntu/enigma-waf"

echo "Iniciando script de arranque backend + WAF - $(date)" | tee -a "$LOG_FILE"

# 1. Lanzar el contenedor del WAF
echo "Arrancando ModSecurity WAF con Docker Compose..." | tee -a "$LOG_FILE"
cd "$DOCKER_COMPOSE_DIR" || {
  echo "No se pudo acceder a $DOCKER_COMPOSE_DIR" | tee -a "$LOG_FILE"
  exit 1
}
docker compose up -d >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
  echo "Error al levantar Docker Compose para ModSecurity" | tee -a "$LOG_FILE"
  exit 1
fi

# 2. Esperar a que WAF esté escuchando en el puerto 8080
echo "Esperando que WAF esté disponible en localhost:8080..." | tee -a "$LOG_FILE"
for i in {1..10}; do
  if curl -s http://localhost:8080 >/dev/null; then
    echo "WAF activo y respondiendo" | tee -a "$LOG_FILE"
    break
  fi
  sleep 2
done

# 3. Lanzar el backend .NET en segundo plano
echo "Lanzando backend en $APP_DIR..." | tee -a "$LOG_FILE"
cd "$APP_DIR" || {
  echo "ERROR: No se pudo acceder a $APP_DIR" | tee -a "$LOG_FILE"
  exit 1
}

echo "Cargando variables de entorno..." | tee -a "$LOG_FILE"
set -o allexport
source "$APP_DIR/.env.production"
set +o allexport

nohup dotnet "$APP_DLL" >> "$APP_DIR/logs.txt" 2>&1 &
PID=$!
sleep 1

if ps -p $PID > /dev/null; then
  echo "Backend .NET lanzado correctamente (PID $PID)" | tee -a "$LOG_FILE"
else
  echo "Error al lanzar el backend." | tee -a "$LOG_FILE"
  exit 1
fi
