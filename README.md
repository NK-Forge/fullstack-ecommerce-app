# Full-Stack E-Commerce App

A full-stack e-commerce application built with React, Node.js, Express, PostgreSQL, Google OAuth, and Stripe Checkout.

This project began as an e-commerce REST API and was extended into a deployed full-stack application with an interactive React client. Users can register, log in, authenticate with Google, browse products, manage a cart, complete checkout through Stripe, and view paid order history.

## Live Demo

```text
https://fullstack-ecommerce-app-qhpb.onrender.com
```

## Repository

```text
https://github.com/NK-Forge/fullstack-ecommerce-app
```

## Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express
- PostgreSQL
- Neon Postgres
- bcrypt
- JSON Web Tokens
- Google OAuth
- Stripe Checkout
- Stripe Webhooks
- Swagger UI
- OpenAPI YAML

### Testing and Tooling

- Mocha
- Chai
- Supertest
- ESLint
- dotenv
- Render

## Features

### User Accounts

- User registration
- User login with JWT authentication
- Google OAuth login
- Logout
- Protected client routes
- Persistent client session using local storage

### Product Browsing

- Product catalog page
- Product details page
- Public product browsing
- Product price and inventory display

### Cart

- Add products to cart
- View cart contents
- Increase and decrease item quantity
- Remove individual items
- Clear cart
- User ownership enforcement for cart routes

### Checkout and Payments

- Stripe Checkout Session creation
- Hosted Stripe checkout page
- Stripe webhook fulfillment
- Webhook signature verification
- Paid order creation after confirmed checkout
- Server-side cart data used for Stripe line items

### Orders

- Order history page
- Paid order status display
- User ownership enforcement for order-history routes
- Order item snapshots preserve price-at-purchase data

### Deployment

- Deployed on Render
- Express serves the built React client in production
- Same-origin API calls supported in production
- Environment-based configuration for local and deployed environments

## Project Structure

```text
fullstack-ecommerce-app/
├─ app.js
├─ server.js
├─ client/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  └─ src/
│     ├─ api/
│     ├─ auth/
│     ├─ components/
│     ├─ pages/
│     ├─ App.jsx
│     ├─ App.css
│     ├─ index.css
│     └─ main.jsx
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
│  ├─ oauth.routes.js
│  ├─ orders.routes.js
│  ├─ paymentWebhooks.routes.js
│  ├─ payments.routes.js
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
NODE_ENV=development
PORT=4001
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
JWT_SECRET=replace-with-your-own-secret
CLIENT_ORIGIN=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_replace-with-your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_replace-with-your-stripe-webhook-secret
STRIPE_CURRENCY=usd

GOOGLE_CLIENT_ID=replace-with-your-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4001/oauth/google/callback
```

Create a `client/.env` file for local frontend development:

```env
VITE_API_BASE_URL=http://localhost:4001
```

Do not commit real `.env` files or production secrets.

## Installation

Install backend dependencies from the project root:

```bash
npm install
```

Install frontend dependencies:

```bash
npm install --prefix client
```

## Database Setup

The database schema is located at:

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

## Running Locally

Start the backend from the project root:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:4001
```

Start the frontend from the `client/` directory:

```bash
cd client
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Production Build

From the project root:

```bash
npm run build
```

The root build script installs client build dependencies, builds the React client, and prunes client dev dependencies afterward.

## Running Tests

From the project root:

```bash
npm test
```

The smoke test suite verifies the main backend flow, including:

- API health
- Database health
- User registration
- User login
- JWT-protected auth route
- Google OAuth configuration handling
- Product creation, retrieval, update, and deletion
- Cart item creation, retrieval, update, removal, and ownership checks
- Stripe Checkout Session route security checks
- Stripe webhook validation checks
- Order creation from cart
- Order retrieval and status update
- Order-history ownership checks
- User retrieval and update
- Cleanup of test order, product, and users

## Client Verification

From the `client/` directory:

```bash
npm run build
npm run lint
```

## Google OAuth Setup

Create a Google OAuth Web Application credential in Google Cloud Console.

For local development, add this authorized redirect URI:

