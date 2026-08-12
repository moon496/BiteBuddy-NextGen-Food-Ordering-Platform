# BiteBuddy — API Contract

This document defines every API endpoint in the BiteBuddy backend: URL, HTTP method, request body, and expected response. It exists so frontend and backend developers build against the same shared interface.

**Base URL:** `${VITE_API_URL}` (set per environment — Codespaces / Render / localhost)

**Auth:** Protected routes require header `Authorization: Bearer <token>` (JWT from `/auth/login`).

---

## Error Response Format

All errors return a JSON body with a `detail` field, and use standard HTTP status codes.

| Status | Meaning | Example body |
|---|---|---|
| 400 | Bad Request — invalid input | `{ "detail": "Cart is empty" }` |
| 401 | Unauthorized — missing/invalid/expired token | `{ "detail": "Invalid or expired token" }` |
| 403 | Forbidden — valid token, no permission (e.g. not Admin, banned account) | `{ "detail": "Admin access required" }` |
| 404 | Not Found | `{ "detail": "Order not found" }` |
| 500 | Internal Server Error | `{ "detail": "Internal Server Error" }` |

Some endpoints return a structured `detail` object instead of a string (e.g. invalid status updates return `{ "detail": { "error": "Invalid status", "allowed_statuses": [...] } }`).

---

## Auth (`/auth`)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{ username, email, password, role }` | `201` User object |
| POST | `/auth/login` | No | `{ email, password }` | `{ access_token, token_type, user: {id, username, email, role} }` |
| GET | `/auth/me` | Yes | — | `{ id, username, email, role }` |
| PUT | `/auth/me` | Yes | `{ username, email }` | Updated User object |
| DELETE | `/auth/me` | Yes | — | `{ message }` |
| POST | `/auth/logout` | Yes | — | `{ message }` |

**Errors:** `400` duplicate username/email · `401` invalid credentials / missing or expired token · `403` account banned · `404` user not found.

---

## Menu

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/menu-items` | No | — | `[ { id, name, price, category, image } ]` (public menu listing) |
| GET | `/admin/menu` | Admin | — | `[ { id, name, price, category, image } ]` |
| POST | `/admin/menu` | Admin | `{ name, price, category?, image? }` | `201 { message, id }` |
| DELETE | `/admin/menu/{item_id}` | Admin | — | `{ message }` |

**Errors:** `403` not admin · `404` menu item not found.

---

## Cart (`/cart`)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/cart/{user_id}` | No | — | `{ items: [{ id, item_id, item_name, category, image, price, quantity, subtotal }] }` |
| POST | `/cart` | No | `{ user_id, item_id, quantity? }` | `201` cart item object |
| PUT | `/cart/{user_id}/{cart_item_id}` | No | `{ quantity }` | Updated cart item object |
| DELETE | `/cart/{user_id}/{cart_item_id}` | No | — | `{ message }` |

**Errors:** `404` menu item / cart item not found.

> Note: cart is currently held in-memory (`cart_db` dict), not a DB table.

---

## Orders (`/orders`)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/orders/create` | No | Query params: `user_id`, `address_id?` | `201 { message, order_id, total }` |
| GET | `/orders/user/{user_id}` | No | — | `{ orders: [{ id, status, total_amount, created_at }] }` |
| GET | `/orders/{order_id}` | No | — | `{ id, status, total_amount, items: [{name, quantity, price}] }` |
| GET | `/orders/{order_id}/status` | No | — | `{ order_id, status, status_sequence, current_step }` |
| PATCH | `/orders/{order_id}/status` | No | `{ status }` | `{ order_id, status }` |

**Status sequence:** `Pending → Confirmed → Preparing → Out for Delivery → Delivered`

**Errors:** `400` empty cart / invalid status · `403` order owner's account is banned · `404` order not found.

---

## Payments (`/payments`)

