from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json

# Импортируем нашу базу данных из соседнего файла
from database import SessionLocal, GameSave

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency: функция для безопасного подключения к БД (ACID-транзакции)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ищет Нурика в базе. Если это первый запуск — создает его.
def get_or_create_player(db: Session, player_id: str = "nurik_1"):
    player = db.query(GameSave).filter(GameSave.player_id == player_id).first()
    if not player:
        player = GameSave(player_id=player_id, walls_data="[]")
        db.add(player)
        db.commit()
        db.refresh(player)
    return player

# Модели данных (Валидация)
class WallData(BaseModel):
    r: int
    c: int

class ActionData(BaseModel):
    action_type: str # 'eat', 'sleep', 'work', 'shower', 'toilet'

@app.get("/get_map")
async def get_map(db: Session = Depends(get_db)):
    player = get_or_create_player(db)
    return {
        "walls": json.loads(player.walls_data),
        "energy": player.energy,
        "hunger": player.hunger,
        "hygiene": player.hygiene,
        "bladder": player.bladder,
        "stars": player.stars
    }

@app.post("/save_wall")
async def save_wall(wall: WallData, db: Session = Depends(get_db)):
    player = get_or_create_player(db)
    walls = json.loads(player.walls_data)
    wall_coord = [wall.r, wall.c]
    
    if wall_coord in walls:
        walls.remove(wall_coord)
    else:
        walls.append(wall_coord)
        
    player.walls_data = json.dumps(walls)
    db.commit() # Железобетонное сохранение в SQL
    return {"status": "ok"}

# ЕДИНЫЙ ЦЕНТР УПРАВЛЕНИЯ ЖИЗНЬЮ
@app.post("/action")
async def perform_action(data: ActionData, db: Session = Depends(get_db)):
    player = get_or_create_player(db)
    msg = ""
    
    if data.action_type == "eat":
        if player.stars >= 10:
            player.stars -= 10
            player.hunger = 100
            msg = "Нурик поел! (-10 Stars)"
        else:
            return {"status": "error", "message": "Нет денег на еду!"}
            
    elif data.action_type == "sleep":
        player.energy = 100
        msg = "Выспался!"
        
    elif data.action_type == "work":
        if player.energy > 20 and player.hunger > 20:
            player.stars += 25
            player.energy -= 20
            player.hunger -= 15
            player.hygiene -= 15
            player.bladder -= 20
            msg = "Написал код! (+25 Stars)"
        else:
            return {"status": "error", "message": "Слишком устал или голоден для работы!"}
            
    elif data.action_type == "shower":
        player.hygiene = 100
        msg = "Помылся!"
        
    elif data.action_type == "toilet":
        player.bladder = 100
        msg = "Сходил в туалет!"
        
    db.commit()
    db.refresh(player)
    
    return {
        "status": "ok", 
        "message": msg,
        "stats": {
            "stars": player.stars, "energy": player.energy, 
            "hunger": player.hunger, "hygiene": player.hygiene, 
            "bladder": player.bladder
        }
    }
