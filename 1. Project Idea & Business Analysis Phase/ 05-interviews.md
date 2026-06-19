# Restaurant Food Ordering System - Interviews

>  Note: Content below is a realistic sample/template to demonstrate format and depth. Replace with notes from interviews you actually conduct before final submission.

## Executive Summary
Interviews were conducted with the restaurant owner, front-of-house staff, and a regular customer to capture first-hand insight into current ordering pain points, directly informing the Problem Statement and later requirements.

## Objective
To understand operational and customer-facing issues in the current order-taking process through direct, open-ended conversation with key stakeholders.

## Interview Participants
| ID | Role | Profile |
|---|---|---|
| P-01 | Restaurant Owner/Manager | Oversees daily operations |
| P-02 | Front-of-house Staff | Takes orders, handles billing |
| P-03 | Regular Customer | Orders 2-3 times per week |

## Interview Guide
| Audience | Key Questions |
|---|---|
| Owner/Manager | How are orders tracked? What complaints are most common? How is sales data tracked? |
| Staff | Walk through the order process. What mistakes happen most, and why? |
| Customer | How do you usually order? Have you had issues? Would you order online if available? |

## Interview Summaries
| Participant | Key Finding | Implication |
|---|---|---|
| P-01 | Paper-based process causes order mix-ups during busy hours; no visibility into best-selling items | Need centralized digital order capture and basic sales reporting |
| P-02 | Mishearing modifications (e.g., "no onions") during rush causes errors; repeated kitchen check-ins waste time | Need structured order entry and real-time kitchen visibility |
| P-03 | Takeaway orders sometimes wrong or not ready on arrival; would use an app for confirmation and ready-time alerts | Need order confirmation and status notifications |

## Key Insights
| Insight ID | Insight | Supporting Participants | Impact on Requirements |
|---|---|---|---|
| I-01 | Manual order-taking is the top error source under load | P-01, P-02 | Drives structured digital order entry requirement |
| I-02 | Staff lose time on manual kitchen coordination | P-02 | Drives real-time order status requirement |
| I-03 | Customers want order confirmation and ready notifications | P-03 | Drives notification/status-tracking requirement |
| I-04 | Owner prioritizes error reduction and sales visibility | P-01 | Drives analytics dashboard requirement |