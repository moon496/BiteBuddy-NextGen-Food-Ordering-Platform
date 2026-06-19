# Restaurant Food Ordering System - Project Overview

## Executive Summary
Restaurant Food Ordering System is a web-based ordering platform that lets restaurants manage digital menus and lets customers place dine-in, takeaway, and delivery orders with real-time status tracking. The product combines menu management, order processing, payments, and basic sales analytics to reduce order errors and reduce dependence on high-commission third-party platforms.

## Project Background
Stakeholder interviews and observation of restaurant operations showed fragmented order-taking workflows: paper tickets for dine-in, phone calls for takeaway, and third-party apps for delivery. This fragmentation causes order errors, delayed kitchen communication, and lost margin to commission fees.

## Business Problem
Current restaurant operations lose revenue and customer trust because:
1. Orders are taken manually and frequently miscommunicated.
2. Customers have no visibility into order status once placed.
3. Sales and menu performance data is not centrally tracked.

## Proposed Solution
Deliver a centralized restaurant ordering system with:
- Order lifecycle management (place, confirm, prepare, ready, complete)
- Digital menu management with categories, pricing, and availability
- Real-time order status tracking and notifications
- Online payment plus cash-on-pickup/delivery support
- Dashboard insights on sales and order trends
- JWT-secured Node.js (Express) backend, React (TypeScript) frontend, PostgreSQL relational database, Stripe payment integration, WebSocket-based real-time updates, Dockerized deployment

## Project Scope
| In Scope | Description |
|---|---|
| User account lifecycle | Register, login, JWT sessions, profile management |
| Menu management | Add/edit/remove items, categories, pricing, availability |
| Order management | Place order, status transitions, order history |
| Order types | Dine-in, takeaway, delivery |
| Payments | Online payment integration, cash on pickup/delivery |
| Real-time tracking | Live order status updates for customers and staff |
| Analytics | Sales dashboard, popular items, order volume trends |
| Platform delivery | REST APIs, responsive UI, containerized deployment |

## Stakeholders
| Stakeholder Group | Primary Interest |
|---|---|
| Customers | Accurate orders, order visibility, convenient payment |
| Restaurant Owner/Manager | Revenue growth, error reduction, sales visibility |
| Front-of-house/Cashier Staff | Simple order confirmation, accurate billing |
| Kitchen Staff | Clear, real-time order details |
| System Admin | Menu/staff management, system reliability |
| Engineering Team | Build quality, maintainability, scalability |
| QA | Reliability, order accuracy validation |
| Course Instructor/Evaluator | Documentation quality, demonstrable understanding |

## Business Value
| Value Driver | Expected Outcome |
|---|---|
| Order accuracy | Fewer order errors and re-makes |
| Faster service | Reduced wait time during peak hours |
| Reduced platform dependency | Lower commission costs vs. third-party apps |
| Sales visibility | Data-driven menu and staffing decisions |

## Success Metrics
| Metric ID | Metric | Target (6 months) |
|---|---|---|
| SM-01 | Order error rate | <= 3% of total orders |
| SM-02 | Average order processing time | <= 5 minutes from placement to kitchen confirmation |
| SM-03 | Customer repeat order rate | >= 40% |
| SM-04 | Online payment success rate | >= 98% |
| SM-05 | P95 order status update latency | <= 2 seconds |

## Assumptions
1. Restaurant staff have access to a tablet/computer with internet connectivity.
2. Customers ordering online have access to a smartphone or computer.
3. MVP targets a single restaurant location before multi-branch support.

## Constraints
| Constraint | Impact |
|---|---|
| Fixed semester/project timeline | Strict prioritization required |
| Limited initial engineering capacity (3-member team) | Scope disciplined to MVP |
| No paid third-party API budget beyond free tiers | Payment/notification options limited to free-tier services |

## Out Of Scope
1. Multi-restaurant/franchise marketplace support (future phase).
2. Native iOS/Android apps (web-responsive first).
3. Delivery rider dispatch and logistics optimization.