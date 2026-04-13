# Bellaveste Frontend — Knowledge Transfer (KT)

This document explains the app structure, key flows, APIs, and how to extend or troubleshoot the codebase.

## Overview
- React + Vite, lazy-loaded routes: [App.jsx](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/App.jsx)
- State: Redux Toolkit slices for cart/orders; Context for auth.
- Networking: Axios client with token + refresh interceptors: [client.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/http/client.js)
- UI: Tailwind-style utility classes, responsive layout, accessibility in controls.

## Getting Started
- Prerequisites: Node 18+ and a running backend at VITE_API_BASE_URL
- Configure env: [env.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/app/config/env.js) (uses `import.meta.env.VITE_API_BASE_URL`, defaults to `http://localhost:5000/api/v1`)
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Project Structure
- Components
  - Layout: Header/Footer, search overlay trigger: [Header.jsx](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/components/layout/Header.jsx)
  - UI: Reusable bits like product cards: [ProductCard.jsx](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/components/ui/ProductCard.jsx)
- Pages
  - Home: Centered loader, sections: [Home](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/Home/index.jsx)
  - Shop: Reads `?search=` and filters products client-side: [Shop](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/Shop/index.jsx)
  - ProductDetails: Variant selection, add to cart (local + server): [ProductDetails](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/ProductDetails/index.jsx)
  - Cart: Cart summary and actions: [Cart](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/Cart/index.jsx)
  - Checkout: Auth-guarded, sync local cart → server, place order: [Checkout](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/checkout/index.jsx)
  - ThankYou: Displays last order receipt: [ThankYou](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/ThankYou/index.jsx)
  - Orders: Lists server + local fallback orders: [Orders](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/Orders/index.jsx)
  - Profile: Tabs for Profile / Saved Addresses / Purchased / Wishlist: [Profile](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/pages/Profile/index.jsx)
- Services (API clients)
  - Auth: [authApi.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/api/authApi.js)
  - Users: [userApi.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/api/userApi.js)
  - Products: [productApi.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/api/productApi.js)
  - Cart: [cartApi.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/api/cartApi.js)
  - Orders: [orderApi.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/api/orderApi.js)
  - Wishlist: [wishlistApi.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/services/api/wishlistApi.js)
- State
  - Cart slice: selectors, add/clear: src/features/cart
  - Orders slice: last order cache: src/features/orders
- Auth
  - Provider: [AuthContext.jsx](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/context/AuthContext.jsx)
  - Hook: [useAuth](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/context/useAuth.js)
  - PrivateRoute: [PrivateRoute](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/components/auth/PrivateRoute.jsx)

## Routing & Guards
- Routes are lazy-loaded in [App.jsx](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/App.jsx).
- `/checkout` and `/orders` are wrapped in PrivateRoute to require login.
- Search overlay navigates to `/shop?search=term`.

## Key Flows
- Search
  - Header icon opens a top overlay with an input.
  - Submitting redirects to `/shop?search=...` and Shop filters client-side (name/description).
- Cart
  - Local Redux updates immediately.
  - If logged in, backend is also updated via `cartApi.addToCart(...)` for persistence and order creation.
  - Remove/clear via `cartApi` endpoints when applicable.
- Checkout
  - Sync local cart to server cart (clear → replay items).
  - Create order: `orderApi.create({...})`
  - Card payments: mark paid via `orderApi.markPaid(orderId, payload)`
  - Fallback: if the backend throws “next is not a function”, a local order is saved and shown in ThankYou + Orders.
- Orders
  - Fetches `GET /orders/my-orders` and merges with local fallback cache key `orders:<userId>`.
- Profile Tabs
  - Profile: basic info + edit.
  - Saved Addresses: stored per-user in localStorage (`addresses:<userId>`) with add/set default/remove.
  - Purchased: renders flat product list derived from orders.
  - Wishlist: reads from backend and supports remove.

## Axios Client & Auth
- Base URL from env: [env.js](file:///c:/Users/Quadrant/Desktop/My%20Study/bellaveste/src/app/config/env.js)
- Request Interceptor injects `Authorization: Bearer <token>` when present.
- Response Interceptor returns `response.data` and tries refresh on 401, storing the new token, then retries the original request.
- If refresh fails, tokens are cleared and the user is redirected to `/login`.

## API Endpoints (per backend)
- Auth: `/auth/login`, `/auth/refresh-token`, etc.
- Products: `/products` with optional query params (`category`, `slug`, etc.)
- Cart: `/cart`, `/cart/update-item`, `/cart/remove-item/:id`, `DELETE /cart`
- Orders:
  - Create: `POST /orders` (reads items from cart, stores order, clears cart)
  - My Orders: `GET /orders/my-orders`
  - Mark Paid: `PATCH /orders/:id/pay`

## Conventions & Patterns
- Use folder imports for lazy routes (avoid `index.jsx` suffix): e.g., `React.lazy(() => import('./pages/Checkout'))`
- Prefer calling API clients in pages/components rather than raw fetch; handle errors gracefully.
- Tailwind-like utility classes for layout and theming.
- Keep business logic in pages/features; components stay focused on presentation.

## Extending the App
- Server-side Search
  - Update `productApi.getAll(params)` to include your backend search param (`q`, `name`, etc.) and call with it from Shop.
- Address storage in backend
  - Replace local `addresses:<userId>` reads/writes with user endpoints if available (e.g., `/users/me/addresses`).
- Order details page
  - Add `OrderDetails` route that reads `GET /orders/:id` and falls back to local cache for `LOCAL-*` ids.
- Wishlist actions on product cards
  - Use `wishlistApi.add(productId)` and `wishlistApi.remove(productId)` and indicate state per product.

## Troubleshooting
- “Next is not a function” on create order
  - A backend middleware/controller mismatch; frontend falls back to local order for continuity.
  - Fix: ensure Express route handlers using `next()` include `(req, res, next)` signature and middleware ordering is correct.
- Empty cart at checkout despite items shown
  - Occurs when local cart differs from server cart; the checkout sync replays local items to server before creating the order.

## Verification
- Lint: `npm run lint` should pass.
- Build: `npm run build` should pass.
- Flows to test: 
  - Login → add products → checkout (UPI and Card) → Thank You → My Orders
  - Search via header → Shop filters
  - Profile tabs: addresses add/default/remove; wishlist remove; purchased renders.

## Directory Cheat Sheet
- src/components/layout: header/footer and site shell
- src/components/ui: reusable presentational components
- src/pages: route-level views (Home, Shop, ProductDetails, Cart, Checkout, ThankYou, Orders, Profile)
- src/services/http: axios setup
- src/services/api: API clients by domain
- src/context: auth provider + hook
- src/features: Redux slices and selectors

## Where to Use What
- Page-level data: use API clients from `src/services/api`, combine with Redux/Context as needed.
- Auth-guarded routes: wrap with `PrivateRoute`.
- Simple UI states (loading/errors): keep in page component state; prefer consistent spinner UI used in Home/ProductSection.
- Cross-cutting concerns (auth, tokens): rely on `client.js` interceptors; don’t reinvent headers.
- Local-only caches: addresses and local fallback orders use `localStorage` with keys namespaced by user id.
