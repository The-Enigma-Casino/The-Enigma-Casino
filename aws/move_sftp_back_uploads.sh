#!/bin/bash

SOURCE="/sftp/back"
TARGET="/home/ubuntu/The-Enigma-Casino/backend"

echo "Moviendo archivos de $SOURCE a $TARGET..."

mv "$SOURCE"/* "$TARGET"/
chown ubuntu:ubuntu "$TARGET"/*

echo "Archivos subidos por SFTP al backend movidos correctamente."
