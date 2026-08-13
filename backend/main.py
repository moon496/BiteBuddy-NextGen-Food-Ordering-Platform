from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from routes.cart_routes import router as cart_router
from database import Base, engine, get_db, SessionLocal
from model import User, MenuItem, Order
from migrations import run_migrations

from routes.order_routes import router as order_router
from routes.auth_routes import router as auth_router
from routes.coupon_routes import router as coupon_router
from routes.address_routes import router as address_router
from routes.admin_routes import router as admin_router
from routes.review_routes import router as review_router
from routes.payment_routes import router as payment_router

import seed as menu_seed
import seed_admin
import seed_orders

ORDER_STATUS_SEQUENCE = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]


def advance_order_statuses():
    db = SessionLocal()
    try:
        orders = db.query(Order).filter(Order.status != "Delivered").all()
        for order in orders:
            if order.status in ORDER_STATUS_SEQUENCE:
                idx = ORDER_STATUS_SEQUENCE.index(order.status)
                if idx < len(ORDER_STATUS_SEQUENCE) - 1:
                    order.status = ORDER_STATUS_SEQUENCE[idx + 1]
        db.commit()
        if orders:
            print(f"[scheduler] Advanced status for {len(orders)} order(s).")
    except Exception as e:
        print(f"[scheduler] Error advancing order statuses: {e}")
    finally:
        db.close()


def run_startup_seeds():
    """Backend chalu hobar shomoy check kore — data na thakle seed kore dey.
       Render restart/sleep-wake er por o data thakbe."""
    try:
        menu_seed.seed()
    except Exception as e:
        print(f"[startup-seed] menu seed error: {e}")
    try:
        seed_admin.seed()
    except Exception as e:
        print(f"[startup-seed] admin seed error: {e}")
    try:
        seed_orders.seed()
    except Exception as e:
        print(f"[startup-seed] orders seed error: {e}")


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    run_startup_seeds()
    scheduler.add_job(advance_order_statuses, "interval", minutes=5, id="advance_order_statuses")
    scheduler.start()
    yield
    # shutdown
    scheduler.shutdown()


app = FastAPI(lifespan=lifespan)

app.include_router(cart_router)
app.include_router(order_router)
app.include_router(auth_router)
app.include_router(coupon_router)
app.include_router(address_router)
app.include_router(admin_router)
app.include_router(review_router)
app.include_router(payment_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bite-buddy-next-gen-food-ordering-p.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.app\.github\.dev|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to BiteBuddy API"}


@app.get("/menu-items")
def get_menu_items(db: Session = Depends(get_db)):
    items = db.query(MenuItem).all()
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "price": item.price,
                "category": item.category,
                "image": item.image,
            }
            for item in items
        ]
    }