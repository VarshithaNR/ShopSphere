# ShopSphere

A full-stack MERN e-commerce application — product catalog, cart, checkout,
order tracking, customer reviews, wishlist, and an admin dashboard for
managing products and orders.

Built with React (Vite), Node.js/Express, and MongoDB Atlas.

> **Note:** Card and UPI are presented as payment *method selections* only.
> No payment gateway is integrated, and the app never claims a card/UPI
> payment was actually processed — only Cash on Delivery orders are
> genuinely fulfillable end-to-end today. See [Payment Architecture](#payment-architecture).

---

## Overview

ShopSphere lets a customer browse and search products, filter by category
and price, add items to a cart, check out, and track their order status.
Registered users can leave one review per product and maintain a wishlist.
Admins get a dashboard with sales/stock statistics and full product/order
management.

## Features

**Customer**
- Browse, search, filter (category, price range), and sort products
- Product details with related products and customer reviews
- Cart with stock-aware quantity controls
- Checkout with server-verified pricing and stock (see [Security Notes](#security-notes))
- Order history, order details, and a status tracker
- Wishlist: save products, move to cart, remove
- Account page: edit name, change password
- One review per product per user, with a live average rating

**Admin**
- Dashboard: total products/orders/customers/sales, pending & delivered
  orders, low-stock and out-of-stock counts, recent orders, recently added
  and low-stock product lists
- Product management: search, filter by category/stock, add, edit, delete
- Order management: search, filter by status/payment method, update status
  (with sane status-transition rules and automatic, idempotent stock
  restoration on cancellation)

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 19 (Vite), React Router 7, Axios |
| Backend   | Node.js, Express 5 |
| Database  | MongoDB Atlas (Mongoose 9) |
| Auth      | JWT + bcrypt |
| Styling   | Hand-written CSS design system (no UI framework) |

No UI component library, no CSS framework, and no extra runtime
dependencies were added beyond what's listed above — the toast system,
skeleton loaders, and rate limiter are all hand-written rather than
pulled in as packages.

## Architecture

```
Browser (React SPA)
      │  Axios, JWT in Authorization header
      ▼
Express API (Node.js)
      │  Mongoose
      ▼
MongoDB Atlas
```

The frontend never talks to MongoDB directly and never computes prices or
totals that get trusted by the backend — every order total, stock check,
and price is recalculated server-side from the current database state.

## Project Structure

```
ShopSphere/
├── backend/
│   ├── controllers/     # Request handlers (business logic)
│   ├── middleware/      # Auth, admin-check, rate limiting, error handling
│   ├── models/          # Mongoose schemas (User, Product, Order, Review)
│   ├── routes/          # Express routers, mounted in server.js
│   ├── utils/           # Small shared helpers (AppError, validators)
│   ├── createAdmin.js   # One-off script to seed an admin account
│   ├── server.js        # App entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/          # One file per backend resource (axios wrappers)
    │   ├── components/   # Reusable UI (Navbar, ProductCard, Spinner, ...)
    │   ├── context/       # Auth, Cart, Wishlist, Toast (React Context)
    │   ├── pages/         # One file per route, plus pages/admin/
    │   ├── App.jsx        # Route definitions
    │   └── index.css      # Design system (tokens, components, layout)
    └── .env.example
```

## Authentication

- Registration/login issue a JWT (7-day expiry) containing the user's id
  and role.
- The token is sent as `Authorization: Bearer <token>` on every request via
  an Axios interceptor.
- A 401 response (expired/invalid token) clears the stored session,
  notifies the user, and the app's protected routes redirect to `/login`.
- Two middleware layers protect routes: `authMiddleware` (must be logged
  in) and `adminMiddleware` (must additionally have `role: "admin"`).
- Passwords are hashed with bcrypt (cost factor 10) and never returned by
  any API response.

## Product Management

Admins can create, edit, and delete products. The API only accepts a
whitelisted set of fields (`name`, `description`, `price`, `category`,
`brand`, `image`, `stock`) — a request body can't inject `rating`,
`numReviews`, `_id`, or timestamps. `rating` and `numReviews` are
system-computed from actual reviews, never admin-editable.

## Cart

The cart is client-side (localStorage), since it's pre-checkout scratch
state — nothing sensitive, and no reason to round-trip it to the server on
every quantity change. It's stock-aware (won't let you add more than what
the product page reported as available), but the authoritative stock check
happens again at checkout, server-side.

## Checkout & Order System

This is the part with the most security-sensitive logic:

- **Price and total are never trusted from the client.** The server looks
  up each product's current price in MongoDB and computes the order total
  itself.
- **Stock is checked and decremented atomically** using
  `findOneAndUpdate({ stock: { $gte: quantity } }, { $inc: { stock: -quantity } })`
  inside a MongoDB transaction, so two customers can't both successfully
  order the last unit of a product.
- Duplicate product IDs in one request are merged before the stock check,
  so a crafted payload can't bypass it by splitting one item across two
  lines.
- All product IDs, quantities (integer, 1–1000), payment method, and
  shipping fields are validated server-side.
- Customer order endpoints only ever return the logged-in customer's own
  orders; admin endpoints can see all orders.
- Order status transitions are constrained (`Pending → Confirmed → Shipped
  → Delivered`, with `Cancelled` reachable from any non-terminal state).
  Cancelling restores stock exactly once, tracked with a `stockRestored`
  flag so re-triggering the same cancellation never double-restores stock.

## Reviews

- One review per user per product, enforced both in the controller and
  with a unique `(product, user)` index in MongoDB (so a race between two
  simultaneous requests can't create duplicates either).
- Rating must be an integer 1–5; comments are required and capped at 1000
  characters.
- A product's average `rating` and `numReviews` are recalculated whenever
  a review is added.
- Reviews are **not** labeled "Verified Purchase" — there's no
  purchase-verification check implemented, so the UI doesn't claim one.

## Wishlist

Stored server-side as an array of product references on the `User`
document (not localStorage), because it's meant to follow the account
across devices and must never be visible to anyone but its owner. Every
wishlist route requires authentication and always operates on
`req.user.id` — there's no way to address another user's wishlist by ID.

## Admin Dashboard

`GET /api/admin/stats` (JWT + admin protected) returns product/order/
customer/sales counts, pending/delivered order counts, low/out-of-stock
counts, the 5 most recent orders, the 5 lowest-stock products, and the 5
most recently added products — all computed live from MongoDB, nothing
hardcoded.

## Payment Architecture

Cash on Delivery is the only payment method that's actually fulfilled
today. UPI and Card are present as **selectable payment methods** in the
schema and checkout form, but the UI explicitly labels them as a demo
("no live payment gateway is connected") rather than claiming a real
charge succeeded.

To add a real gateway later (e.g. Razorpay or Stripe):
1. Keep the secret/API key only in `backend/.env`, never sent to the
   frontend.
2. Create the payment order/intent server-side, return only the
   client-safe public key + order/intent ID to the frontend.
3. Verify the payment signature/webhook **server-side** before marking an
   order's payment as complete — never trust a "success" flag sent from
   the browser.
4. Keep `Order.paymentMethod` and add a separate `paymentStatus` field
   distinct from order `status`, so "paid" and "shipped" aren't conflated.

## Environment Variables

Neither `.env` file is committed — both are covered by `.gitignore`, and
this document doesn't contain real values. Copy the `.example` files and
fill them in.

**`backend/.env`** (see `backend/.env.example`)
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Port the API listens on (defaults to 5000) |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `FRONTEND_URL` | Comma-separated allowed CORS origin(s) in production |
| `NODE_ENV` | `development` or `production` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional overrides for `npm run seed:admin` |

**`frontend/.env`** (see `frontend/.env.example`)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, including `/api` |

## Local Setup

Prerequisites: Node.js 18+, a MongoDB Atlas cluster (or local MongoDB),
and npm.

```bash
git clone <your-repo-url>
cd ShopSphere
```

### Running the Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev             # nodemon, http://localhost:5000
```

Seed an admin account (optional, safe to skip if you already have one):
```bash
npm run seed:admin
```

### Running the Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api for local dev
npm run dev              # http://localhost:5173
```

### Running a Production Build Locally

```bash
cd frontend
npm run build
npm run preview
```

## API Overview

All routes are prefixed with `/api`. 🔒 = requires a valid JWT. 👑 = also
requires `role: "admin"`.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Create an account, returns a JWT |
| POST | `/auth/login` | Log in, returns a JWT |
| GET | `/auth/me` 🔒 | Current user's profile |
| PUT | `/auth/profile` 🔒 | Update name |
| PUT | `/auth/change-password` 🔒 | Change password |
| GET | `/products` | List products (search, category, price range, sort, pagination) |
| GET | `/products/:id` | Product details |
| GET | `/products/:id/related` | Related products (same category) |
| POST | `/products` 👑 | Create product |
| PUT | `/products/:id` 👑 | Update product |
| DELETE | `/products/:id` 👑 | Delete product |
| GET | `/reviews/:productId` | List reviews for a product |
| POST | `/reviews` 🔒 | Submit a review |
| POST | `/orders` 🔒 | Place an order (server computes price/total) |
| GET | `/orders` 🔒 | Current user's orders |
| GET | `/orders/:id` 🔒 | One of the current user's orders |
| GET | `/wishlist` 🔒 | Current user's wishlist |
| POST | `/wishlist/:productId` 🔒 | Add to wishlist |
| DELETE | `/wishlist/:productId` 🔒 | Remove from wishlist |
| GET | `/admin/orders` 👑 | All orders (search, status/payment filter) |
| GET | `/admin/orders/:id` 👑 | Any single order |
| PUT | `/admin/orders/:id/status` 👑 | Update order status |
| GET | `/admin/stats` 👑 | Dashboard statistics |
| GET | `/health` | Health check (used by hosting providers) |

## Deployment

### Frontend (e.g. Vercel / Netlify)
1. Set the build command to `npm run build` and the output directory to
   `dist`.
2. Set the environment variable `VITE_API_URL` to your deployed backend's
   URL, including `/api` (e.g. `https://shopsphere-api.onrender.com/api`).
3. Deploy. Client-side routing needs a rewrite rule so deep links (e.g.
   `/products/123`) don't 404 — Vercel/Netlify both do this automatically
   for a Vite SPA when the framework preset is selected.

### Backend (e.g. Render / Railway)
1. Set the start command to `npm start` (root: `backend`).
2. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT` (most
   providers set this for you), `FRONTEND_URL` (your deployed frontend's
   origin, e.g. `https://shopsphere.vercel.app`), `NODE_ENV=production`.
3. The `/api/health` endpoint can be used as the provider's health check
   URL.

### MongoDB Atlas Production Checklist
- [ ] Database user has a strong, unique password (not the sample one from
      the connection string wizard)
- [ ] Network access allows your backend host's IP (or `0.0.0.0/0` only if
      you understand the tradeoff — a specific IP allowlist is safer)
- [ ] The database user's role is scoped to this database, not an
      account-wide admin role
- [ ] Backups/point-in-time recovery enabled if this data matters
- [ ] Connection string in `MONGO_URI` uses `mongodb+srv://` and is only
      ever stored in the hosting provider's environment variable settings

### GitHub Safety Checklist
- [ ] `backend/.env` and `frontend/.env` are **not** committed (verify
      with `git status` — both should be untracked, and `.gitignore`
      already lists `.env`)
- [ ] `node_modules/` is not committed
- [ ] No API keys, connection strings, or JWT secrets appear anywhere in
      committed source, commit messages, or this README
- [ ] `git log --all -- backend/.env frontend/.env` returns nothing (confirms
      neither file was ever committed in the project's history)

## Security Notes

- Server-side price/stock recalculation on every order (see
  [Checkout & Order System](#checkout--order-system)) — the single most
  important control in this app.
- JWT auth + role-based admin authorization on every sensitive route.
- Passwords hashed with bcrypt; never returned in any API response.
- Field whitelisting on product create/update (no mass-assignment).
- ObjectId format validated before every database lookup (bad IDs return
  400, not a raw MongoDB error).
- Regex-based search input is escaped to prevent regex-injection/ReDoS.
- CORS restricted to `FRONTEND_URL` in production.
- Basic dependency-free rate limiting on `/auth/register` and
  `/auth/login`.
- Centralized error handler — no stack traces or internal error details
  leak to the client.
- This is a portfolio/demo project, not an audited production system —
  before handling real payments or real customer data, get an
  independent security review.

## Screenshots

_Add screenshots here before publishing — e.g._

```
docs/screenshots/home.png
docs/screenshots/product-details.png
docs/screenshots/checkout.png
docs/screenshots/admin-dashboard.png
```

## Future Improvements

- Real payment gateway integration (Razorpay/Stripe) per the architecture
  notes above
- Server-side rendering or pre-rendering for better SEO (this is a
  client-rendered SPA today — see note below)
- Product image upload (currently image URLs only)
- Email notifications on order status changes
- Purchase-verification for reviews ("Verified Purchase" badge)
- Automated tests (unit + integration)

---

**A note on SEO:** this is a client-rendered single-page app. Page titles,
meta description, and semantic HTML are in place, but a crawler that
doesn't execute JavaScript will only see the initial shell — full SEO
would need server-side rendering or static pre-rendering (e.g. Next.js,
or a prerender service), which is out of scope for this project as-is.
