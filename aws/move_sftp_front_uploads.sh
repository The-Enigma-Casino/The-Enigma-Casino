#!/bin/bash

SOURCE="/sftp/front"
TARGET="/home/ubuntu/The-Enigma-Casino/frontend"

echo "Moviendo archivos de $SOURCE a $TARGET..."

mv "$SOURCE"/* "$TARGET"/
chown ubuntu:ubuntu "$TARGET"/*

echo "Archivos subidos por SFTP al frontend movidos correctamente."
