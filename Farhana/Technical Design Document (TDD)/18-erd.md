# Restaurant Food Ordering System - Entity Relationship Diagram (ERD)

> **Note:** This ERD is a **logical domain model** used for requirements analysis and technical design communication.
> The physical database implementation is documented in [21-database-design.md](21-database-design.md).

---

# Entity Overview

| Entity | Purpose |
|---|---|
| User | Stores customer and administrator account information |
| Category | Organizes food items into categories |
| FoodItem | Stores menu item information |
| Cart | Represents customer shopping carts |
| CartItem | Stores individual items inside carts |
| Order | Stores customer order information |
| OrderItem | Stores food items belonging to orders |
| Payment | Stores payment transaction details |
| Review | Stores customer ratings and feedback |

---

# Entity Attributes

## User

`id, full_name, email, password_hash, phone_number, address, role, is_active, created_at, updated_at`

---

## Category

`id, name, description, created_at, updated_at`

---

## FoodItem

`id, category_id, name, description, price, image_url, availability_status, created_at, updated_at`

---

## Cart

`id, user_id, total_amount, created_at, updated_at`

---

## CartItem

`id, cart_id, food_item_id, quantity, subtotal`

---

## Order

`id, user_id, order_date, total_amount, order_status, delivery_address, delivery_time, created_at, updated_at`

---

## OrderItem

`id, order_id, food_item_id, quantity, price`

---

## Payment

`id, order_id, payment_method, transaction_id, amount, payment_status, payment_date`

---

## Review

`id, user_id, food_item_id, rating, comment, created_at`

---

# Relationship Rules

1. One **User** can have many **Orders**.
2. One **User** can have one active **Cart**.
3. One **User** can submit many **Reviews**.
4. One **Category** can contain many **FoodItems**.
5. One **Cart** contains many **CartItems**.
6. One **FoodItem** can belong to many **CartItems**.
7. One **Order** contains many **OrderItems**.
8. One **FoodItem** can appear in many **OrderItems**.
9. One **Order** has one **Payment**.
10. One **FoodItem** can receive many **Reviews**.

---

# Mermaid ER Diagram

```mermaid
erDiagram

    USER ||--o{ ORDER : places
    USER ||--|| CART : owns
    USER ||--o{ REVIEW : writes

    CATEGORY ||--o{ FOOD_ITEM : contains

    CART ||--o{ CART_ITEM : includes
    FOOD_ITEM ||--o{ CART_ITEM : selected_in

    ORDER ||--o{ ORDER_ITEM : contains
    FOOD_ITEM ||--o{ ORDER_ITEM : ordered_as

    ORDER ||--|| PAYMENT : paid_by

    FOOD_ITEM ||--o{ REVIEW : receives

    USER {
        bigint id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar phone_number
        varchar address
        varchar role
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    CATEGORY {
        bigint id PK
        varchar name
        text description
        datetime created_at
        datetime updated_at
    }

    FOOD_ITEM {
        bigint id PK
        bigint category_id FK
        varchar name
        text description
        decimal price
        varchar image_url
        boolean availability_status
        datetime created_at
        datetime updated_at
    }

    CART {
        bigint id PK
        bigint user_id FK
        decimal total_amount
        datetime created_at
        datetime updated_at
    }

    CART_ITEM {
        bigint id PK
        bigint cart_id FK
        bigint food_item_id FK
        int quantity
        decimal subtotal
    }

    ORDER {
        bigint id PK
        bigint user_id FK
        datetime order_date
        decimal total_amount
        varchar order_status
        varchar delivery_address
        datetime delivery_time
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint food_item_id FK
        int quantity
        decimal price
    }

    PAYMENT {
        bigint id PK
        bigint order_id FK
        varchar payment_method
        varchar transaction_id
        decimal amount
        varchar payment_status
        datetime payment_date
    }

    REVIEW {
        bigint id PK
        bigint user_id FK
        bigint food_item_id FK
        int rating
        text comment
        datetime created_at
    }
```

---

# Cardinality Summary

| Relationship | Cardinality |
|---|---|
| User → Order | One-to-Many |
| User → Review | One-to-Many |
| User → Cart | One-to-One |
| Category → FoodItem | One-to-Many |
| Cart → CartItem | One-to-Many |
| FoodItem → CartItem | One-to-Many |
| Order → OrderItem | One-to-Many |
| FoodItem → OrderItem | One-to-Many |
| Order → Payment | One-to-One |
| FoodItem → Review | One-to-Many |

---

# Business Rules

1. A customer must be registered before placing orders.
2. Each food item belongs to exactly one category.
3. A customer can place multiple orders.
4. Each order may contain multiple food items.
5. Payment information is associated with a single order.
6. Customers can provide reviews only for food items.
7. Food items marked unavailable cannot be added to the cart.
8. Order status can be one of:

- Pending
- Confirmed
- Preparing
- Out for Delivery
- Delivered
- Cancelled

---

# Related Documents

- [19-system-design.md](19-system-design.md)
- [20-tdd.md](20-tdd.md)
- [21-database-design.md](21-database-design.md)
- [22-api-design.md](22-api-design.md)