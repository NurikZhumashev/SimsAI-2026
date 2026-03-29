from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# Создаем базу данных (sqlite локально, или postgres на Railway)
DATABASE_URL = "sqlite:///./game.db" 

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    
    # Основные ресурсы
    money = Column(Float, default=100.0)    # Стартовый капитал
    health = Column(Integer, default=100)   # Здоровье (0 = Гейм Овер)
    hunger = Column(Integer, default=100)   # Сытость (падает со временем)
    energy = Column(Integer, default=100)   # Энергия для действий
    
    # Прогресс
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    
    # Время (нужно для восстановления энергии и пассивного дохода)
    last_update = Column(DateTime, default=datetime.datetime.utcnow)

# Создаем таблицы
Base.metadata.create_all(bind=engine)
