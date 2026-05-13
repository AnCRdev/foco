import _thread
import urequests
import time
import math
import random
from machine import Pin, PWM
from config import LED_PIN, BACKEND_URL

pwm = PWM(Pin(LED_PIN, Pin.OUT), freq=1000)
pwm.duty(0)

led_state = False
prev_state = False

# --- Efectos LED ---

def effect_flicker_on():
    for _ in range(random.randint(3, 7)):
        pwm.duty(random.randint(80, 600))
        time.sleep_ms(random.randint(20, 90))
        pwm.duty(0)
        time.sleep_ms(random.randint(15, 55))
    for i in range(0, 1024, 7):
        pwm.duty(min(i, 1023))
        time.sleep_ms(3)
    pwm.duty(1023)

def effect_fade_out():
    d = pwm.duty()
    while d > 0:
        d = max(0, d - 14)
        pwm.duty(d)
        time.sleep_ms(8)
    pwm.duty(0)

# --- Polling en hilo separado ---

def poll_thread():
    global led_state
    while True:
        try:
            r = urequests.get(BACKEND_URL + "/api/poll", timeout=3)
            data = r.json()
            r.close()
            led_state = bool(data.get("state", False))
        except Exception as e:
            print("Poll error:", e)
        time.sleep_ms(600)

_thread.start_new_thread(poll_thread, ())

# --- Loop principal: efectos + respiración ---

breath_step = 0

print("Conectado. Polling " + BACKEND_URL)

while True:
    state_changed = led_state != prev_state

    if state_changed and led_state:
        effect_flicker_on()
        breath_step = 0
        prev_state = True

    elif state_changed and not led_state:
        effect_fade_out()
        prev_state = False

    elif led_state:
        angle = breath_step * 0.04
        brightness = int((math.sin(angle) + 1) / 2 * 303 + 720)
        pwm.duty(brightness)
        breath_step += 1
        time.sleep_ms(20)

    else:
        time.sleep_ms(50)
