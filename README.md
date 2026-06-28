# 📚 ECOMMERCE PROJECT README

## Table of Contents

- [Overview](#overview)
- [Vision](#vision)
- [Mission](#mission)
- [Actors of the System](#actors-of-the-system)
- [Functional Requirements](#functional-requirements)
- [Non Functional Requirements](#non-functional-requirements)
- [ERD](#erd)
- [User Stories](#user-stories)
- [Flow Charts](#flow-charts)
- [Sequence Diagrams](#sequence-diagrams)
- [Assumptions](#assumptions)
- [Tech Stack](#tech-stack)
- [Project Structure](#️-project-structure)
- [Design Patterns](#-design-patterns)
- [Setup & Installation Guide](#setup--installation-guide)
- [API Documentation](#api-documentation)
- [Testing Suite](#-testing-suite)

---

## 🗂️Overview

Foodlify is an e-commerce platform dedicated to revolutionizing the dining and food delivery experience. It connects customers with various restaurants, allowing them to browse menus, manage shopping carts, and place orders intuitively. The system supports robust user management with distinct roles, extensive restaurant menu configurations, real-time order tracking, and secure multi-option payment integrations to ensure a smooth end-to-end transaction.

---

## 🧭Vision

To become the leading and most trusted food-commodity e-commerce ecosystem, providing a seamless bridge between culinary businesses and customers through innovative technology. We aim to make quality food globally accessible while empowering restaurants to scale their reach digitally.

---

## 🎯Mission

To deliver a reliable, intuitive, and scalable food delivery platform that simplifies the ordering process for customers. We strive to provide restaurants with robust tools to manage their menus, track orders, and process payments securely and efficiently.

---

## 👥Actors of the System

1. **End User (Customer)** will be able to:

- Discover many categories of restaurants.
- Create his own cart and adjust it.
- Complete purchasing order with multiple payment methods.
- Real-time tracking of his order status.
- Get high levels of customer service satisfaction.

2. **Restaurant Owner** will be able to:

- Add his restaurant information and its related menus through simple interactive platform.
- View his required orders and interact with them.
- Monitor his progress through analytical and reporting dashboard.

3. **Delivery Rider** will be able to:

- Accept/decline delivery requests
- Navigate to pickup & drop-off
- Update delivery status
- View earnings

4. **System Admin** will be able to:

- Overview and manage entire platform.
- Manage users and restaurants accounts.
- Monitor Orders and disputes.
- Configure promotions.
- access to dashboards and reporting tools.

5. **System** Should be able to:

- Ensure reliable order processing.
- Maintain data consistency.
- Enable real-time communication.

<!-- List and describe all actors (users, systems, roles) that interact with the system. -->

---

## 📦Functional Requirements

### Features:

1. User Registration & Authentication.
2. Restaurant & Menu Management.
3. Cart Management.
4. Order Management.
5. Payment Integration Management.
6. Customer Support Management.
7. Notification & Email Management
8. Dashboard & Reports

### Functions:

### 1. User Registration & Authentication

        1. Create Account /Sign Up
        2. Login
        3. Logout
        4. Forget Password
        5. Enable/Disable Account
        7. User Profile: Show, Edit.

### 2. Restaurant & Menu Management

        1. Add Restaurant
        2. Update Restaurant
        3. Delete Restaurant
        4. View Restaurants - Categories Tabs - Recommendations - Near You - Daily Offers- Top Rating ...
        5. View Single Restaurant
        6. Search Restaurant
        7. Add Menu
        8. Update Menu
        9. Delete Menu
        10. View Menu
        11. Filter Menu / Item

### 3. Cart Management

        1. Add to cart
        2. Modify cart
            2.1 Add items
            2.2 Remove items
            2.3 Change quantity (+, -)
        3. Clear cart
        4. Checkout

### 4. Order Management

        1. Place Order
        2. Receive order by restaurant
        3. Cancel Order by customer/restaurant
        4. Track Order
        5. View Order summary
        6. View Order details
        7. View Orders History
        8. Update Order Status
        9. Send Email confirmation
        10. Send order status notification

### 5. Payment Integration Management

        1. Payment Integration with 3rd Party
        2. Select Payment method
        3. Create Transaction
        4. View Payment Transaction
        5. Create Transaction Receipt
        6. send Email Notification

### 6. Customer support Management

        1. Raise a Complain
        2. Add Rate to restaurant
        3. Need Help
        4. Customer Add Card

---

## ⚙️Non Functional Requirements
| #  | NFR Category        | Detailed Requirement                       | Architecture Decisions                                                | Technologies / Tools               |
| -- | ------------------- | ------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------- |
| 1  | Performance         | API response time ≤ 300 ms, page load ≤ 2s | Use in-memory caching, CDN for static assets, DB indexing, pagination | Redis, Cloudflare / AWS CloudFront |
| 2  | Performance         | Handle high read traffic efficiently       | Cache frequently accessed data (restaurants, menus)                   | Redis                              |
| 3  | Scalability         | Support 10k+ concurrent users              | Horizontal scaling with stateless services                            | Docker, Kubernetes                 |
| 4  | Security            | Encrypt all data in transit                | Enforce HTTPS (TLS) across all services                               | TLS                                |
| 5  | Security            | Secure password storage                    | Hash passwords with strong algorithms                                 | bcrypt                             |
| 6  | Security            | Secure authentication                      | Token-based authentication                                            | JWT                                |
| 7  | Security            | Prevent common attacks (SQLi, XSS, CSRF)   | Rate limiting, input validation, WAF, API protection                  | NGINX, API Gateway                 |
| 8  | Security            | Secure payment processing                  | Use PCI-compliant payment gateway                                     | Stripe                             |
| 9  | Availability        | System uptime ≥ 99.9%                      | Multi-instance deployment, no single point of failure                 | Kubernetes                         |
| 10 | Availability        | Ensure service continuity                  | Health checks + auto-restart failed services                          | Kubernetes                         |
| 11 | Reliability         | No data loss in orders                     | Use transactional DB operations                                       | PostgreSQL                         |
| 12 | Reliability         | Prevent duplicate orders/payments          | Idempotency keys for critical APIs                                    | Redis / DB                         |
| 13 | Reliability         | Handle partial failures                    | Retry mechanisms + circuit breakers                                   | App logic / middleware             |
| 14 | Usability           | Smooth and fast UX                         | Lazy loading, optimized UI, minimal steps                             | React / Next.js                    |
| 15 | Compatibility       | Support web and mobile platforms           | API-first architecture                                                | REST API                           |
| 16 | Maintainability     | Easy to extend and modify                  | Clean architecture (controller → service → repository)                | Service-based design patterns      |
| 17 | Maintainability     | Code consistency                           | Linting and formatting tools                                          | ESLint, Prettier                   |
| 18 | Observability       | Monitor system performance                 | Metrics collection and visualization                                  | Prometheus, Grafana                |
| 19 | Observability       | Log all critical events                    | Structured logging system                                             | Winston                            |
| 20 | Payment Reliability | Payment success rate ≥ 99%                 | Retry failed payments, use webhooks                                   | Stripe, Queues                     |
| 21 | Network             | Handle poor network conditions             | Retry logic, timeout handling                                         | Client + Server logic              |
| 22 | Network             | Improve perceived performance              | Offline UI fallback (cached data)                                     | Browser cache                      |
| 23 | Testability         | Ensure code quality                        | Unit and integration testing                                          | Jest, Supertest                    |



## 📊ERD

```mermaid
erDiagram
	direction TB
	RESTAURANT {
		int restaurant-id PK ""
		string name  ""
		int menu-id FK ""
	}

	MENU {
		int menu-id PK ""
		int restruent-id FK ""
	}

	PAYMENT-INTEGRATION-TYPE {
		int id PK ""
		string name  ""
	}

	USER-TYPE {
		int user-id PK ""
		string name  ""
	}

	ROLE {
		int role-id PK ""
		string name  ""
	}

	USER-ROLE {
		int user-id FK ""
		int role-id FK ""
	}

	CUSTOMER {
		int id PK ""
		int user-id FK ""
	}

	ADDRESS {
		int id PK ""
		int user-id FK ""
		string city  ""
		string country  ""
		int post_code  ""
	}

	ORDER {
		int order-id PK ""
		int user-id FK ""
		string address  ""
		date date  ""
	}

	ORDER-ITEMS {
		int order-item-id PK ""
		int order-id FK ""
		int item-id FK ""
		int quantity  ""
	}

	ORDER-STATE {
		int id PK ""
		string status  ""
	}

	ORDER-TRACKING {
		int order-id FK ""
		string current-location  ""
		date estimat-time  ""
	}

	PREFERRED-PAYMENT-SETTINGS {
		int id PK ""
		int user-id FK ""
		int pay-config-id FK ""
	}

	PAYMENT-CONFIGURATIONS {
		int id PK ""
		int pay-integra-id FK ""
		string config-details  ""
	}

	AUDITING {
		int id PK ""
		string type-id  ""
		string details  ""
		date audit-date  ""
	}

	TRANSACTION {
		int id PK ""
		int order-id FK ""
		int amount  ""
		string status  ""
	}

	TRANSACTION-DETAILS {
		int id PK ""
		string details  ""
	}

	PAYMENT-STATUS {
		int id PK ""
		string name  ""
	}

	CART {
		int user-id PK ""
		string name  ""
	}

	CART-ITEMS {
		int id PK ""
		int cart-id FK ""
		int menu-item-id FK ""
		int quantity  ""
	}

	MENU-ITEMS {
		int item-id PK ""
		int menu-id FK ""
		string item-name  ""
		int price  ""
	}

	USER {
		int user-id PK ""
		string name  ""
		string email  ""
	}

	RESTAURANT||--o{MENU:"has"
	USER-TYPE||--o{USER:"defines"
	ROLE||--o{USER-ROLE:"contains"
	USER||--o{USER-ROLE:"has"
	USER||--o{CUSTOMER:"is"
	USER||--o{ADDRESS:"has"
	USER||--o{PREFERRED-PAYMENT-SETTINGS:"configures"
	CUSTOMER||--o{ORDER:"places"
	ORDER||--o{ORDER-ITEMS:"contains"
	ORDER||--o{ORDER-STATE:"has"
	ORDER||--o{ORDER-TRACKING:"tracks"
	MENU||--o{MENU-ITEMS:"contains"
	PAYMENT-INTEGRATION-TYPE||--o{PAYMENT-CONFIGURATIONS:"uses"
	PAYMENT-CONFIGURATIONS||--o{PREFERRED-PAYMENT-SETTINGS:"configures"
	AUDITING||--o{TRANSACTION:"records"
	TRANSACTION||--o{TRANSACTION-DETAILS:"has"
	TRANSACTION||--o{PAYMENT-STATUS:"has"
	CART||--o{CART-ITEMS:"contains"
	CART-ITEMS||--o{MENU-ITEMS:"contains"
```

<!-- Include the Entity Relationship Diagram (ERD) here. You can embed an image or link to it. -->

---

## User Stories

---

### Epic 1: User Registration & Authentication

- **Feature name**: User Registration & Authentication
- **Description**: All stories related to account creation, login, session management, and password lifecycle for both customers and dashboard admins.
- **Acceptance Criteria**: Gherkin

---

- **Story 1-1**: Register

```gherkin
  As a new customer
  I want to create an account
  So that I can place orders on Foodlify

Background:
    Given the user is on the registration page

Happy_cases:
  Scenario: Register with valid data
    Given the user provides a unique email, phone, name, and password
    When  the user submits the registration form
    Then  a new account is created
     And  the user receives a success response with their profile data

Edge_cases:
  Scenario: Email already registered
    Given the email is already linked to an existing account
    When  the user submits the registration form
    Then  a 409 Conflict error is returned
     And  no new account is created

  Scenario: Phone already registered
    Given the phone number is already linked to an existing account
    When  the user submits the registration form
    Then  a 409 Conflict error is returned
     And  no new account is created
```

---

- **Story 1-2**: Login

```gherkin
  As a registered customer
  I want to log in
  So that I can access my account and place orders

Background:
    Given the user has a registered account

Happy_cases:
  Scenario: Login with valid credentials
    Given the user provides correct email and password
    When  the user submits the login form
    Then  access and refresh tokens are issued as httpOnly cookies
     And  a 200 OK response is returned

Edge_cases:
  Scenario: Invalid email
    Given the user provides an email that does not exist
    When  the user submits the login form
    Then  a 401 Unauthorized error is returned

  Scenario: Wrong password
    Given the user provides the correct email but wrong password
    When  the user submits the login form
    Then  a 401 Unauthorized error is returned
```

---

- **Story 1-3**: Logout

```gherkin
  As a logged-in customer
  I want to log out
  So that my session is terminated securely

Background:
    Given the user is authenticated

Happy_cases:
  Scenario: Logout successfully
    When  the user calls the logout endpoint
    Then  the refresh token is revoked in the database
     And  auth cookies are cleared
     And  a 200 OK response is returned

Edge_cases:
  Scenario: Logout with missing refresh token cookie
    Given the refresh token cookie is absent
    When  the user calls logout
    Then  all refresh tokens for the user are revoked
```

---

- **Story 1-4**: Forgot Password

```gherkin
  As a customer who forgot their password
  I want to receive a password reset email
  So that I can regain access to my account

Happy_cases:
  Scenario: Valid registered email
    Given the user provides a registered customer email
    When  the user submits the forgot password form
    Then  a password reset link is sent to that email
     And  a 200 OK response is returned

Edge_cases:
  Scenario: Email not found
    Given the user provides an email that does not exist
    When  the user submits the forgot password form
    Then  a 200 OK response is returned (silent — no email disclosure)
     And  no email is sent
```

---

- **Story 1-5**: Reset Password from Link

```gherkin
  As a customer with a reset link
  I want to set a new password
  So that I can access my account again

Happy_cases:
  Scenario: Valid reset token
    Given the user has a valid non-expired reset token
    When  the user submits a new password
    Then  the password is updated
     And  a 200 OK response is returned

Edge_cases:
  Scenario: Expired or invalid token
    Given the reset token is expired or tampered
    When  the user submits the form
    Then  a 401 Unauthorized error is returned
```

---

- **Story 1-6**: Change Password

```gherkin
  As a logged-in customer
  I want to change my password
  So that I can keep my account secure

Background:
    Given the user is authenticated

Happy_cases:
  Scenario: Correct old password
    Given the user provides the correct old password and a new password
    When  the user submits the change password form
    Then  the password is updated
     And  a 200 OK response is returned

Edge_cases:
  Scenario: Wrong old password
    Given the user provides an incorrect old password
    When  the user submits the form
    Then  a 400 Bad Request error is returned
     And  the password is not changed
```

---

- **Story 1-7**: View & Update Profile

```gherkin
  As a logged-in customer
  I want to view and update my profile
  So that my account information is current

Background:
    Given the user is authenticated

Happy_cases:
  Scenario: View profile
    When  the user requests their profile
    Then  name, email, phone, dob, and gender are returned

  Scenario: Update profile fields
    Given the user provides updated name, phone, or gender
    When  the user submits the update form
    Then  the profile is updated
     And  the updated profile is returned

  Scenario: Update email
    Given the user provides current password and a new unique email
    When  the user submits the email update form
    Then  the email is updated

Edge_cases:
  Scenario: New email already taken
    Given the new email belongs to another account
    When  the user submits the email update form
    Then  a 409 Conflict error is returned
```

---

### Epic 2: Restaurant & Menu Management

- **Feature name**: Restaurant & Menu Management
- **Description**: Stories for browsing restaurants, viewing menus, and admin/owner management of restaurants, menus, and menu items.
- **Acceptance Criteria**: Gherkin

---

- **Story 2-1**: View Restaurants

```gherkin
  As a customer
  I want to browse available restaurants
  So that I can choose where to order from

Happy_cases:
  Scenario: List all restaurants
    When  the customer requests the restaurant list
    Then  all active restaurants are returned

  Scenario: View single restaurant
    Given a valid restaurantId
    When  the customer requests that restaurant
    Then  the restaurant details are returned
```

---

- **Story 2-2**: View Menu & Menu Items

```gherkin
  As a customer
  I want to view a restaurant's menu
  So that I can select items to order

Happy_cases:
  Scenario: View menu
    Given a valid restaurantId and menuId
    When  the customer requests the menu
    Then  all menu items with prices and stock are returned

Edge_cases:
  Scenario: Menu not found
    Given an invalid menuId
    When  the customer requests the menu
    Then  a 404 Not Found error is returned
```

---

- **Story 2-3**: Create Restaurant

```gherkin
  As a SUPER_ADMIN or RESTAURANT_OWNER
  I want to add a new restaurant
  So that customers can discover and order from it

Background:
    Given the admin is authenticated with the required role

Happy_cases:
  Scenario: Create restaurant successfully
    Given valid restaurant data is provided
    When  the admin submits the create request
    Then  the restaurant is persisted
     And  a 201 Created response is returned

Edge_cases:
  Scenario: Unauthorized role
    Given the user does not have SUPER_ADMIN or RESTAURANT_OWNER role
    When  the user submits the create request
    Then  a 403 Forbidden error is returned
```

---

- **Story 2-4**: Create / Update / Delete Menu and Menu Items

```gherkin
  As a SUPER_ADMIN or RESTAURANT_OWNER
  I want to manage menus and items
  So that customers see accurate and up-to-date offerings

Background:
    Given the admin is authenticated with the required role

Happy_cases:
  Scenario: Create menu
    Given valid menu data for an existing restaurant
    When  the admin submits the create menu request
    Then  the menu is created under that restaurant

  Scenario: Update menu item
    Given a valid menuId and menuItemId
    When  the admin submits updated item data
    Then  the item is updated

  Scenario: Delete menu item
    Given a valid menuId and menuItemId
    When  the admin submits the delete request
    Then  the item is removed from the menu

Edge_cases:
  Scenario: Menu or item not found
    Given an invalid menuId or menuItemId
    When  the admin submits the request
    Then  a 404 Not Found error is returned
```

---

### Epic 3: Cart Management

- **Feature name**: Cart Management
- **Description**: Showing all User stories related to creating a cart then adding, modifying and deleting items within it.
- **Acceptance Criteria**: Gherkin
- **Story 3-1**: Add To Cart

```gherkin
  As a customer
  I want to create my cart and add items to it
  So that I can review and modify my order before checkout
Background:
    Given the user is logged in
     And  the user has selected a restaurant
Happy_cases:
  Scenario_1: Add item to cart successfully
     Given the menu item is available
     When  the user adds the item to the cart
     Then  the item should be added to the cart
      And  the cart total should be updated
Edge cases:
  Scenario_1: Add unavailable item to cart
     Given the menu item is unavailable
     When  the user tries to add the item to the cart
     Then  the action should be prevented
      And  an error message should be displayed
```

- **Story 3-2**: Modify Cart- Remove item

```gherkin
  As a customer
  I want to manage my cart
  So that I can review and modify my order before checkout

Happy_cases:
  Scenario_1: Remove item from cart
     Given the cart contains an item
     When  the user removes the item
     Then  the item should be removed from the cart
      And  the cart total should be updated
```

- **Story 3-3**: Modify Cart- Modify item quantity

```gherkin
  As a customer
  I want to manage my cart
  So that I can review and modify my order before checkout

Happy_cases:
  Scenario_1: Modify item quantity in cart successfully
    Given the cart contains an item
    When  the user increases or decreases the item quantity
    Then  system checks stock in case of increase
     And  enough quantity response
     And  the item quantity should be updated
     And  the cart total should be recalculated
Edge cases:
  Scenario_1: Modify cart with invalid quantity
    Given the cart contains an item
    When  the user increases the item quantity
    Then  system check stock in case of increase
     And  No enough quantity response
    Then  the system should show low stock error
     And  the quantity should not be updated
```

- **Story 3-4**: Clear Cart

```gherkin
  As a customer
  I want to clear my cart
  So that I no more need now

Happy_cases:
  Scenario: Clear entire cart
    Given the cart contains multiple items
    When  the user chooses to clear the cart
    Then  all items should be removed from the cart
     And  the cart should be empty
```

- **Story 3-4**: View Cart

```gherkin
  As a customer
  I want to view my cart
  So that I can review and modify my order before checkout

Happy_cases:
  Scenario: View cart details
    Given the cart contains items
    When  the user views the cart
    Then  all items with their quantities and prices should be displayed
     And  the total amount should be shown
```

---

### Epic 4: Order Management

- **Feature name**: Order Management
- **Description**: Stories for placing, tracking, updating, and cancelling orders. Uses Chain of Responsibility for creation and State pattern for status transitions.
- **Acceptance Criteria**: Gherkin

---

- **Story 4-1**: Checkout

```gherkin
  As a customer with items in my cart
  I want to validate and lock my cart for ordering
  So that prices and stock are confirmed before payment

Background:
    Given the customer is authenticated
     And  the cart has at least one item

Happy_cases:
  Scenario: Checkout succeeds
    Given all cart items are available, in stock, and prices match
    When  the customer initiates checkout
    Then  cart is transferred to the order system
     And  a 200 OK response with cart summary is returned

Edge_cases:
  Scenario: Cart is empty
    Given the customer's Redis cart is empty
    When  the customer initiates checkout
    Then  an error is returned: cart is empty

  Scenario: Price changed since added to cart
    Given a menu item's price has changed since the customer added it
    When  the customer initiates checkout
    Then  a PriceNotMatch error is returned

  Scenario: Quantity exceeds stock
    Given the requested quantity is higher than available stock
    When  the customer initiates checkout
    Then  a QuantityExceed error is returned
```

---

- **Story 4-2**: Place Order

```gherkin
  As a customer who has completed checkout
  I want to place my order
  So that the restaurant can prepare it

Background:
    Given the customer is authenticated
     And  checkout has been completed

Happy_cases:
  Scenario: Place order with Stripe
    Given the customer selects Stripe as payment method
    When  the customer places the order
    Then  the order is created with PENDING status
     And  a Stripe payment intent is returned

  Scenario: Place order with Cash
    Given the customer selects Cash as payment method
    When  the customer places the order
    Then  the order is created with CONFIRMED status immediately

Edge_cases:
  Scenario: Invalid address
    Given the customer provides a non-existent addressId
    When  the customer places the order
    Then  a 404 Not Found error is returned
```

---

- **Story 4-3**: Track Order

```gherkin
  As a customer
  I want to view my order's tracking history
  So that I know the current state of my delivery

Background:
    Given the customer is authenticated

Happy_cases:
  Scenario: Get tracking history
    Given a valid orderId belonging to the customer
    When  the customer requests tracking history
    Then  a list of status changes with timestamps is returned

Edge_cases:
  Scenario: Order not found
    Given an invalid or unowned orderId
    When  the customer requests tracking
    Then  a 404 Not Found error is returned
```

---

- **Story 4-4**: Update Order Status

```gherkin
  As an authorized actor (admin / restaurant / rider)
  I want to update an order's status
  So that the customer is kept informed

Background:
    Given the actor is authenticated

Happy_cases:
  Scenario: Valid status transition
    Given the current status allows the requested transition
    When  the actor submits the new status
    Then  the order status is updated
     And  a tracking entry is inserted
     And  on DELIVERED — an order summary is generated

Edge_cases:
  Scenario: Invalid transition
    Given the transition is not allowed by the State machine
    When  the actor submits the new status
    Then  an error is returned

  Valid transitions:
    PENDING      → CONFIRMED | CANCELLED
    CONFIRMED    → PROCESSED | CANCELLED
    PROCESSED    → READY_TO_PICKUP
    READY_TO_PICKUP → OUT_FOR_DELIVERY
    OUT_FOR_DELIVERY → DELIVERED
    DELIVERED    → REFUNDED
```

---

- **Story 4-5**: Cancel Order

```gherkin
  As a customer
  I want to cancel my order
  So that I am not charged for an unwanted order

Background:
    Given the customer is authenticated

Happy_cases:
  Scenario: Cancel a PENDING or CONFIRMED order
    Given the order is in PENDING or CONFIRMED or PROCESSED or READY_TO_PICKUP status
    When  the customer cancels the order
    Then  the order status changes to CANCELLED
     And  a tracking entry is inserted

Edge_cases:
  Scenario: Cancel a non-cancellable order
    Given the order is DELIVERED, CANCELLED, or OUT_FOR_DELIVERY
    When  the customer attempts to cancel
    Then  an error is returned: cannot cancel this order
```

---

### Epic 5: Payment Integration

- **Feature name**: Payment Integration Management
- **Description**: Stories for selecting payment method, processing Stripe payments and cash orders, and handling Stripe webhooks.
- **Acceptance Criteria**: Gherkin

---

- **Story 5-1**: Pay with Stripe

```gherkin
  As a customer placing an order
  I want to pay online with Stripe
  So that my order is securely processed

Background:
    Given the customer has placed an order with Stripe payment type

Happy_cases:
  Scenario: Stripe payment intent created
    Given the order total and currency are valid
    When  the order is placed
    Then  a Stripe payment intent with client_secret is returned
     And  the order status is PENDING until payment confirmation

  Scenario: Stripe webhook confirms payment
    Given Stripe sends a payment_intent.succeeded webhook
    When  the webhook is received and signature is valid
    Then  the order status is updated to CONFIRMED

Edge_cases:
  Scenario: Invalid Stripe signature
    Given the webhook payload has an invalid signature
    When  it is received
    Then  a 400 Bad Request is returned
     And  no order state changes
```

---

- **Story 5-2**: Pay with Cash

```gherkin
  As a customer placing an order
  I want to pay with cash on delivery
  So that I don't need a card

Background:
    Given the customer selects Cash as payment method

Happy_cases:
  Scenario: Cash order placed
    When  the customer places the order
    Then  the order is created with CONFIRMED status immediately
     And  no external payment processing occurs
```

---

### Epic 6: Customer Support

- **Feature name**: Customer Support Management
- **Description**: Stories for raising support tickets, rating restaurants, and managing loyalty points.
- **Acceptance Criteria**: Gherkin

---

- **Story 6-1**: Create Support Ticket

```gherkin
  As a customer
  I want to raise a support ticket
  So that I can get help with an issue

Background:
    Given the customer is authenticated

Happy_cases:
  Scenario: Create ticket without order reference
    Given the customer provides category, subject, and description
    When  the customer submits the ticket
    Then  a ticket is created with a unique requestId
     And  the requestId is returned

  Scenario: Create ticket linked to an order
    Given the customer provides a valid orderId they own
    When  the customer submits the ticket
    Then  the ticket is linked to that order

Edge_cases:
  Scenario: Order not found
    Given the customer provides an invalid orderId
    When  the customer submits the ticket
    Then  a 404 Not Found error is returned
```

---

- **Story 6-2**: Resolve Support Ticket

```gherkin
  As support staff
  I want to resolve a support ticket
  So that the customer's issue is closed

Background:
    Given the actor is authenticated

Happy_cases:
  Scenario: Resolve ticket
    Given a valid ticketId and resolution text
    When  the actor submits the resolution
    Then  the ticket status changes to RESOLVED
     And  the resolution text is stored

Edge_cases:
  Scenario: Ticket not found
    Given an invalid requestId
    When  the actor submits the resolution
    Then  a 404 Not Found error is returned
```

---

- **Story 6-3**: Rate Restaurant

```gherkin
  As a customer who received their order
  I want to rate the restaurant
  So that other customers can make informed choices

Background:
    Given the customer is authenticated
     And  the order is DELIVERED

Happy_cases:
  Scenario: Submit rating
    Given the customer provides a valid orderId and rating value
    When  the customer submits the rating
    Then  the rating is stored against the restaurant

Edge_cases:
  Scenario: Invalid orderId
    Given the orderId does not exist
    When  the customer submits
    Then  a 404 Not Found error is returned
```

---

- **Story 6-4**: Loyalty Points

```gherkin
  As a customer
  I want to view and redeem my loyalty points
  So that I can get discounts on future orders

Background:
    Given the customer is authenticated

Happy_cases:
  Scenario: View points
    When  the customer requests their points
    Then  current points balance is returned

  Scenario: Redeem points
    When  the customer requests points redemption
    Then  points are converted to monetary value
     And  the result is returned

Edge_cases:
  Scenario: Insufficient points
    Given the customer has zero points
    When  the customer requests redemption
    Then  zero value is returned
```

---

## 🔄Flow Charts

### 1- User Registration & Authentication

```mermaid
flowchart TD

A[User] --> B{Auth Action}

%% ================= REGISTER =================
B -->|Register| C[Submit Name, Email, Phone, Password]
C --> D{Email Exists?}
D -- Yes --> E[Return 409 Email Conflict]
D -- No --> F{Phone Exists?}
F -- Yes --> G[Return 409 Phone Conflict]
F -- No --> H[Hash Password]
H --> I[Create User + Customer in DB Transaction]
I --> J[Return User Profile]

%% ================= LOGIN =================
B -->|Login| K[Submit Email + Password]
K --> L{User Found?}
L -- No --> M[Return 401 Invalid Credentials]
L -- Yes --> N{Password Match?}
N -- No --> M
N -- Yes --> O[Issue Access + Refresh Tokens]
O --> P[Set httpOnly Cookies]
P --> Q[Return 200 OK]

%% ================= FORGOT PASSWORD =================
B -->|Forgot Password| R[Submit Email]
R --> S{User Found + Is Customer?}
S -- No --> T[Return 200 Silent No Email Sent]
S -- Yes --> U[Generate Reset Token]
U --> V[Send Reset Email]
V --> T

%% ================= RESET PASSWORD =================
B -->|Reset via Link| W[Submit Token + New Password]
W --> X{Token Valid?}
X -- No --> Y[Return 401 Invalid Token]
X -- Yes --> Z[Hash + Save New Password]
Z --> AA[Return 200 OK]

%% ================= CHANGE PASSWORD =================
B -->|Change Password| AB[Submit Old + New Password]
AB --> AC{Old Password Correct?}
AC -- No --> AD[Return 400 Password Mismatch]
AC -- Yes --> AE[Hash + Save New Password]
AE --> AA
```

---

### 2- Restaurant & Menu Management

```mermaid
flowchart TD

A[Actor] --> B{Choose Action}

%% ================= PUBLIC READ =================
B -->|Browse Restaurants| C[GET /restaurants]
C --> D[Return Restaurant List with Redis Cache]

B -->|View Menu| E[GET /:restaurantId/menus/:menuId]
E --> F{Menu Exists?}
F -- No --> G[Return 404 Not Found]
F -- Yes --> H[Return Menu Items]

%% ================= ADMIN MANAGE RESTAURANT =================
B -->|Create Restaurant| I{Role Check}
I -- Unauthorized --> J[Return 403 Forbidden]
I -- SUPER_ADMIN / OWNER --> K[Validate Input]
K --> L[Persist Restaurant to DB]
L --> M[Return 201 Created]

%% ================= ADMIN MANAGE MENU =================
B -->|Create Menu| N{Role Check}
N -- Unauthorized --> J
N -- Authorized --> O[Validate restaurantId + menu data]
O --> P{Restaurant Exists?}
P -- No --> G
P -- Yes --> Q[Create Menu]
Q --> M

%% ================= ADMIN MANAGE MENU ITEMS =================
B -->|Add / Update / Delete Item| R{Role Check}
R -- Unauthorized --> J
R -- Authorized --> S[Validate menuId + itemId]
S --> T{Item Exists?}
T -- No --> G
T -- Yes --> U[Apply Change to DB]
U --> V[Return 200 OK]
```

---

### 3- Cart Management

```mermaid
flowchart TD

A[User] --> B{Choose Action}

%% ================= VIEW CART =================
B -->|View Cart| C[Load Cart]
C --> D{Cart Empty}

D -- Yes --> E[Show Empty Cart]
D -- No --> F[Display Cart Items]

%% ================= ADD ITEM =================
B -->|Add Item| G[Select Menu Item]
G --> H{Item Available}

H -- No --> I[Show Error Not Available]
H -- Yes --> J{Same Restaurant}

J -- No --> K[Prompt Clear Cart or Cancel]
K --> B
J -- Yes --> L[Add Item to Cart]
L --> M[Update Total]

%% ================= MODIFY QUANTITY =================
B -->|Update Quantity| N[Select Cart Item]
N --> O[Change Quantity]
O --> P{Valid Quantity}

P -- No --> Q[Show Validation Error]
P -- Yes --> R[Update Quantity]
R --> M

%% ================= REMOVE ITEM =================
B -->|Remove Item| S[Select Cart Item]
S --> T[Remove Item]
T --> U[Update Cart Total]

%% ================= CLEAR CART =================
B -->|Clear Cart| V[Confirm Clear Cart]
V --> W[Remove All Items]
W --> X[Cart Empty]

%% ================= END =================
M --> Y[Show Updated Cart]
U --> Y
F --> Y
X --> Y
```

---

### 4- Order Management

```mermaid
flowchart TD

A[Customer] --> B{Order Action}

%% ================= CHECKOUT =================
B -->|Checkout| C[Load Redis Cart]
C --> D{Cart Empty?}
D -- Yes --> E[Return Error Cart Empty]
D -- No --> F[Fetch Menu Items from DB]
F --> G{All Items Found?}
G -- No --> H[Return 404 Item Not Found]
G -- Yes --> I{Same Restaurant?}
I -- No --> J[Return RestaurantNotMatch Error]
I -- Yes --> K{Quantities in Stock?}
K -- No --> L[Return QuantityExceed Error]
K -- Yes --> M{Prices Match?}
M -- No --> N[Return PriceNotMatch Error]
M -- Yes --> O[Transfer Cart to DB - Lock Cart]
O --> P[Return Checkout Summary]

%% ================= PLACE ORDER =================
B -->|Place Order| Q[Submit addressId + paymentTypeId]
Q --> R{Payment Type?}
R -- Stripe --> S[Set Status PENDING]
S --> T[Create Stripe Payment Intent]
T --> U[Return client_secret to Customer]
R -- Cash --> V[Set Status CONFIRMED]
V --> W[Return Order Created]

%% ================= UPDATE STATUS =================
B -->|Update Status| X[Submit new status]
X --> Y{State Transition Valid?}
Y -- No --> Z[Return Transition Error]
Y -- Yes --> AA[Update Order Status in DB]
AA --> AB[Insert Tracking Entry]
AB --> AC{Status = DELIVERED?}
AC -- Yes --> AD[Generate Order Summary]
AC -- No --> AE[Return 200 OK]
AD --> AE

%% ================= CANCEL ORDER =================
B -->|Cancel Order| AF[Submit orderId]
AF --> AG{Order Found?}
AG -- No --> AH[Return 404 Not Found]
AG -- Yes --> AI{Cancellable Status?}
AI -- No Delivered/OUT_FOR_DELIVERY/Cancelled --> AJ[Return Cannot Cancel Error]
AI -- Yes --> AK[Set Status CANCELLED]
AK --> AL[Insert Tracking Entry]
AL --> AE
```

---

### 5- Payment Management

```mermaid
flowchart TD

A[Customer] --> B{Payment Method}

%% ================= STRIPE =================
B -- Stripe --> C[Place Order PENDING]
C --> D[Create Stripe Payment Intent]
D --> E[Return client_secret to Frontend]
E --> F[Customer Completes Payment in Stripe UI]
F --> G[Stripe Sends Webhook Event]
G --> H{Signature Valid?}
H -- No --> I[Return 400 Bad Request]
H -- Yes --> J{Event Type?}
J -- payment_intent.succeeded --> K[Update Order to CONFIRMED]
J -- payment_intent.failed --> L[Update Order to CANCELLED]
K --> M[Return 200 OK]
L --> M

%% ================= CASH =================
B -- Cash --> N[Place Order CONFIRMED Immediately]
N --> O[No External Payment Processing]
O --> P[Restaurant Collects on Delivery]
P --> M
```

---

### 6- Customer Support

```mermaid
flowchart TD

A[Customer] --> B{Support Action}

%% ================= SUPPORT TICKET =================
B -->|Raise Ticket| C[Submit Category, Subject, Description]
C --> D{Order ID Provided?}
D -- Yes --> E{Order Exists?}
E -- No --> F[Return 404 Not Found]
E -- Yes --> G[Link Ticket to Order]
D -- No --> H[Create Ticket without Order]
G --> I[Generate Unique requestId]
H --> I
I --> J[Persist Ticket to DB]
J --> K[Return requestId]

B -->|Resolve Ticket| L[Submit requestId + Resolution Text]
L --> M{Ticket Found?}
M -- No --> F
M -- Yes --> N[Update Status to RESOLVED]
N --> O[Store Resolution Text]
O --> P[Return 200 OK]

%% ================= RATING =================
B -->|Rate Restaurant| Q[Submit orderId + Rating Value]
Q --> R{Valid orderId?}
R -- No --> F
R -- Yes --> S[Insert Rating for Restaurant]
S --> P

%% ================= LOYALTY POINTS =================
B -->|View Points| T[GET /customer-service/points]
T --> U[Return Points Balance]

B -->|Redeem Points| V[GET /customer-service/points/redeem]
V --> W[Convert Points to Monetary Value]
W --> X[Return Redeemable Amount]
```

---

## 🧩Sequence Diagrams

### 1- User Registration & Authentication

```mermaid
sequenceDiagram
    actor User
    participant API as Backend API
    participant AuthSvc as CustomerService
    participant SharedAuth as SharedAuthService
    participant UserRepo as UserManagementRepository
    participant CustRepo as CustomerRepository
    participant DB as PostgreSQL
    participant Mail as MailService

    %% ── Register ──
    User->>API: POST /customers/register {name,email,phone,password}
    API->>AuthSvc: register(data)
    AuthSvc->>UserRepo: findUserByEmail(email)
    UserRepo->>DB: SELECT user WHERE email=?
    DB-->>UserRepo: null
    UserRepo-->>AuthSvc: null
    AuthSvc->>CustRepo: findCustomerByPhone(phone)
    CustRepo->>DB: SELECT customer WHERE phone=?
    DB-->>CustRepo: null
    CustRepo-->>AuthSvc: null
    AuthSvc->>AuthSvc: hashPassword(password)
    AuthSvc->>DB: $transaction — createUser + createCustomer
    DB-->>AuthSvc: user, customer
    AuthSvc-->>API: {id, customerId, name, email, phone}
    API-->>User: 201 Created + profile

    %% ── Login ──
    User->>API: POST /customers/login {email, password}
    API->>AuthSvc: login(data, meta)
    AuthSvc->>SharedAuth: login(email, password, resolvePayload)
    SharedAuth->>UserRepo: findUserByEmail(email)
    DB-->>UserRepo: user record
    SharedAuth->>SharedAuth: comparePassword(plain, hash)
    SharedAuth->>CustRepo: findCustomerByUserId(user.id)
    DB-->>CustRepo: customer
    SharedAuth->>SharedAuth: signAccess + signRefresh
    SharedAuth->>DB: createRefreshToken(hash, expiresAt)
    SharedAuth-->>AuthSvc: {accessToken, refreshToken}
    AuthSvc-->>API: tokens
    API-->>User: 200 OK + httpOnly cookies

    %% ── Forgot Password ──
    User->>API: POST /customers/forgot-password {email}
    API->>AuthSvc: forgotPassword({email})
    AuthSvc->>SharedAuth: forgotPassword(email, validate, path, emailOptions)
    SharedAuth->>UserRepo: findUserByEmail(email)
    DB-->>UserRepo: user (or null)
    SharedAuth->>SharedAuth: validate(user) — check userTypeCode === customer
    SharedAuth->>SharedAuth: signResetToken(userId)
    SharedAuth->>Mail: sendMail(to, subject, html)
    Mail-->>SharedAuth: sent
    SharedAuth-->>AuthSvc: void
    AuthSvc-->>API: {}
    API-->>User: 200 OK
```

---

### 2- Restaurant & Menu Management

```mermaid
sequenceDiagram
    actor Admin as Admin / Owner
    actor Customer
    participant API as Backend API
    participant RestSvc as RestaurantService
    participant MenuSvc as MenuService
    participant Cache as Redis Cache
    participant DB as PostgreSQL

    %% ── Browse Restaurants (cached) ──
    Customer->>API: GET /restaurants
    API->>Cache: get restaurants
    alt Cache Hit
        Cache-->>API: restaurant list
    else Cache Miss
        API->>RestSvc: getRestaurants()
        RestSvc->>DB: SELECT restaurants
        DB-->>RestSvc: list
        RestSvc->>Cache: set restaurants (TTL)
        RestSvc-->>API: list
    end
    API-->>Customer: 200 OK + restaurants

    %% ── View Menu ──
    Customer->>API: GET /:restaurantId/menus/:menuId
    API->>MenuSvc: getMenu(restaurantId, menuId)
    MenuSvc->>DB: SELECT menu + items WHERE id=?
    DB-->>MenuSvc: menu with items
    MenuSvc-->>API: menu data
    API-->>Customer: 200 OK + menu

    %% ── Create Menu Item ──
    Admin->>API: POST /:restaurantId/menus/:menuId/items (auth + role)
    API->>API: authDashboard middleware
    API->>API: requireRole(SUPER_ADMIN | RESTAURANT_OWNER)
    API->>MenuSvc: createMenuItem(restaurantId, menuId, data)
    MenuSvc->>DB: INSERT menuItem
    DB-->>MenuSvc: created item
    MenuSvc->>Cache: invalidate restaurants cache
    MenuSvc-->>API: item
    API-->>Admin: 201 Created
```

---

### 3- Cart Management

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend (App/Web)
    participant API as Backend API
    participant Cart as Cart Service
    participant DB as Database

    %% =========================
    %% Add to Cart
    %% =========================
    User->>UI: Click "Add to Cart"
    UI->>API: POST /cart/items {productId, qty}
    API->>Cart: addItem(userId, productId, qty)
    Cart->>DB: Upsert cart item
    DB-->>Cart: Success
    Cart-->>API: Updated cart
    API-->>UI: 200 OK + cart data
    UI-->>User: Show updated cart

    %% =========================
    %% Modify Item Quantity
    %% =========================
    User->>UI: Change item quantity
    UI->>API: PATCH /cart/items/{itemId} {qty}
    API->>Cart: updateItem(userId, itemId, qty)
    Cart->>DB: Update quantity
    DB-->>Cart: Success
    Cart-->>API: Updated cart
    API-->>UI: 200 OK + cart data
    UI-->>User: Show updated cart

    %% =========================
    %% Remove Item (edge case)
    %% =========================
    User->>UI: Set qty = 0 / Remove item
    UI->>API: DELETE /cart/items/{itemId}
    API->>Cart: removeItem(userId, itemId)
    Cart->>DB: Delete item
    DB-->>Cart: Success
    Cart-->>API: Updated cart
    API-->>UI: 200 OK
    UI-->>User: Item removed

    %% =========================
    %% Clear Cart
    %% =========================
    User->>UI: Click "Clear Cart"
    UI->>API: DELETE /cart
    API->>Cart: clearCart(userId)
    Cart->>DB: Delete all cart items
    DB-->>Cart: Success
    Cart-->>API: Empty cart
    API-->>UI: 200 OK
    UI-->>User: Cart is empty
```

---

### 4- Order Management

```mermaid
sequenceDiagram
    actor Customer
    participant API as Backend API
    participant OrdSvc as OrderService
    participant Chain as Chain of Responsibility
    participant State as State Machine
    participant CartRepo as CartRedisRepository
    participant MenuSvc as MenuService
    participant PaySvc as PaymentStrategy
    participant DB as PostgreSQL
    participant Stripe as Stripe API

    %% ── Checkout ──
    Customer->>API: POST /orders/checkout
    API->>OrdSvc: checkout(customerId)
    OrdSvc->>CartRepo: findCartByCustomerId(customerId)
    CartRepo-->>OrdSvc: Redis cart items
    OrdSvc->>MenuSvc: getMenuItemsByIds(itemIds)
    MenuSvc->>DB: SELECT menu items
    DB-->>MenuSvc: items
    OrdSvc->>OrdSvc: validate prices + stock + same restaurant
    OrdSvc->>DB: $transaction — clearCart + createCartWithItems
    DB-->>OrdSvc: success
    OrdSvc-->>API: {customerId, restaurantId, itemsCount}
    API-->>Customer: 200 OK + checkout summary

    %% ── Place Order (Stripe) ──
    Customer->>API: POST /orders {addressId, paymentTypeId}
    API->>OrdSvc: placeOrder(input)
    OrdSvc->>DB: $transaction
    OrdSvc->>Chain: processOrder().handle(input)
    Chain->>DB: validate address, validate payment type
    Chain->>PaySvc: createPayment(order) — StripeStrategy
    PaySvc->>Stripe: paymentIntents.create
    Stripe-->>PaySvc: {id, client_secret}
    PaySvc-->>Chain: transaction record
    Chain->>DB: INSERT order with PENDING status
    Chain-->>OrdSvc: order + client_secret
    OrdSvc-->>API: result
    API-->>Customer: 201 Created + client_secret

    %% ── Update Order Status ──
    Customer->>API: PATCH /orders/:orderId/status {status: CONFIRMED}
    API->>OrdSvc: updateOrderStatus(customerId, orderId, CONFIRMED)
    OrdSvc->>DB: getSingleOrderById
    DB-->>OrdSvc: order
    OrdSvc->>State: new OrderContext(currentStatus)
    State->>State: context.confirm() — PENDING → CONFIRMED
    OrdSvc->>DB: updateOrderStatusByName(orderId, CONFIRMED)
    OrdSvc->>DB: addOrderTrackingStatus(orderId, statusId)
    DB-->>OrdSvc: success
    OrdSvc-->>API: void
    API-->>Customer: 200 OK
```

---

### 5- Payment Management

```mermaid
sequenceDiagram
    actor Customer
    participant API as Backend API
    participant OrdSvc as OrderService
    participant PayStrategy as PaymentStrategy
    participant StripeSvc as StripeStrategy
    participant Stripe as Stripe API
    participant Webhook as WebhookController
    participant DB as PostgreSQL

    %% ── Stripe Payment Flow ──
    Customer->>API: POST /orders {paymentTypeId: STRIPE}
    API->>OrdSvc: placeOrder(input)
    OrdSvc->>PayStrategy: new PaymentStrategy(STRIPE)
    PayStrategy->>StripeSvc: createPayment(order)
    StripeSvc->>Stripe: paymentIntents.create({amount, currency})
    Stripe-->>StripeSvc: {id, client_secret}
    StripeSvc-->>OrdSvc: transaction record
    OrdSvc->>DB: INSERT order status=PENDING
    OrdSvc-->>API: {orderId, client_secret}
    API-->>Customer: 201 + client_secret

    Customer->>Stripe: Complete payment in frontend
    Stripe->>Webhook: POST /webhook (payment_intent.succeeded)
    Webhook->>Webhook: stripe.webhooks.constructEvent(sig)
    alt Invalid signature
        Webhook-->>Stripe: 400 Bad Request
    else Valid
        Webhook->>DB: UPDATE order status=CONFIRMED
        Webhook-->>Stripe: 200 OK
    end

    %% ── Cash Payment Flow ──
    Customer->>API: POST /orders {paymentTypeId: CASH}
    API->>OrdSvc: placeOrder(input)
    OrdSvc->>PayStrategy: new PaymentStrategy(CASH)
    PayStrategy->>PayStrategy: CashStrategy — no external call
    OrdSvc->>DB: INSERT order status=CONFIRMED
    OrdSvc-->>API: {orderId}
    API-->>Customer: 201 Created
```

---

### 6- Customer Support

```mermaid
sequenceDiagram
    actor Customer
    participant API as Backend API
    participant TicketSvc as TicketService
    participant RateSvc as RateService
    participant PointsSvc as LoyaltyPointsService
    participant OrdSvc as OrderService
    participant DB as PostgreSQL

    %% ── Create Support Ticket ──
    Customer->>API: POST /customer-service/ticket {category, subject, description, orderId?}
    API->>TicketSvc: insertSupportTicket(input)
    alt orderId provided
        TicketSvc->>OrdSvc: getSingleOrder(customerId, orderId)
        OrdSvc->>DB: SELECT order
        DB-->>OrdSvc: order or null
        alt Order not found
            OrdSvc-->>TicketSvc: null
            TicketSvc-->>API: 404 Not Found
            API-->>Customer: 404 Not Found
        end
    end
    TicketSvc->>TicketSvc: generate requestId (nanoid)
    TicketSvc->>DB: INSERT support_ticket
    DB-->>TicketSvc: ticket
    TicketSvc-->>API: requestId
    API-->>Customer: 201 Created + requestId

    %% ── Resolve Ticket ──
    Customer->>API: PATCH /customer-service/ticket/:id/resolve {resolution}
    API->>TicketSvc: resolveSupportTicket(requestId, resolution)
    TicketSvc->>DB: SELECT ticket WHERE requestId=?
    DB-->>TicketSvc: ticket or null
    alt Not found
        TicketSvc-->>API: 404 Not Found
    else Found
        TicketSvc->>DB: UPDATE ticket status=RESOLVED, resolution=?
        DB-->>TicketSvc: updated
        TicketSvc-->>API: success
        API-->>Customer: 200 OK
    end

    %% ── Rate Restaurant ──
    Customer->>API: POST /customer-service/rate/:orderId {rating}
    API->>RateSvc: insertRestaurantRate(customerId, orderId, rating)
    RateSvc->>DB: INSERT restaurant_rate
    DB-->>RateSvc: success
    RateSvc-->>API: success
    API-->>Customer: 201 Created

    %% ── Loyalty Points ──
    Customer->>API: GET /customer-service/points
    API->>PointsSvc: getPoints(customerId)
    PointsSvc->>DB: SELECT loyalty_points WHERE customerId=?
    DB-->>PointsSvc: points balance
    PointsSvc-->>API: balance
    API-->>Customer: 200 OK + {points}
```

---

## 🧾Assumptions

<!-- List any assumptions made during design or development of the system. -->

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js v25 |
| **Framework** | Express.js v5 |
| **Language** | TypeScript |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Cache** | Redis (cart + restaurant caching) |
| **Auth** | JWT (access 2d / refresh 4d / reset 1h) + bcrypt |
| **Validation** | Zod |
| **Payment** | Stripe + Cash (Strategy pattern) |
| **Email** | Nodemailer |
| **Logging** | Winston |
| **HTTP Security** | Helmet, CORS, rate-limiting |
| **API Docs** | Swagger / OpenAPI (`/api-docs`) |
| **Testing** | Jest + ts-jest + Supertest |
| **Containerization** | Docker + Docker Compose |
| **Version Control** | Git & GitHub |

---

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── customerManagement/        # Customer auth + profile
│   ├── userManagement/            # Dashboard (admin) auth + user CRUD + profile
│   ├── restaurantManagemet/       # Restaurant + menu + menu-item CRUD
│   ├── cartManagement/            # Redis-backed cart
│   ├── orderManagment/            # Order lifecycle (State pattern + Chain of Responsibility)
│   ├── paymentManagement/         # Stripe + Cash (Strategy pattern) + webhooks
│   └── customerServiceManagement/ # Support tickets + ratings + loyalty points
├── middlewares/
│   ├── auth_handling/             # JWT auth + role guard
│   ├── error_handling/            # Global error handler
│   └── rate_limiting/             # Express rate-limit
├── shared_infrastructure/
│   ├── auth/                      # JWT helpers, password helpers, user-type constants
│   ├── error/                     # Error classes + messages
│   ├── http/                      # Cookie utils
│   ├── logger/                    # Winston logger
│   ├── mail/                      # Email templates
│   ├── middleware/                 # Zod validate middleware
│   └── success/                   # Success message constants
├── utils/                         # asyncHandler, mailService, response helper
├── routes/index.ts                # Central router
├── app.ts
└── server.ts
lib/
├── prisma.ts                      # Prisma singleton
└── redis.ts                       # Redis singleton
prisma/
├── schema.prisma
└── seed.ts
tests/
├── customerManagement/            # customer.service + customer.profile.service
├── userManagement/                # auth.service + user.service + profile.service
├── cart/
├── order/
└── health.test.ts
```

---

## 🧩 Design Patterns

| Pattern | Where Used | Purpose |
|---|---|---|
| **State** | `orderManagment/States/` | Order status transitions (PENDING → CONFIRMED → PROCESSED → DELIVERED / CANCELLED) |
| **Chain of Responsibility** | `orderManagment/chainPattern/` | Order creation pipeline — each handler validates one concern and passes to next |
| **Strategy** | `paymentManagement/PaymentStrategies/` | Swap payment providers (Stripe / Cash) without changing order logic |
| **Repository** | All modules | Isolate DB queries from business logic |
| **Service Layer** | All modules | Thin controllers, fat services |

---

## 🗄️ Redis — Cart Management

### Why Redis?

The cart is a short-lived, frequently mutated data structure. Storing it in Redis instead of PostgreSQL gives:

| Benefit | Detail |
|---|---|
| **Speed** | Sub-millisecond reads/writes vs DB round-trips |
| **Simplicity** | No migration needed when cart schema changes |
| **TTL support** | Carts can expire automatically (future feature) |
| **Isolation** | Cart state is separate from order/payment data |

### Redis Key Structure

Each customer's cart uses **three keys**:

```
cart:{customerId}          → Hash  — restaurantId, isLocked
cart:{customerId}:items    → Hash  — cartItemId → JSON item object
cart:{customerId}:counter  → String — auto-increment for item IDs
```

### Architecture

```
POST /api/v1/cart  →  CartController
                          │
                          ▼
                   CartRedisService          ← business logic
                          │
                          ▼
                  CartRedisRepository        ← Redis read/write
                          │
                          ▼
                     lib/redis.ts            ← singleton client
                          │
                          ▼
                    Redis Server :6379
```

> **Note:** Menu item validation (stock, price) still reads from PostgreSQL via Prisma.  
> The original `CartService` (Prisma-based) is kept intact and used exclusively by Order Management.

---

## 🚀Setup & Installation Guide

Follow these steps to set up the backend environment locally:

### Prerequisites

- Node.js (v25.9.0) — _We provide an `.nvmrc` file for easy switching via `nvm use`_
- Docker & Docker Compose
- Git
- **Redis Server** (v6+) — required for cart endpoints to work

### Installation Steps (Local Environment)

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Foodlify/Group-1-Team-1.git
   cd Group-1-Team-1
   ```

2. **Select the correct Node version:**
   ```bash
   nvm use
   ```

#### When run on local machine

3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Environment Setup:**
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:

   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/foodlify"
   REDIS_URL=redis://localhost:6379
   ```

5. **Install & Start Redis:**

   **Ubuntu / Debian:**
   ```bash
   sudo apt-get install -y redis-server
   sudo service redis-server start
   ```

   **macOS (Homebrew):**
   ```bash
   brew install redis
   brew services start redis
   ```

   **Verify Redis is running:**
   ```bash
   redis-cli ping   # should print: PONG
   ```

6. **Database Migration:**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

7. **Database seed:**
   ```bash
   npx prisma db seed
   ```

8. **Start the Development Server:**

   ```bash
   npm run dev
   ```

   You should see in the console:
   ```
   [Redis] Connected
   [Redis] Ready
   Server is running on http://localhost:3000/api/health
   ```


#### When run on Docker

1. **Start the API, database, and Redis (Docker):**

   ```bash
   docker-compose up -d
   ```

   > Make sure your `docker-compose.yml` includes a Redis service (see below).
   > If not already present, add:
   > ```yaml
   > redis:
   >   image: redis:alpine
   >   ports:
   >     - "6379:6379"
   > ```
   > And add `REDIS_URL=redis://redis:6379` to your API service environment.

2. **Database Migration:**

   ```bash
   docker exec -it foodlify_api prisma generate
   docker exec -it foodlify_api npx prisma db push
   ```

3. **Database seed:**
   ```bash
   docker exec -it foodlify_api npx prisma db seed
   ```

### Troubleshooting Redis

| Error | Cause | Fix |
|---|---|---|
| `client is closed` | Redis not running when server started | Start Redis, then restart the Node server |
| `connect ECONNREFUSED 127.0.0.1:6379` | Redis server not running | Run `sudo service redis-server start` |
| Cart endpoints return 500 | Redis unreachable | Check `redis-cli ping` returns `PONG` |
---


## API Documentation

Once the server is running, explore the Swagger documentation at:
`http://localhost:3000/api-docs`

All routes are prefixed with `/api/v1`.

### Customer Auth & Profile — `/api/v1/customers`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new customer |
| POST | `/login` | Public | Login, sets httpOnly cookies |
| POST | `/refresh-token` | Public | Rotate refresh token |
| POST | `/forgot-password` | Public | Send password reset email |
| POST | `/reset-password-from-link` | Public | Reset password via token link |
| POST | `/logout` | Customer | Revoke current refresh token |
| DELETE | `/refresh-token` | Customer | Revoke refresh token explicitly |
| POST | `/change-password` | Customer | Change password (old + new) |
| GET | `/profile` | Customer | Get own profile |
| PATCH | `/profile` | Customer | Update name, phone, dob, gender |
| PATCH | `/profile/email` | Customer | Update email (requires password) |

### Dashboard Auth & User Management — `/api/v1/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Dashboard login |
| POST | `/auth/refresh-token` | Public | Rotate refresh token |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Reset via link token |
| POST | `/auth/logout` | Admin | Logout |
| DELETE | `/auth/refresh-token` | Admin | Revoke refresh token |
| POST | `/auth/change-password` | Admin | Change password |
| GET | `/profile` | Admin | Get own profile |
| PATCH | `/profile` | Admin | Update name |
| PATCH | `/profile/email` | Admin | Update email |
| GET | `/users` | SUPER_ADMIN / ADMIN | List all admin users |
| GET | `/users/:id` | SUPER_ADMIN / ADMIN | Get admin user |
| POST | `/users` | SUPER_ADMIN | Create admin user |
| PATCH | `/users/:id` | SUPER_ADMIN / ADMIN | Update admin user |
| DELETE | `/users/:id` | SUPER_ADMIN | Delete admin user |

### Restaurants & Menus — `/api/v1/restaurants`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List restaurants |
| GET | `/:restaurantId` | Public | Get single restaurant |
| GET | `/:restaurantId/menus/:menuId` | Public | Get menu |
| GET | `/menus/:menuId/menuItem/:menuItemId` | Public | Get menu item |
| POST | `/restaurants/add-restaurant` | SUPER_ADMIN / RESTAURANT_OWNER | Create restaurant |
| PATCH | `/restaurants/update/:restaurantId` | SUPER_ADMIN / RESTAURANT_OWNER | Update restaurant |
| DELETE | `/restaurants/delete/:restaurantId` | SUPER_ADMIN / RESTAURANT_OWNER | Delete restaurant |
| POST | `/:restaurantId/menus` | SUPER_ADMIN / RESTAURANT_OWNER | Create menu |
| PATCH | `/:restaurantId/menus/:menuId` | SUPER_ADMIN / RESTAURANT_OWNER | Update menu |
| DELETE | `/:restaurantId/menus/:menuId` | SUPER_ADMIN / RESTAURANT_OWNER | Delete menu |
| POST | `/:restaurantId/menus/:menuId/items` | SUPER_ADMIN / RESTAURANT_OWNER | Create menu item |
| PATCH | `/menus/:menuId/items/:menuItemId` | SUPER_ADMIN / RESTAURANT_OWNER | Update menu item |
| DELETE | `/menus/:menuId/items/:menuItemId` | SUPER_ADMIN / RESTAURANT_OWNER | Delete menu item |

### Cart — `/api/v1/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Customer | Add item to cart |
| GET | `/` | Customer | View cart |
| DELETE | `/` | Customer | Clear entire cart |
| PATCH | `/:itemId` | Customer | Update item quantity |
| DELETE | `/:itemId` | Customer | Remove single item |
| GET | `/price-quantity` | Customer | Get cart total price + quantity |

### Orders — `/api/v1/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/checkout` | Customer | Checkout (prepare order) |
| POST | `/` | Customer | Place order |
| GET | `/:orderId` | Customer | Get single order |
| PATCH | `/:orderId/status` | Customer | Update order status |
| GET | `/status?status=` | Customer | Get orders by status |
| PATCH | `/:orderId/cancel-order` | Customer | Cancel order |
| GET | `/:orderId/tracking-history` | Customer | Get tracking history |

### Order Summary — `/api/v1/order-summary`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Customer | Get all order summaries |

### Customer Service — `/api/v1/customer-service`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ticket` | Customer | Create support ticket |
| GET | `/ticket/:id` | Customer | Get support ticket |
| PATCH | `/ticket/:id` | Customer | Update ticket status |
| PATCH | `/ticket/:id/resolve` | Customer | Resolve ticket |
| POST | `/rate/:orderId` | Customer | Rate restaurant |
| GET | `/points` | Customer | Get loyalty points |
| GET | `/points/redeem` | Customer | Redeem points to money |

### Webhooks — `/api/v1/webhook`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Stripe signature | Handle Stripe payment events |

---

## 🧪 Testing Suite

### Tools

| Tool | Purpose |
|---|---|
| **Jest** | Test runner + assertions |
| **ts-jest** | TypeScript transform for Jest |
| **Supertest** | HTTP integration tests |

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage report
npx jest --coverage

# Run specific module
npx jest tests/customerManagement/
npx jest tests/userManagement/
```

### Test Files

| File | Tests | Coverage |
|---|---|---|
| `tests/customerManagement/customer.service.test.ts` | 27 | 100% stmts/branch |
| `tests/customerManagement/customer.profile.service.test.ts` | 13 | 100% stmts/branch |
| `tests/userManagement/auth.service.test.ts` | 27 | 100% stmts/branch |
| `tests/userManagement/user.service.test.ts` | 22 | 100% stmts/branch |
| `tests/userManagement/profile.service.test.ts` | 13 | 100% stmts/branch |
| `tests/health.test.ts` | 1 | Health check integration |

### Strategy

- **Unit tests** mock all dependencies (repositories, shared services, Prisma, logger)
- Every service method covered: happy path + all error branches
- `jest.mocked()` for type-safe mocks
- `describe` + `it` structure per function, all scenarios per block

### Environment Variables for Tests

Tests use in-memory mocks — no real DB or Redis required. JWT uses default fallback secrets (`supersecret` / `superrefreshsecret`) when env vars are absent.

---
