#!/bin/bash
# Flashea los archivos MicroPython al ESP32 via mpremote
# Instalar con: pip install mpremote
#
# Uso: ./flash.sh /dev/tty.usbmodem* (Mac)
#      ./flash.sh COM3               (Windows)

PORT=${1:-"auto"}

echo "Subiendo firmware al ESP32 en puerto: $PORT"

mpremote connect $PORT cp config.py :config.py
mpremote connect $PORT cp boot.py   :boot.py
mpremote connect $PORT cp main.py   :main.py

echo "Listo. Reiniciando ESP32..."
mpremote connect $PORT reset
