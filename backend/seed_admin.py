from database import SessionLocal, Base, engine
from model import User
from auth_utils import hash_password

Base.metadata.create_all(bind=engine)

DEMO_ADMINS = [
    {"username": "admin1", "email": "admin1@bitebuddy.com", "password": "ChangeMe123!"},
]

def seed():
    db = SessionLocal()
    try:
        for data in DEMO_ADMINS:
            if db.query(User).filter(User.email == data["email"]).first():
                print(f"Skip (already exists): {data['email']}")
                continue
            admin = User(
                username=data["username"],
                email=data["email"],
                hashed_password=hash_password(data["password"]),
                role="Admin",
            )
            db.add(admin)
            print(f"Created admin: {data['email']}")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed()