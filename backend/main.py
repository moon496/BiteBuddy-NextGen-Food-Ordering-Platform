from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from order_status import router as order_status_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(order_status_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to BiteBuddy API"}

@app.get("/menu")
def get_menu():
    return {"items": ["Pizza", "Burger", "Pasta", "Salad"]}
