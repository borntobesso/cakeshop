# Coming Soon Mode

This website has a "Coming Soon" mode that displays a temporary landing page to visitors.

## How to Enable/Disable

### Local Development

Edit `.env.local` file:

```bash
# To SHOW "Coming Soon" page:
NEXT_PUBLIC_COMING_SOON=true

# To HIDE "Coming Soon" page and show normal website:
NEXT_PUBLIC_COMING_SOON=false
```

After changing, restart your dev server:
```bash
npm run dev
```

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add or edit the variable:
   - **Name**: `NEXT_PUBLIC_COMING_SOON`
   - **Value**: `true` (to show) or `false` (to hide)
4. Click **Save**
5. **Redeploy** your site (Vercel → Deployments → Click "..." → Redeploy)

## Files Involved

- `/src/components/ComingSoon.tsx` - The coming soon page component
- `/src/app/layout.tsx` - Conditionally shows the coming soon page based on env variable
- `.env.local` - Contains the NEXT_PUBLIC_COMING_SOON variable

## To Remove This Feature Completely (When Done)

When you no longer need this feature:

1. Remove `NEXT_PUBLIC_COMING_SOON` from `.env.local`
2. Remove `NEXT_PUBLIC_COMING_SOON` from Vercel environment variables
3. Delete `/src/components/ComingSoon.tsx`
4. Remove the import and conditional logic from `/src/app/layout.tsx`
5. Delete this file (`COMING_SOON_MODE.md`)
