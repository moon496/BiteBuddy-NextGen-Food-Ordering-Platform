# Restaurant Food Ordering System - Functional Requirements

| FR ID | Description | Priority | Business Justification | Related User Story |
|---|---|---|---|---|
| FR-001 | System shall allow users to register with name, unique email, phone number, and password. | High | Enables secure onboarding | US-001 |
| FR-002 | System shall enforce unique email constraint during account creation. | High | Prevents duplicate accounts | US-001 |
| FR-003 | System shall authenticate users using email and password. | High | Provides secure access | US-002 |
| FR-004 | System shall allow users to log out securely. | High | Prevents unauthorized access | US-003 |
| FR-005 | System shall allow users to update profile information. | Medium | Improves account management | US-004 |
| FR-006 | System shall provide password reset functionality. | High | Enables account recovery | US-005 |
| FR-007 | System shall display restaurant menu categories. | High | Helps users browse food items | US-006 |
| FR-008 | System shall display detailed information of each food item including price, image, and description. | High | Supports informed purchase decisions | US-007 |
| FR-009 | System shall allow users to search food items by name. | High | Improves food discovery | US-008 |
| FR-010 | System shall allow users to filter food items by category. | Medium | Improves browsing efficiency | US-009 |
| FR-011 | System shall allow users to add food items to the cart. | High | Core ordering functionality | US-010 |
| FR-012 | System shall allow users to update item quantities in the cart. | High | Provides order flexibility | US-011 |
| FR-013 | System shall allow users to remove items from the cart. | High | Prevents unwanted purchases | US-012 |
| FR-014 | System shall calculate total order amount automatically. | High | Ensures accurate billing | US-013 |
| FR-015 | System shall allow users to place orders. | High | Main business functionality | US-014 |
| FR-016 | System shall generate a unique order ID for every order. | High | Enables order tracking | US-014 |
| FR-017 | System shall allow users to select delivery address. | High | Supports delivery service | US-015 |
| FR-018 | System shall allow users to choose payment methods (Cash on Delivery, Card, Mobile Banking). | High | Provides payment flexibility | US-016 |
| FR-019 | System shall confirm successful order placement. | High | Enhances user confidence | US-017 |
| FR-020 | System shall allow users to view order history. | High | Enables order reference | US-018 |
| FR-021 | System shall allow users to track order status. | High | Improves customer experience | US-019 |
| FR-022 | System shall notify users when order status changes. | Medium | Keeps customers informed | US-020 |
| FR-023 | System shall allow administrators to add new food items. | High | Supports menu management | US-021 |
| FR-024 | System shall allow administrators to update food item information. | High | Maintains menu accuracy | US-022 |
| FR-025 | System shall allow administrators to remove food items. | High | Keeps menu up to date | US-023 |
| FR-026 | System shall allow administrators to manage food categories. | Medium | Improves menu organization | US-024 |
| FR-027 | System shall allow administrators to view all customer orders. | High | Supports order processing | US-025 |
| FR-028 | System shall allow administrators to update order status. | High | Enables delivery workflow | US-026 |
| FR-029 | System shall allow administrators to cancel orders if necessary. | Medium | Handles exceptional cases | US-027 |
| FR-030 | System shall maintain order records in the database. | High | Supports business reporting | US-028 |
| FR-031 | System shall provide sales reports for administrators. | Medium | Supports business analysis | US-029 |
| FR-032 | System shall allow customers to submit ratings and reviews. | Medium | Improves service quality | US-030 |
| FR-033 | System shall allow administrators to manage customer reviews. | Medium | Prevents inappropriate content | US-031 |
| FR-034 | System shall support multiple users simultaneously. | High | Ensures scalability | US-032 |
| FR-035 | System shall provide responsive interfaces for desktop and mobile devices. | High | Enhances accessibility | US-033 |
| FR-036 | System shall maintain user session during active usage. | High | Improves usability | US-034 |
| FR-037 | System shall validate all user inputs before processing. | High | Prevents invalid data entry | US-035 |
| FR-038 | System shall prevent unauthorized access to admin features. | High | Protects sensitive operations | US-036 |
| FR-039 | System shall store customer and order information securely. | High | Protects user privacy | US-037 |
| FR-040 | System shall provide dashboard statistics for administrators. | Medium | Supports decision making | US-038 |

## Requirement Notes

1. FR IDs are uniquely assigned and referenced in use cases, SRS, TDD, and test cases.
2. High priority requirements are considered essential for the Minimum Viable Product (MVP).
3. Medium priority requirements may be implemented in later development phases.

## SMART Quality Check for Functional Requirements

| SMART Element | Functional Requirement Quality Rule |
|---|---|
| Specific | Each FR clearly defines a system behavior. |
| Measurable | Every requirement can be verified through testing. |
| Achievable | Requirements are feasible within the project scope. |
| Relevant | Each requirement supports business goals and user needs. |
| Timely | High-priority requirements are targeted for the MVP release. |

## MoSCoW Mapping for Functional Requirements

| MoSCoW Category | Priority Mapping | FR Coverage (examples) |
|---|---|---|
| Must Have | High | FR-001–FR-004, FR-007–FR-019, FR-020–FR-021, FR-023–FR-025, FR-027–FR-030, FR-034–FR-039 |
| Should Have | Medium | FR-005, FR-010, FR-022, FR-026, FR-029, FR-031–FR-033, FR-040 |
| Could Have | Low | None |
| Won't Have (this release) | Not in baseline | AI recommendations, table reservation, and chatbot support are deferred to future releases. |