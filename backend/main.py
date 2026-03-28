from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Разрешаем фронтенду общаться с бэкендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Простая база данных в оперативной памяти (пока без SQL)
# Храним координаты стен: [[r1, c1], [r2, c2]]
game_state = {
    "walls": [],
    "energy": 100,
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
    # Если такой стены нет — добавляем, если есть — убираем (режим ластика)
    wall_coord = [wall.r, wall.c]
    if wall_coord in game_state["walls"]:
        game_state["walls"].remove(wall_coord)
    else:
        game_state["walls"].append(wall_coord)
    return {"status": "ok", "walls_count": len(game_state["walls"])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
