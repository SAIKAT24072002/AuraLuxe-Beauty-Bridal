# AuraLuxe Beauty & Bridal MERN Platform

Production-oriented MERN booking platform for beauty appointments, bridal makeup services, admin operations, media management, coupons, and payment-ready booking flows.

## Current Status

This repository is in final production audit state:

- MongoDB-backed beauty and bridal booking flows
- Admin authentication and protected CRUD
- Cloudinary-backed media uploads
- Coupon validation and 50% advance calculation
- Remaining payment architecture with safe no-credential fallback
- Socket.IO notifications and booking tracking
- Premium customer UI plus admin workspace

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Framer Motion, Axios, Lucide React
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Socket.IO
- Media: Cloudinary
- Payments: Razorpay-ready architecture

## Project Structure

```text
frontend/
backend/
README.md
.gitignore
```

## Environment Variables

See:

- `frontend/.env.example`
- `backend/.env.example`

Required later for Render:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `ADMIN_SETUP_KEY`
- `ENABLE_ADMIN_SETUP_ROUTE`
- `ADMIN_SEED_NAME`
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- `ADMIN_SEED_PHONE`
- `CLIENT_URL`
- `CLIENT_URLS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Required later for Vercel:

- `VITE_API_URL`
- `VITE_RAZORPAY_KEY_ID`

## Local Run

```bash
npm install
npm run dev:frontend
npm run dev:backend
```

## Deployment Notes

- `frontend/vercel.json` provides SPA route rewrites for direct navigation and refresh safety.
- Backend and Socket.IO CORS are environment-driven via `CLIENT_URL` and optional comma-separated `CLIENT_URLS`.
- Keep `.env` files untracked and never place credential values in frontend source.
