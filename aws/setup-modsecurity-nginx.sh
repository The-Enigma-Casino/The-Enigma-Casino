#!/bin/bash
set -e
# Si cualquier comando falla para el script

# chmod +x setup-modsecurity-nginx.sh

# 1. Instalar dependencias
sudo apt update
sudo apt install -y git build-essential libtool libpcre3 libpcre3-dev libssl-dev \
 zlib1g-dev libxml2 libxml2-dev libyajl-dev curl doxygen cmake pkgconf

# 2. Clonar y compilar ModSecurity
cd ~
git clone --depth 1 -b v3/master https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git submodule init && git submodule update
./build.sh
./configure --disable-pcre2
sudo make install

# 3. Descargar y compilar
cd ~
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

NGINX_VERSION=$(nginx -v 2>&1 | cut -d "/" -f2)
wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz
tar -zxvf nginx-${NGINX_VERSION}.tar.gz
cd nginx-${NGINX_VERSION}
./configure --with-compat --add-dynamic-module=../ModSecurity-nginx
make modules

sudo cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# 4. Habilitar el módulo en nginx.conf
if ! grep -q "load_module modules/ngx_http_modsecurity_module.so;" /etc/nginx/nginx.conf; then
  sudo sed -i '1iload_module modules/ngx_http_modsecurity_module.so;' /etc/nginx/nginx.conf
fi

echo "✅ Módulo ModSecurity compilado y cargado para Nginx"
