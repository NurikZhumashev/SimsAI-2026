from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Память сервера: теперь Нурик помнит и голод
game_state = {
    "walls": [],
    "energy": 100,
    "hunger": 100,
    "nurik_pos": {"x": 0, "y": 0}
}

class WallData(BaseModel):
    r: int
    c: int

@app.get("/get_map")
async def get_map():
    return game_state

@app.post("/save_wall")
async def save_wall(wall: WallData):
    wall_coord = [wall.r, wall.c]
    if wall_coord in game_state["walls"]:
        game_state["walls"].remove(wall_coord)
    else:
        game_state["walls"].append(wall_coord)
    return {"status": "ok"}

@app.post("/eat")
async def eat():
    game_state["hunger"] = 100
    return {"status": "full", "hunger": 100}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
