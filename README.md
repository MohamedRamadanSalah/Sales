# Real-Estate Marketplace — Web App

A bilingual (Arabic / English) real-estate marketplace with three roles:
**brokers** list properties, **clients** find and buy them through an order → checkout → invoice flow,
and **admins** run the platform from an analytics dashboard.

Backend: [`sales_backend`](https://github.com/MohamedRamadanSalah/sales_backend) (Node.js REST API + PostgreSQL).

## Features

- **Auth**: sign-up, login, forgot/reset password, profile, with automatic token refresh
- **Search**: filterable property search with an interactive Leaflet map, plus detail pages with image galleries
- **Brokers**: create, edit and manage your own listings
- **Clients**: favorites, checkout, order tracking with progress steps
- **Invoices**: printable invoices with payment plan, parties, approval workflow, audit trail and document checklist
- **Admin**: dashboard, analytics, activity log, and order, property and location management
- **i18n**: full Arabic / English UI

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · SWR · Leaflet

## Project structure

```
src/
├── app/            # Routes (admin/*, checkout/[id], invoices/[id], properties, favorites, ...)
├── components/     # admin, common, home, invoice, layout, order, property, ui
├── context/        # AuthContext, ToastContext
├── lib/            # api.ts (fetch wrapper with token refresh), auth, formatters
├── i18n/           # Arabic / English translations
└── types/
```

## Getting started

```bash
npm install
# point the app at the API (local default of the backend):
echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.
