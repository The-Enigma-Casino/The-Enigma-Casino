[Unit]
Description=WAF Backend Watchdog
After=network.target docker.service

[Service]
User=ubuntu
ExecStart=/bin/bash /home/ubuntu/enigma-waf/waf-watchdog.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target