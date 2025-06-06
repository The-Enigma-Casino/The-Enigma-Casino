#!/bin/bash
set -e

echo "🔄 Preparando entorno para ModSecurity..."

# 1. Instalar dependencias
sudo apt update
sudo apt install -y git build-essential libtool libpcre3 libpcre3-dev libpcre2-dev \
libssl-dev zlib1g-dev libxml2 libxml2-dev libyajl-dev curl doxygen cmake pkgconf

# 2. Eliminar carpetas anteriores
rm -rf ~/ModSecurity ~/ModSecurity-nginx ~/nginx-src

# 3. Clonar y compilar ModSecurity
cd ~
git clone --depth 1 -b v3/master https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git submodule init && git submodule update
./build.sh
./configure
make
sudo make install

# 4. Clonar el conector oficial para Nginx
cd ~
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# 5. Descargar código fuente de tu versión actual de Nginx
NGINX_VERSION=$(nginx -v 2>&1 | cut -d "/" -f2)
mkdir -p ~/nginx-src
cd ~/nginx-src
wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
tar -zxvf nginx-${NGINX_VERSION}.tar.gz
cd nginx-${NGINX_VERSION}

# 6. Compilar módulo dinámico ModSecurity para Nginx
./configure --with-compat --add-dynamic-module=~/ModSecurity-nginx
make modules

# 7. Copiar módulo a la ruta oficial de Nginx
sudo mkdir -p /etc/nginx/modules
sudo cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# 8. Activar módulo en nginx.conf si no está ya presente
if ! grep -q "load_module modules/ngx_http_modsecurity_module.so;" /etc/nginx/nginx.conf; then
  sudo sed -i '1iload_module modules/ngx_http_modsecurity_module.so;' /etc/nginx/nginx.conf
fi

echo "✅ Módulo ModSecurity compilado y cargado para Nginx"
