# Restaurant Food Ordering System - Non-Functional Requirements

| NFR ID | Category | Requirement (Measurable Target) |
|---|---|---|
| NFR-001 | Performance | System shall support at least 1,000 concurrent users without significant degradation. |
| NFR-002 | Performance | Average response time for menu, cart, and order APIs shall be <= 500 ms under normal load. |
| NFR-003 | Performance | Order confirmation shall be completed within <= 3 seconds for 95% of requests. |
| NFR-004 | Availability | Monthly system availability shall be >= 99.9%. |
| NFR-005 | Availability | Planned maintenance downtime shall not exceed 2 hours per month. |
| NFR-006 | Reliability | Failed order transactions shall be retried automatically up to 3 times. |
| NFR-007 | Reliability | No confirmed customer order shall be lost after successful submission. |
| NFR-008 | Reliability | Database backup restoration tests shall be performed successfully at least once per month. |
| NFR-009 | Scalability | System shall support 3 times the baseline traffic during peak meal hours. |
| NFR-010 | Security | All authenticated APIs shall require valid user credentials. |
| NFR-011 | Security | User sessions shall expire automatically after 30 minutes of inactivity. |
| NFR-012 | Security | Sensitive information shall be transmitted using HTTPS (TLS 1.2 or higher), and passwords shall be stored in encrypted form. |
| NFR-013 | Security | System shall record failed login attempts and unauthorized access attempts. |
| NFR-014 | Security | Critical security vulnerabilities shall be fixed before deployment. |
| NFR-015 | Accessibility | The user interface shall comply with WCAG 2.1 AA accessibility standards for essential functions. |
| NFR-016 | Accessibility | All interactive components shall support keyboard navigation. |
| NFR-017 | Maintainability | Source code shall maintain at least 80% unit test coverage. |
| NFR-018 | Maintainability | Future updates shall preserve backward compatibility within minor releases. |
| NFR-019 | Maintainability | Static code analysis shall report no critical issues before release. |
| NFR-020 | Observability | System logs and monitoring data shall be available for all critical operations. |
| NFR-021 | Observability | Critical system failures shall trigger alerts within 2 minutes. |
| NFR-022 | Portability | Application shall run consistently across development, testing, and production environments. |
| NFR-023 | Portability | Deployment process shall be reproducible using Docker containers. |
| NFR-024 | Compliance | Customer account deletion requests shall be processed within 30 days. |
| NFR-025 | Usability | A first-time customer shall be able to place an order within 5 minutes during usability testing. |
| NFR-026 | Usability | Navigation between menu, cart, and checkout pages shall require no more than three clicks. |
| NFR-027 | Compatibility | System shall support the latest versions of Chrome, Firefox, Edge, and Safari browsers. |
| NFR-028 | Compatibility | User interface shall be responsive on desktop, tablet, and mobile devices. |
| NFR-029 | Data Integrity | All order and payment information shall remain consistent and free from duplication. |
| NFR-030 | Recovery | System shall restore service within 1 hour after a major failure. |

## NFR Verification Approach

| Category | Verification Method |
|---|---|
| Performance / Scalability | Load testing and stress testing |
| Availability / Reliability | Backup, failover, and recovery testing |
| Security | Vulnerability scanning, authentication tests, and penetration testing |
| Accessibility | Automated accessibility tools and manual keyboard testing |
| Maintainability | Unit testing, static code analysis, and code reviews |
| Observability | Log monitoring and alert validation |
| Portability | Docker-based deployment and cross-platform testing |
| Usability | User acceptance testing and usability studies |
| Compatibility | Browser and device compatibility testing |
| Recovery | Disaster recovery and restoration tests |

## Quality Attributes

| Quality Attribute | Description |
|---|---|
| Performance | System should respond quickly and efficiently during peak usage. |
| Reliability | Orders and customer data should be processed accurately without loss. |
| Security | User accounts and sensitive information should be protected from unauthorized access. |
| Availability | System should remain accessible with minimal downtime. |
| Maintainability | Source code and architecture should support easy modification and updates. |
| Scalability | System should handle increased traffic and future growth. |
| Usability | Customers should be able to place orders easily and efficiently. |
| Portability | System should operate consistently across environments. |

## ISO/IEC 25010 Quality Characteristics Mapping

| Characteristic | Related NFR IDs |
|---|---|
| Performance Efficiency | NFR-001, NFR-002, NFR-003, NFR-009 |
| Reliability | NFR-006, NFR-007, NFR-008, NFR-030 |
| Security | NFR-010 – NFR-014 |
| Usability | NFR-015, NFR-016, NFR-025, NFR-026 |
| Maintainability | NFR-017 – NFR-019 |
| Portability | NFR-022, NFR-023 |
| Compatibility | NFR-027, NFR-028 |
| Availability | NFR-004, NFR-005 |
| Data Integrity | NFR-029 |