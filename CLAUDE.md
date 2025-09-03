# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```
Uses Next.js with Turbopack for faster development builds.

**Build for production:**
```bash
npm run build
```
Runs `prisma generate` before building.

**Linting:**
```bash
npm run lint
```
Uses ESLint with Next.js TypeScript configuration.

**Database commands:**
- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Run database migrations  
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma client
- `npm run db:reset` - Reset database with migrations

All database commands use `.env.local` for environment variables via dotenv.

## Architecture Overview

**Tech Stack:**
- Next.js 15 with React 19 and TypeScript
- Prisma ORM with PostgreSQL database
- NextAuth.js for authentication with Prisma adapter
- Stripe integration for payments
- Tailwind CSS with custom patisserie color scheme
- Context API for cart state management

**Key Directories:**
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components
- `src/context/` - React Context providers (CartContext)
- `src/lib/` - Utilities (auth, Stripe, Prisma client)
- `src/types/` - TypeScript type definitions
- `prisma/` - Database schema and migrations

**Authentication:**
Uses NextAuth.js with credentials provider and JWT strategy. User roles: `customer` | `admin`. Admin routes are protected and accessible at `/admin/*`.

**Database Schema:**
- Users with role-based access
- Orders with payment status tracking
- Special codes system for discounts
- NextAuth session/account tables

**Payment System:**
Integrated Stripe payments with both online and onsite payment options. Special codes can be applied for discounts. First-time user detection affects payment flow.

**State Management:**
Cart functionality uses React Context (`CartContext`) with local state. Items include size selection for whole cakes.

**API Routes:**
- `/api/auth/` - NextAuth authentication
- `/api/checkout/` - Stripe payment processing
- `/api/orders/` - Order management
- `/api/admin/` - Admin functionality
- `/api/notifications/` - Notification system
  - `/api/notifications/email` - Email notifications
  - `/api/notifications/sms` - SMS notifications via Twilio
  - `/api/notifications/print-failure` - Print failure alerts
- `/api/print/order` - Hiboutik printer integration

**Notification System:**
Unified notification system with centralized service (`/lib/order-notifications.ts`):
- **Order Notifications**: Automatic customer confirmation emails and shop notifications
- **SMS Alerts**: Shop receives SMS for new orders with customer details and pickup info
- **Dual Printing**: Orders print twice to shop printer with formatted receipts
- **Print Failure Detection**: Automatic SMS/email alerts when printing fails
- **Pickup Reminders**: 24-hour advance SMS reminders to customers (scheduled)
- **Selective Notifications**: Configurable options for testing (email-only, shop-only, etc.)
- **DRY Architecture**: Single `sendAllOrderNotifications()` function used by all order APIs

**Environment Variables Required:**
- Email: `NEXT_PUBLIC_EMAIL_*` variables for SMTP
- SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Shop Contact: `NEXT_PUBLIC_SHOP_PHONE`, `NEXT_PUBLIC_SHOP_EMAIL`
- Printing: `NEXT_PUBLIC_HIBOUTIK_*` variables for printer API

**Styling:**
Custom Tailwind theme with patisserie colors (cream, mint, yellow, coral). Uses Inter font and French language content.