```text
http://localhost:4001/oauth/google/callback
```

For the deployed Render app, add this authorized redirect URI:

```text
https://fullstack-ecommerce-app-qhpb.onrender.com/oauth/google/callback
```

The OAuth flow is:

```text
React login/register page
→ Express /oauth/google
→ Google consent screen
→ Express /oauth/google/callback
→ React /oauth/callback
→ authenticated app session
```

## Stripe Test Mode Setup

This project uses Stripe Checkout and Stripe webhooks.

For local testing:

1. Add a Stripe test secret key to `.env`.
2. Start the backend.
3. Start the frontend.
4. Start the Stripe CLI listener:

```bash
stripe listen --events checkout.session.completed --forward-to http://localhost:4001/payments/webhook
```

5. Copy the `whsec_...` signing secret from the Stripe CLI into `.env` as `STRIPE_WEBHOOK_SECRET`.
6. Restart the backend.
7. Complete checkout using Stripe's test card:

```text
4242 4242 4242 4242
```

Use any future expiration date, any CVC, and any ZIP code.

For deployed testing, create a Stripe webhook endpoint:

```text
https://fullstack-ecommerce-app-qhpb.onrender.com/payments/webhook
```

Subscribe it to:

```text
checkout.session.completed
```

Then copy the webhook signing secret into Render as `STRIPE_WEBHOOK_SECRET`.

## API Documentation

Swagger UI is available locally at:

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
GET /health/db
```

In local development, the API root also returns a health message:

```text
GET /
```

In production, Express serves the React client at `/`.

### Auth

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### OAuth

```text
GET /oauth/google
GET /oauth/google/callback
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

Protected with JWT. User-scoped cart routes enforce ownership.

```text
GET    /cart/:userId
POST   /cart/:userId/items
PUT    /cart/:userId/items/:productId
DELETE /cart/:userId/items/:productId
DELETE /cart/:userId
```

### Orders

Protected with JWT. User order-history and user checkout routes enforce ownership.

```text
POST   /orders/:userId
GET    /orders
GET    /orders/:id
GET    /orders/user/:userId
PUT    /orders/:id
DELETE /orders/:id
```

### Payments

```text
POST /payments/checkout-session/:userId
POST /payments/webhook
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

## Render Deployment Notes

The app is deployed as a single Render Web Service.

Render settings:

```text
Runtime: Node
Branch: main
Build Command: npm install && npm run build
Start Command: npm start
```

Important Render environment variables:

```env
NODE_ENV=production
NODE_VERSION=22
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
CLIENT_ORIGIN=https://fullstack-ecommerce-app-qhpb.onrender.com

STRIPE_SECRET_KEY=your-stripe-test-or-live-secret-key
STRIPE_WEBHOOK_SECRET=your-deployed-stripe-webhook-secret
STRIPE_CURRENCY=usd

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://fullstack-ecommerce-app-qhpb.onrender.com/oauth/google/callback
```

## Security Notes

- Passwords are hashed with bcrypt.
- JWTs are required for protected routes.
- Cart routes enforce authenticated user ownership.
- User order-history routes enforce authenticated user ownership.
- Stripe Checkout line items are built from the server-side cart.
- Stripe webhook fulfillment verifies webhook signatures.
- Real secrets are stored in local `.env` files or Render environment variables, not in source control.

## Known Limitations and Future Work

- Admin-style routes such as user management, product mutations, and global order management currently use JWT protection but do not yet have role-based authorization.
- Stripe is verified in test mode for this project.
- The OpenAPI documentation may need expansion for the newer OAuth and payment routes.
- Product images and richer product data could be added.
- Order details could be expanded to show individual purchased items in the client.
- A production app should add stronger account-linking rules for OAuth users and email/password users with the same email.
- A production app should add persistent Stripe event/session IDs for stronger webhook idempotency.

## Status

Core project functionality is complete, deployed, and verified.

Verified:

- Local backend smoke tests
- Local client build and lint
- Render deployment
- Google OAuth login
- Stripe Checkout in test mode
- Stripe webhook fulfillment
- Paid order history