Simulated gateway (bKash/card sandbox not available yet — mocked ~80% success rate; drop-in swap later).

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/payments/initiate` | No | `{ order_id, amount, method: "bkash"\|"card"\|"cod" }` | `201` payment object `{ payment_id, order_id, amount, method, status: "pending" }` |
| POST | `/payments/{payment_id}/callback` | No | `{ force_result?: "success"\|"failure" }` (optional, for testing) | Payment object with `status: "paid"` or `"failed"` |
| GET | `/payments/{payment_id}` | No | — | Payment object |

**Errors:** `400` invalid method / amount ≤ 0 / already processed · `404` order or payment not found.

---

## Coupons (`/coupons`)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/coupons` | No | — | `{ coupons: [{ code, type, value, max_discount?, active }] }` (public active coupons) |
| GET | `/coupons/my` | Yes | — | `[ { id, code, discount_type, value, max_discount } ]` (user's unused coupons) |
| POST | `/coupons/apply` | Optional | `{ code, subtotal }` | `{ code, discount_type, discount_value, subtotal, discount_amount, total }` |
| POST | `/coupons/redeem/{user_coupon_id}` | Yes | — | `{ message }` |

**Errors:** `400` subtotal ≤ 0 · `404` invalid/expired coupon.

---

## Reviews (`/reviews`)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/reviews/{item_id}` | No | — | `{ item_id, average_rating, count, reviews: [...] }` |
| POST | `/reviews` | No | `{ item_id, user_id, rating (1-5), comment? }` | `201` review object |
| DELETE | `/reviews/{item_id}/{review_id}` | No | — | `{ message }` |

**Errors:** `404` review not found.

---

## Addresses (`/addresses`)

| Method | Path | Auth | Request Body | Response |
|---|---|---|---|---|
| GET | `/addresses` | Yes | — | `{ addresses: [...] }` |
| POST | `/addresses` | Yes | `{ label, address_line, city, phone }` | Created address object |
| PUT | `/addresses/{address_id}` | Yes | `{ label, address_line, city, phone }` | Updated address object |
| DELETE | `/addresses/{address_id}` | Yes | — | `{ message }` |

---

## Admin (`/admin`)

All routes require `Admin` role (`403` otherwise).

| Method | Path | Request Body | Response |
|---|---|---|---|
| GET | `/admin/orders` | — | `{ orders: [...], status_sequence }` |
| GET | `/admin/orders/user/{user_id}` | — | `[ { order_id, status, total_amount, created_at } ]` |
| PATCH | `/admin/orders/{order_id}/status` | `{ status }` | `{ order_id, status }` |
| PATCH | `/admin/orders/{order_id}/mark-failed` | — | `{ order_id, status, user_id, username, failed_delivery_count, is_banned }` |
| GET | `/admin/revenue` | — | `{ total_revenue, today_revenue, month_revenue, total_orders }` |
| GET | `/admin/menu` | — | `[ menu items ]` |
| POST | `/admin/menu` | `{ name, price, category?, image? }` | `201 { message, id }` |
| DELETE | `/admin/menu/{item_id}` | — | `{ message }` |
| GET | `/admin/admins` | — | `[ { id, username, email } ]` |
| POST | `/admin/admins` | `{ username, email, password }` | `201 { message }` |
| DELETE | `/admin/admins/{admin_id}` | — | `{ message }` |
| GET | `/admin/banned-users` | — | `[ { id, username, email, failed_delivery_count } ]` |
| PATCH | `/admin/users/{user_id}/unban` | — | `{ message }` |
| POST | `/admin/coupons` | `{ user_id, code, discount_type, value, max_discount? }` | `201 { message }` |
| GET | `/admin/coupons` | — | `[ { id, user_id, username, code, discount_type, value, used } ]` |
| DELETE | `/admin/coupons/{coupon_id}` | — | `{ message }` |

**Errors:** `400` invalid status / duplicate admin / self-removal attempt · `403` not admin · `404` order / user / coupon / menu item not found.
