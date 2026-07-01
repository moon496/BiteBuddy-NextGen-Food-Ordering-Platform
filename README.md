# BiteBuddy-NextGen-Food-Ordering-Platform
## Order Status Tracking Feature

This feature lets customers track the real-time status of their order, from
the moment it's placed to delivery.

### Backend (FastAPI)
| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/orders/{order_id}/status` | Returns the order's current status and full status sequence |
| PATCH | `/orders/{order_id}/status` | Updates an order's status (used for testing/demo) |

Order status moves through this sequence:
`Pending → Confirmed → Preparing → Out for Delivery → Delivered`

### Frontend (React)
The `OrderStatus` component (`frontend/src/components/OrderStatus.jsx`) lets a
customer enter an Order ID and see:
- The order's current status, clearly highlighted
- All previous statuses marked as completed
- Live updates every 5 seconds via polling, without needing a page refresh

### Try it locally
```bash
# backend
cd backend
uvicorn main:app --reload

# frontend (separate terminal)
cd frontend
npm install
npm run dev
```
Test with sample order IDs: `1001`, `1002`, `1003`.