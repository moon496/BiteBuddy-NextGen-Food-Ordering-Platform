from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.cart_routes import router as cart_router
from routes.order_routes import router as order_router
from routes.auth_routes import router as auth_router
from database import Base, engine
from model import User

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(cart_router)
app.include_router(order_router)
app.include_router(auth_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://expert-space-adventure-5g9wxrww565rf769w-5173.app.github.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to BiteBuddy API"}

@app.get("/menu")
def get_menu():
    return {"items": ["Pizza", "Burger", "Pasta", "Salad"]}

@app.get("/menu-items")
def get_menu_items():
    return {
        "items": [
            {"id": 1, "name": "Burger", "price": 120, "category": "Fast Food"},
            {"id": 2, "name": "Pizza", "price": 250, "category": "Italian"},
            {"id": 3, "name": "Pasta", "price": 180, "category": "Italian"},
            {"id": 4, "name": "Salad", "price": 90, "category": "Healthy"},
            {"id": 5, "name": "MeatBox", "price": 120, "category": "Testy Food"},
            {"id": 6, "name": "Ice-cream", "price": 100, "category": "Fast Food"},
            {"id": 7, "name": "Sushi", "price": 200, "category": "Healthy"},
            {"id": 8, "name": "Fried-Rice", "price": 150, "category": "Fast Food"}
        ]
    }