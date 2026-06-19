# Restaurant Food Ordering System - Use Cases

## UC-01 Register User
| Field | Details |
|---|---|
| Actor | Guest User |
| Preconditions | User is not registered |
| Primary Flow | 1) User opens registration page 2) Enters name, email, phone number, and password 3) Submits form 4) System validates input and creates account 5) Success message displayed |
| Alternative Flow | A1: Email already exists → show error message. A2: Invalid input → validation error displayed. |
| Post Conditions | User account is created |
| Related FR | FR-001, FR-002 |

## UC-02 Login
| Field | Details |
|---|---|
| Actor | Registered User |
| Preconditions | Valid account exists |
| Primary Flow | 1) User enters email and password 2) System authenticates credentials 3) User gains access to the system |
| Alternative Flow | A1: Invalid credentials → access denied. |
| Post Conditions | Authenticated session established |
| Related FR | FR-003, FR-004 |

## UC-03 Browse Menu
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | Food items are available |
| Primary Flow | 1) User opens menu page 2) System displays categories and food items 3) User views food details |
| Alternative Flow | A1: No food items available → display notification. |
| Post Conditions | User can select desired food items |
| Related FR | FR-007, FR-008 |

## UC-04 Search Food Item
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | Menu items exist |
| Primary Flow | 1) User enters keyword 2) System searches food items 3) Matching results are displayed |
| Alternative Flow | A1: No matching item found → display message. |
| Post Conditions | Search results shown |
| Related FR | FR-009, FR-010 |

## UC-05 Add Item to Cart
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | User has selected food item |
| Primary Flow | 1) User clicks "Add to Cart" 2) System adds item to cart 3) Cart total updated |
| Alternative Flow | A1: Item unavailable → show notification. |
| Post Conditions | Item stored in cart |
| Related FR | FR-011, FR-012, FR-014 |

## UC-06 Remove Item from Cart
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | Cart contains at least one item |
| Primary Flow | 1) User selects item to remove 2) System removes item 3) Total amount recalculated |
| Alternative Flow | A1: Item already removed → no action required. |
| Post Conditions | Cart updated |
| Related FR | FR-013, FR-014 |

## UC-07 Place Order
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | Cart contains items |
| Primary Flow | 1) User proceeds to checkout 2) Selects delivery address 3) Chooses payment method 4) Confirms order 5) System generates order ID and stores order |
| Alternative Flow | A1: Empty cart → order not allowed. A2: Payment failure → order cancelled. |
| Post Conditions | Order successfully created |
| Related FR | FR-015, FR-016, FR-017, FR-018, FR-019 |

## UC-08 View Order History
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | User has previously placed orders |
| Primary Flow | 1) User opens order history page 2) System retrieves past orders 3) Orders are displayed |
| Alternative Flow | A1: No previous orders → display empty history message. |
| Post Conditions | User can review previous orders |
| Related FR | FR-020 |

## UC-09 Track Order Status
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | Active order exists |
| Primary Flow | 1) User selects order 2) System retrieves current status 3) Status displayed (Pending, Preparing, Delivered) |
| Alternative Flow | A1: Order not found → error displayed. |
| Post Conditions | Customer is informed about order progress |
| Related FR | FR-021, FR-022 |

## UC-10 Manage Menu
| Field | Details |
|---|---|
| Actor | Administrator |
| Preconditions | Admin is authenticated |
| Primary Flow | 1) Admin adds, updates, or deletes food items 2) System saves changes 3) Updated menu displayed |
| Alternative Flow | A1: Invalid information → validation error. |
| Post Conditions | Menu updated successfully |
| Related FR | FR-023, FR-024, FR-025, FR-026 |

## UC-11 Manage Orders
| Field | Details |
|---|---|
| Actor | Administrator |
| Preconditions | Customer orders exist |
| Primary Flow | 1) Admin views orders 2) Updates order status 3) System saves changes and notifies customer |
| Alternative Flow | A1: Invalid order ID → error message. |
| Post Conditions | Order status updated |
| Related FR | FR-027, FR-028, FR-029 |

## UC-12 Generate Sales Report
| Field | Details |
|---|---|
| Actor | Administrator |
| Preconditions | Order records are available |
| Primary Flow | 1) Admin requests report 2) System retrieves sales data 3) Report generated and displayed |
| Alternative Flow | A1: No sales records found → empty report generated. |
| Post Conditions | Sales report available |
| Related FR | FR-030, FR-031, FR-040 |

## UC-13 Submit Review
| Field | Details |
|---|---|
| Actor | Customer |
| Preconditions | Customer has completed an order |
| Primary Flow | 1) Customer selects completed order 2) Provides rating and comments 3) System stores review |
| Alternative Flow | A1: Invalid rating → validation error. |
| Post Conditions | Review saved successfully |
| Related FR | FR-032, FR-033 |