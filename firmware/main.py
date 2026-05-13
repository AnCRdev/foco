import uasyncio as asyncio
import network
import json
import math
import random
from machine import Pin, PWM
from config import LED_PIN, SERVER_PORT

pwm = PWM(Pin(LED_PIN, Pin.OUT), freq=1000)
pwm.duty(0)

led_state = False
prev_state = False

def get_ip():
    wlan = network.WLAN(network.STA_IF)
    return wlan.ifconfig()[0] if wlan.isconnected() else "0.0.0.0"

def build_response(body, status="200 OK"):
    payload = json.dumps(body)
    return ("HTTP/1.1 " + status + "\r\n"
            "Content-Type: application/json\r\n"
            "Content-Length: " + str(len(payload)) + "\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Connection: close\r\n\r\n" + payload)

async def handle_client(reader, writer):
    global led_state
    try:
        data = await reader.read(1024)
        request = data.decode("utf-8", "ignore")
        line = request.split("\r\n")[0].split(" ")
        method = line[0] if line else "GET"
        path   = line[1] if len(line) > 1 else "/"

        if method == "OPTIONS":
            resp = ("HTTP/1.1 204 No Content\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "Access-Control-Allow-Methods: GET, POST\r\n"
                    "Connection: close\r\n\r\n")
        elif path == "/toggle":
            led_state = not led_state
            resp = build_response({"state": led_state})
        elif path == "/status":
            resp = build_response({"state": led_state, "ip": get_ip()})
        else:
            resp = build_response({"error": "not found"}, "404 Not Found")

        writer.write(resp.encode())
        await writer.drain()
    except Exception as e:
        print("Error cliente:", e)
    finally:
        writer.close()

async def effect_flicker_on():
    # Parpadeo irregular de foco viejo antes de estabilizarse
    flashes = random.randint(3, 7)
    for _ in range(flashes):
        pwm.duty(random.randint(80, 600))
        await asyncio.sleep_ms(random.randint(20, 90))
        pwm.duty(0)
        await asyncio.sleep_ms(random.randint(15, 55))
    # Fade in suave hasta brillo completo
    for i in range(0, 1024, 7):
        pwm.duty(min(i, 1023))
        await asyncio.sleep_ms(3)
    pwm.duty(1023)

async def effect_fade_out():
    d = pwm.duty()
    while d > 0:
        d = max(0, d - 14)
        pwm.duty(d)
        await asyncio.sleep_ms(8)
    pwm.duty(0)

async def led_effects():
    global led_state, prev_state
    breath_step = 0

    while True:
        state_changed = led_state != prev_state

        if state_changed and led_state:
            # ON: flicker de foco viejo + fade in
            await effect_flicker_on()
            breath_step = 0
            prev_state = True

        elif state_changed and not led_state:
            # OFF: fade out gradual
            await effect_fade_out()
            prev_state = False

        elif led_state:
            # Mientras está ON: pulso de respiración entre 70%-100%
            angle = breath_step * 0.04
            brightness = int((math.sin(angle) + 1) / 2 * 303 + 720)
            pwm.duty(brightness)
            breath_step += 1
            await asyncio.sleep_ms(20)

        else:
            await asyncio.sleep_ms(50)

async def main():
    server = await asyncio.start_server(handle_client, "0.0.0.0", SERVER_PORT)
    print("Servidor HTTP en http://" + get_ip() + ":" + str(SERVER_PORT))
    asyncio.create_task(led_effects())
    await server.wait_closed()

asyncio.run(main())
