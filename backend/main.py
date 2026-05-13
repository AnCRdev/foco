from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Foco IoT Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Estado en memoria
state = {"on": False}

@app.get("/api/status")
async def status():
    return {"state": state["on"]}

@app.post("/api/toggle")
async def toggle():
    state["on"] = not state["on"]
    return {"state": state["on"]}

# El ESP32 llama a este endpoint cada 500ms para saber qué tiene que hacer
@app.get("/api/poll")
async def poll():
    return {"state": state["on"]}
