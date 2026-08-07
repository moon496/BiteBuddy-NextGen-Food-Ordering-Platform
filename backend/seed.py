from database import SessionLocal, Base, engine
from model import MenuItem

Base.metadata.create_all(bind=engine)
db = SessionLocal()

menu_data = [
    {"name": "Burger", "price": 120, "category": "Fast Food", "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=500"},
    {"name": "Pizza", "price": 250, "category": "Italian", "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500"},
    {"name": "Pasta", "price": 180, "category": "Italian", "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500"},
    {"name": "Salad", "price": 90, "category": "Healthy", "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500"},
    {"name": "MeatBox", "price": 120, "category": "Testy Food", "image": "https://images.unsplash.com/photo-1767065703791-ddc9a028563c?q=80&w=500"},
    {"name": "Ice-cream", "price": 100, "category": "Fast Food", "image": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=500"},
    {"name": "Sushi", "price": 200, "category": "Healthy", "image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=500"},
    {"name": "Fried-Rice", "price": 150, "category": "Fast Food", "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500"},
    {"name": "Double Cheeseburger", "price": 320, "category": "Burgers", "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500"},
    {"name": "Mango Lassi", "price": 120, "category": "Drinks", "image": "https://images.unsplash.com/photo-1719239948819-0afeced16184?q=80&w=500"},
    {"name": "Spicy Ramen Bowl", "price": 280, "category": "Noodles", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=500"},
    {"name": "Chicken Tacos", "price": 260, "category": "Mexican", "image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=500"},
]

for item in menu_data:
    exists = db.query(MenuItem).filter(MenuItem.name == item["name"]).first()
    if not exists:
        db.add(MenuItem(**item))

db.commit()
db.close()
print("Seeded menu items!")