from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal, User
import datetime

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Разрешает запросы с любых сайтов (включая твой GitHub Pages)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Подключаемся к базе
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/status/{user_id}")
def get_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Если игрока нет, создаем нового (для теста)
        user = User(id=user_id, username=f"User_{user_id}")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.post("/action/work/{user_id}")
def work(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    
    # Проверки: можно ли работать?
    if user.energy < 10:
        raise HTTPException(status_code=400, detail="Слишком устал. Нужно поспать.")
    if user.hunger < 5:
        raise HTTPException(status_code=400, detail="Слишком голоден. Нужно поесть.")

    # Логика действия
    reward = 10.0 * user.level  # Зарплата растет с уровнем
    user.money += reward
    user.energy -= 10           # Тратим силы
    user.hunger -= 5            # Хочется кушать
    user.exp += 20              # Получаем опыт
    
    # Проверка уровня (упрощенно)
    if user.exp >= user.level * 100:
        user.level += 1
        user.exp = 0

    db.commit()
    return {"message": "Вы успешно поработали!", "reward": reward, "new_balance": user.money}

@app.post("/action/rest/{user_id}")
def rest(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    
    user.energy = min(100, user.energy + 50) # Спим — +50 энергии
    user.hunger -= 10 # Пока спал — проголодался
    
    db.commit()
    return {"message": "Вы отлично выспались на картонке!", "new_energy": user.energy}

@app.post("/action/eat/{user_id}")
def eat(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    
    if user.money < 20:
        raise HTTPException(status_code=400, detail="Нет денег даже на сухарик.")
        
    user.money -= 20
    user.hunger = min(100, user.hunger + 30)
    
    db.commit()
    return {"message": "Вы съели подозрительный беляш.", "new_hunger": user.hunger}
