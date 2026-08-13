# BiteBuddy-NextGen-Food-Ordering-Platform

## Order Status Tracking Feature

This feature lets customers track the real-time status of their order, from the moment it's placed to delivery.

## Backend (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/{order_id}/status` | Returns the order's current status and full status sequence |
| PATCH | `/orders/{order_id}/status` | Updates an order's status (used for testing/demo) |

Order status moves through this sequence:

`Pending → Confirmed → Preparing → Out for Delivery → Delivered`
## Input Validation & Error Handling

This feature improves API reliability by adding input validation and consistent error responses.

### Validation

- Request data is validated using Pydantic schemas.
- Required fields are checked before processing requests.
- Invalid input values return clear validation messages.

### Error Responses

The API provides predictable error responses:

- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication failure
- `404 Not Found` - Requested resource not found
- `422 Validation Error` - Invalid input format or missing required fields

## Frontend (React)

The `OrderStatus` component (`frontend/src/components/OrderStatus.jsx`) lets a customer enter an Order ID and see:

- The order's current status, clearly highlighted
- All previous statuses marked as completed
- Live updates every 5 seconds via polling, without needing a page refresh

## Try it locally / GitHub Codespaces

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

#Backend relode
kill -9 66051 74141
lsof -i :8000
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev -- --host
```

## Testing

Use sample order IDs:

`1001`, `1002`, `1003`

## Notes for GitHub Codespaces

# .env file : 
VITE_API_URL = backend url 

For GitHub Codespaces:

- Make sure backend port `8000` is forwarded and set to **Public** visibility.
- Make sure frontend port `5173` is forwarded and accessible.
- Update the frontend `BASE_URL` with the forwarded backend URL if required.
