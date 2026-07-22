from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# NOTE: Originally pointed to a placeholder MySQL instance that was never
# configured. Switched to SQLite so the app runs standalone without a
# separate database server, using the same SQLAlchemy Base/session pattern.
SQLALCHEMY_DATABASE_URL = "sqlite:///./bitebuddy.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()