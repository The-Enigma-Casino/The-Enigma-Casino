#!/bin/bash
# chmod +x ~/start-backend.sh

# ./start-backend.sh
# nohup ./start-backend.sh &

cd ~/The-Enigma-Casino/backend/the-enigma-casino-server || exit 1
source ./set-env.sh
dotnet bin/Release/net8.0/publish/the-enigma-casino-server.dll
