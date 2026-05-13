import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

ESP32_IP = os.getenv("ESP32_IP", "192.168.1.100")
ESP32_URL = f"http://{ESP32_IP}"

app = FastAPI(title="Foco IoT Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def status():
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{ESP32_URL}/status")
            return r.json()
    except httpx.ConnectError:
        raise HTTPException(503, detail="ESP32 no responde. Verificá la IP y la red.")
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/toggle")
async def toggle():
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{ESP32_URL}/toggle")
            return r.json()
    except httpx.ConnectError:
        raise HTTPException(503, detail="ESP32 no responde. Verificá la IP y la red.")
    except Exception as e:
        raise HTTPException(500, detail=str(e))
