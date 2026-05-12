# E-Commerce API

REST API for an e-commerce application built with Node.js, Express, and PostgreSQL.

This project was built as a server-side API project and includes user authentication, protected routes, product management, user account management, cart management, order creation from cart contents, Swagger API documentation, and an automated smoke test suite.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Neon Postgres
- bcrypt
- JSON Web Tokens
- Swagger UI
- OpenAPI YAML
- Mocha
- Chai
- Supertest
- dotenv

## Features

- Express API server
- PostgreSQL database connection through Neon
- Database schema for users, products, carts, cart items, orders, and order items
- User registration
- User login with JWT
- Password hashing with bcrypt
- JWT middleware for protected routes
- CRUD operations for users
- CRUD operations for products
- Cart creation and cart item management
- Order creation from cart contents
- Order item snapshots using price at purchase
- Product inventory reduction when orders are placed
- Swagger UI API documentation
- Automated smoke test suite covering the main API flow

## Project Structure

```text
ecommerce-api/
├─ app.js
├─ server.js
├─ db/
│  ├─ index.js
│  └─ schema.sql
├─ docs/
│  ├─ api-plan.md
│  └─ openapi.yaml
├─ middleware/
│  └─ authMiddleware.js
├─ models/
│  ├─ cartModel.js
│  ├─ orderModel.js
│  ├─ productModel.js
│  └─ userModel.js
├─ routes/
│  ├─ auth.routes.js
│  ├─ cart.routes.js
│  ├─ orders.routes.js
│  ├─ products.routes.js
│  └─ users.routes.js
├─ test/
│  └─ smoke.test.js
├─ .env.example
├─ package.json
└─ README.md
```

## Environment Variables

Create a `.env` file in the project root using `.env.example` as a guide.

```env
PORT=4001
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=replace-with-your-own-secret
```

Do not commit the real `.env` file.

## Installation

```bash
npm install
```

## Running the Server

```bash
npm run dev
```

The API runs at:

```text
http://localhost:4001
```

## Running Tests

```bash
npm test
```

Expected result:

```text
24 passing
```

The smoke test suite verifies the main project flow:

- API health
- Database health
- User registration
- User login
- JWT-protected auth route
- Product creation, retrieval, update, and deletion
- Cart item creation, retrieval, and update
- Order creation from cart
- Order retrieval and status update
- User retrieval and update
- Cleanup of test order, product, and user

## Database Setup

The schema is located at:

```text
db/schema.sql
```

Run the SQL in your PostgreSQL database or Neon SQL Editor to create the required tables.

Expected tables:

```text
users
products
carts
cart_items
orders
order_items
```

## API Documentation

Swagger UI is available at:

```text
http://localhost:4001/api-docs/
```

The OpenAPI specification is located at:

```text
docs/openapi.yaml
```

Swagger includes documentation for:

- Health
- Auth
- Users
- Products
- Cart
- Orders

## API Endpoints

### Health

```text
GET /         
GET /health/db
```

### Auth

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Users

Protected with JWT.

```text
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

### Products

Product reads are public. Product creation, updates, and deletes are protected with JWT.

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
```

### Cart

Protected with JWT.

```text
GET    /cart/:userId
POST   /cart/:userId/items
PUT    /cart/:userId/items/:productId
DELETE /cart/:userId/items/:productId
DELETE /cart/:userId
```

### Orders

Protected with JWT.

```text
POST   /orders/:userId
GET    /orders
GET    /orders/:id
GET    /orders/user/:userId
PUT    /orders/:id
DELETE /orders/:id
```

## Authentication

Protected endpoints require a bearer token.

Example:

```bash
curl --request GET \
--url http://localhost:4001/auth/me \
--header "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Example Register Request

```bash
curl --request POST \
--url http://localhost:4001/auth/register \
--header "Content-Type: application/json" \
--data "{\"username\":\"demo\",\"email\":\"demo@example.com\",\"password\":\"test123\"}"
```

## Example Login Request

```bash
curl --request POST \
--url http://localhost:4001/auth/login \
--header "Content-Type: application/json" \
--data "{\"email\":\"demo@example.com\",\"password\":\"test123\"}"
```

## Example Product Creation Request

```bash
curl --request POST \
--url http://localhost:4001/products \
--header "Content-Type: application/json" \
--header "Authorization: Bearer YOUR_TOKEN_HERE" \
--data "{\"name\":\"Forge Mug\",\"description\":\"A sturdy mug for long coding sessions\",\"price\":14.99,\"inventoryQuantity\":25}"
```

## Example Cart Request

```bash
curl --request POST \
--url http://localhost:4001/cart/1/items \
--header "Content-Type: application/json" \
--header "Authorization: Bearer YOUR_TOKEN_HERE" \
--data "{\"productId\":1,\"quantity\":2}"
```

## Example Order Request

```bash
curl --request POST \
--url http://localhost:4001/orders/1 \
--header "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes

- PostgreSQL `NUMERIC` values may be returned as strings by the `pg` package.
- The order creation flow uses a database transaction.
- Order items store `price_at_purchase` so historical order totals remain accurate.
- Creating an order reduces product inventory and clears the user's cart.
- The smoke test uses unique user and product data each run, then cleans up after itself.

## Status

Core project functionality is complete and covered by an automated smoke test suite.

Completed:

- Express server
- Neon PostgreSQL connection
- Database schema
- User registration
- User login
- JWT middleware
- User CRUD
- Product CRUD
- Cart CRUD
- Order CRUD
- Swagger documentation
- README and environment example
- Automated smoke test suite
