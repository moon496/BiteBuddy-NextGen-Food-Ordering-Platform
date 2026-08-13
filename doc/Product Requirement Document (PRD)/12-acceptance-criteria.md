# 12 — Acceptance Criteria
## Project: Restaurant Food Ordering System

---

## What is Acceptance Criteria?
Acceptance criteria are specific conditions that must be met for a user story to be considered **complete and working correctly**. They are written in a **Given / When / Then** format.

---

## AC-01: Customer Registration (US-01)

**User Story:** As a customer, I want to register with my email and password.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The customer is on the registration page | They enter a valid email and password (min 8 characters) and submit | A new account is created and they are redirected to the home page |
| 2 | The customer is on the registration page | They enter an email that is already registered | An error message is shown: "This email is already in use" |
| 3 | The customer is on the registration page | They leave the email or password field empty | Form validation shows: "This field is required" |
| 4 | The customer is on the registration page | They enter a password shorter than 8 characters | Error shown: "Password must be at least 8 characters" |

---

## AC-02: Customer Login (US-02)

**User Story:** As a customer, I want to log in to my account.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The customer has a registered account | They enter correct email and password | They are logged in and redirected to the home/menu page |
| 2 | The customer has a registered account | They enter incorrect password | Error shown: "Invalid email or password" |
| 3 | The customer is on the login page | They leave fields blank and submit | Form shows: "Please fill in all fields" |
| 4 | The customer is logged in | They click "Logout" | Session ends and they are redirected to the login page |

---

## AC-03: Browse Menu (US-06, US-07)

**User Story:** As a customer, I want to browse the menu by category and see item details.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The customer is on the menu page | The page loads | All food categories are displayed (e.g., Starters, Main Course, Drinks) |
| 2 | The customer clicks a category | The category is selected | Only items belonging to that category are shown |
| 3 | The customer clicks on a food item | The item detail page opens | Name, description, price, and photo are displayed clearly |
| 4 | The admin has marked an item as unavailable | The customer views the menu | The item is shown with an "Unavailable" label and cannot be added to cart |

---

## AC-04: Search Food Items (US-08)

**User Story:** As a customer, I want to search for a specific food item by name.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The customer is on the menu page | They type "Biryani" in the search box | All items with "Biryani" in the name are displayed |
| 2 | The customer searches for an item | The item exists | Results appear within 1 second |
| 3 | The customer searches for a non-existent item | No matching results found | A message is shown: "No items found. Try a different search." |
| 4 | The customer clears the search box | Search is cleared | Full menu is displayed again |

---

## AC-05: Add to Cart (US-11, US-12, US-13)

**User Story:** As a customer, I want to add items to my cart and manage quantities.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The customer views a food item | They click "Add to Cart" | The item is added and cart item count increases by 1 |
| 2 | The item is already in the cart | The customer clicks "+" | Item quantity increases by 1 |
| 3 | The item quantity is more than 1 | The customer clicks "-" | Quantity decreases by 1 |
| 4 | The item quantity is 1 | The customer clicks "-" | Item is removed from the cart |
| 5 | The customer is viewing the cart | They click "Remove" on an item | The item is removed from the cart immediately |
| 6 | The cart is empty | Customer visits cart page | A message is shown: "Your cart is empty. Start ordering!" |

---

## AC-06: Special Instructions (US-14)

**User Story:** As a customer, I want to add special instructions to my order.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The customer is in the cart or checkout | They type in the "Special Instructions" field | The note is saved with the order |
| 2 | The admin views an order | The customer had added a note | The note is displayed clearly next to the order |
| 3 | The customer leaves the field blank | They proceed to checkout | The order is placed normally with no instruction |

---

## AC-07: Place Order & Payment (US-15, US-17, US-18, US-19)

**User Story:** As a customer, I want to review my order and complete payment.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | The cart has items | Customer clicks "Checkout" | A summary shows all items, quantities, and total price |
| 2 | Customer selects "Online Payment" | They complete payment via SSL Commerz | A success page is shown with order ID and confirmation |
| 3 | Customer selects "Cash on Delivery" | They confirm the order | Order is placed and marked as "Pending Payment" |
| 4 | Payment fails | Customer attempts online payment | Error is shown: "Payment failed. Please try again." |
| 5 | Order is confirmed | System processes it | Customer receives an SMS/email confirmation |

---

## AC-08: Order Tracking (US-21, US-22)

**User Story:** As a customer, I want to see the live status of my order.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | Customer has placed an order | They visit "My Orders" | Current order status is displayed (e.g., "Preparing") |
| 2 | Admin updates an order status | Customer is on the tracking page | Status updates without needing to refresh (or within 30 seconds) |
| 3 | Order status changes to "Ready" | Customer has notifications enabled | Customer receives a notification: "Your order is ready!" |
| 4 | Order is delivered | Status changes to "Delivered" | Customer is prompted to leave a review |

---

## AC-09: Admin — Add Menu Item (US-24)

**User Story:** As an admin, I want to add new food items to the menu.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | Admin is on "Add Item" page | They fill all required fields and submit | Item is added to the menu and visible to customers immediately |
| 2 | Admin submits without a price | Required field is missing | Error shown: "Price is required" |
| 3 | Admin uploads an image larger than 2MB | Image is uploaded | System shows: "Image must be under 2MB" |
| 4 | Admin adds a valid item | Item is saved | Admin is redirected to the menu management list with a success message |

---

## AC-10: Admin — Manage Orders (US-29, US-30)

**User Story:** As an admin, I want to view and update order status.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | Admin is on the Orders page | A new order comes in | Order appears in the "Pending" list in real time (or within 30 seconds) |
| 2 | Admin clicks "Confirm Order" | Order status is updated | Status changes to "Confirmed" and customer is notified |
| 3 | Admin clicks "Mark as Preparing" | Order is being cooked | Status changes to "Preparing" |
| 4 | Admin filters by "Pending" | Filter is applied | Only pending orders are displayed |

---

## AC-11: Kitchen Display (US-36, US-37, US-38)

**User Story:** As kitchen staff, I want to see and manage orders on the kitchen display.

| # | Given | When | Then |
|---|-------|------|------|
| 1 | An order is confirmed by admin | Kitchen display screen is open | The order appears automatically on the KDS |
| 2 | Kitchen staff reads an order | Special instructions are present | Instructions are shown clearly below item list |
| 3 | Kitchen staff clicks "Mark as Ready" | Food is prepared | Status updates to "Ready" and customer/admin is notified |

---

## Summary Table

| AC ID | Feature | User Story Ref | Status |
|-------|---------|----------------|--------|
| AC-01 | Registration | US-01 | Defined |
| AC-02 | Login | US-02 | Defined |
| AC-03 | Browse Menu | US-06, US-07 | Defined |
| AC-04 | Search | US-08 | Defined |
| AC-05 | Cart Management | US-11–13 | Defined |
| AC-06 | Special Instructions | US-14 | Defined |
| AC-07 | Order & Payment | US-15–19 | Defined |
| AC-08 | Order Tracking | US-21, US-22 | Defined |
| AC-09 | Admin Menu Mgmt | US-24 | Defined |
| AC-10 | Admin Order Mgmt | US-29, US-30 | Defined |
| AC-11 | Kitchen Display | US-36–38 | Defined |
