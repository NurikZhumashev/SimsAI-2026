import os
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# Railway автоматически подставляет DATABASE_URL. 
# Если её нет (например, на компьютере), используем SQLite как запасной вариант.
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Создаем движок
engine = create_engine(DATABASE_URL or "sqlite:///./game.db")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    money = Column(Float, default=100.0)
    health = Column(Integer, default=100)
    hunger = Column(Integer, default=100)
    energy = Column(Integer, default=100)
    level = Column(Integer, default=1)
    exp = Column(Integer, default=0)
    last_update = Column(DateTime, default=datetime.datetime.utcnow)

# Создаем таблицы в новой базе
Base.metadata.create_all(bind=engine)
