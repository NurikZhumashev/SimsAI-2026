from sqlalchemy import create_engine, Column, Integer, String, JSON
from sqlalchemy.orm import sessionmaker, declarative_base

# Создаем файл базы данных sqlite
SQLALCHEMY_DATABASE_URL = "sqlite:///./nurik_world.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Таблица нашего мира (хранит статы и карту)
class GameSave(Base):
    __tablename__ = "game_saves"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(String, unique=True, index=True) # Задел под мультиплеер
    stars = Column(Integer, default=50)   # Стартовый капитал
    energy = Column(Integer, default=100)
    hunger = Column(Integer, default=100)
    hygiene = Column(Integer, default=100) # Гигиена
    bladder = Column(Integer, default=100) # Нужда
    walls_data = Column(JSON, default="[]") # Стены храним в JSON

# Команда для создания таблиц при запуске
Base.metadata.create_all(bind=engine)
