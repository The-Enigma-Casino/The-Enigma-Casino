> [!IMPORTANT]
> En proceso de desarrollo... Esto si fallara mas seria imposible

```bash
sudo nano /etc/systemd/system/enigma-backend.service
```

```bash
[Unit]
Description=Enigma Backend .NET Service
After=network.target

[Service]
Environment="PATH=/usr/bin:/usr/local/bin:/home/ubuntu/.dotnet/tools"
Type=simple
User=ubuntu
ExecStart=/home/ubuntu/auto-start-backend.sh
WorkingDirectory=/home/ubuntu
StandardOutput=append:/home/ubuntu/backend-output.log
StandardError=append:/home/ubuntu/backend-error.log
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo chmod +x /home/ubuntu/auto-start-backend.sh
sudo systemctl daemon-reload
sudo systemctl enable enigma-backend.service
sudo systemctl start enigma-backend.service
```

```bash
sudo systemctl status enigma-backend.service
tail -n 50 /home/ubuntu/backend-run.log
```