# Mock Data Generator

This directory contains scripts for generating test/mock data for the cake shop application.

## seed-mock-orders.ts

Generates realistic mock orders and customers for testing admin dashboard features.

### What it creates:

- **10 mock customers** with French names, emails, and phone numbers
- **150 mock orders** spanning the last 90 days
- Orders include:
  - Random combinations of 1-5 products per order
  - Realistic French pastry items (Tarte au Citron, Éclair, Macaron, etc.)
  - Various order statuses (pending, confirmed, ready, completed, cancelled)
  - Both online and onsite payment methods
  - Pickup dates and times
  - Some whole cakes with size options (6, 8, 10, 12 parts)

### Usage:

```bash
npm run seed:mock
```

### What the script does:

1. **Creates mock customers** - Generates 10 customer accounts with:
   - Realistic French names
   - Email addresses (@example.fr)
   - Phone numbers (+336...)
   - Password: `password123` (for testing login)

2. **Generates orders** - Creates 150 orders with:
   - Random distribution across the last 90 days
   - Weighted status distribution (more completed orders than cancelled)
   - Future pickup dates for pending/confirmed orders
   - Past pickup dates for ready/completed/cancelled orders
   - Various products and quantities

3. **Prints statistics** - Shows summary of created data:
   - Total orders and revenue
   - Orders by status
   - Orders by payment method

### Safe to run multiple times

The script is safe to run multiple times. It will:
- Skip creating customers that already exist (by email)
- Generate new unique order numbers each time
- Add to existing data without overwriting

### Testing the admin dashboard

After running the script, you can test these admin features:

- **Calendar View**: `/admin/dashboard/calendar`
  - See orders grouped by date
  - Visual indicators for busy days
  - Click dates to see order details

- **Orders Table**: `/admin/dashboard/orders`
  - Filter by date range, customer, product, status
  - Sort by any column
  - Export to Excel

- **Analytics Dashboard**: `/admin/dashboard/analytics`
  - View total orders and revenue
  - See popular products
  - Analyze peak ordering times
  - Check payment method distribution
  - Review order status breakdown

### Resetting data

If you want to start fresh:

```bash
npm run db:reset
```

**Warning**: This will delete ALL data including real orders. Only use in development!
