from datetime import datetime, timedelta
from database import SessionLocal, Base, engine
from model import User, MenuItem, Order, OrderItem

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Demo customer user (order er jonno lagbe, login korar dorkar nai)
demo_user = db.query(User).filter(User.username == "demo_customer").first()
if not demo_user:
    demo_user = User(
        username="demo_customer",
        email="demo_customer@bitebuddy.com",
        hashed_password="not_a_real_hash",
        role="User",
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

menu_items = db.query(MenuItem).all()
if not menu_items:
    print("Menu items nai — age seed.py chalao!")
    db.close()
    exit()

def make_order(days_ago, status, items):
    total = sum(mi.price * qty for mi, qty in items)
    order = Order(
        user_id=demo_user.id,
        status=status,
        total_amount=total,
        created_at=datetime.utcnow() - timedelta(days=days_ago),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    for mi, qty in items:
        db.add(OrderItem(
            order_id=order.id,
            item_id=mi.id,
            item_name=mi.name,
            quantity=qty,
            price=mi.price,
        ))
    db.commit()
    return order

existing = db.query(Order).filter(Order.user_id == demo_user.id).count()
if existing == 0:
    make_order(0, "Pending", [(menu_items[0], 2), (menu_items[1], 1)])       # aajker order
    make_order(1, "Confirmed", [(menu_items[2], 1)])
    make_order(3, "Delivered", [(menu_items[3], 3)])
    make_order(10, "Delivered", [(menu_items[4], 1), (menu_items[5], 2)])   # ei month er order
    print("Dummy orders seeded!")
else:
    print("Demo orders already exist, skip korlam.")

db.close()