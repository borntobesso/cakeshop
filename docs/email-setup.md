# Email Setup Instructions for Fu Pâtisserie

## Gmail SMTP setup

1. Enable 2-Step Verification on your Google account
2. Create an "App Password"
3. Add this app password in .env (NEXT_PUBLIC_EMAIL_USER)

## SendGrid Account Setup

1. **Create a SendGrid Account**

   - Go to [SendGrid's website](https://signup.sendgrid.com/)
   - Sign up using your business email (e.g., shop@fupatisserie.com)
   - Choose the "Free" plan (100 emails/day)

2. **Verify Your Sender Identity**

   - Go to Settings → Sender Authentication
   - Choose "Single Sender Verification"
   - Enter your business email address
   - Complete the verification process

3. **Create an API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Choose "Full Access" or "Restricted Access" (just email sending)
   - Copy the generated API key

## Environment Variables Setup

Once you have your SendGrid account set up, provide these values to your developer:

```env
NEXT_PUBLIC_SENDGRID_API_KEY=your_api_key_here
NEXT_PUBLIC_SHOP_EMAIL=your_shop_email@example.com
NEXT_PUBLIC_SENDER_EMAIL=your_verified_sender@example.com
NEXT_PUBLIC_SHOP_NAME="Fu Pâtisserie"
NEXT_PUBLIC_SHOP_PHONE=+33612345678
```

Replace the values with your actual information:

- `NEXT_PUBLIC_SENDGRID_API_KEY`: The API key you created in SendGrid
- `NEXT_PUBLIC_SHOP_EMAIL`: Your business email where you want to receive order notifications
- `NEXT_PUBLIC_SENDER_EMAIL`: The email address you verified in SendGrid
- `NEXT_PUBLIC_SHOP_NAME`: Your business name (defaults to "Fu Pâtisserie" if not provided)
- `NEXT_PUBLIC_SHOP_PHONE`: Your business phone number for SMS notifications

## Important Notes

1. **Email Limits**

   - Free plan: 100 emails per day
   - If you need more, you can upgrade to a paid plan

2. **Sender Reputation**

   - Always use a business email for sending
   - Don't share your API key
   - Monitor your email deliverability in the SendGrid dashboard

3. **Testing**

   - Test emails will be sent during development
   - Make sure to check both customer and shop notification emails

4. **Support**
   - For SendGrid account issues: Contact SendGrid support
   - For website/email integration issues: Contact your developer
