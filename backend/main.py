from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.cart_routes import router as cart_router
from order_status import router as order_status_router

from routes.auth_routes import router as auth_router
from routes.coupon_routes import router as coupon_router
from routes.address_routes import router as address_router
from routes.admin_routes import router as admin_router
from routes.review_routes import router as review_router
from routes.payment_routes import router as payment_router
from database import Base, engine
from model import User  

app = FastAPI()  

Base.metadata.create_all(bind=engine)

app.include_router(cart_router)          
app.include_router(order_status_router)

app.include_router(auth_router)
app.include_router(coupon_router)
app.include_router(address_router)
app.include_router(admin_router)
app.include_router(review_router)
app.include_router(payment_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
            {"id": 1, "name": "Burger", "price": 120, "category": "Fast Food",  "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500"},
            {"id": 2, "name": "Pizza", "price": 250, "category": "Italian","image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500"},
            {"id": 3, "name": "Pasta", "price": 180, "category": "Italian","image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500"},
            {"id": 4, "name": "Salad", "price": 90, "category": "Healthy","image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500"},
            {"id": 5, "name": "MeatBox", "price": 120, "category": "Testy Food", "image": "https://images.unsplash.com/photo-1767065703791-ddc9a028563c?q=80&w=500"},
            {"id": 6, "name": "Ice-cream", "price": 100, "category": "Fast Food","image": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=500"},
            {"id": 7, "name": "Sushi", "price": 200, "category": "Healthy","image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=500"},
            {"id": 8, "name": "Fried-Rice", "price": 150, "category": "Fast Food","image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500"},
            {"id": 9, "name": "Double Cheeseburger", "price": 320, "category": "Burgers","image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500"},
            {"id": 10, "name": "Mango Lassi", "price": 120, "category": "Drinks", "image": "https://images.unsplash.com/photo-1719239948819-0afeced16184?q=80&w=500"},
            {"id": 11, "name": "Spicy Ramen Bowl", "price": 280, "category": "Noodles", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=500"},
            {"id": 12, "name": "Chicken Tacos", "price": 260, "category": "Mexican", "image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=500"}
        ]
    }