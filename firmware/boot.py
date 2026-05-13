import network
import time
from config import WIFI_SSID, WIFI_PASSWORD

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("WiFi ya conectado:", wlan.ifconfig()[0])
        return wlan

    print(f"Conectando a '{WIFI_SSID}'...")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    timeout = 15
    while not wlan.isconnected() and timeout > 0:
        time.sleep(1)
        timeout -= 1
        print(".", end="")

    if wlan.isconnected():
        ip = wlan.ifconfig()[0]
        print(f"\nConectado. IP: {ip}")
    else:
        print("\nError: no se pudo conectar al WiFi")

    return wlan

connect_wifi()
